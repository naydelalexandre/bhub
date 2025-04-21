const fs = require('fs');
const path = require('path');
const { supabase } = require('./supabase');

async function setupSupabaseDatabase() {
  try {
    console.log('Iniciando configuração do banco de dados Supabase...');
    
    // Ler o arquivo schema.sql
    const schemaPath = path.join(__dirname, 'db', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Dividir o schema em comandos SQL individuais
    // Remover comentários e linhas em branco
    const cleanedSchema = schema
      .replace(/--.*$/gm, '')
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0);
    
    console.log(`Encontrados ${cleanedSchema.length} comandos SQL para executar`);
    
    // Executar cada comando
    for (const command of cleanedSchema) {
      console.log(`Executando: ${command.substring(0, 50)}...`);
      const { error } = await supabase.rpc('exec_sql', { sql_command: command });
      
      if (error) {
        console.error(`Erro ao executar comando: ${error.message}`);
        // Continuar com os próximos comandos
      }
    }
    
    console.log('Configuração do banco de dados Supabase concluída!');
  } catch (error) {
    console.error('Erro durante a configuração do banco de dados:', error);
    throw error;
  }
}

// Executar se for chamado diretamente
if (require.main === module) {
  setupSupabaseDatabase()
    .then(() => {
      console.log('Script de configuração concluído com sucesso!');
      process.exit(0);
    })
    .catch(err => {
      console.error('Falha no script de configuração:', err);
      process.exit(1);
    });
}

module.exports = { setupSupabaseDatabase }; 