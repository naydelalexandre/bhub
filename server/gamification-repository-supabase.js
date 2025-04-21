// Implementação básica do repositório de gamificação para Supabase
const { supabase } = require('./supabase');

class GamificationRepository {
  constructor() {
    console.log('Inicializando GamificationRepository com Supabase');
  }

  // ===== MÉTODOS PARA PERFIL DO USUÁRIO =====
  async getUserProfile(userId) {
    try {
      // Verificar se o perfil existe
      const { data: profile, error } = await supabase
        .from('gamification_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        
        // Se o perfil não existir, criar um novo
        if (error.code === 'PGRST116') {
          const newProfile = {
            user_id: userId,
            level: 'Iniciante',
            total_points: 0,
            weekly_points: 0,
            streak: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          const { data: createdProfile, error: createError } = await supabase
            .from('gamification_profiles')
            .insert(newProfile)
            .select()
            .single();
            
          if (createError) {
            console.error('Erro ao criar perfil:', createError);
            return null;
          }
          
          return {
            profile: createdProfile,
            levelProgress: {
              level: 'Iniciante',
              nextLevel: 'Bronze',
              currentPoints: 0,
              pointsForNextLevel: 100,
              progress: 0
            }
          };
        }
        
        return null;
      }

      // Calcular progresso de nível
      const levelProgress = {
        level: profile.level,
        nextLevel: this.getNextLevel(profile.level),
        currentPoints: profile.total_points,
        pointsForNextLevel: this.getPointsForNextLevel(profile.level),
        progress: this.calculateProgress(profile.total_points, profile.level)
      };

      return {
        profile,
        levelProgress
      };
    } catch (error) {
      console.error('Erro ao obter perfil de usuário:', error);
      return null;
    }
  }

  getNextLevel(currentLevel) {
    const levels = ['Iniciante', 'Bronze', 'Prata', 'Ouro', 'Platina', 'Diamante', 'Mestre'];
    const index = levels.indexOf(currentLevel);
    return index < levels.length - 1 ? levels[index + 1] : null;
  }

  getPointsForNextLevel(currentLevel) {
    const thresholds = {
      'Iniciante': 100,
      'Bronze': 500,
      'Prata': 1000,
      'Ouro': 2000,
      'Platina': 5000,
      'Diamante': 10000,
      'Mestre': 10000
    };
    
    return thresholds[currentLevel] || 0;
  }

  calculateProgress(points, currentLevel) {
    const thresholds = {
      'Iniciante': 0,
      'Bronze': 100,
      'Prata': 500,
      'Ouro': 1000,
      'Platina': 2000,
      'Diamante': 5000,
      'Mestre': 10000
    };
    
    const nextLevel = this.getNextLevel(currentLevel);
    if (!nextLevel) return 100;
    
    const currentThreshold = thresholds[currentLevel];
    const nextThreshold = thresholds[nextLevel];
    
    if (nextThreshold === currentThreshold) return 100;
    
    const progress = ((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    return Math.min(Math.max(0, Math.round(progress)), 100);
  }

  // ===== MÉTODOS PARA CONQUISTAS =====
  async getUserAchievements(userId) {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select(`
          *,
          user_achievements!inner(
            progress,
            completed,
            completed_at
          )
        `)
        .eq('user_achievements.user_id', userId);

      if (error) {
        console.error('Erro ao buscar conquistas:', error);
        return [];
      }

      return data.map(item => ({
        ...item,
        progress: item.user_achievements[0]?.progress || 0,
        completed: item.user_achievements[0]?.completed || false,
        completedAt: item.user_achievements[0]?.completed_at
      }));
    } catch (error) {
      console.error('Erro ao buscar conquistas do usuário:', error);
      return [];
    }
  }

  // ===== MÉTODOS PARA RANKING =====
  async getWeeklyRanking(limit = 20) {
    try {
      const { data, error } = await supabase
        .from('gamification_profiles')
        .select(`
          id,
          user_id,
          level,
          total_points,
          weekly_points,
          users (
            name,
            avatar_initials,
            role
          )
        `)
        .order('weekly_points', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erro ao buscar ranking:', error);
        return [];
      }

      return data.map((item, index) => ({
        userId: item.user_id,
        name: item.users?.name || 'Usuário',
        avatarInitials: item.users?.avatar_initials || '??',
        role: item.users?.role || 'broker',
        level: item.level,
        points: item.total_points,
        weeklyPoints: item.weekly_points,
        position: index + 1
      }));
    } catch (error) {
      console.error('Erro ao buscar ranking:', error);
      return [];
    }
  }

  // ===== MÉTODOS PARA HISTÓRICO DE PONTOS =====
  async getUserPointsHistory(userId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('points_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erro ao buscar histórico:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar histórico de pontos:', error);
      return [];
    }
  }

  // Métodos auxiliares
  async addPointsHistory(userId, points, reason, sourceType = null, sourceId = null) {
    // Método simplificado para adicionar pontos
    return { success: true };
  }

  async checkAchievements(userId, type, value) {
    // Método simplificado para verificar conquistas
    return;
  }

  async updateUserStreak(userId, increment = true) {
    // Método simplificado para atualizar streak
    return true;
  }

  async checkAndUpdateUserLevel(userId) {
    // Método simplificado para verificar nível
    return true;
  }

  async recalculateWeeklyRanking() {
    // Método simplificado para recalcular ranking
    return true;
  }

  async getGamificationSettings() {
    try {
      const { data, error } = await supabase
        .from('gamification_settings')
        .select('*')
        .single();

      if (error) {
        console.error('Erro ao buscar configurações:', error);
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

      return data;
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      return null;
    }
  }

  async updateGamificationSettings(settings) {
    // Método simplificado para atualizar configurações
    return true;
  }
}

// Exportar uma instância do repositório
const gamificationRepository = new GamificationRepository();
module.exports = gamificationRepository; 