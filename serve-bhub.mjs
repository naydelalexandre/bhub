// Script para servir as páginas de demonstração do B.Hub
import fs from 'fs';
import http from 'http';
import { fileURLToPath } from 'url';
import path from 'path';

// Obter o diretório atual usando ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Servidor para a demonstração principal
const demoPath = path.join(__dirname, 'bhub-demo.html');
const demoHtml = fs.readFileSync(demoPath, 'utf8');

const demoServer = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(demoHtml);
});

// Servidor para os exemplos visuais
const examplesPath = path.join(__dirname, 'bhub-examples.html');
const examplesHtml = fs.readFileSync(examplesPath, 'utf8');

const examplesServer = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(examplesHtml);
});

// Iniciar servidores em portas diferentes
const DEMO_PORT = 3004;
const EXAMPLES_PORT = 3005;

console.log("\n=================================================");
console.log("     B.Hub - Plataforma Imobiliária     ");
console.log("=================================================\n");

console.log("Iniciando servidores de demonstração...\n");

demoServer.listen(DEMO_PORT, () => {
  console.log(`B.Hub - Demonstração rodando em http://localhost:${DEMO_PORT}`);
});

examplesServer.listen(EXAMPLES_PORT, () => {
  console.log(`B.Hub - Exemplos visuais rodando em http://localhost:${EXAMPLES_PORT}`);
});

console.log('\nAcesse as seguintes URLs para ver as demonstrações do B.Hub:');
console.log(`- Demonstração principal: http://localhost:${DEMO_PORT}`);
console.log(`- Exemplos visuais: http://localhost:${EXAMPLES_PORT}`);
console.log("\nPara encerrar os servidores, pressione Ctrl+C\n"); 