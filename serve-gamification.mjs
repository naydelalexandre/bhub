// Script para servir a página de demonstração da gamificação
import fs from 'fs';
import http from 'http';
import { fileURLToPath } from 'url';
import path from 'path';

// Obter o diretório atual usando ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const htmlPath = path.join(__dirname, 'bhub-gamification.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(html);
});

const PORT = 3007;
server.listen(PORT, () => {
  console.log("\n=================================================");
  console.log("     B.Hub - Demonstração de Gamificação     ");
  console.log("=================================================\n");
  console.log(`Servidor iniciado com sucesso na porta ${PORT}`);
  console.log(`Para visualizar a gamificação, acesse:`);
  console.log(`http://localhost:${PORT}`);
  console.log("\nPara encerrar o servidor, pressione Ctrl+C\n");
}); 