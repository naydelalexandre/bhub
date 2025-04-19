import express from 'express';
import { authenticateUser } from '../middleware/auth';
import { gamificationService } from '../gamification-service';
import { GamificationProfile, UserAchievement } from '../../shared/gamification-schema';
import { Permission, requirePermission } from '../middleware/permission';
import { storage } from '../storage';
import { User } from '../../shared/schema';

const router = express.Router();

// Obter perfil de gamificação do usuário
router.get('/profile', authenticateUser, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    const userId = req.user.id;
    const profile = await gamificationService.ensureProfileExists(userId);
    
    // Calcular progresso do nível
    const levelProgress = await gamificationService.calculateLevelProgress(userId);
    
    res.json({
      profile,
      levelProgress
    });
  } catch (error) {
    console.error('Erro ao obter perfil de gamificação:', error);
    res.status(500).json({ message: 'Erro ao obter perfil de gamificação' });
  }
});

// Obter histórico de pontos do usuário
router.get('/points-history', authenticateUser, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    const userId = req.user.id;
    const pointsHistory = await gamificationService.getPointsHistory(userId);
    
    res.json(pointsHistory);
  } catch (error) {
    console.error('Erro ao obter histórico de pontos:', error);
    res.status(500).json({ message: 'Erro ao obter histórico de pontos' });
  }
});

// Obter todas as conquistas
router.get('/achievements', authenticateUser, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    const userId = req.user.id;
    
    // Buscar todas as conquistas
    const allAchievements = await gamificationService.getAllAchievements();
    
    // Buscar o perfil para verificar progresso das conquistas
    const profile = await gamificationService.getProfileByUser(userId);
    
    // Mapear conquistas com progresso do usuário
    const achievementsWithProgress = allAchievements.map(achievement => {
      const userAchievement = profile?.achievements.find(
        a => a.achievementId === achievement.id
      );
      
      return {
        ...achievement,
        progress: userAchievement?.progress || 0,
        completed: userAchievement?.completed || false,
        completedAt: userAchievement?.completedAt
      };
    });
    
    res.json(achievementsWithProgress);
  } catch (error) {
    console.error('Erro ao obter conquistas:', error);
    res.status(500).json({ message: 'Erro ao obter conquistas' });
  }
});

// Obter ranking semanal
router.get('/weekly-ranking', authenticateUser, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    const userId = req.user.id;
    const userRole = req.user.role;
    let ranking;
    
    if (userRole === 'director') {
      // Diretores veem o ranking global
      ranking = await gamificationService.getWeeklyRanking();
    } else {
      // Gerentes e corretores veem apenas o ranking de sua equipe
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      
      const teamId = user.teamId;
      if (!teamId && userRole === 'manager') {
        // Se o gerente não tem equipe, mostrar os corretores que ele gerencia
        const managedBrokers = await storage.getBrokersByManager(userId);
        const brokerIds = managedBrokers.map(broker => broker.id);
        ranking = (await gamificationService.getWeeklyRanking())
          .filter(item => brokerIds.includes(item.userId));
      } else if (!teamId) {
        // Se não tem equipe e não é gerente, mostrar apenas o próprio usuário
        ranking = (await gamificationService.getWeeklyRanking())
          .filter(item => item.userId === userId);
      } else {
        // Filtrar ranking por membros da mesma equipe
        const teamMembers = await storage.getUsersByTeam(teamId);
        const teamMemberIds = teamMembers.map(member => member.id);
        ranking = (await gamificationService.getWeeklyRanking())
          .filter(item => teamMemberIds.includes(item.userId));
      }
    }
    
    res.json(ranking);
  } catch (error) {
    console.error('Erro ao obter ranking semanal:', error);
    res.status(500).json({ message: 'Erro ao obter ranking semanal' });
  }
});

