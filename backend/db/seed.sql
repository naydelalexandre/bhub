-- Configurações de gamificação
INSERT INTO gamification_settings (level_thresholds, points_decay_rate, streak_requirement_hours)
VALUES (
  '{
    "Iniciante": 0,
    "Bronze": 100,
    "Prata": 300,
    "Ouro": 600,
    "Platina": 1000,
    "Diamante": 1500,
    "Mestre": 2500,
    "Lenda": 4000
  }',
  0.25,  -- 25% de decaimento dos pontos semanais
  24     -- 24 horas para manter sequência
);

-- Usuários iniciais
INSERT INTO users (username, password, name, role, avatar_initials, manager_id, team_id)
VALUES 
-- Diretor
('diretor', '$2a$10$rY8jCjKpHAj4ClxHqzb3tO3cwzLuS4bkYoBMTAh3XE1z1XL8M7tIq', 'Carlos Diretor', 'director', 'CD', NULL, NULL),
-- Gerentes
('gerente1', '$2a$10$rY8jCjKpHAj4ClxHqzb3tO3cwzLuS4bkYoBMTAh3XE1z1XL8M7tIq', 'Maria Gerente', 'manager', 'MG', 1, 1),
('gerente2', '$2a$10$rY8jCjKpHAj4ClxHqzb3tO3cwzLuS4bkYoBMTAh3XE1z1XL8M7tIq', 'Pedro Gerente', 'manager', 'PG', 1, 2),
-- Corretores
('corretor1', '$2a$10$rY8jCjKpHAj4ClxHqzb3tO3cwzLuS4bkYoBMTAh3XE1z1XL8M7tIq', 'Ana Corretora', 'broker', 'AC', 2, 1),
('corretor2', '$2a$10$rY8jCjKpHAj4ClxHqzb3tO3cwzLuS4bkYoBMTAh3XE1z1XL8M7tIq', 'Bruno Corretor', 'broker', 'BC', 2, 1),
('corretor3', '$2a$10$rY8jCjKpHAj4ClxHqzb3tO3cwzLuS4bkYoBMTAh3XE1z1XL8M7tIq', 'Carla Corretora', 'broker', 'CC', 3, 2),
('corretor4', '$2a$10$rY8jCjKpHAj4ClxHqzb3tO3cwzLuS4bkYoBMTAh3XE1z1XL8M7tIq', 'Diego Corretor', 'broker', 'DC', 3, 2);

-- Criação de perfis de gamificação para cada usuário
INSERT INTO gamification_profiles (user_id, level, total_points, weekly_points, streak)
VALUES 
(1, 'Diamante', 1650, 120, 5),
(2, 'Ouro', 750, 85, 3),
(3, 'Ouro', 620, 70, 2),
(4, 'Prata', 420, 120, 4),
(5, 'Bronze', 220, 60, 1),
(6, 'Prata', 320, 40, 3),
(7, 'Iniciante', 80, 30, 2);

-- Conquistas
INSERT INTO achievements (name, description, points, category, difficulty, icon, requirements)
VALUES
-- Categoria: Atividades
('Primeiro Passo', 'Complete sua primeira atividade', 10, 'Atividades', 'easy', '🚶', 'Completar 1 atividade'),
('Produtividade Inicial', 'Complete 10 atividades', 25, 'Atividades', 'easy', '📝', 'Completar 10 atividades'),
('Mestre das Tarefas', 'Complete 50 atividades', 100, 'Atividades', 'medium', '✅', 'Completar 50 atividades'),
('Workaholic', 'Complete 100 atividades', 200, 'Atividades', 'hard', '💼', 'Completar 100 atividades'),

-- Categoria: Negociações
('Primeira Venda', 'Realize sua primeira negociação com sucesso', 20, 'Negociações', 'easy', '🤝', 'Completar 1 negociação'),
('Vendedor Iniciante', 'Realize 5 negociações com sucesso', 50, 'Negociações', 'easy', '💰', 'Completar 5 negociações'),
('Vendedor Profissional', 'Realize 25 negociações com sucesso', 150, 'Negociações', 'medium', '💎', 'Completar 25 negociações'),
('Mestre das Vendas', 'Realize 50 negociações com sucesso', 300, 'Negociações', 'hard', '🏆', 'Completar 50 negociações'),
('Milhão', 'Atinja R$ 1.000.000 em vendas', 500, 'Negociações', 'hard', '💵', 'Atingir R$ 1.000.000 em vendas'),

