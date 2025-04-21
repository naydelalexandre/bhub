const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');
const { DATABASE_PATH } = require('./init');

class GamificationRepository {
  constructor() {
    this.db = new sqlite3.Database(DATABASE_PATH);
    // Transformar métodos callback em promises
    this.get = promisify(this.db.get.bind(this.db));
    this.all = promisify(this.db.all.bind(this.db));
    this.run = promisify(this.db.run.bind(this.db));
    this.exec = promisify(this.db.exec.bind(this.db));
  }

  // Fechar conexão com o banco quando necessário
  close() {
    this.db.close();
  }

  // ===== MÉTODOS PARA PERFIL DO USUÁRIO =====

  /**
   * Obter perfil de gamificação completo do usuário
   */
  async getUserProfile(userId) {
    try {
      // Obter o perfil básico
      const profile = await this.get(
        `SELECT * FROM gamification_profiles WHERE user_id = ?`,
        [userId]
      );

      if (!profile) {
        return null;
      }

      // Obter as conquistas do usuário
      const achievements = await this.getUserAchievements(userId);
      profile.achievements = achievements;

      // Obter informações de nível
      const settings = await this.getGamificationSettings();
      const levelThresholds = JSON.parse(settings.level_thresholds);
      
      // Calcular progresso para o próximo nível
      const levelProgress = this.calculateLevelProgress(profile.total_points, levelThresholds);

      return {
        profile,
        levelProgress
      };
    } catch (error) {
      console.error('Erro ao buscar perfil de gamificação:', error);
      throw error;
    }
  }

