// Script para executar o servidor B.Hub na porta 3001
import fs from 'fs';
import http from 'http';
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

// Obter o diretório atual usando ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho para os arquivos estáticos compilados
const distPath = path.join(__dirname, 'dist/public');

const app = express();

// Servir arquivos estáticos
app.use(express.static(distPath));
app.use(express.json());

// Rota para página inicial
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Iniciar servidor na porta 3001
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`B.Hub - Servidor rodando em http://localhost:${PORT}`);
  console.log(`Para ver a demonstração das melhorias, acesse http://localhost:3002`);
}); 