import { storage } from "./storage";
import { 
  Achievement, 
  UserAchievement, 
  GamificationProfile, 
  GamificationLevel,
  PointsHistoryEntry,
  LEVEL_REQUIREMENTS,
  DEFAULT_ACHIEVEMENTS
} from "../shared/gamification-schema";

class GamificationService {
  private achievements: Map<number, Achievement> = new Map();
  private profiles: Map<number, GamificationProfile> = new Map();
  private pointsHistory: Map<number, PointsHistoryEntry> = new Map();
  
  private achievementId = 1;
  private profileId = 1;
  private pointsHistoryId = 1;
  
  constructor() {
    // Inicializar conquistas padrão
    this.initDefaultAchievements();
  }
  
  private initDefaultAchievements() {
    DEFAULT_ACHIEVEMENTS.forEach(achievement => {
      this.createAchievement({
        ...achievement,
        id: this.achievementId++,
        createdAt: new Date()
      });
    });
  }
  
  // =================== ACHIEVEMENTS ===================
  
  async getAchievement(id: number): Promise<Achievement | undefined> {
    return this.achievements.get(id);
  }
  
  async getAllAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values());
  }
  
  async createAchievement(achievement: Achievement): Promise<Achievement> {
    const id = achievement.id || this.achievementId++;
    const newAchievement = { ...achievement, id };
    this.achievements.set(id, newAchievement);
    return newAchievement;
  }
  
  // =================== PROFILES ===================
  
  async getProfile(id: number): Promise<GamificationProfile | undefined> {
    return this.profiles.get(id);
  }
  
  async getProfileByUser(userId: number): Promise<GamificationProfile | undefined> {
    return Array.from(this.profiles.values()).find(
      profile => profile.userId === userId
    );
  }
  
  async ensureProfileExists(userId: number): Promise<GamificationProfile> {
    let profile = await this.getProfileByUser(userId);
    
    if (!profile) {
      // Se o perfil não existir, cria um novo
      const achievements = await this.getAllAchievements();
      const userAchievements: UserAchievement[] = achievements.map(achievement => ({
        achievementId: achievement.id,
        progress: 0,
        completed: false
      }));
      
      profile = {
        id: this.profileId++,
        userId,
        level: "bronze",
        totalPoints: 0,
        weeklyPoints: 0,
        streak: 0,
        lastActive: new Date(),
        achievements: userAchievements,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      this.profiles.set(profile.id, profile);
    }
    
    return profile;
  }
  
  async updateProfile(id: number, updates: Partial<GamificationProfile>): Promise<GamificationProfile | undefined> {
    const profile = this.profiles.get(id);
    if (!profile) return undefined;
    
    const updatedProfile = { ...profile, ...updates, updatedAt: new Date() };
    this.profiles.set(id, updatedProfile);
    return updatedProfile;
  }
  
  // =================== POINTS ===================
  
  async addPoints(userId: number, points: number, reason: string, relatedId?: number, relatedType?: string): Promise<GamificationProfile> {
    // Buscar ou criar perfil do usuário
    const profile = await this.ensureProfileExists(userId);
    
    // Adicionar pontos
    profile.totalPoints += points;
    profile.weeklyPoints += points;
    profile.updatedAt = new Date();
    
    // Atualizar nível com base nos pontos
    profile.level = this.calculateLevel(profile.totalPoints);
    
    // Registrar no histórico
    this.pointsHistory.set(this.pointsHistoryId++, {
      id: this.pointsHistoryId,
      userId,
      points,
      reason,
      relatedId,
      relatedType,
      createdAt: new Date()
    });
    
    // Atualizar perfil
    this.profiles.set(profile.id, profile);
    
    // Verificar conquistas após ganhar pontos
    await this.checkAchievements(userId);
    
    return profile;
  }
  
  async getPointsHistory(userId: number): Promise<PointsHistoryEntry[]> {
    return Array.from(this.pointsHistory.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  // =================== LEVELS ===================
  
  private calculateLevel(totalPoints: number): GamificationLevel {
    if (totalPoints >= LEVEL_REQUIREMENTS.diamond) return "diamond";
    if (totalPoints >= LEVEL_REQUIREMENTS.platinum) return "platinum";
    if (totalPoints >= LEVEL_REQUIREMENTS.gold) return "gold";
    if (totalPoints >= LEVEL_REQUIREMENTS.silver) return "silver";
    return "bronze";
  }
  
  async calculateLevelProgress(userId: number): Promise<{
    level: GamificationLevel;
    nextLevel: GamificationLevel | null;
    currentPoints: number;
    pointsForNextLevel: number;
    progress: number;
  }> {
    const profile = await this.ensureProfileExists(userId);
    const currentLevel = profile.level;
    const currentPoints = profile.totalPoints;
    
    const levels: GamificationLevel[] = ["bronze", "silver", "gold", "platinum", "diamond"];
    const currentLevelIndex = levels.indexOf(currentLevel);
    const nextLevel = currentLevelIndex < levels.length - 1 ? levels[currentLevelIndex + 1] : null;
    
    if (!nextLevel) {
      return {
        level: currentLevel,
        nextLevel: null,
        currentPoints,
        pointsForNextLevel: 0,
        progress: 100
      };
    }
    
    const currentLevelMinPoints = LEVEL_REQUIREMENTS[currentLevel];
    const nextLevelMinPoints = LEVEL_REQUIREMENTS[nextLevel];
    const pointsForNextLevel = nextLevelMinPoints - currentLevelMinPoints;
    const pointsEarned = currentPoints - currentLevelMinPoints;
    const progress = Math.min(100, Math.round((pointsEarned / pointsForNextLevel) * 100));
    
    return {
      level: currentLevel,
      nextLevel,
      currentPoints,
      pointsForNextLevel,
      progress
    };
  }
  
  // =================== ACHIEVEMENTS ===================
  
  async updateAchievementProgress(userId: number, achievementId: number, progress: number): Promise<UserAchievement | undefined> {
    const profile = await this.ensureProfileExists(userId);
    const achievement = await this.getAchievement(achievementId);
    
    if (!achievement) return undefined;
    
    const userAchievementIndex = profile.achievements.findIndex(
      a => a.achievementId === achievementId
    );
    
    if (userAchievementIndex === -1) return undefined;
    
    const userAchievement = profile.achievements[userAchievementIndex];
    
    // Se já completou, não atualiza mais
    if (userAchievement.completed) return userAchievement;
    
    // Atualiza o progresso
    userAchievement.progress = progress;
    
    // Verifica se completou a conquista
    if (progress >= achievement.requirement && !userAchievement.completed) {
      userAchievement.completed = true;
      userAchievement.completedAt = new Date();
      
      // Adiciona pontos de recompensa por completar a conquista
      await this.addPoints(
        userId, 
        achievement.pointsReward, 
        `Conquista: ${achievement.title}`, 
        achievement.id, 
        "achievement"
      );
      
      // Notifica o usuário
      await storage.createNotification({
        type: "achievement",
        title: "Nova Conquista!",
        content: `Você desbloqueou a conquista "${achievement.title}"!`,
        userId,
        relatedId: achievement.id,
        relatedType: "achievement"
      });
    }
    
    // Atualiza os achievements no perfil
    profile.achievements[userAchievementIndex] = userAchievement;
    await this.updateProfile(profile.id, { achievements: profile.achievements });
    
    return userAchievement;
  }
  
  async getCompletedAchievements(userId: number): Promise<Achievement[]> {
    const profile = await this.ensureProfileExists(userId);
    const completedAchievementIds = profile.achievements
      .filter(a => a.completed)
      .map(a => a.achievementId);
    
    return (await this.getAllAchievements())
      .filter(achievement => completedAchievementIds.includes(achievement.id));
  }
  
  async checkAchievements(userId: number): Promise<void> {
    // Este método é chamado após ações importantes do usuário
    // para verificar se alguma conquista foi alcançada
    
    const user = await storage.getUser(userId);
    if (!user) return;
    
    const profile = await this.ensureProfileExists(userId);
    const allAchievements = await this.getAllAchievements();
    
    // Verificar conquistas relacionadas a atividades
    if (user.role === "broker") {
      const activities = await storage.getActivitiesByUser(userId);
      const completedActivities = activities.filter(activity => activity.status === "completed");
      
      // Conquista "Velocista" - Atividades completadas antes do prazo
      const timelyActivities = completedActivities.filter(activity => {
        const dueDate = new Date(activity.dueDate);
        const completedAt = activity.updatedAt || new Date();
        return completedAt < dueDate;
      });
      
      const velocista = allAchievements.find(a => a.title === "Velocista");
      if (velocista) {
        await this.updateAchievementProgress(userId, velocista.id, timelyActivities.length);
      }
      
      // Conquista "Super Produtivo" - 10 atividades em um dia
      const activityCountByDay = new Map<string, number>();
      completedActivities.forEach(activity => {
        const date = new Date(activity.updatedAt || new Date()).toISOString().split('T')[0];
        activityCountByDay.set(date, (activityCountByDay.get(date) || 0) + 1);
      });
      
      const maxActivitiesInDay = Math.max(...Array.from(activityCountByDay.values()), 0);
      const superProdutivo = allAchievements.find(a => a.title === "Super Produtivo");
      if (superProdutivo) {
        await this.updateAchievementProgress(userId, superProdutivo.id, maxActivitiesInDay);
      }
    }
    
    // Verificar conquistas relacionadas a negociações
    if (user.role === "broker") {
      const deals = await storage.getDealsByUser(userId);
      const closedDeals = deals.filter(deal => deal.stage === "closing");
      
      // Conquista "Negociador Master" - 3 negociações em uma semana
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const recentClosedDeals = closedDeals.filter(deal => {
        const lastUpdated = new Date(deal.lastUpdated);
        return lastUpdated >= oneWeekAgo;
      });
      
      const negociadorMaster = allAchievements.find(a => a.title === "Negociador Master");
      if (negociadorMaster) {
        await this.updateAchievementProgress(userId, negociadorMaster.id, recentClosedDeals.length);
      }
    }
    
    // Verificar conquistas relacionadas à comunicação e streak
    // Estas precisariam de dados mais específicos sobre logins e comunicação diária
    // que podem ser implementados em uma versão futura
  }
  
  // =================== RANKINGS ===================
  
  async getWeeklyRanking(): Promise<{
    userId: number;
    name: string;
    role: string;
    level: GamificationLevel;
    points: number;
    activities: number;
    deals: number;
  }[]> {
    const profiles = Array.from(this.profiles.values());
    const ranking = [];
    
    for (const profile of profiles) {
      const user = await storage.getUser(profile.userId);
      if (!user || user.role !== "broker") continue;
      
      const activities = await storage.getActivitiesByUser(profile.userId);
      const completedActivities = activities.filter(a => a.status === "completed").length;
      
      const deals = await storage.getDealsByUser(profile.userId);
      const progressedDeals = deals.filter(d => d.stage !== "initial_contact").length;
      
      ranking.push({
        userId: profile.userId,
        name: user.name,
        role: user.role,
        level: profile.level,
        points: profile.weeklyPoints,
        activities: completedActivities,
        deals: progressedDeals
      });
    }
    
    // Ordenar por pontos (decrescente)
    return ranking.sort((a, b) => b.points - a.points);
  }
  
  // Métodos para eventos específicos do sistema
  
  async onActivityCompleted(userId: number, activityId: number, isTimely: boolean): Promise<void> {
    // Conceder pontos básicos por completar atividade
    const points = isTimely ? 10 : 5; // Mais pontos se completou antes do prazo
    
    await this.addPoints(
      userId,
      points,
      `Atividade ${activityId} concluída${isTimely ? ' antes do prazo' : ''}`,
      activityId,
      "activity"
    );
    
    // Verificar conquistas
    await this.checkAchievements(userId);
  }
  
  async onDealProgressed(userId: number, dealId: number, fromStage: string, toStage: string): Promise<void> {
    // Pontos ganhos dependem da progressão na etapa
    const stageValues: {[key: string]: number} = {
      "initial_contact": 1,
      "visit": 2,
      "proposal": 3,
      "closing": 4
    };
    
    const fromValue = stageValues[fromStage] || 0;
    const toValue = stageValues[toStage] || 0;
    
    // Se avançou de etapa
    if (toValue > fromValue) {
      const points = 10 * (toValue - fromValue); // 10 pontos por etapa avançada
      
      // Bônus especial por fechar negócio
      const closingBonus = toStage === "closing" ? 25 : 0;
      
      await this.addPoints(
        userId,
        points + closingBonus,
        `Negociação ${dealId} avançou para ${toStage}`,
        dealId,
        "deal"
      );
      
      // Verificar conquistas
      await this.checkAchievements(userId);
    }
  }
  
  async onMessageSent(userId: number): Promise<void> {
    // Pontos por comunicação ativa
    await this.addPoints(
      userId,
      2,
      "Comunicação ativa",
      undefined,
      "communication"
    );
    
    // Verificar conquistas de comunicação
    const profile = await this.ensureProfileExists(userId);
    const comunicador = Array.from(this.achievements.values()).find(a => a.title === "Comunicador");
    
    if (comunicador) {
      // Atualizar lastActive
      const lastActive = profile.lastActive;
      const now = new Date();
      profile.lastActive = now;
      
      // Se estava ativo ontem, incrementa o streak
      if (lastActive) {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastActive.toDateString() === yesterday.toDateString()) {
          profile.streak += 1;
        } else if (lastActive.toDateString() !== now.toDateString()) {
          // Se não estava ativo nem ontem nem hoje (antes), reseta o streak
          profile.streak = 1;
        }
      } else {
        profile.streak = 1;
      }
      
      await this.updateProfile(profile.id, { 
        lastActive: profile.lastActive,
        streak: profile.streak
      });
      
      // Atualizar progresso da conquista de comunicação
      await this.updateAchievementProgress(userId, comunicador.id, profile.streak);
      
      // Verificar a conquista de consistência
      const consistencia = Array.from(this.achievements.values()).find(a => a.title === "Consistência");
      if (consistencia) {
        await this.updateAchievementProgress(userId, consistencia.id, profile.streak);
      }
    }
  }
  
  // Método para resetar pontos semanais (executado automaticamente)
  async resetWeeklyPoints(): Promise<void> {
    const profiles = Array.from(this.profiles.values());
    
    // Antes de resetar, verifica a conquista "Primeiro Lugar"
    const ranking = await this.getWeeklyRanking();
    
    if (ranking.length > 0) {
      const winner = ranking[0];
      const primeiroLugar = Array.from(this.achievements.values()).find(a => a.title === "Primeiro Lugar");
      
      if (primeiroLugar) {
        await this.updateAchievementProgress(winner.userId, primeiroLugar.id, 1);
      }
    }
    
    // Resetar pontos semanais de todos os perfis
    for (const profile of profiles) {
      await this.updateProfile(profile.id, { weeklyPoints: 0 });
    }
  }
  
  // Método para obter todos os perfis de gamificação (para diretores)
  async getAllProfiles(): Promise<GamificationProfile[]> {
    return Array.from(this.profiles.values());
  }
}

export const gamificationService = new GamificationService(); 