const { supabase } = require('./supabase');

async function createExecSqlFunction() {
  try {
    console.log('Criando função exec_sql no Supabase...');
    
    // SQL para criar a função (executado como usuário admin)
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION exec_sql(sql_command text)
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER -- executa com privilégios do criador
      AS $$
      BEGIN
        EXECUTE sql_command;
      END;
      $$;
    `;
    
    // Esta operação precisa ser executada por um usuário com permissões de admin
    // No console Supabase, acesse SQL Editor e execute o script acima manualmente
    console.log('IMPORTANTE: A função exec_sql precisa ser criada manualmente no console do Supabase!');
    console.log('Copie e cole o seguinte SQL no Editor SQL do Supabase:');
    console.log('');
    console.log(createFunctionSQL);
    console.log('');
    
    // Verificar se a função já existe
    console.log('Tentando verificar se a função já existe...');
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_command: 'SELECT 1' 
    });
    
    if (error) {
      console.error('A função exec_sql não existe ou você não tem permissões para usá-la.');
      console.error('Erro:', error.message);
      return false;
    }
    
    console.log('A função exec_sql parece estar funcionando corretamente!');
    return true;
  } catch (error) {
    console.error('Erro ao criar função exec_sql:', error);
    return false;
  }
}

// Executar se for chamado diretamente
if (require.main === module) {
  createExecSqlFunction()
    .then(success => {
      if (success) {
        console.log('Script concluído com sucesso!');
      } else {
        console.error('Falha ao verificar ou criar a função exec_sql.');
      }
      process.exit(success ? 0 : 1);
    })
    .catch(err => {
      console.error('Erro inesperado:', err);
      process.exit(1);
    });
}

module.exports = { createExecSqlFunction }; 