// Script para iniciar o servidor com mais informações de erro
require('dotenv').config();

// Capturar erros não tratados
process.on('uncaughtException', (error) => {
  console.error('ERRO NÃO TRATADO:', error);
  console.error('Stack trace:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('PROMESSA REJEITADA NÃO TRATADA:');
  console.error('Razão:', reason);
  console.error('Promessa:', promise);
});

// Tentar carregar o servidor passo a passo
console.log('Iniciando processo de carregamento do servidor...');

try {
  console.log('1. Carregando módulos...');
  const express = require('express');
  const cors = require('cors');
  console.log('- Express e CORS carregados');
  
  const morgan = require('morgan');
  const helmet = require('helmet');
  console.log('- Morgan e Helmet carregados');
  
  const fs = require('fs');
  const path = require('path');
  console.log('- FS e Path carregados');
  
  console.log('2. Verificando conexão com Supabase...');
  const { supabase, testSupabaseConnection } = require('./supabase');
  console.log('- Módulo Supabase carregado');
  
  console.log('3. Carregando repositório de gamificação...');
  try {
    const gamificationRepository = require('./gamification-repository-supabase');
    console.log('- Repositório de gamificação carregado');
  } catch (repoError) {
    console.error('ERRO AO CARREGAR REPOSITÓRIO:', repoError);
    console.error('Stack trace:', repoError.stack);
    process.exit(1);
  }
  
  console.log('4. Carregando CRON jobs...');
  try {
    const { startCronJobs } = require('./cron/gamification-jobs');
    console.log('- CRON jobs carregados');
  } catch (cronError) {
    console.error('ERRO AO CARREGAR CRON JOBS:', cronError);
    console.error('Você pode continuar sem os jobs, mas algumas funcionalidades automáticas não funcionarão');
  }
  
  console.log('5. Configurando app Express...');
  const app = express();
  const PORT = process.env.PORT || 3000;
  
  app.use(cors());
  app.use(express.json());
  
  // Rota básica
  app.get('/', (req, res) => {
    res.json({ message: 'BrokerBooster API está rodando!' });
  });
  
  app.get('/check-supabase', async (req, res) => {
    try {
      const connected = await testSupabaseConnection();
      res.json({ 
        supabase_connected: connected,
        message: connected ? 'Conexão com Supabase estabelecida!' : 'Falha na conexão com Supabase'
      });
    } catch (error) {
      res.status(500).json({ 
        error: true, 
        message: 'Erro ao verificar conexão com Supabase',
        details: error.message
      });
    }
  });
  
  console.log('6. Iniciando servidor...');
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
  });
  
} catch (error) {
  console.error('ERRO FATAL AO INICIALIZAR:', error);
  console.error('Stack trace:', error.stack);
  process.exit(1);
} 