const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 3000;
const publicDir = path.join(__dirname, 'public');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};

function setCorsHeaders(response) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function sendJson(response, statusCode, data) {
  setCorsHeaders(response);
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(data));
}

function sendFile(response, filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[extension] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      sendJson(response, 404, { error: 'Archivo no encontrado' });
      return;
    }

    response.writeHead(200, { 'Content-Type': contentType });
    response.end(content);
  });
}

const server = http.createServer((request, response) => {
  if (request.method === 'OPTIONS' && request.url === '/api/mensaje') {
    setCorsHeaders(response);
    response.writeHead(204);
    response.end();
    return;
  }

  if (request.url === '/api/mensaje') {
    sendJson(response, 200, {
      mensaje: 'Hola desde el servidor',
      fecha: new Date().toISOString()
    });
    return;
  }

  const requestPath = request.url === '/' ? 'index.html' : request.url;
  const filePath = path.join(publicDir, requestPath);

  if (!filePath.startsWith(publicDir)) {
    sendJson(response, 403, { error: 'Acceso no permitido' });
    return;
  }

  sendFile(response, filePath);
});

server.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});