// Rota para diretores verem o resumo de gamificação da empresa
router.get('/company-summary', 
  authenticateUser,
  requirePermission(Permission.VIEW_GLOBAL_RANKING),
  async (req, res) => {
    try {
      // Obter todos os perfis de gamificação
      const profiles = await gamificationService.getAllProfiles();
      
      // Estatísticas por nível
      const levelStats = {
        bronze: profiles.filter(p => p.level === 'bronze').length,
        silver: profiles.filter(p => p.level === 'silver').length,
        gold: profiles.filter(p => p.level === 'gold').length,
        platinum: profiles.filter(p => p.level === 'platinum').length,
        diamond: profiles.filter(p => p.level === 'diamond').length
      };
      
      // Estatísticas de conquistas
      const achievementsStats = {
        total: 0,
        completed: 0,
        completionRate: 0
      };
      
      profiles.forEach(profile => {
        achievementsStats.total += profile.achievements.length;
        achievementsStats.completed += profile.achievements.filter(a => a.completed).length;
      });
      
      if (achievementsStats.total > 0) {
        achievementsStats.completionRate = Math.round((achievementsStats.completed / achievementsStats.total) * 100);
      }
      
      // Estatísticas de pontos
      const pointsStats = {
        total: profiles.reduce((sum, profile) => sum + profile.totalPoints, 0),
        average: 0,
        highest: Math.max(...profiles.map(p => p.totalPoints)),
        weeklyTotal: profiles.reduce((sum, profile) => sum + profile.weeklyPoints, 0)
      };
      
      if (profiles.length > 0) {
        pointsStats.average = Math.round(pointsStats.total / profiles.length);
      }
      
      // Resumo geral
      const summary = {
        totalUsers: profiles.length,
        levelDistribution: levelStats,
        achievements: achievementsStats,
        points: pointsStats,
        lastUpdated: new Date()
      };
      
      res.json(summary);
    } catch (error) {
      console.error('Erro ao obter resumo de gamificação da empresa:', error);
      res.status(500).json({ message: 'Erro ao obter resumo de gamificação da empresa' });
    }
});

// Rota para visualizar ranking por tipo de usuário (para diretores e gerentes)
router.get('/role-ranking', 
  authenticateUser,
  async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }
      const userRole = req.user.role;
      const userId = req.user.id;
      
      // Verificar permissões
      if (userRole !== 'director' && userRole !== 'manager') {
        return res.status(403).json({ message: 'Acesso restrito aos diretores e gerentes' });
      }
      
      // Obter role de interesse (manager ou broker)
      const role = req.query.role as string;
      if (role !== 'manager' && role !== 'broker') {
        return res.status(400).json({ message: 'Parâmetro role deve ser "manager" ou "broker"' });
      }
      
      // Obter todos os usuários do role especificado
      let users: User[] = [];
      if (userRole === 'director') {
        // Diretores veem todos os usuários
        users = await storage.getUsersByRole(role as 'manager' | 'broker');
      } else {
        // Gerentes veem apenas os usuários de sua equipe
        if (role === 'manager') {
          // Gerentes não podem ver outros gerentes
          return res.status(403).json({ message: 'Gerentes não podem ver ranking de outros gerentes' });
        }
        
        // Obter corretores gerenciados pelo gerente
        users = await storage.getBrokersByManager(userId);
      }
      
      // Obter perfis de gamificação para esses usuários
      const profilesPromises = users.map(user => 
        gamificationService.getProfileByUser(user.id)
      );
      
      const profiles = await Promise.all(profilesPromises);
      
      // Combinar dados de usuário com perfil de gamificação
      const rankingData = users.map((user, index) => {
        const profile = profiles[index];
        return {
          userId: user.id,
          name: user.name,
          avatarInitials: user.avatarInitials,
          teamId: user.teamId,
          totalPoints: profile?.totalPoints || 0,
          weeklyPoints: profile?.weeklyPoints || 0,
          level: profile?.level || 'bronze',
          achievements: {
            total: profile?.achievements.length || 0,
            completed: profile?.achievements.filter(a => a.completed).length || 0
          }
        };
      });
      
      // Ordenar por pontos totais
      const sortedRanking = rankingData.sort((a, b) => b.totalPoints - a.totalPoints);
      
      res.json(sortedRanking);
    } catch (error) {
      console.error('Erro ao obter ranking por tipo de usuário:', error);
      res.status(500).json({ message: 'Erro ao obter ranking por tipo de usuário' });
    }
});

