// Script que configura tabelas no Supabase sem precisar da função exec_sql
// Este script usa as APIs nativas do Supabase

const { supabase } = require('./supabase');

async function main() {
  try {
    console.log('Iniciando configuração do banco de dados Supabase...');
    
    // Criar tabela de usuários
    console.log('Criando tabela "users"...');
    const { error: usersError } = await supabase
      .from('users')
      .select('count(*)')
      .maybeSingle()
      .then(async ({ error }) => {
        if (error && error.code === 'PGRST116') {
          // Tabela não existe, precisamos criá-la
          return await supabase.rpc('criar_tabela_users');
        }
        return { error: null };
      });

    if (usersError) {
      console.log('Tabela "users" já existe ou ocorreu erro:', usersError.message);
    } else {
      console.log('Tabela "users" configurada com sucesso!');
    }
    
    // Criar tabela de gamificação
    console.log('Criando tabela "gamification_profiles"...');
    const { error: profilesError } = await supabase
      .from('gamification_profiles')
      .select('count(*)')
      .maybeSingle()
      .then(async ({ error }) => {
        if (error && error.code === 'PGRST116') {
          // Tabela não existe, precisamos criá-la
          return await supabase.rpc('criar_tabela_gamification');
        }
        return { error: null };
      });

    if (profilesError) {
      console.log('Tabela "gamification_profiles" já existe ou ocorreu erro:', profilesError.message);
    } else {
      console.log('Tabela "gamification_profiles" configurada com sucesso!');
    }
    
    // Inserir dados iniciais
    console.log('Configurando dados iniciais...');
    
    console.log('Verificando se precisa criar usuário administrador...');
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'director')
      .maybeSingle();
      
    if (!adminUser && adminError?.code === 'PGRST116') {
      console.log('Erro ao verificar usuário admin:', adminError.message);
    } else if (!adminUser) {
      console.log('Criando usuário administrador padrão...');
      
      // Criar usuário admin padrão
      const { error: createAdminError } = await supabase
        .from('users')
        .insert({
          username: 'admin',
          password: '$2a$10$SnH.Jm2K7VBlFQUdgqO26.AjsJsZhC0j/38K.5FFIzXQxB8f3r8lW', // senha: admin123
          name: 'Administrador',
          role: 'director',
          avatar_initials: 'AD',
          created_at: new Date().toISOString()
        });
        
      if (createAdminError) {
        console.log('Erro ao criar usuário admin:', createAdminError.message);
      } else {
        console.log('Usuário administrador criado com sucesso!');
      }
    } else {
      console.log('Usuário administrador já existe.');
    }
    
    console.log('Verificando configurações de gamificação...');
    // Verificar e criar configurações de gamificação
    const { data: settings, error: settingsError } = await supabase
      .from('gamification_settings')
      .select('*')
      .maybeSingle();
      
    if (!settings && settingsError?.code === 'PGRST116') {
      console.log('Erro ao verificar configurações:', settingsError.message);
    } else if (!settings) {
      console.log('Criando configurações de gamificação padrão...');
      
      const defaultLevelThresholds = JSON.stringify({
        "Iniciante": 0,
        "Bronze": 100,
        "Prata": 500,
        "Ouro": 1000,
        "Platina": 2000,
        "Diamante": 5000,
        "Mestre": 10000
      });
      
      const { error: createSettingsError } = await supabase
        .from('gamification_settings')
        .insert({
          id: 1,
          points_per_activity: 10,
          points_per_deal: 50,
          weekly_decay_percentage: 30,
          level_thresholds: defaultLevelThresholds,
          updated_at: new Date().toISOString()
        });
        
      if (createSettingsError) {
        console.log('Erro ao criar configurações:', createSettingsError.message);
      } else {
        console.log('Configurações de gamificação criadas com sucesso!');
      }
    } else {
      console.log('Configurações de gamificação já existem.');
    }
    
    console.log('Configuração concluída com sucesso!');
    
  } catch (error) {
    console.error('Erro durante a configuração:', error);
  }
}

// Executar o script
main()
  .then(() => {
    console.log('Processo finalizado!');
  })
  .catch(err => {
    console.error('Falha no script:', err);
    process.exit(1);
  }); 