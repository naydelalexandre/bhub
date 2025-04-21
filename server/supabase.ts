import { createClient } from '@supabase/supabase-js';
import { Database } from './types/supabase';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// Utiliza as variáveis de ambiente para o URL e chave do Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://sua-url-supabase.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sua-chave-anon-aqui';

// Emite um aviso se as variáveis de ambiente não estiverem definidas
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.warn('Aviso: SUPABASE_URL ou SUPABASE_KEY não estão definidos no arquivo .env');
}

// Cria e exporta o cliente Supabase
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Função para testar a conexão com o banco de dados Supabase
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('users').select('count(*)').single();
    
    if (error) {
      console.error('Erro ao conectar ao Supabase:', error.message);
      return false;
    }
    
    console.log('Conexão com Supabase estabelecida com sucesso!');
    return true;
  } catch (err) {
    console.error('Erro ao testar conexão com Supabase:', err);
    return false;
  }
} 