// Rota para diretores verem o resumo de gamificação por equipe
router.get('/team-summary/:teamId', 
  authenticateUser,
  async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }
      const userRole = req.user.role;
      const userId = req.user.id;
      const teamId = parseInt(req.params.teamId);
      
      // Verificar acesso à equipe
      if (userRole === 'director') {
        // Diretores têm acesso a todas as equipes
      } else if (userRole === 'manager') {
        // Verificar se o gerente é responsável pela equipe
        const team = await storage.getTeam(teamId);
        if (!team || team.managerId !== userId) {
          return res.status(403).json({ message: 'Acesso restrito ao gerente responsável pela equipe' });
        }
      } else {
        // Verificar se o corretor pertence à equipe
        const user = await storage.getUser(userId);
        if (!user || user.teamId !== teamId) {
          return res.status(403).json({ message: 'Acesso restrito a membros da equipe' });
        }
      }
      
      // Obter membros da equipe
      const teamMembers = await storage.getUsersByTeam(teamId);
      
      // Obter perfil de gamificação para cada membro
      const profilePromises = teamMembers.map(member => 
        gamificationService.getProfileByUser(member.id)
      );
      
      const profiles = await Promise.all(profilePromises);
      
      // Estatísticas por nível
      const levelStats = {
        bronze: profiles.filter(p => p?.level === 'bronze').length,
        silver: profiles.filter(p => p?.level === 'silver').length,
        gold: profiles.filter(p => p?.level === 'gold').length,
        platinum: profiles.filter(p => p?.level === 'platinum').length,
        diamond: profiles.filter(p => p?.level === 'diamond').length
      };
      
      // Estatísticas de conquistas
      const achievementsStats = {
        total: 0,
        completed: 0,
        completionRate: 0
      };
      
      profiles.forEach(profile => {
        if (profile) {
          achievementsStats.total += profile.achievements.length;
          achievementsStats.completed += profile.achievements.filter(a => a.completed).length;
        }
      });
      
      if (achievementsStats.total > 0) {
        achievementsStats.completionRate = Math.round((achievementsStats.completed / achievementsStats.total) * 100);
      }
      
      // Obter a equipe
      const team = await storage.getTeam(teamId);
      
      // Resumo da equipe
      const summary = {
        teamId,
        teamName: team?.name || 'Equipe',
        managerId: team?.managerId,
        totalMembers: teamMembers.length,
        levelDistribution: levelStats,
        achievements: achievementsStats,
        totalPoints: profiles.reduce((sum, profile) => sum + (profile?.totalPoints || 0), 0),
        weeklyPoints: profiles.reduce((sum, profile) => sum + (profile?.weeklyPoints || 0), 0),
        members: teamMembers.map((member, index) => ({
          userId: member.id,
          name: member.name,
          avatarInitials: member.avatarInitials,
          role: member.role,
          totalPoints: profiles[index]?.totalPoints || 0,
          weeklyPoints: profiles[index]?.weeklyPoints || 0,
          level: profiles[index]?.level || 'bronze'
        })).sort((a, b) => b.totalPoints - a.totalPoints)
      };
      
      res.json(summary);
    } catch (error) {
      console.error('Erro ao obter resumo da equipe:', error);
      res.status(500).json({ message: 'Erro ao obter resumo da equipe' });
    }
});

// Rota para fins de teste/simulação - adicionar pontos manualmente
router.post('/test/add-points', authenticateUser, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    const userId = req.user.id;
    const { points, reason } = req.body;
    
    if (!points || !reason) {
      return res.status(400).json({ message: 'Pontos e motivo são obrigatórios' });
    }
    
    const profile = await gamificationService.addPoints(
      userId, 
      parseInt(points), 
      reason
    );
    
    res.json({ 
      message: `${points} pontos adicionados com sucesso!`,
      profile
    });
  } catch (error) {
    console.error('Erro ao adicionar pontos:', error);
    res.status(500).json({ message: 'Erro ao adicionar pontos' });
  }
});