-- Categoria: Engajamento
('Primeira Sequência', 'Mantenha uma sequência de 3 dias', 15, 'Engajamento', 'easy', '📆', 'Manter sequência de 3 dias'),
('Consistência', 'Mantenha uma sequência de 7 dias', 30, 'Engajamento', 'medium', '🔥', 'Manter sequência de 7 dias'),
('Dedicação Total', 'Mantenha uma sequência de 30 dias', 200, 'Engajamento', 'hard', '⭐', 'Manter sequência de 30 dias'),

-- Categoria: Crescimento
('Aprendiz', 'Atinja o nível Bronze', 50, 'Crescimento', 'easy', '🥉', 'Atingir nível Bronze'),
('Intermediário', 'Atinja o nível Prata', 100, 'Crescimento', 'medium', '🥈', 'Atingir nível Prata'),
('Experiente', 'Atinja o nível Ouro', 200, 'Crescimento', 'medium', '🥇', 'Atingir nível Ouro'),
('Elite', 'Atinja o nível Platina', 300, 'Crescimento', 'hard', '💠', 'Atingir nível Platina'),
('Lendário', 'Atinja o nível Diamante', 500, 'Crescimento', 'hard', '💎', 'Atingir nível Diamante');

-- Progresso de conquistas para usuários (alguns exemplos)
-- Diretor (ID: 1)
INSERT INTO user_achievements (user_id, achievement_id, progress, completed, completed_at)
VALUES
(1, 1, 100, 1, datetime('now', '-30 day')), -- Primeiro Passo
(1, 2, 100, 1, datetime('now', '-25 day')), -- Produtividade Inicial
(1, 3, 100, 1, datetime('now', '-15 day')), -- Mestre das Tarefas
(1, 4, 85, 0, NULL), -- Workaholic (em progresso)
(1, 5, 100, 1, datetime('now', '-28 day')), -- Primeira Venda
(1, 6, 100, 1, datetime('now', '-20 day')), -- Vendedor Iniciante
(1, 7, 100, 1, datetime('now', '-10 day')), -- Vendedor Profissional
(1, 8, 75, 0, NULL), -- Mestre das Vendas (em progresso)
(1, 13, 100, 1, datetime('now', '-27 day')), -- Aprendiz
(1, 14, 100, 1, datetime('now', '-25 day')), -- Intermediário
(1, 15, 100, 1, datetime('now', '-20 day')), -- Experiente
(1, 16, 100, 1, datetime('now', '-10 day')), -- Elite
(1, 17, 100, 1, datetime('now', '-5 day')); -- Lendário

-- Gerente 1 (ID: 2)
INSERT INTO user_achievements (user_id, achievement_id, progress, completed, completed_at)
VALUES
(2, 1, 100, 1, datetime('now', '-25 day')), -- Primeiro Passo
(2, 2, 100, 1, datetime('now', '-20 day')), -- Produtividade Inicial
(2, 3, 95, 0, NULL), -- Mestre das Tarefas (em progresso)
(2, 5, 100, 1, datetime('now', '-22 day')), -- Primeira Venda
(2, 6, 100, 1, datetime('now', '-15 day')), -- Vendedor Iniciante
(2, 7, 70, 0, NULL), -- Vendedor Profissional (em progresso)
(2, 10, 100, 1, datetime('now', '-10 day')), -- Primeira Sequência
(2, 11, 100, 1, datetime('now', '-5 day')), -- Consistência
(2, 13, 100, 1, datetime('now', '-18 day')), -- Aprendiz
(2, 14, 100, 1, datetime('now', '-12 day')), -- Intermediário
(2, 15, 100, 1, datetime('now', '-7 day')); -- Experiente

