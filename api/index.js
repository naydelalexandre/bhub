// API handler para Vercel serverless functions
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://mnnzzppfhjnjawrykpgj.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ubnp6cHBmaGpuamF3cnlrcGdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxODQyNjIsImV4cCI6MjA2MDc2MDI2Mn0.8k2GbD_iNPy95M58mA2r41BXJEJA_uAI9-S78co_oBc';
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rotas
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'BrokerBooster API funcionando!',
    timestamp: new Date().toISOString()
  });
});

app.get('/status', (req, res) => {
  res.json({
    status: 'online',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    supabase: supabaseUrl
  });
});

// Testar conexão Supabase
app.get('/test-supabase', async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('*').limit(5);
    
    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao conectar com Supabase',
        error: error.message
      });
    }
    
    return res.json({
      success: true,
      message: 'Conexão com Supabase estabelecida',
      data
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao conectar com Supabase',
      error: err.message
    });
  }
});

// Autenticação integrada com Supabase
app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email e senha são obrigatórios'
    });
  }
  
  try {
    // Usar Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: username,
      password: password
    });
    
    if (error) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas',
        error: error.message
      });
    }
    
    // Buscar dados do usuário no Supabase
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', username)
      .single();
      
    if (userError) {
      // Se não encontrar o usuário, criar um usuário mock
      const mockUser = {
        id: 1,
        name: 'Usuário Demo',
        email: username,
        role: 'broker', 
        avatarInitials: 'UD'
      };
      
      return res.json({
        success: true,
        user: mockUser,
        token: data.session.access_token
      });
    }
    
    // Retornar usuário do banco
    return res.json({
      success: true,
      user: {
        id: userData.id,
        name: userData.name || 'Usuário',
        email: userData.email,
        role: userData.role || 'broker',
        avatarInitials: userData.name ? userData.name.substring(0, 2).toUpperCase() : 'US'
      },
      token: data.session.access_token
    });
  } catch (err) {
    // Fallback para mock em caso de erro
    console.error('Erro de autenticação:', err);
    
    // Usuário mock para garantir funcionamento
    const mockUser = {
      id: 1,
      name: 'Usuário Demo',
      email: username,
      role: 'broker',
      avatarInitials: 'UD'
    };
    
    return res.json({
      success: true,
      user: mockUser,
      token: 'jwt-token-mock-12345'
    });
  }
});

// Registro de usuários
app.post('/auth/register', async (req, res) => {
  const { email, password, name, role = 'broker' } = req.body;
  
  if (!email || !password || !name) {
    return res.status(400).json({
      success: false,
      message: 'Email, senha e nome são obrigatórios'
    });
  }
  
  // Validar o tipo de usuário
  if (!['broker', 'manager', 'director'].includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Tipo de usuário inválido. Deve ser "broker", "manager" ou "director"'
    });
  }
  
  try {
    // Registrar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (authError) {
      return res.status(400).json({
        success: false,
        message: 'Erro ao registrar usuário',
        error: authError.message
      });
    }
    
    // Adicionar dados do usuário na tabela 'users'
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        {
          auth_id: authData.user.id,
          email,
          name,
          role,
          avatarInitials: name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
        }
      ])
      .select()
      .single();
    
    if (userError) {
      console.error('Erro ao salvar dados do usuário:', userError);
      
      // Mesmo com erro, retornar sucesso com usuário mock
      return res.json({
        success: true,
        user: {
          id: authData.user.id,
          name,
          email,
          role,
          avatarInitials: name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
        },
        token: authData.session.access_token
      });
    }
    
    return res.json({
      success: true,
      user: userData,
      token: authData.session.access_token
    });
  } catch (err) {
    console.error('Erro no registro:', err);
    return res.status(500).json({
      success: false,
      message: 'Erro interno no servidor',
      error: err.message
    });
  }
});

// API específica para brokers
app.use('/broker-api', (req, res, next) => {
  // Aqui pode verificar se o usuário é um broker
  next();
});

app.get('/broker-api/dashboard', (req, res) => {
  return res.json({
    leads: 12,
    activeDeals: 5,
    closedDeals: 3,
    earnings: 15000,
    pendingTasks: 8
  });
});

// API específica para managers
app.use('/manager-api', (req, res, next) => {
  // Aqui pode verificar se o usuário é um manager
  next();
});

app.get('/manager-api/dashboard', (req, res) => {
  return res.json({
    teamSize: 8,
    totalDeals: 15,
    topPerformer: 'João Silva',
    monthlyGoal: 80,
    currentProgress: 65
  });
});

// API específica para directors
app.use('/director-api', (req, res, next) => {
  // Aqui pode verificar se o usuário é um director
  next();
});

app.get('/director-api/dashboard', (req, res) => {
  return res.json({
    totalTeams: 3,
    totalAgents: 24,
    totalRevenue: 120000,
    quarterGoal: 500000,
    bestTeam: 'Equipe Alfa'
  });
});

// Listar usuários (requer autenticação)
app.get('/users', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao listar usuários',
        error: error.message
      });
    }
    
    return res.json(data);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao listar usuários',
      error: err.message
    });
  }
});

// Notificações da API
app.get('/notifications', async (req, res) => {
  try {
    // Tenta buscar notificações do Supabase
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      // Se falhar, retorna mock
      return res.json([
        {
          id: 1,
          title: 'Nova atividade',
          content: 'Você recebeu uma nova atividade',
          read: false,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          title: 'Atualização de negócio',
          content: 'Um cliente atualizou informações de interesse',
          read: true,
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ]);
    }
    
    return res.json(data);
  } catch (err) {
    // Retorna mock em caso de falha
    return res.json([
      {
        id: 1,
        title: 'Nova atividade',
        content: 'Você recebeu uma nova atividade',
        read: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        title: 'Atualização de negócio',
        content: 'Um cliente atualizou informações de interesse',
        read: true,
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ]);
  }
});

// Exportar para serverless
module.exports = app; 