// Rota para diretores visualizarem estatísticas agrupadas por categorias de corretores
router.get('/broker-categories', 
  authenticateUser,
  requirePermission(Permission.VIEW_GLOBAL_RANKING),
  async (req, res) => {
    try {
      if (req.user?.role !== 'director') {
        return res.status(403).json({ message: 'Acesso restrito a diretores' });
      }
      
      // Obter todos os corretores
      const brokers = await storage.getUsersByRole('broker');
      
      // Obter perfis de gamificação para cada corretor
      const profilePromises = brokers.map(broker => 
        gamificationService.getProfileByUser(broker.id)
      );
      
      const profiles = await Promise.all(profilePromises);
      
      // Combinar dados de corretor com seu perfil de gamificação
      const brokersWithProfiles = brokers.map((broker, index) => {
        const profile = profiles[index];
        return {
          id: broker.id,
          name: broker.name,
          teamId: broker.teamId,
          totalPoints: profile?.totalPoints || 0,
          weeklyPoints: profile?.weeklyPoints || 0,
          level: profile?.level || 'bronze',
          achievementsCompleted: profile?.achievements.filter(a => a.completed).length || 0,
          // Obter dados de performance do corretor
          performance: {
            activitiesCompleted: 0, // Será preenchido a seguir
            dealsCompleted: 0      // Será preenchido a seguir
          }
        };
      });
      
      // Obter atividades e negócios por corretor
      for (const broker of brokersWithProfiles) {
        const activities = await storage.getActivitiesByUser(broker.id);
        broker.performance.activitiesCompleted = activities.filter(a => a.completed).length;
        
        const deals = await storage.getDealsByUser(broker.id);
        broker.performance.dealsCompleted = deals.filter(d => d.stage === 'closed').length;
      }
      
      // Categorizar corretores baseado em performance
      const categorizedBrokers = {
        highPerformers: brokersWithProfiles.filter(b => 
          b.performance.dealsCompleted >= 3 &&
          b.performance.activitiesCompleted >= 10 &&
          b.totalPoints >= 1000
        ),
        
        growingPerformers: brokersWithProfiles.filter(b => 
          (b.performance.dealsCompleted >= 1 && b.performance.dealsCompleted < 3) &&
          (b.performance.activitiesCompleted >= 5 && b.performance.activitiesCompleted < 10) &&
          (b.totalPoints >= 500 && b.totalPoints < 1000)
        ),
        
        newBrokers: brokersWithProfiles.filter(b => 
          b.performance.dealsCompleted < 1 &&
          b.performance.activitiesCompleted < 5 &&
          b.totalPoints < 500
        )
      };
      
      // Calcular estatísticas para cada categoria
      const calculateCategoryStats = (brokers) => {
        if (brokers.length === 0) return null;
        
        return {
          count: brokers.length,
          avgPoints: Math.round(brokers.reduce((sum, b) => sum + b.totalPoints, 0) / brokers.length),
          avgWeeklyPoints: Math.round(brokers.reduce((sum, b) => sum + b.weeklyPoints, 0) / brokers.length),
          avgActivities: Math.round(brokers.reduce((sum, b) => sum + b.performance.activitiesCompleted, 0) / brokers.length),
          avgDeals: Math.round(brokers.reduce((sum, b) => sum + b.performance.dealsCompleted, 0) / brokers.length * 10) / 10,
          levelDistribution: {
            bronze: brokers.filter(b => b.level === 'bronze').length,
            silver: brokers.filter(b => b.level === 'silver').length,
            gold: brokers.filter(b => b.level === 'gold').length,
            platinum: brokers.filter(b => b.level === 'platinum').length,
            diamond: brokers.filter(b => b.level === 'diamond').length
          }
        };
      };
      
      const result = {
        highPerformers: {
          brokers: categorizedBrokers.highPerformers.map(b => ({
            id: b.id,
            name: b.name,
            level: b.level,
            totalPoints: b.totalPoints
          })),
          stats: calculateCategoryStats(categorizedBrokers.highPerformers)
        },
        growingPerformers: {
          brokers: categorizedBrokers.growingPerformers.map(b => ({
            id: b.id,
            name: b.name,
            level: b.level,
            totalPoints: b.totalPoints
          })),
          stats: calculateCategoryStats(categorizedBrokers.growingPerformers)
        },
        newBrokers: {
          brokers: categorizedBrokers.newBrokers.map(b => ({
            id: b.id,
            name: b.name,
            level: b.level,
            totalPoints: b.totalPoints
          })),
          stats: calculateCategoryStats(categorizedBrokers.newBrokers)
        },
        totalBrokers: brokersWithProfiles.length,
        lastUpdated: new Date()
      };
      
      res.json(result);
    } catch (error) {
      console.error('Erro ao obter categorias de corretores:', error);
      res.status(500).json({ message: 'Erro ao obter categorias de corretores' });
    }
});

export default router; 