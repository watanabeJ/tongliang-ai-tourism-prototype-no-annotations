const http = require('http');
const fs = require('fs');
const path = require('path');
const { createAgentHandler } = require('./server/consumer-agent.cjs');

const root = __dirname;
const port = Number(process.env.PORT || 4173);
const types = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
};

function createPrototypeServer(options = {}) {
const handleAgent = createAgentHandler(options);
return http.createServer((request, response) => {
  if ((request.url || '').startsWith('/api/consumer-agent/')) {
    handleAgent(request, response);
    return;
  }
  let pathname;
  try { pathname = decodeURIComponent((request.url || '/').split('?')[0]); }
  catch { response.writeHead(400).end('Bad request'); return; }
  if (pathname.includes('\0')) { response.writeHead(400).end('Bad request'); return; }
  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  let target = path.resolve(root, relative);
  const inRoot = file => file.startsWith(root + path.sep);
  // Server code, launch scripts and private/dot files are never static assets.
  if (!inRoot(target) || relative.split(/[\\/]/).some(part => part.startsWith('.')) ||
      /^server(?:[\\/]|$)/i.test(relative) || relative.toLowerCase() === 'serve-prototype.js' || !types[path.extname(target).toLowerCase()]) {
    response.writeHead(403).end('Forbidden');
    return;
  }

  // The preview opens plan.html at the root URL, so relative consumer-page
  // links resolve to /product-detail.html, /activity-detail.html, etc.
  // Fall back to the corresponding consumer file for those links.
  if (relative !== 'index.html' && !fs.existsSync(target)) {
    const consumerTarget = path.resolve(root, 'consumer', relative);
    if (consumerTarget.startsWith(path.resolve(root, 'consumer') + path.sep) && fs.existsSync(consumerTarget)) target = consumerTarget;
  }

  if (!inRoot(target)) {
    response.writeHead(403).end('Forbidden');
    return;
  }

  fs.readFile(target, (error, data) => {
    if (error) {
      response.writeHead(error.code === 'ENOENT' ? 404 : 500).end('Not found');
      return;
    }

    response.writeHead(200, {
      'Content-Type': types[path.extname(target).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    response.end(data);
  });
});
}
if (require.main === module) {
  createPrototypeServer().listen(port, '127.0.0.1', () => {
    console.log(`Tongliang prototype running on port ${port}; agent: deepseek-v4-flash`);
  });
}
module.exports = { createPrototypeServer };
