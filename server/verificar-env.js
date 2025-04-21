// Script para verificar .env
require('dotenv').config();

console.log('===== Verificação de variáveis de ambiente =====');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL || 'NÃO DEFINIDO');
console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? 'DEFINIDO (valor oculto)' : 'NÃO DEFINIDO');

// Verificar se o arquivo .env existe
const fs = require('fs');
const path = require('path');

const envPathInServer = path.join(__dirname, '.env');
const envPathInRoot = path.join(__dirname, '..', '.env');

console.log('\n===== Verificação do arquivo .env =====');
if (fs.existsSync(envPathInServer)) {
  console.log(`Arquivo .env encontrado em: ${envPathInServer}`);
  const content = fs.readFileSync(envPathInServer, 'utf8');
  console.log('Conteúdo (primeiras 20 caracteres de cada linha):');
  content.split('\n').forEach(line => {
    if (line.trim()) {
      // Mostra só o começo da linha para não expor chaves completas
      const parts = line.split('=');
      if (parts.length > 1) {
        console.log(`${parts[0]}=${parts[1].substring(0, 20)}...`);
      } else {
        console.log(line.substring(0, 20) + '...');
      }
    }
  });
} else {
  console.log(`Arquivo .env NÃO encontrado em: ${envPathInServer}`);
}

if (fs.existsSync(envPathInRoot)) {
  console.log(`\nArquivo .env encontrado na raiz: ${envPathInRoot}`);
  const content = fs.readFileSync(envPathInRoot, 'utf8');
  console.log('Conteúdo (primeiras 20 caracteres de cada linha):');
  content.split('\n').forEach(line => {
    if (line.trim()) {
      // Mostra só o começo da linha para não expor chaves completas
      const parts = line.split('=');
      if (parts.length > 1) {
        console.log(`${parts[0]}=${parts[1].substring(0, 20)}...`);
      } else {
        console.log(line.substring(0, 20) + '...');
      }
    }
  });
} else {
  console.log(`\nArquivo .env NÃO encontrado na raiz: ${envPathInRoot}`);
}

console.log('\n===== Verificação concluída ====='); 