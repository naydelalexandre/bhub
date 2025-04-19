// Script para servir a página HTML de demonstração
const fs = require('fs');
const http = require('http');
const path = require('path');

const htmlPath = path.join(__dirname, 'test-screenshots.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(html);
});

const PORT = 3002;
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
}); 