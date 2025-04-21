-- ===============================================================
-- SCHEMAS DO BROKERBOOSTER PARA SUPABASE
-- ===============================================================

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('broker', 'manager', 'director')),
  avatar_initials VARCHAR(10),
  team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de equipes
CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  manager_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de atividades
CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority VARCHAR(50) CHECK (priority IN ('low', 'medium', 'high')),
  due_date TIMESTAMPTZ,
  assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  client_name VARCHAR(255),
  property_info TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de negociações
CREATE TABLE IF NOT EXISTS deals (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'prospecting' CHECK (status IN ('prospecting', 'visit', 'proposal', 'negotiation', 'closed', 'lost')),
  broker_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  manager_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  client_name VARCHAR(255),
  property_address TEXT,
  property_value DECIMAL(15, 2) DEFAULT 0,
  commission_value DECIMAL(15, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de mensagens
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  sender_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  receiver_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  is_team_message BOOLEAN DEFAULT FALSE,
  read BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de status de leitura de mensagens (para mensagens de equipe)
CREATE TABLE IF NOT EXISTS message_read_status (
  id SERIAL PRIMARY KEY,
  message_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT FALSE,
  UNIQUE(message_id, user_id)
);

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('message', 'activity', 'deal', 'performance', 'reminder')),
  read BOOLEAN DEFAULT FALSE,
  related_entity_id INTEGER,
  related_entity_type VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de desempenho
CREATE TABLE IF NOT EXISTS performances (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  properties_sold INTEGER DEFAULT 0,
  sales_volume DECIMAL(15, 2) DEFAULT 0,
  commission DECIMAL(15, 2) DEFAULT 0,
  activities_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, month, year)
);

-- ===============================================================
-- TABELAS PARA SISTEMA DE GAMIFICAÇÃO
-- ===============================================================

-- Tabela de perfis de gamificação
CREATE TABLE IF NOT EXISTS gamification_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  level VARCHAR(50) NOT NULL DEFAULT 'Iniciante',
  total_points INTEGER DEFAULT 0,
  weekly_points INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  ranking_position INTEGER,
  last_active TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de conquistas disponíveis
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  icon VARCHAR(100),
  trigger_type VARCHAR(100) NOT NULL,
  trigger_condition VARCHAR(100) NOT NULL,
  target_progress INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de progresso de conquistas dos usuários
CREATE TABLE IF NOT EXISTS user_achievements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, achievement_id)
);

-- Tabela de histórico de pontos
CREATE TABLE IF NOT EXISTS points_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  source_type VARCHAR(100),
  source_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de configurações do sistema de gamificação
CREATE TABLE IF NOT EXISTS gamification_settings (
  id SERIAL PRIMARY KEY,
  points_per_activity INTEGER DEFAULT 10,
  points_per_deal INTEGER DEFAULT 50,
  weekly_decay_percentage INTEGER DEFAULT 30,
  level_thresholds JSONB NOT NULL DEFAULT '{"Iniciante": 0, "Bronze": 100, "Prata": 500, "Ouro": 1000, "Platina": 2000, "Diamante": 5000, "Mestre": 10000}',
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Inserir dados iniciais para configurações
INSERT INTO gamification_settings (id, points_per_activity, points_per_deal, weekly_decay_percentage) 
VALUES (1, 10, 50, 30)
ON CONFLICT (id) DO NOTHING;

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_activities_assigned_to ON activities(assigned_to);
CREATE INDEX IF NOT EXISTS idx_activities_created_by ON activities(created_by);
CREATE INDEX IF NOT EXISTS idx_deals_broker_id ON deals(broker_id);
CREATE INDEX IF NOT EXISTS idx_deals_manager_id ON deals(manager_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_points_history_user_id ON points_history(user_id);
CREATE INDEX IF NOT EXISTS idx_performances_user_id ON performances(user_id);

-- Tabela para armazenar ranking semanal (pode ser recalculada periodicamente)
CREATE TABLE IF NOT EXISTS weekly_rankings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  position INTEGER NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, week_start),
  INDEX idx_week_position (week_start, position)
);

-- Trigger para atualizar o campo updated_at automaticamente
CREATE TRIGGER IF NOT EXISTS update_timestamp_users
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
  UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS update_timestamp_gamification_profiles
AFTER UPDATE ON gamification_profiles
FOR EACH ROW
BEGIN
  UPDATE gamification_profiles SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS update_timestamp_achievements
AFTER UPDATE ON achievements
FOR EACH ROW
BEGIN
  UPDATE achievements SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS update_timestamp_user_achievements
AFTER UPDATE ON user_achievements
FOR EACH ROW
BEGIN
  UPDATE user_achievements SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- Trigger para atualizar pontos do perfil quando um histórico é inserido
CREATE TRIGGER IF NOT EXISTS update_profile_points
AFTER INSERT ON points_history
FOR EACH ROW
BEGIN
  UPDATE gamification_profiles
  SET total_points = total_points + NEW.points,
      weekly_points = weekly_points + NEW.points
  WHERE user_id = NEW.user_id;
END;

-- Trigger para atualizar o status de completado quando o progresso atinge 100%
CREATE TRIGGER IF NOT EXISTS update_achievement_completion
AFTER UPDATE OF progress ON user_achievements
FOR EACH ROW
WHEN NEW.progress >= 100 AND OLD.completed = 0
BEGIN
  UPDATE user_achievements
  SET completed = 1,
      completed_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
  
  -- Adicionar pontos da conquista ao histórico do usuário
  INSERT INTO points_history (user_id, points, reason, source_type, source_id)
  SELECT NEW.user_id, a.points, 'Conquista completada: ' || a.name, 'achievement', a.id
  FROM achievements a
  WHERE a.id = NEW.achievement_id;
END; 