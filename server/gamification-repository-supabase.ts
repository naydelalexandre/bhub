import { supabase } from './supabase';

class GamificationRepository {
  constructor() {
    console.log('Inicializando GamificationRepository com Supabase');
  }

  // ===== MÉTODOS PARA PERFIL DO USUÁRIO =====

  /**
   * Obter perfil de gamificação completo do usuário
   */
  async getUserProfile(userId) {
    try {
      // Obter o perfil básico
      const { data: profile, error: profileError } = await supabase
        .from('gamification_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        console.error('Erro ao buscar perfil de gamificação:', profileError);
        return null;
      }

      // Obter as conquistas do usuário
      const achievements = await this.getUserAchievements(userId);
      profile.achievements = achievements;

      // Obter informações de nível
      const settings = await this.getGamificationSettings();
      const levelThresholds = settings.level_thresholds;
      
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
    // Converter para objeto se receber como string JSON
    const thresholds = typeof levelThresholds === 'string' 
      ? JSON.parse(levelThresholds) 
      : levelThresholds;
    
    // Ordenar níveis por pontos necessários
    const levels = Object.entries(thresholds)
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
      const { error } = await supabase
        .from('gamification_profiles')
        .update({ weekly_points: supabase.raw(`weekly_points + ${points}`) })
        .eq('user_id', userId);
        
      if (error) {
        console.error('Erro ao atualizar pontos semanais:', error);
        return false;
      }
      
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
      const update = increment 
        ? { 
            streak: supabase.raw('streak + 1'),
            last_active: new Date().toISOString()
          }
        : {
            streak: 0,
            last_active: new Date().toISOString()
          };
          
      const { error } = await supabase
        .from('gamification_profiles')
        .update(update)
        .eq('user_id', userId);
        
      if (error) {
        console.error('Erro ao atualizar sequência:', error);
        return false;
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
      const { data: profile, error: profileError } = await supabase
        .from('gamification_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        console.error('Erro ao buscar perfil para atualização de nível:', profileError);
        return false;
      }

      const settings = await this.getGamificationSettings();
      const levelThresholds = typeof settings.level_thresholds === 'string' 
        ? JSON.parse(settings.level_thresholds) 
        : settings.level_thresholds;

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
        const { error: updateError } = await supabase
          .from('gamification_profiles')
          .update({ level: newLevel })
          .eq('user_id', userId);
          
        if (updateError) {
          console.error('Erro ao atualizar nível do usuário:', updateError);
          return false;
        }

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
          
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao verificar e atualizar nível:', error);
      throw error;
    }
  }

  /**
   * Obter ranking numérico do nível
   */
  getLevelRank(level, levelThresholds) {
    const levels = Object.keys(levelThresholds).sort((a, b) => 
      levelThresholds[a] - levelThresholds[b]
    );
    return levels.indexOf(level);
  }

  /**
   * Obter conquistas do usuário
   */
  async getUserAchievements(userId) {
    try {
      // Obter todas as conquistas disponíveis
      const { data: allAchievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*');
        
      if (achievementsError) {
        console.error('Erro ao buscar conquistas:', achievementsError);
        return [];
      }
      
      // Obter progresso do usuário
      const { data: userProgress, error: progressError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId);
        
      if (progressError) {
        console.error('Erro ao buscar progresso de conquistas do usuário:', progressError);
        return [];
      }
      
      // Mapear o progresso do usuário para cada conquista
      const userProgressMap = new Map();
      userProgress.forEach(progress => {
        userProgressMap.set(progress.achievement_id, progress);
      });
      
      // Combinar conquistas com progresso do usuário
      const achievements = allAchievements.map(achievement => {
        const progress = userProgressMap.get(achievement.id);
        return {
          ...achievement,
          current_progress: progress ? progress.progress : 0,
          completed: progress ? progress.completed : false
        };
      });
      
      return achievements;
    } catch (error) {
      console.error('Erro ao buscar conquistas do usuário:', error);
      throw error;
    }
  }

  /**
   * Atualizar progresso de conquista
   */
  async updateAchievementProgress(userId, achievementId, progressIncrement) {
    try {
      // Buscar conquista e progresso atual
      const { data: achievement, error: achievementError } = await supabase
        .from('achievements')
        .select('*')
        .eq('id', achievementId)
        .single();
        
      if (achievementError) {
        console.error('Erro ao buscar detalhe da conquista:', achievementError);
        return false;
      }
      
      // Verificar se o usuário já tem progresso nesta conquista
      const { data: userAchievement, error: userAchievementError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .eq('achievement_id', achievementId)
        .single();
        
      let completed = false;
      let newProgress = progressIncrement;
      
      if (userAchievementError && userAchievementError.code !== 'PGRST116') {
        console.error('Erro ao buscar progresso atual da conquista:', userAchievementError);
        return false;
      }
      
      // Se já existe progresso, atualizar
      if (userAchievement) {
        // Se já completou, não fazer nada
        if (userAchievement.completed) {
          return false;
        }
        
        newProgress = userAchievement.progress + progressIncrement;
        completed = newProgress >= achievement.target_progress;
        
        const { error: updateError } = await supabase
          .from('user_achievements')
          .update({ 
            progress: newProgress,
            completed: completed
          })
          .eq('user_id', userId)
          .eq('achievement_id', achievementId);
          
        if (updateError) {
          console.error('Erro ao atualizar progresso da conquista:', updateError);
          return false;
        }
      } 
      // Caso contrário, criar novo registro
      else {
        completed = progressIncrement >= achievement.target_progress;
        
        const { error: insertError } = await supabase
          .from('user_achievements')
          .insert({
            user_id: userId,
            achievement_id: achievementId,
            progress: progressIncrement,
            completed: completed
          });
          
        if (insertError) {
          console.error('Erro ao criar progresso de conquista:', insertError);
          return false;
        }
      }
      
      // Se completou, adicionar pontos ao usuário e registrar no histórico
      if (completed) {
        // Adicionar pontos
        const { error: profileError } = await supabase
          .from('gamification_profiles')
          .update({ 
            total_points: supabase.raw(`total_points + ${achievement.points}`),
            weekly_points: supabase.raw(`weekly_points + ${achievement.points}`)
          })
          .eq('user_id', userId);
          
        if (profileError) {
          console.error('Erro ao adicionar pontos por conquista:', profileError);
        }
        
        // Registrar no histórico
        await this.addPointsHistory(
          userId, 
          achievement.points,
          `Conquista completada: ${achievement.name}`,
          'achievement',
          achievementId
        );
        
        // Verificar se subiu de nível
        await this.checkAndUpdateUserLevel(userId);
      }
      
      return completed;
    } catch (error) {
      console.error('Erro ao atualizar progresso de conquista:', error);
      throw error;
    }
  }

  /**
   * Verificar conquistas baseadas em eventos
   */
  async checkAchievements(userId, type, value) {
    try {
      // Buscar todas as conquistas do tipo especificado
      const { data: achievements, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('trigger_type', type);
        
      if (error) {
        console.error(`Erro ao buscar conquistas do tipo ${type}:`, error);
        return;
      }
      
      // Para cada conquista, calcular o progresso e atualizar
      for (const achievement of achievements) {
        const progressIncrement = this.calculateProgressIncrement(achievement, type, value);
        
        if (progressIncrement > 0) {
          await this.updateAchievementProgress(userId, achievement.id, progressIncrement);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar conquistas:', error);
      throw error;
    }
  }

  /**
   * Calcular incremento de progresso para conquista
   */
  calculateProgressIncrement(achievement, type, value) {
    // Critérios dependem do tipo de conquista
    switch (type) {
      case 'login':
        // Conquistas baseadas em login diário
        return achievement.trigger_condition === 'login' ? 1 : 0;
        
      case 'activity':
        // Conquistas baseadas em atividades (concluir, criar)
        if (achievement.trigger_condition === 'complete_activity' && value === 'completed') {
          return 1;
        } else if (achievement.trigger_condition === 'create_activity') {
          return 1;
        }
        return 0;
        
      case 'deal':
        // Conquistas baseadas em negociações
        if (achievement.trigger_condition === 'close_deal' && value === 'closed') {
          return 1;
        } else if (achievement.trigger_condition === 'create_deal') {
          return 1;
        }
        return 0;
        
      case 'points':
        // Conquistas baseadas em pontos acumulados
        if (achievement.trigger_condition === 'earn_points') {
          return value; // O valor é a quantidade de pontos
        }
        return 0;
        
      default:
        return 0;
    }
  }

  /**
   * Obter histórico de pontos do usuário
   */
  async getUserPointsHistory(userId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('points_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
        
      if (error) {
        console.error('Erro ao buscar histórico de pontos:', error);
        return [];
      }
      
      return data;
    } catch (error) {
      console.error('Erro ao buscar histórico de pontos:', error);
      throw error;
    }
  }

  /**
   * Adicionar entrada no histórico de pontos
   */
  async addPointsHistory(userId, points, reason, sourceType = null, sourceId = null) {
    try {
      const { error } = await supabase
        .from('points_history')
        .insert({
          user_id: userId,
          points: points,
          reason: reason,
          source_type: sourceType,
          source_id: sourceId,
          created_at: new Date().toISOString()
        });
        
      if (error) {
        console.error('Erro ao adicionar histórico de pontos:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao adicionar histórico de pontos:', error);
      throw error;
    }
  }

  /**
   * Obter ranking semanal dos usuários
   */
  async getWeeklyRanking(limit = 20) {
    try {
      const { data, error } = await supabase
        .from('gamification_profiles')
        .select(`
          user_id,
          weekly_points,
          total_points,
          level,
          users (
            name,
            avatar_initials
          )
        `)
        .order('weekly_points', { ascending: false })
        .limit(limit);
        
      if (error) {
        console.error('Erro ao buscar ranking semanal:', error);
        return [];
      }
      
      // Formatar resposta para o formato esperado pela aplicação
      return data.map((item, index) => ({
        userId: item.user_id,
        name: item.users.name,
        avatarInitials: item.users.avatar_initials,
        level: item.level,
        weeklyPoints: item.weekly_points,
        totalPoints: item.total_points,
        position: index + 1
      }));
    } catch (error) {
      console.error('Erro ao buscar ranking semanal:', error);
      throw error;
    }
  }

  /**
   * Recalcular ranking semanal
   */
  async recalculateWeeklyRanking() {
    try {
      // Essa operação seria melhor feita por uma função SQL no Supabase
      // Mas podemos simular com select e updates
      
      const { data: profiles, error: profilesError } = await supabase
        .from('gamification_profiles')
        .select('*')
        .order('weekly_points', { ascending: false });
        
      if (profilesError) {
        console.error('Erro ao buscar perfis para recálculo de ranking:', profilesError);
        return false;
      }
      
      // Atualizar posição no ranking para cada usuário
      for (let i = 0; i < profiles.length; i++) {
        const { error: updateError } = await supabase
          .from('gamification_profiles')
          .update({ ranking_position: i + 1 })
          .eq('user_id', profiles[i].user_id);
          
        if (updateError) {
          console.error(`Erro ao atualizar posição no ranking do usuário ${profiles[i].user_id}:`, updateError);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao recalcular ranking semanal:', error);
      throw error;
    }
  }

  /**
   * Obter configurações de gamificação
   */
  async getGamificationSettings() {
    try {
      const { data, error } = await supabase
        .from('gamification_settings')
        .select('*')
        .single();
        
      if (error) {
        console.error('Erro ao buscar configurações de gamificação:', error);
        // Retornar valores padrão
        return {
          points_per_activity: 10,
          points_per_deal: 50,
          weekly_decay_percentage: 30,
          level_thresholds: {
            "Iniciante": 0,
            "Bronze": 100,
            "Prata": 500,
            "Ouro": 1000,
            "Platina": 2000,
            "Diamante": 5000,
            "Mestre": 10000
          }
        };
      }
      
      // Se level_thresholds estiver em formato JSON string, converter para objeto
      if (data.level_thresholds && typeof data.level_thresholds === 'string') {
        data.level_thresholds = JSON.parse(data.level_thresholds);
      }
      
      return data;
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
      // Garantir que level_thresholds seja armazenado como JSON
      const updatedSettings = { ...settings };
      if (updatedSettings.level_thresholds && typeof updatedSettings.level_thresholds !== 'string') {
        updatedSettings.level_thresholds = JSON.stringify(updatedSettings.level_thresholds);
      }
      
      const { error } = await supabase
        .from('gamification_settings')
        .update(updatedSettings)
        .eq('id', 1); // Assumindo que há apenas um registro de configurações
        
      if (error) {
        console.error('Erro ao atualizar configurações de gamificação:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar configurações de gamificação:', error);
      throw error;
    }
  }

  /**
   * Aplicar decay de pontos semanais (chamado normalmente por um CRON)
   */
  async applyWeeklyPointsDecay() {
    try {
      // Buscar configuração de decay
      const settings = await this.getGamificationSettings();
      const decayPercentage = settings.weekly_decay_percentage || 30;
      
      // Calcular decay para todos os usuários ativos
      const { data: profiles, error: profilesError } = await supabase
        .from('gamification_profiles')
        .select('*');
        
      if (profilesError) {
        console.error('Erro ao buscar perfis para decay semanal:', profilesError);
        return false;
      }
      
      // Para cada usuário, aplicar o decay
      for (const profile of profiles) {
        const decayAmount = Math.floor(profile.weekly_points * (decayPercentage / 100));
        const newWeeklyPoints = Math.max(0, profile.weekly_points - decayAmount);
        
        // Atualizar pontos semanais
        const { error: updateError } = await supabase
          .from('gamification_profiles')
          .update({ weekly_points: newWeeklyPoints })
          .eq('user_id', profile.user_id);
          
        if (updateError) {
          console.error(`Erro ao aplicar decay para usuário ${profile.user_id}:`, updateError);
        } else if (decayAmount > 0) {
          // Registrar decay no histórico
          await this.addPointsHistory(
            profile.user_id,
            -decayAmount,
            `Decay semanal de pontos (${decayPercentage}%)`,
            'decay'
          );
        }
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao aplicar decay semanal:', error);
      throw error;
    }
  }
}

// Exportar uma instância
const gamificationRepository = new GamificationRepository();

export { gamificationRepository };
export default gamificationRepository; 