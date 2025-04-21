// Endpoint específico de gamificação para Vercel Serverless Functions
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

// Rota para buscar o ranking de gamificação
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

// Rota para buscar conquistas do usuário
app.get('/api/gamification/achievements/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        id,
        user_id,
        achievement_id,
        progress,
        completed,
        completed_at,
        achievements (
          id, 
          name,
          description,
          points,
          icon
        )
      `)
      .eq('user_id', userId);
      
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Rota para buscar perfil de gamificação do usuário
app.get('/api/gamification/profile/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const { data, error } = await supabase
      .from('gamification_profiles')
      .select(`
        id,
        user_id,
        level,
        total_points,
        weekly_points,
        streak,
        last_active
      `)
      .eq('user_id', userId)
      .single();
      
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Configuração para Vercel
module.exports = app; 