  /**
   * Calcular progresso para o próximo nível
   */
  calculateLevelProgress(totalPoints, levelThresholds) {
    // Ordenar níveis por pontos necessários
    const levels = Object.entries(levelThresholds)
      .map(([level, points]) => ({ level, points }))
      .sort((a, b) => a.points - b.points);

    let currentLevel = levels[0].level;
    let nextLevel = null;
    let currentLevelPoints = levels[0].points;
    let nextLevelPoints = null;

    // Encontrar o nível atual e o próximo
    for (let i = 0; i < levels.length; i++) {
      if (totalPoints >= levels[i].points) {
        currentLevel = levels[i].level;
        currentLevelPoints = levels[i].points;
        
        if (i < levels.length - 1) {
          nextLevel = levels[i + 1].level;
          nextLevelPoints = levels[i + 1].points;
        }
      } else {
        if (!nextLevel) {
          nextLevel = levels[i].level;
          nextLevelPoints = levels[i].points;
        }
        break;
      }
    }

    // Calcular porcentagem de progresso
    let progress = 0;
    if (nextLevelPoints && currentLevelPoints !== nextLevelPoints) {
      progress = Math.min(
        100,
        Math.round(
          ((totalPoints - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100
        )
      );
    }

    return {
      level: currentLevel,
      nextLevel,
      currentPoints: totalPoints,
      pointsForNextLevel: nextLevelPoints || totalPoints,
      progress
    };
  }

  /**
   * Atualizar pontos semanais do usuário
   */
  async updateUserWeeklyPoints(userId, points) {
    try {
      await this.run(
        `UPDATE gamification_profiles 
         SET weekly_points = weekly_points + ? 
         WHERE user_id = ?`,
        [points, userId]
      );
      return true;
    } catch (error) {
      console.error('Erro ao atualizar pontos semanais:', error);
      throw error;
    }
  }

  /**
   * Atualizar sequência (streak) do usuário
   */
  async updateUserStreak(userId, increment = true) {
    try {
      if (increment) {
        await this.run(
          `UPDATE gamification_profiles 
           SET streak = streak + 1,
               last_active = CURRENT_TIMESTAMP
           WHERE user_id = ?`,
          [userId]
        );
      } else {
        await this.run(
          `UPDATE gamification_profiles 
           SET streak = 0,
               last_active = CURRENT_TIMESTAMP
           WHERE user_id = ?`,
          [userId]
        );
      }
      return true;
    } catch (error) {
      console.error('Erro ao atualizar sequência:', error);
      throw error;
    }
  }

  /**
   * Verificar e atualizar nível do usuário
   */
  async checkAndUpdateUserLevel(userId) {
    try {
      const profile = await this.get(
        `SELECT * FROM gamification_profiles WHERE user_id = ?`,
        [userId]
      );

      if (!profile) {
        return false;
      }

      const settings = await this.getGamificationSettings();
      const levelThresholds = JSON.parse(settings.level_thresholds);

      // Determinar o nível correto baseado nos pontos
      let newLevel = profile.level;
      for (const [level, threshold] of Object.entries(levelThresholds)) {
        if (profile.total_points >= threshold) {
          newLevel = level;
        } else {
          break;
        }
      }

      // Se o nível mudou, atualizar
      if (newLevel !== profile.level) {
        await this.run(
          `UPDATE gamification_profiles SET level = ? WHERE user_id = ?`,
          [newLevel, userId]
        );

        // Adicionar ao histórico se o nível aumentou
        if (this.getLevelRank(newLevel, levelThresholds) > 
            this.getLevelRank(profile.level, levelThresholds)) {
          await this.addPointsHistory(
            userId, 
            0, 
            `Novo nível alcançado: ${newLevel}`, 
            'level_up', 
            null
          );
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao verificar/atualizar nível:', error);
      throw error;
    }
  }

  /**
   * Obter ranking numérico de um nível (para comparação)
   */
  getLevelRank(level, levelThresholds) {
    const levels = Object.entries(levelThresholds)
      .sort((a, b) => a[1] - b[1])
      .map(([name]) => name);
    return levels.indexOf(level);
  }

  // ===== MÉTODOS PARA CONQUISTAS =====

  /**
   * Obter todas as conquistas com progresso do usuário
   */
  async getUserAchievements(userId) {
    try {
      return await this.all(
        `SELECT 
           a.id, a.name, a.description, a.points, a.category, 
           a.difficulty, a.icon, a.requirements, a.created_at, a.updated_at,
           ua.progress, ua.completed, ua.completed_at
         FROM achievements a
         LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
         ORDER BY a.category, a.difficulty, a.name`,
        [userId]
      );
    } catch (error) {
      console.error('Erro ao buscar conquistas do usuário:', error);
      throw error;
    }
  }

  /**
   * Atualizar progresso de uma conquista
   */
  async updateAchievementProgress(userId, achievementId, progressIncrement) {
    try {
      // Verificar se já existe um registro para este usuário e conquista
      const existing = await this.get(
        `SELECT * FROM user_achievements 
         WHERE user_id = ? AND achievement_id = ?`,
        [userId, achievementId]
      );

      if (existing) {
        // Se já está completo, não atualizar
        if (existing.completed) {
          return false;
        }

        // Atualizar progresso existente
        const newProgress = Math.min(100, existing.progress + progressIncrement);
        await this.run(
          `UPDATE user_achievements 
           SET progress = ? 
           WHERE user_id = ? AND achievement_id = ?`,
          [newProgress, userId, achievementId]
        );
      } else {
        // Criar novo registro de progresso
        const progress = Math.min(100, progressIncrement);
        await this.run(
          `INSERT INTO user_achievements (user_id, achievement_id, progress, completed)
           VALUES (?, ?, ?, ?)`,
          [userId, achievementId, progress, progress >= 100 ? 1 : 0]
        );
      }

      return true;
    } catch (error) {
      console.error('Erro ao atualizar progresso de conquista:', error);
      throw error;
    }
  }

  /**
   * Verificar conquistas baseadas em critérios específicos
   */
  async checkAchievements(userId, type, value) {
    try {
      let achievements = [];
      
      // Baseado no tipo de ação, verificar conquistas relevantes
      switch (type) {
        case 'activity_completed':
          achievements = await this.all(
            `SELECT * FROM achievements 
             WHERE category = 'Atividades' AND requirements LIKE ?`,
            ['%Completar%atividade%']
          );
          break;
        case 'deal_completed':
          achievements = await this.all(
            `SELECT * FROM achievements 
             WHERE category = 'Negociações' AND requirements LIKE ?`,
            ['%Completar%negociação%']
          );
          break;
        case 'streak_updated':
          achievements = await this.all(
            `SELECT * FROM achievements 
             WHERE category = 'Engajamento' AND requirements LIKE ?`,
            ['%sequência%']
          );
          break;
        case 'level_updated':
          achievements = await this.all(
            `SELECT * FROM achievements 
             WHERE category = 'Crescimento' AND requirements LIKE ?`,
            [`%${value}%`]
          );
          break;
      }

      // Para cada conquista relevante, atualizar o progresso
      for (const achievement of achievements) {
        const progressIncrement = this.calculateProgressIncrement(achievement, type, value);
        if (progressIncrement > 0) {
          await this.updateAchievementProgress(userId, achievement.id, progressIncrement);
        }
      }

      return true;
    } catch (error) {
      console.error('Erro ao verificar conquistas:', error);
      throw error;
    }
  }

  /**
   * Calcular o incremento de progresso para uma conquista
   */
  calculateProgressIncrement(achievement, type, value) {
    // Extrair o número do requisito, ex: "Completar 10 atividades" -> 10
    const requirementMatch = achievement.requirements.match(/\d+/);
    if (!requirementMatch) return 0;
    
    const requirementValue = parseInt(requirementMatch[0], 10);
    if (isNaN(requirementValue) || requirementValue <= 0) return 0;
    
    // Calcular o incremento baseado no tipo de ação
    switch (type) {
      case 'activity_completed':
      case 'deal_completed':
        return Math.round(100 / requirementValue); // ex: 100/10 = 10% por atividade
        
      case 'streak_updated':
        if (value >= requirementValue) {
          return 100; // Completa a conquista
        } else {
          return Math.round((value / requirementValue) * 100); // % do objetivo
        }
        
      case 'level_updated':
        if (achievement.requirements.includes(value)) {
          return 100; // Completa a conquista
        }
        return 0;
        
      default:
        return 0;
    }
  }

  // ===== MÉTODOS PARA HISTÓRICO DE PONTOS =====

  /**
   * Obter histórico de pontos do usuário
   */
  async getUserPointsHistory(userId, limit = 50) {
    try {
      return await this.all(
        `SELECT * FROM points_history 
         WHERE user_id = ? 
         ORDER BY created_at DESC
         LIMIT ?`,
        [userId, limit]
      );
    } catch (error) {
      console.error('Erro ao buscar histórico de pontos:', error);
      throw error;
    }
  }

  /**
   * Adicionar entrada ao histórico de pontos
   */
  async addPointsHistory(userId, points, reason, sourceType = null, sourceId = null) {
    try {
      await this.run(
        `INSERT INTO points_history 
         (user_id, points, reason, source_type, source_id)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, points, reason, sourceType, sourceId]
      );
      return true;
    } catch (error) {
      console.error('Erro ao adicionar histórico de pontos:', error);
      throw error;
    }
  }

  // ===== MÉTODOS PARA RANKING =====

  /**
   * Obter ranking semanal
   */
  async getWeeklyRanking(limit = 20) {
    try {
      return await this.all(
        `SELECT 
           r.position,
           u.id as userId,
           u.name,
           u.avatar_initials as avatarInitials,
           u.team_id as teamId,
           gp.level,
           gp.total_points as totalPoints,
           gp.weekly_points as weeklyPoints
         FROM weekly_rankings r
         JOIN users u ON r.user_id = u.id
         JOIN gamification_profiles gp ON u.id = gp.user_id
         WHERE r.week_start = date('now', 'weekday 0', '-7 day')
         ORDER BY r.position
         LIMIT ?`,
        [limit]
      );
    } catch (error) {
      console.error('Erro ao buscar ranking semanal:', error);
      throw error;
    }
  }

  /**
   * Recalcular ranking semanal (executado periodicamente)
   */
  async recalculateWeeklyRanking() {
    try {
      // Apagar ranking da semana atual
      await this.run(
        `DELETE FROM weekly_rankings 
         WHERE week_start = date('now', 'weekday 0', '-7 day')`
      );

      // Inserir novos rankings baseados nos pontos semanais
      await this.run(
        `INSERT INTO weekly_rankings (user_id, week_start, position, points)
         SELECT 
           user_id, 
           date('now', 'weekday 0', '-7 day'),
           ROW_NUMBER() OVER (ORDER BY weekly_points DESC),
           weekly_points
         FROM gamification_profiles
         WHERE weekly_points > 0
         ORDER BY weekly_points DESC`
      );

      return true;
    } catch (error) {
      console.error('Erro ao recalcular ranking semanal:', error);
      throw error;
    }
  }

  // ===== MÉTODOS PARA CONFIGURAÇÕES =====

  /**
   * Obter configurações de gamificação
   */
  async getGamificationSettings() {
    try {
      return await this.get(
        `SELECT * FROM gamification_settings WHERE active = 1 ORDER BY version DESC LIMIT 1`
      );
    } catch (error) {
      console.error('Erro ao buscar configurações de gamificação:', error);
      throw error;
    }
  }

  /**
   * Atualizar configurações de gamificação
   */
  async updateGamificationSettings(settings) {
    try {
      // Desativar configurações atuais
      await this.run(
        `UPDATE gamification_settings SET active = 0 WHERE active = 1`
      );

      // Obter a última versão
      const lastVersion = await this.get(
        `SELECT MAX(version) as version FROM gamification_settings`
      );
      const newVersion = (lastVersion?.version || 0) + 1;

      // Inserir novas configurações
      await this.run(
        `INSERT INTO gamification_settings 
         (level_thresholds, points_decay_rate, streak_requirement_hours, version, active)
         VALUES (?, ?, ?, ?, 1)`,
        [
          JSON.stringify(settings.levelThresholds),
          settings.pointsDecayRate,
          settings.streakRequirementHours,
          newVersion
        ]
      );

      return true;
    } catch (error) {
      console.error('Erro ao atualizar configurações de gamificação:', error);
      throw error;
    }
  }

  /**
   * Aplicar decaimento de pontos semanais (executado semanalmente)
   */
  async applyWeeklyPointsDecay() {
    try {
      const settings = await this.getGamificationSettings();
      const decayRate = settings.points_decay_rate;

      if (decayRate > 0) {
        await this.run(
          `UPDATE gamification_profiles 
           SET weekly_points = CAST(weekly_points * (1 - ?) AS INTEGER)`,
          [decayRate]
        );
      }

      return true;
    } catch (error) {
      console.error('Erro ao aplicar decaimento de pontos semanais:', error);
      throw error;
    }
  }
}

module.exports = new GamificationRepository(); 