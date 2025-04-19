// Script para servir a página HTML de demonstração (versão ES Modules)
import fs from 'fs';
import http from 'http';
import { fileURLToPath } from 'url';
import path from 'path';

// Obter o diretório atual usando ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const htmlPath = path.join(__dirname, 'test-screenshots.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(html);
});

const PORT = 3002;
server.listen(PORT, () => {
  console.log(`B.Hub - Servidor rodando em http://localhost:${PORT}`);
  console.log(`Abra seu navegador e acesse: http://localhost:${PORT}`);
}); 