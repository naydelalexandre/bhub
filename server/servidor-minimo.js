// Servidor Express mínimo apenas para teste
require('dotenv').config();
const express = require('express');
const { supabase } = require('./supabase');

const app = express();
const PORT = 3000;

// Rota básica
app.get('/', (req, res) => {
  res.json({ message: 'Servidor mínimo funcionando!' });
});

// Rota para testar Supabase
app.get('/testar-conexao', async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('count(*)');
    
    if (error) {
      return res.status(500).json({ 
        erro: true, 
        mensagem: error.message, 
        codigo: error.code 
      });
    }
    
    return res.json({ 
      sucesso: true, 
      mensagem: 'Conexão com Supabase funcionando!',
      dados: data 
    });
  } catch (err) {
    return res.status(500).json({ 
      erro: true, 
      mensagem: 'Erro inesperado', 
      detalhes: err.message 
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor mínimo rodando em http://localhost:${PORT}`);
}); 