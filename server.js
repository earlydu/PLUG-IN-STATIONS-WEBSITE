// Static file server for the Plug In Stations site.
// Run: node server.js   (then open http://localhost:3000)

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon',
  '.pdf':  'application/pdf',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.txt':  'text/plain; charset=utf-8',
};

const server = http.createServer((req, res) => {
  let pathname = decodeURIComponent(url.parse(req.url).pathname);
  if (pathname === '/' || pathname === '') pathname = '/index.html';

  const filePath = path.join(ROOT, pathname);

  // prevent directory traversal
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  const serve404 = () => {
    fs.readFile(path.join(ROOT, '404.html'), (err, data) => {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data || '<h1>404 — Not Found</h1>');
    });
  };
  const tryServe = (target) => {
    fs.stat(target, (err, stat) => {
      if (err) return serve404();
      if (stat.isDirectory()) {
        const idx = path.join(target, 'index.html');
        return fs.stat(idx, (e2, s2) => (e2 || !s2.isFile()) ? serve404() : tryServe(idx));
      }
      const ext = path.extname(target).toLowerCase();
      res.writeHead(200, {
        'Content-Type': MIME[ext] || 'application/octet-stream',
        'Cache-Control': 'no-cache',
      });
      fs.createReadStream(target).pipe(res);
    });
  };
  tryServe(filePath);
});

server.listen(PORT, () => {
  console.log(`\nPlug In Stations site is live:`);
  console.log(`  http://localhost:${PORT}\n`);
  console.log(`Press Ctrl+C to stop.\n`);
});
