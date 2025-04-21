const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const DATABASE_PATH = path.join(__dirname, 'brokerbooster.db');

async function initializeDatabase() {
  console.log('Inicializando banco de dados...');
  
  // Verificar se o banco de dados já existe
  const dbExists = fs.existsSync(DATABASE_PATH);
  
  // Conectar ao banco de dados
  const db = new sqlite3.Database(DATABASE_PATH);
  
  try {
    // Executar em modo de promessa
    const run = promisify(db.run.bind(db));
    const exec = promisify(db.exec.bind(db));
    
    // Ler e executar o arquivo de esquema
    console.log('Criando tabelas...');
    const schemaSQL = await readFile(path.join(__dirname, 'schema.sql'), 'utf8');
    await exec(schemaSQL);
    console.log('Tabelas criadas com sucesso!');
    
    // Se o banco de dados não existia antes, inserir dados iniciais
    if (!dbExists) {
      console.log('Inserindo dados iniciais...');
      const seedSQL = await readFile(path.join(__dirname, 'seed.sql'), 'utf8');
      await exec(seedSQL);
      console.log('Dados iniciais inseridos com sucesso!');
    }
    
    console.log('Inicialização do banco de dados concluída!');
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    throw error;
  } finally {
    // Fechar a conexão
    db.close();
  }
}

// Exportar função de inicialização
module.exports = {
  initializeDatabase,
  DATABASE_PATH
};

// Executar inicialização se o script for executado diretamente
if (require.main === module) {
  initializeDatabase()
    .then(() => console.log('Banco de dados pronto para uso!'))
    .catch(err => {
      console.error('Falha ao inicializar banco de dados:', err);
      process.exit(1);
    });
} 