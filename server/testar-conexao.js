// Script para testar a conexão com o Supabase
const { supabase } = require('./supabase');

async function testarConexao() {
  try {
    console.log('Testando conexão com Supabase...');
    console.log('URL do Supabase:', process.env.SUPABASE_URL);
    
    // Verificar se consegue conectar
    const { data, error } = await supabase.from('users').select('count(*)');
    
    if (error) {
      console.error('ERRO DE CONEXÃO:', error.message);
      console.error('Código do erro:', error.code);
      console.error('Detalhes completos:', error);
      
      if (error.code === 'PGRST116') {
        console.log('\nA tabela "users" não existe. Verifique se executou o script SQL no Supabase.');
      } else if (error.code === '42501') {
        console.log('\nErro de permissão. Verifique as permissões da tabela no Supabase.');
      } else if (error.code === 'ENOTFOUND') {
        console.log('\nNão foi possível conectar ao servidor. Verifique a URL do Supabase.');
      } else if (error.code === 'AuthApiError') {
        console.log('\nProblema de autenticação. Verifique a chave do Supabase.');
      }
      
      return false;
    }
    
    console.log('Conexão bem-sucedida!');
    console.log('Resultado:', data);
    
    // Checar quais tabelas existem
    console.log('\nVerificando tabelas existentes...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
      
    if (tablesError) {
      console.error('Erro ao verificar tabelas:', tablesError.message);
    } else {
      console.log('Tabelas encontradas:', tables.map(t => t.table_name).join(', '));
    }
    
    return true;
  } catch (error) {
    console.error('ERRO GRAVE:', error);
    return false;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testarConexao()
    .then(success => {
      console.log('\nResultado do teste:', success ? 'SUCESSO' : 'FALHA');
      process.exit(success ? 0 : 1);
    })
    .catch(err => {
      console.error('Erro não tratado:', err);
      process.exit(1);
    });
}

module.exports = { testarConexao }; 