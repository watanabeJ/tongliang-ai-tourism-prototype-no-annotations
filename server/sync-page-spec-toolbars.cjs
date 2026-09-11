// Mechanical migration from the existing consumer Q&A page's tested viewer.
// Only presentation code is replaced; embedded documents and annotations stay intact.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { Script } = require('node:vm');

const root = path.resolve(__dirname, '..');
const version = 'page-spec-toolbar-v3';
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const hash = text => createHash('sha256').update(text).digest('hex');
const scripts = html => [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)];
const viewerOf = html => scripts(html).find(match =>
  !match[1].includes('application/json') && match[2].includes('const pageKey ='));
const documentsOf = html => scripts(html)
  .filter(match => match[1].includes('data-proto-spec-markdown'))
  .map(match => match[0]);
const template = viewerOf(read('consumer/plan.html'))[2];
assert(template.includes('window.PrototypePageSpec ='));

const targets = [
  'consumer/activity-detail.html',
  'consumer/product-detail.html',
  ...['merchant-assistant', 'government'].flatMap(directory =>
    fs.readdirSync(path.join(root, directory)).filter(file => file.endsWith('.html'))
      .sort().map(file => `${directory}/${file}`))
];
const changes = [];
const pageChecks = [];
function stage(file, before, after) {
  if (before !== after) changes.push({ file, before, after });
}
for (const file of targets) {
  const before = read(file);
  const oldViewer = viewerOf(before);
  assert(oldViewer, `Missing existing viewer: ${file}`);
  const pageKey = JSON.parse(oldViewer[2].match(/const pageKey = ("[^"]+");/)[1]);
  const directory = path.dirname(file);
  const docs = documentsOf(before);
  let after = before;
  let specRef = scripts(before).find(match => match[1].includes('data-proto-spec-markdown'))
    ?.[1].match(/data-proto-spec-ref="([^"]+)"/)?.[1];

  if (!docs.length) {
    specRef = directory === 'consumer'
      ? 'prototype-annotator/specs/current/P01.md'
      : `prototype-specs/current/${pageKey}.md`;
    const markdown = read(`${directory}/${specRef}`);
    const embedded = `<script type="application/json" data-proto-spec-markdown="${pageKey}" data-proto-spec-ref="${specRef}">${JSON.stringify(markdown).replace(/</g, '\\u003c')}</script>\n`;
    after = after.slice(0, oldViewer.index) + embedded + after.slice(oldViewer.index);
  }

  let newViewer = template.replace('const pageKey = "plan";', `const pageKey = ${JSON.stringify(pageKey)};`);
  // Keep the document attached to its subsystem even when all three share port 4188.
  // The embedded document remains first choice, as on the reference Q&A page.
  newViewer = newViewer.replace('  fetchFirstText([\n',
    `  fetchFirstText([\n    ${JSON.stringify(specRef || `prototype-specs/current/${pageKey}.md`)},\n    "prototype-specs/current/" + encodeURIComponent(pageKey) + ".md",\n`);
  new Script(newViewer, { filename: file });
  after = after.replace(oldViewer[0], `<script>${newViewer}</script>`);
  assert(after.includes('window.PrototypePageSpec ='));
  after = after.replace(/window\.PROTOTYPE_ANNOTATOR_CONFIG = [^\r\n]+/, config =>
    config.includes('pageSpecInToolbar: true') ? config :
      config.replace('{ dataUrl:', '{ pageSpecInToolbar: true, dataUrl:'));
  assert(after.includes('pageSpecInToolbar: true'), `Missing opt-in: ${file}`);
  after = after.replace(/prototype-annotator\.(css|js)(?:\?[^"]*)?(?=")/g,
    (_, extension) => `prototype-annotator.${extension}?v=${version}`);
  // Keep every pre-existing document byte-for-byte, including front matter.
  for (const doc of docs) assert(after.includes(doc), `Document changed: ${file}`);
  pageChecks.push({ file, pageKey, embeddedDocumentsUnchanged: true,
    documentHash: hash(documentsOf(after).join('\n')) });
  stage(file, before, after);
}

const referenceJs = read('consumer/prototype-annotator/runtime/prototype-annotator.js');
const toolbarStart = referenceJs.indexOf('  function hasPageSpecViewer()');
const toolbarEnd = referenceJs.indexOf('  function loadToolbarPreferences()', toolbarStart);
const toolbarBlock = referenceJs.slice(toolbarStart, toolbarEnd);
const referenceCss = read('consumer/prototype-annotator/runtime/prototype-annotator.css');
const panelStart = referenceCss.indexOf('/* The page-level document entry');
const panelEnd = referenceCss.indexOf('.pa-toolbar button,', panelStart);
const panelStyles = referenceCss.slice(panelStart, panelEnd);
const smallPanelStyles = referenceCss.match(/@media \(max-width: 768px\) \{\s*(\.pa-page-spec-panel\.proto-spec-doc \{[^}]+\})/)[1];

for (const directory of ['merchant-assistant', 'government']) {
  const runtimeFile = `${directory}/prototype-annotator/runtime/prototype-annotator.js`;
  const before = read(runtimeFile);
  let after = before;
  const start = after.includes('  function hasPageSpecViewer()')
    ? after.indexOf('  function hasPageSpecViewer()') : after.indexOf('  function ensureToolbar()');
  const end = after.indexOf('  function loadToolbarPreferences()', start);
  assert(start > 0 && end > start);
  after = after.slice(0, start) + toolbarBlock + after.slice(end);
  if (!after.includes('pageSpecInToolbar: false')) {
    after = after.replace('autoSave: true', 'autoSave: true,\n    pageSpecInToolbar: false');
  }
  after = after.replace(/toolbar\.style\.right = "auto";(?!\s*toolbar\.style\.bottom)/g,
    'toolbar.style.right = "auto";\n    toolbar.style.bottom = "auto";');
  if (!after.includes('window.addEventListener("prototypepagespecchange"')) {
    after = after.replace('  function setupGlobalEvents() {',
      '  function setupGlobalEvents() {\n    window.addEventListener("prototypepagespecchange", updateToolbar);');
  }
  new Script(after, { filename: runtimeFile });
  stage(runtimeFile, before, after);

  const cssFile = `${directory}/prototype-annotator/runtime/prototype-annotator.css`;
  const cssBefore = read(cssFile);
  let cssAfter = cssBefore;
  if (!cssAfter.includes('.pa-toolbar.pa-toolbar-has-page-spec')) {
    cssAfter = cssAfter.replace('.pa-toolbar button,', `${panelStyles}.pa-toolbar button,`);
    cssAfter = cssAfter.replace('@media (max-width: 768px) {',
      `@media (max-width: 768px) {\n  ${smallPanelStyles}`);
  }
  stage(cssFile, cssBefore, cssAfter);
}

const apply = process.argv.includes('--write');
if (apply) {
  // All replacements have been validated before writing any of the known targets.
  for (const change of changes) fs.writeFileSync(path.join(root, change.file), change.after);
}
console.log(JSON.stringify({
  mode: apply ? 'written' : 'dry-run',
  pages: pageChecks,
  changedFiles: changes.map(({ file }) => file),
  changedFileCount: changes.length
}, null, 2));
