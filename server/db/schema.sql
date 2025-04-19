-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('director', 'manager', 'broker')),
  avatar_initials VARCHAR(10) NOT NULL,
  manager_id INTEGER NULL REFERENCES users(id),
  team_id INTEGER NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de configurações de gamificação
CREATE TABLE IF NOT EXISTS gamification_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  level_thresholds JSON NOT NULL, -- JSON com thresholds para cada nível
  points_decay_rate FLOAT DEFAULT 0.0, -- Taxa de decaimento de pontos semanais
  streak_requirement_hours INTEGER DEFAULT 24, -- Horas para manter sequência
  version INTEGER NOT NULL DEFAULT 1,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de perfis de gamificação
CREATE TABLE IF NOT EXISTS gamification_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  level VARCHAR(20) NOT NULL DEFAULT 'Iniciante',
  total_points INTEGER NOT NULL DEFAULT 0,
  weekly_points INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_weekly_points (weekly_points),
  INDEX idx_total_points (total_points)
);

-- Tabela de conquistas
CREATE TABLE IF NOT EXISTS achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  category VARCHAR(50) NOT NULL,
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  icon VARCHAR(50) NOT NULL,
  requirements TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_difficulty (difficulty)
);

-- Tabela de progresso de conquistas por usuário
CREATE TABLE IF NOT EXISTS user_achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, achievement_id),
  INDEX idx_user_id (user_id),
  INDEX idx_achievement_id (achievement_id),
  INDEX idx_completed (completed)
);

-- Tabela de histórico de pontos
CREATE TABLE IF NOT EXISTS points_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  reason VARCHAR(255) NOT NULL,
  source_type VARCHAR(50) NULL,
  source_id INTEGER NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);

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