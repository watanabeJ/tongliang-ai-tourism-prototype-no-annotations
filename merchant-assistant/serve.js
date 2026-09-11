const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const port = Number(process.env.PORT || 4187);
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png'
};

http.createServer((request, response) => {
  const pathname = decodeURIComponent((request.url || '/').split('?')[0]);
  const relative = pathname === '/' ? 'login.html' : pathname.replace(/^\/+/, '');
  const target = path.resolve(root, relative);

  if (!target.startsWith(root)) {
    response.writeHead(403).end('Forbidden');
    return;
  }

  fs.readFile(target, (error, data) => {
    if (error) {
      response.writeHead(error.code === 'ENOENT' ? 404 : 500).end('Not found');
      return;
    }
    response.writeHead(200, { 'Content-Type': contentTypes[path.extname(target).toLowerCase()] || 'application/octet-stream' });
    response.end(data);
  });
}).listen(port, '127.0.0.1', () => {
  console.log(`V6 merchant assistant prototype: http://127.0.0.1:${port}/`);
});
