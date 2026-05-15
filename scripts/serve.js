#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || '127.0.0.1';

const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js':   'application/javascript; charset=utf-8',
    '.mjs':  'application/javascript; charset=utf-8',
    '.css':  'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg':  'image/svg+xml',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif':  'image/gif',
    '.webp': 'image/webp',
    '.ico':  'image/x-icon',
    '.map':  'application/json; charset=utf-8',
    '.txt':  'text/plain; charset=utf-8',
    '.xml':  'application/xml; charset=utf-8',
    '.gpx':  'application/gpx+xml',
    '.woff': 'font/woff',
    '.woff2':'font/woff2',
    '.ttf':  'font/ttf',
};

const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    let filePath = path.join(root, urlPath);

    if (!filePath.startsWith(root)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (!err && stats.isDirectory()) {
            filePath = path.join(filePath, 'index.html');
        }

        fs.readFile(filePath, (readErr, data) => {
            if (readErr) {
                res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
                res.end('404 Not Found');
                return;
            }
            const ext = path.extname(filePath).toLowerCase();
            res.writeHead(200, {'Content-Type': mimeTypes[ext] || 'application/octet-stream'});
            res.end(data);
        });
    });
});

server.listen(port, host, () => {
    console.log(`WindAhead is running at http://${host}:${port}`);
});
