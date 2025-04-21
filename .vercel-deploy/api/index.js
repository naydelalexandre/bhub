// Vercel Serverless Function Entry Point
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Inicializa o supabase
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://mnnzzppfhjnjawrykpgj.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ubnp6cHBmaGpuamF3cnlrcGdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxODQyNjIsImV4cCI6MjA2MDc2MDI2Mn0.8k2GbD_iNPy95M58mA2r41BXJEJA_uAI9-S78co_oBc';
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Rotas da API
app.get('/api/status', (req, res) => {
  res.json({ status: 'online', timestamp: new Date().toISOString() });
});

// Rota específica para testar conexão com Supabase
app.get('/api/supabase-status', async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('count').single();
    
    if (error) {
      console.error('Erro ao conectar com Supabase:', error.message);
      return res.status(500).json({
        status: 'error',
        message: 'Falha ao conectar com o Supabase',
        error: error.message
      });
    }
    
    return res.json({
      status: 'connected',
      message: 'Conexão com Supabase estabelecida com sucesso',
      data
    });
  } catch (err) {
    console.error('Erro ao testar conexão com Supabase:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao testar conexão com Supabase',
      error: err.message
    });
  }
});

// Rota para gamificação básica
app.get('/api/gamification/ranking', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('gamification_profiles')
      .select(`
        id,
        user_id,
        level,
        total_points,
        weekly_points
      `)
      .order('weekly_points', { ascending: false })
      .limit(10);
      
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Global error handler
app.use((err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  console.error(`[ERROR] ${status}: ${message}`);
  if (err.stack) console.error(err.stack);
  
  res.status(status).json({ message });
});

// Configuração para Vercel
module.exports = app; 