-- Histórico de pontos
INSERT INTO points_history (user_id, points, reason, source_type, source_id, created_at)
VALUES
-- Diretor
(1, 10, 'Conquista completada: Primeiro Passo', 'achievement', 1, datetime('now', '-30 day')),
(1, 25, 'Conquista completada: Produtividade Inicial', 'achievement', 2, datetime('now', '-25 day')),
(1, 100, 'Conquista completada: Mestre das Tarefas', 'achievement', 3, datetime('now', '-15 day')),
(1, 20, 'Conquista completada: Primeira Venda', 'achievement', 5, datetime('now', '-28 day')),
(1, 50, 'Conquista completada: Vendedor Iniciante', 'achievement', 6, datetime('now', '-20 day')),
(1, 150, 'Conquista completada: Vendedor Profissional', 'achievement', 7, datetime('now', '-10 day')),
(1, 50, 'Conquista completada: Aprendiz', 'achievement', 13, datetime('now', '-27 day')),
(1, 100, 'Conquista completada: Intermediário', 'achievement', 14, datetime('now', '-25 day')),
(1, 200, 'Conquista completada: Experiente', 'achievement', 15, datetime('now', '-20 day')),
(1, 300, 'Conquista completada: Elite', 'achievement', 16, datetime('now', '-10 day')),
(1, 500, 'Conquista completada: Lendário', 'achievement', 17, datetime('now', '-5 day')),
(1, 45, 'Atividade concluída: Reunião com equipe', 'activity', 1, datetime('now', '-3 day')),
(1, 50, 'Negociação finalizada: Venda Residencial', 'deal', 1, datetime('now', '-2 day')),
(1, 25, 'Bônus: Feedback positivo de cliente', 'bonus', NULL, datetime('now', '-1 day')),
(1, 25, 'Atividade concluída: Revisão de relatórios', 'activity', 2, datetime('now')),

-- Gerente 1
(2, 10, 'Conquista completada: Primeiro Passo', 'achievement', 1, datetime('now', '-25 day')),
(2, 25, 'Conquista completada: Produtividade Inicial', 'achievement', 2, datetime('now', '-20 day')),
(2, 20, 'Conquista completada: Primeira Venda', 'achievement', 5, datetime('now', '-22 day')),
(2, 50, 'Conquista completada: Vendedor Iniciante', 'achievement', 6, datetime('now', '-15 day')),
(2, 15, 'Conquista completada: Primeira Sequência', 'achievement', 10, datetime('now', '-10 day')),
(2, 30, 'Conquista completada: Consistência', 'achievement', 11, datetime('now', '-5 day')),
(2, 50, 'Conquista completada: Aprendiz', 'achievement', 13, datetime('now', '-18 day')),
(2, 100, 'Conquista completada: Intermediário', 'achievement', 14, datetime('now', '-12 day')),
(2, 200, 'Conquista completada: Experiente', 'achievement', 15, datetime('now', '-7 day')),
(2, 35, 'Atividade concluída: Treinamento de equipe', 'activity', 3, datetime('now', '-4 day')),
(2, 40, 'Negociação finalizada: Venda Comercial', 'deal', 2, datetime('now', '-3 day')),
(2, 35, 'Atividade concluída: Reunião com cliente', 'activity', 4, datetime('now', '-1 day')),
(2, 40, 'Negociação finalizada: Aluguel Comercial', 'deal', 3, datetime('now')),
(2, 10, 'Bônus: Feedback positivo de equipe', 'bonus', NULL, datetime('now'));

-- Ranking semanal (calculado a partir dos dados acima)
INSERT INTO weekly_rankings (user_id, week_start, position, points, created_at)
VALUES
-- Semana atual
(1, date('now', 'weekday 0', '-7 day'), 1, 120, datetime('now')),
(4, date('now', 'weekday 0', '-7 day'), 2, 120, datetime('now')),
(2, date('now', 'weekday 0', '-7 day'), 3, 85, datetime('now')),
(3, date('now', 'weekday 0', '-7 day'), 4, 70, datetime('now')),
(5, date('now', 'weekday 0', '-7 day'), 5, 60, datetime('now')),
(6, date('now', 'weekday 0', '-7 day'), 6, 40, datetime('now')),
(7, date('now', 'weekday 0', '-7 day'), 7, 30, datetime('now')); 