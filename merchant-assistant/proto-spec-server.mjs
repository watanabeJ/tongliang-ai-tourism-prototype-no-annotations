#!/usr/bin/env node
import { createServer } from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";

const root = process.cwd();
const port = Number(process.env.PORT || readArg("--port") || 8080);
const apiPrefix = "/__prototype-specs/specs/";

createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", "http://localhost");
    if (url.pathname.startsWith(apiPrefix)) {
      await handleSpecRequest(req, res, decodeURIComponent(url.pathname.slice(apiPrefix.length)));
      return;
    }
    const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
    const file = path.resolve(root, "." + decodeURIComponent(pathname));
    if (!(file === root || file.startsWith(root + path.sep))) throw Object.assign(new Error("Forbidden"), { status: 403 });
    const stat = await fs.stat(file).catch(() => null);
    if (!stat?.isFile()) throw Object.assign(new Error("Not found"), { status: 404 });
    res.writeHead(200, { "Content-Type": contentType(file) });
    res.end(await readResponseFile(file));
  } catch (error) {
    res.writeHead(error.status || 500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(error.message || "Internal server error");
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`ProtoSpec local server: http://127.0.0.1:${port}`);
});

function readArg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : "";
}

async function handleSpecRequest(req, res, pageKey) {
  if ((req.method || "") === "GET") {
    await handleSpecRead(res, pageKey);
    return;
  }
  if (!["PUT", "POST", "PATCH"].includes(req.method || "")) {
    res.writeHead(405, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  const payload = parsePayload(Buffer.concat(chunks).toString("utf-8"));
  const markdown = typeof payload === "string" ? payload : payload.markdown;
  if (!markdown || typeof markdown !== "string") throw Object.assign(new Error("markdown is required"), { status: 400 });
  await writeManualSpec(pageKey, markdown);
  res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" });
  res.end(JSON.stringify({ ok: true, pageKey }));
}

async function handleSpecRead(res, pageKey) {
  const safeKey = safePageKey(pageKey);
  const currentFile = path.join(root, "prototype-specs", "current", safeKey + ".md");
  const markdown = await fs.readFile(currentFile, "utf-8").catch(() => "");
  if (!markdown) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8", "Access-Control-Allow-Origin": "*" });
    res.end(`Spec not found: ${safeKey}`);
    return;
  }
  res.writeHead(200, { "Content-Type": "text/markdown; charset=utf-8", "Access-Control-Allow-Origin": "*" });
  res.end(markdown);
}

function parsePayload(raw) {
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return raw; }
}

async function readResponseFile(file) {
  const content = await fs.readFile(file);
  if (!file.endsWith(".html")) return content;
  return Buffer.from(await injectSpecFallback(file, content.toString("utf-8")), "utf-8");
}

async function injectSpecFallback(file, html) {
  if (!html.includes("data-proto-spec-annotator-viewer")) return html;
  const match = html.match(/const pageKey = "([^"]+)";/);
  if (!match) return html;
  const pageKey = safePageKey(match[1]);
  if (html.includes('data-proto-spec-markdown="' + pageKey + '"')) return html;
  const markdown = await fs.readFile(path.join(root, "prototype-specs", "current", pageKey + ".md"), "utf-8").catch(() => "");
  if (!markdown) return html;
  const script = '<script type="application/json" data-proto-spec-markdown="' + pageKey + '">' + escapeScriptJson(JSON.stringify(markdown)) + "</script>\n";
  return html.replace("<!-- proto-spec-annotator-viewer:start -->", script + "<!-- proto-spec-annotator-viewer:start -->");
}

function escapeScriptJson(value) {
  return value.replace(/</g, "\\u003c");
}

async function writeManualSpec(pageKey, markdown) {
  const safeKey = safePageKey(pageKey);
  const currentDir = path.join(root, "prototype-specs", "current");
  const historyDir = path.join(root, "prototype-specs", "history", safeKey);
  const currentFile = path.join(currentDir, safeKey + ".md");
  await fs.mkdir(currentDir, { recursive: true });
  const previous = await fs.readFile(currentFile, "utf-8").catch(() => "");
  if (previous) {
    await fs.mkdir(historyDir, { recursive: true });
    await fs.writeFile(path.join(historyDir, timestamp() + ".before-manual-save.md"), previous, "utf-8");
  }
  await fs.writeFile(currentFile, markManualEdit(markdown), "utf-8");
}

function markManualEdit(markdown) {
  const now = new Date().toISOString();
  if (!markdown.startsWith("---\n")) return markdown;
  const end = markdown.indexOf("\n---", 4);
  if (end === -1) return markdown;
  const frontmatter = upsertLine(upsertLine(markdown.slice(4, end), "lastManualEditedAt", JSON.stringify(now)), "sourceType", "\"manual-edited\"");
  return "---\n" + frontmatter.trimEnd() + "\n---" + markdown.slice(end + 4);
}

function upsertLine(frontmatter, key, value) {
  const pattern = new RegExp("^" + key + ":.*$", "m");
  return pattern.test(frontmatter) ? frontmatter.replace(pattern, key + ": " + value) : frontmatter.trimEnd() + "\n" + key + ": " + value + "\n";
}

function safePageKey(value) {
  return String(value || "").replace(/[^A-Za-z0-9_-]/g, "-") || "page-spec";
}

function contentType(file) {
  if (file.endsWith(".html")) return "text/html; charset=utf-8";
  if (file.endsWith(".js") || file.endsWith(".mjs")) return "text/javascript; charset=utf-8";
  if (file.endsWith(".css")) return "text/css; charset=utf-8";
  if (file.endsWith(".md")) return "text/markdown; charset=utf-8";
  return "application/octet-stream";
}

function timestamp() {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
}
