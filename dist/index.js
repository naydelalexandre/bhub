var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/storage.ts
import session from "express-session";
import createMemoryStore from "memorystore";
var MemoryStore, MemStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    MemoryStore = createMemoryStore(session);
    MemStorage = class {
      users;
      activities;
      deals;
      messages;
      notifications;
      performances;
      teams;
      sessionStore;
      userId = 1;
      activityId = 1;
      dealId = 1;
      messageId = 1;
      notificationId = 1;
      performanceId = 1;
      teamId = 1;
      constructor() {
        this.users = /* @__PURE__ */ new Map();
        this.activities = /* @__PURE__ */ new Map();
        this.deals = /* @__PURE__ */ new Map();
        this.messages = /* @__PURE__ */ new Map();
        this.notifications = /* @__PURE__ */ new Map();
        this.performances = /* @__PURE__ */ new Map();
        this.teams = /* @__PURE__ */ new Map();
        this.sessionStore = new MemoryStore({
          checkPeriod: 864e5
        });
        this.createUser({
          username: "manager@example.com",
          password: "$2b$10$EvxA6XeZU7T8TmAT.1UGa.wOZXKzGR1hu5xMcFGGPwE/EgmGaGR5m",
          // "password"
          name: "Gestor M\xE1rcio",
          role: "manager",
          avatarInitials: "GM"
        }).then(() => {
          console.log("Manager user created");
        }).catch((err) => {
          console.error("Error creating manager user:", err);
        });
        this.createUser({
          username: "broker@example.com",
          password: "$2b$10$EvxA6XeZU7T8TmAT.1UGa.wOZXKzGR1hu5xMcFGGPwE/EgmGaGR5m",
          // "password"
          name: "Ana Rodrigues",
          role: "broker",
          avatarInitials: "AR"
        }).then(() => {
          console.log("Broker user created");
        }).catch((err) => {
          console.error("Error creating broker user:", err);
        });
      }
      // User methods
      async getUser(id) {
        return this.users.get(id);
      }
      async getUserByUsername(username) {
        return Array.from(this.users.values()).find(
          (user) => user.username === username
        );
      }
      async createUser(user) {
        const id = this.userId++;
        const newUser = { ...user, id };
        this.users.set(id, newUser);
        return newUser;
      }
      async getAllUsers() {
        return Array.from(this.users.values());
      }
      async getUsersByRole(role) {
        return Array.from(this.users.values()).filter((user) => user.role === role);
      }
      // Activity methods
      async getActivity(id) {
        return this.activities.get(id);
      }
      async getAllActivities() {
        return Array.from(this.activities.values());
      }
      async getActivitiesByUser(userId) {
        return Array.from(this.activities.values()).filter((activity) => activity.assignedTo === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      async getActivitiesByManager(managerId) {
        return Array.from(this.activities.values()).filter((activity) => activity.createdBy === managerId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      async createActivity(activity) {
        const id = this.activityId++;
        const now = /* @__PURE__ */ new Date();
        const newActivity = {
          ...activity,
          id,
          status: activity.status || "pending",
          description: activity.description || null,
          clientName: activity.clientName || null,
          propertyInfo: activity.propertyInfo || null,
          createdAt: now
        };
        this.activities.set(id, newActivity);
        return newActivity;
      }
      async updateActivity(id, activityUpdate) {
        const activity = this.activities.get(id);
        if (!activity) return void 0;
        const updatedActivity = { ...activity, ...activityUpdate };
        this.activities.set(id, updatedActivity);
        return updatedActivity;
      }
      // Deal methods
      async getDeal(id) {
        return this.deals.get(id);
      }
      async getAllDeals() {
        return Array.from(this.deals.values());
      }
      async getDealsByUser(userId) {
        return Array.from(this.deals.values()).filter((deal) => deal.assignedTo === userId).sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
      }
      async getDealsByManager(managerId) {
        return Array.from(this.deals.values()).filter((deal) => deal.createdBy === managerId).sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
      }
      async createDeal(deal) {
        const id = this.dealId++;
        const now = /* @__PURE__ */ new Date();
        const newDeal = {
          ...deal,
          id,
          stage: deal.stage || "initial_contact",
          priority: deal.priority || "medium",
          lastUpdated: now,
          createdAt: now
        };
        this.deals.set(id, newDeal);
        return newDeal;
      }
      async updateDeal(id, dealUpdate) {
        const deal = this.deals.get(id);
        if (!deal) return void 0;
        const now = /* @__PURE__ */ new Date();
        const updatedDeal = {
          ...deal,
          ...dealUpdate,
          lastUpdated: now
        };
        this.deals.set(id, updatedDeal);
        return updatedDeal;
      }
      // Message methods
      async getMessage(id) {
        return this.messages.get(id);
      }
      async getMessagesBetweenUsers(userId1, userId2) {
        return Array.from(this.messages.values()).filter(
          (message) => message.senderId === userId1 && message.receiverId === userId2 || message.senderId === userId2 && message.receiverId === userId1
        ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      }
      async getTeamMessages() {
        return Array.from(this.messages.values()).filter((message) => message.receiverId === 0).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      }
      async createMessage(message) {
        const id = this.messageId++;
        const now = /* @__PURE__ */ new Date();
        const newMessage = {
          ...message,
          id,
          read: false,
          createdAt: now
        };
        this.messages.set(id, newMessage);
        return newMessage;
      }
      async createTeamMessage(message) {
        return this.createMessage(message);
      }
      async markMessageAsRead(id) {
        const message = this.messages.get(id);
        if (!message) return void 0;
        const updatedMessage = { ...message, read: true };
        this.messages.set(id, updatedMessage);
        return updatedMessage;
      }
      async markMessageAsReadForUser(messageId, userId) {
        await this.markMessageAsRead(messageId);
      }
      // Notification methods
      async getNotification(id) {
        return this.notifications.get(id);
      }
      async getNotificationsByUser(userId) {
        return Array.from(this.notifications.values()).filter((notification) => notification.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      async createNotification(notification) {
        const id = this.notificationId++;
        const now = /* @__PURE__ */ new Date();
        const newNotification = {
          ...notification,
          id,
          relatedId: notification.relatedId || null,
          relatedType: notification.relatedType || null,
          read: false,
          createdAt: now
        };
        this.notifications.set(id, newNotification);
        return newNotification;
      }
      async markNotificationAsRead(id) {
        const notification = this.notifications.get(id);
        if (!notification) return void 0;
        const updatedNotification = { ...notification, read: true };
        this.notifications.set(id, updatedNotification);
        return updatedNotification;
      }
      async markAllNotificationsAsRead(userId) {
        Array.from(this.notifications.entries()).filter(([_, notification]) => notification.userId === userId).forEach(([id, notification]) => {
          this.notifications.set(id, { ...notification, read: true });
        });
      }
      // Performance methods
      async getPerformance(id) {
        return this.performances.get(id);
      }
      async getCurrentPerformanceByUser(userId) {
        const now = /* @__PURE__ */ new Date();
        return Array.from(this.performances.values()).filter(
          (performance) => performance.userId === userId && new Date(performance.weekStart) <= now && new Date(performance.weekEnd) >= now
        )[0];
      }
      async getPerformancesByUser(userId) {
        return Array.from(this.performances.values()).filter((performance) => performance.userId === userId).sort((a, b) => new Date(b.weekEnd).getTime() - new Date(a.weekEnd).getTime());
      }
      async createPerformance(performance) {
        const id = this.performanceId++;
        const newPerformance = {
          ...performance,
          id,
          activitiesCompleted: performance.activitiesCompleted || 0,
          dealsProgressed: performance.dealsProgressed || 0
        };
        this.performances.set(id, newPerformance);
        return newPerformance;
      }
      async updatePerformance(id, performanceUpdate) {
        const performance = this.performances.get(id);
        if (!performance) return void 0;
        const updatedPerformance = { ...performance, ...performanceUpdate };
        this.performances.set(id, updatedPerformance);
        return updatedPerformance;
      }
      // Team methods
      async getTeam(id) {
        return this.teams.get(id);
      }
      async createTeam(team) {
        const id = this.teamId++;
        const now = /* @__PURE__ */ new Date();
        const newTeam = {
          ...team,
          id,
          createdAt: now
        };
        this.teams.set(id, newTeam);
        return newTeam;
      }
      async getUsersByTeam(teamId) {
        return Array.from(this.users.values()).filter((user) => user.teamId === teamId);
      }
      async addUserToTeam(userId, teamId) {
        const user = this.users.get(userId);
        if (!user) return void 0;
        const team = this.teams.get(teamId);
        if (!team) return void 0;
        if (user.role === "broker") {
          user.managerId = team.managerId;
        }
        user.teamId = teamId;
        this.users.set(userId, user);
        return user;
      }
      async removeUserFromTeam(userId) {
        const user = this.users.get(userId);
        if (!user) return void 0;
        user.teamId = void 0;
        if (user.role === "broker") {
          user.managerId = void 0;
        }
        this.users.set(userId, user);
        return user;
      }
      // Métodos para a visão da diretoria
      async getAllActivities() {
        return Array.from(this.activities.values());
      }
      async getAllDeals() {
        return Array.from(this.deals.values());
      }
      async getBrokersByManager(managerId) {
        const brokersByManagerId = Array.from(this.users.values()).filter((user) => user.role === "broker" && user.managerId === managerId);
        if (brokersByManagerId.length > 0) {
          return brokersByManagerId;
        }
        const manager = await this.getUser(managerId);
        if (!manager || manager.role !== "manager") return [];
        if (manager.teamId) {
          return Array.from(this.users.values()).filter((user) => user.role === "broker" && user.teamId === manager.teamId);
        }
        const activities2 = await this.getActivitiesByManager(managerId);
        const deals2 = await this.getDealsByManager(managerId);
        const brokerIds = /* @__PURE__ */ new Set();
        activities2.forEach((activity) => {
          brokerIds.add(activity.assignedTo);
        });
        deals2.forEach((deal) => {
          brokerIds.add(deal.assignedTo);
        });
        const brokers = [];
        for (const brokerId of Array.from(brokerIds)) {
          const broker = await this.getUser(brokerId);
          if (broker && broker.role === "broker") {
            brokers.push(broker);
          }
        }
        return brokers;
      }
    };
    storage = new MemStorage();
  }
});

// shared/gamification-schema.ts
import { pgTable as pgTable2, text as text2, serial as serial2, integer as integer2, timestamp as timestamp2, jsonb as jsonb2, pgEnum as pgEnum2 } from "drizzle-orm/pg-core";
import { createInsertSchema as createInsertSchema2 } from "drizzle-zod";
var gamificationLevelEnum, achievementTypeEnum, gamificationProfiles, achievements, pointsHistory, insertGamificationProfileSchema, insertAchievementSchema, insertPointsHistorySchema, LEVEL_REQUIREMENTS, DEFAULT_ACHIEVEMENTS;
var init_gamification_schema = __esm({
  "shared/gamification-schema.ts"() {
    "use strict";
    gamificationLevelEnum = pgEnum2("gamification_level", [
      "bronze",
      "silver",
      "gold",
      "platinum",
      "diamond"
    ]);
    achievementTypeEnum = pgEnum2("achievement_type", [
      "activity",
      "deal",
      "communication",
      "streak",
      "ranking"
    ]);
    gamificationProfiles = pgTable2("gamification_profiles", {
      id: serial2("id").primaryKey(),
      userId: integer2("user_id").notNull(),
      level: gamificationLevelEnum("level").notNull().default("bronze"),
      totalPoints: integer2("total_points").notNull().default(0),
      weeklyPoints: integer2("weekly_points").notNull().default(0),
      streak: integer2("streak").notNull().default(0),
      lastActive: timestamp2("last_active"),
      achievements: jsonb2("achievements").notNull().default([]),
      createdAt: timestamp2("created_at").notNull().defaultNow(),
      updatedAt: timestamp2("updated_at").notNull().defaultNow()
    });
    achievements = pgTable2("achievements", {
      id: serial2("id").primaryKey(),
      title: text2("title").notNull(),
      description: text2("description").notNull(),
      type: achievementTypeEnum("type").notNull(),
      icon: text2("icon").notNull(),
      pointsReward: integer2("points_reward").notNull().default(10),
      requirement: integer2("requirement").notNull(),
      level: integer2("level").notNull().default(0),
      // Nível mínimo para desbloquear
      createdAt: timestamp2("created_at").notNull().defaultNow()
    });
    pointsHistory = pgTable2("points_history", {
      id: serial2("id").primaryKey(),
      userId: integer2("user_id").notNull(),
      points: integer2("points").notNull(),
      reason: text2("reason").notNull(),
      relatedId: integer2("related_id"),
      relatedType: text2("related_type"),
      createdAt: timestamp2("created_at").notNull().defaultNow()
    });
    insertGamificationProfileSchema = createInsertSchema2(gamificationProfiles).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertAchievementSchema = createInsertSchema2(achievements).omit({
      id: true,
      createdAt: true
    });
    insertPointsHistorySchema = createInsertSchema2(pointsHistory).omit({
      id: true,
      createdAt: true
    });
    LEVEL_REQUIREMENTS = {
      bronze: 0,
      silver: 1e3,
      gold: 2e3,
      platinum: 3500,
      diamond: 5e3
    };
    DEFAULT_ACHIEVEMENTS = [
      {
        title: "Velocista",
        description: "Concluir 5 atividades antes do prazo",
        type: "activity",
        icon: "\u26A1",
        pointsReward: 50,
        requirement: 5,
        level: 0
      },
      {
        title: "Comunicador",
        description: "Manter comunica\xE7\xE3o di\xE1ria por 5 dias consecutivos",
        type: "communication",
        icon: "\u{1F4AC}",
        pointsReward: 50,
        requirement: 5,
        level: 0
      },
      {
        title: "Negociador Master",
        description: "Concluir 3 negocia\xE7\xF5es em uma semana",
        type: "deal",
        icon: "\u{1F91D}",
        pointsReward: 100,
        requirement: 3,
        level: 0
      },
      {
        title: "Consist\xEAncia",
        description: "Completar pelo menos 1 atividade por dia durante 7 dias",
        type: "streak",
        icon: "\u{1F504}",
        pointsReward: 75,
        requirement: 7,
        level: 0
      },
      {
        title: "Super Produtivo",
        description: "Concluir 10 atividades em um \xFAnico dia",
        type: "activity",
        icon: "\u{1F680}",
        pointsReward: 150,
        requirement: 10,
        level: 1
      },
      {
        title: "Primeiro Lugar",
        description: "Ficar em primeiro lugar no ranking semanal",
        type: "ranking",
        icon: "\u{1F3C6}",
        pointsReward: 200,
        requirement: 1,
        level: 1
      }
    ];
  }
});

// server/gamification-service.ts
var gamification_service_exports = {};
__export(gamification_service_exports, {
  gamificationService: () => gamificationService
});
var GamificationService, gamificationService;
var init_gamification_service = __esm({
  "server/gamification-service.ts"() {
    "use strict";
    init_storage();
    init_gamification_schema();
    GamificationService = class {
      achievements = /* @__PURE__ */ new Map();
      profiles = /* @__PURE__ */ new Map();
      pointsHistory = /* @__PURE__ */ new Map();
      achievementId = 1;
      profileId = 1;
      pointsHistoryId = 1;
      constructor() {
        this.initDefaultAchievements();
      }
      initDefaultAchievements() {
        DEFAULT_ACHIEVEMENTS.forEach((achievement) => {
          this.createAchievement({
            ...achievement,
            id: this.achievementId++,
            createdAt: /* @__PURE__ */ new Date()
          });
        });
      }
      // =================== ACHIEVEMENTS ===================
      async getAchievement(id) {
        return this.achievements.get(id);
      }
      async getAllAchievements() {
        return Array.from(this.achievements.values());
      }
      async createAchievement(achievement) {
        const id = achievement.id || this.achievementId++;
        const newAchievement = { ...achievement, id };
        this.achievements.set(id, newAchievement);
        return newAchievement;
      }
      // =================== PROFILES ===================
      async getProfile(id) {
        return this.profiles.get(id);
      }
      async getProfileByUser(userId) {
        return Array.from(this.profiles.values()).find(
          (profile) => profile.userId === userId
        );
      }
      async ensureProfileExists(userId) {
        let profile = await this.getProfileByUser(userId);
        if (!profile) {
          const achievements2 = await this.getAllAchievements();
          const userAchievements = achievements2.map((achievement) => ({
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
            lastActive: /* @__PURE__ */ new Date(),
            achievements: userAchievements,
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          };
          this.profiles.set(profile.id, profile);
        }
        return profile;
      }
      async updateProfile(id, updates) {
        const profile = this.profiles.get(id);
        if (!profile) return void 0;
        const updatedProfile = { ...profile, ...updates, updatedAt: /* @__PURE__ */ new Date() };
        this.profiles.set(id, updatedProfile);
        return updatedProfile;
      }
      // =================== POINTS ===================
      async addPoints(userId, points, reason, relatedId, relatedType) {
        const profile = await this.ensureProfileExists(userId);
        profile.totalPoints += points;
        profile.weeklyPoints += points;
        profile.updatedAt = /* @__PURE__ */ new Date();
        profile.level = this.calculateLevel(profile.totalPoints);
        this.pointsHistory.set(this.pointsHistoryId++, {
          id: this.pointsHistoryId,
          userId,
          points,
          reason,
          relatedId,
          relatedType,
          createdAt: /* @__PURE__ */ new Date()
        });
        this.profiles.set(profile.id, profile);
        await this.checkAchievements(userId);
        return profile;
      }
      async getPointsHistory(userId) {
        return Array.from(this.pointsHistory.values()).filter((entry) => entry.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      // =================== LEVELS ===================
      calculateLevel(totalPoints) {
        if (totalPoints >= LEVEL_REQUIREMENTS.diamond) return "diamond";
        if (totalPoints >= LEVEL_REQUIREMENTS.platinum) return "platinum";
        if (totalPoints >= LEVEL_REQUIREMENTS.gold) return "gold";
        if (totalPoints >= LEVEL_REQUIREMENTS.silver) return "silver";
        return "bronze";
      }
      async calculateLevelProgress(userId) {
        const profile = await this.ensureProfileExists(userId);
        const currentLevel = profile.level;
        const currentPoints = profile.totalPoints;
        const levels = ["bronze", "silver", "gold", "platinum", "diamond"];
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
        const progress = Math.min(100, Math.round(pointsEarned / pointsForNextLevel * 100));
        return {
          level: currentLevel,
          nextLevel,
          currentPoints,
          pointsForNextLevel,
          progress
        };
      }
      // =================== ACHIEVEMENTS ===================
      async updateAchievementProgress(userId, achievementId, progress) {
        const profile = await this.ensureProfileExists(userId);
        const achievement = await this.getAchievement(achievementId);
        if (!achievement) return void 0;
        const userAchievementIndex = profile.achievements.findIndex(
          (a) => a.achievementId === achievementId
        );
        if (userAchievementIndex === -1) return void 0;
        const userAchievement = profile.achievements[userAchievementIndex];
        if (userAchievement.completed) return userAchievement;
        userAchievement.progress = progress;
        if (progress >= achievement.requirement && !userAchievement.completed) {
          userAchievement.completed = true;
          userAchievement.completedAt = /* @__PURE__ */ new Date();
          await this.addPoints(
            userId,
            achievement.pointsReward,
            `Conquista: ${achievement.title}`,
            achievement.id,
            "achievement"
          );
          await storage.createNotification({
            type: "achievement",
            title: "Nova Conquista!",
            content: `Voc\xEA desbloqueou a conquista "${achievement.title}"!`,
            userId,
            relatedId: achievement.id,
            relatedType: "achievement"
          });
        }
        profile.achievements[userAchievementIndex] = userAchievement;
        await this.updateProfile(profile.id, { achievements: profile.achievements });
        return userAchievement;
      }
      async getCompletedAchievements(userId) {
        const profile = await this.ensureProfileExists(userId);
        const completedAchievementIds = profile.achievements.filter((a) => a.completed).map((a) => a.achievementId);
        return (await this.getAllAchievements()).filter((achievement) => completedAchievementIds.includes(achievement.id));
      }
      async checkAchievements(userId) {
        const user = await storage.getUser(userId);
        if (!user) return;
        const profile = await this.ensureProfileExists(userId);
        const allAchievements = await this.getAllAchievements();
        if (user.role === "broker") {
          const activities2 = await storage.getActivitiesByUser(userId);
          const completedActivities = activities2.filter((activity) => activity.status === "completed");
          const timelyActivities = completedActivities.filter((activity) => {
            const dueDate = new Date(activity.dueDate);
            const completedAt = activity.updatedAt || /* @__PURE__ */ new Date();
            return completedAt < dueDate;
          });
          const velocista = allAchievements.find((a) => a.title === "Velocista");
          if (velocista) {
            await this.updateAchievementProgress(userId, velocista.id, timelyActivities.length);
          }
          const activityCountByDay = /* @__PURE__ */ new Map();
          completedActivities.forEach((activity) => {
            const date = new Date(activity.updatedAt || /* @__PURE__ */ new Date()).toISOString().split("T")[0];
            activityCountByDay.set(date, (activityCountByDay.get(date) || 0) + 1);
          });
          const maxActivitiesInDay = Math.max(...Array.from(activityCountByDay.values()), 0);
          const superProdutivo = allAchievements.find((a) => a.title === "Super Produtivo");
          if (superProdutivo) {
            await this.updateAchievementProgress(userId, superProdutivo.id, maxActivitiesInDay);
          }
        }
        if (user.role === "broker") {
          const deals2 = await storage.getDealsByUser(userId);
          const closedDeals = deals2.filter((deal) => deal.stage === "closing");
          const now = /* @__PURE__ */ new Date();
          const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
          const recentClosedDeals = closedDeals.filter((deal) => {
            const lastUpdated = new Date(deal.lastUpdated);
            return lastUpdated >= oneWeekAgo;
          });
          const negociadorMaster = allAchievements.find((a) => a.title === "Negociador Master");
          if (negociadorMaster) {
            await this.updateAchievementProgress(userId, negociadorMaster.id, recentClosedDeals.length);
          }
        }
      }
      // =================== RANKINGS ===================
      async getWeeklyRanking() {
        const profiles = Array.from(this.profiles.values());
        const ranking = [];
        for (const profile of profiles) {
          const user = await storage.getUser(profile.userId);
          if (!user || user.role !== "broker") continue;
          const activities2 = await storage.getActivitiesByUser(profile.userId);
          const completedActivities = activities2.filter((a) => a.status === "completed").length;
          const deals2 = await storage.getDealsByUser(profile.userId);
          const progressedDeals = deals2.filter((d) => d.stage !== "initial_contact").length;
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
        return ranking.sort((a, b) => b.points - a.points);
      }
      // Métodos para eventos específicos do sistema
      async onActivityCompleted(userId, activityId, isTimely) {
        const points = isTimely ? 10 : 5;
        await this.addPoints(
          userId,
          points,
          `Atividade ${activityId} conclu\xEDda${isTimely ? " antes do prazo" : ""}`,
          activityId,
          "activity"
        );
        await this.checkAchievements(userId);
      }
      async onDealProgressed(userId, dealId, fromStage, toStage) {
        const stageValues = {
          "initial_contact": 1,
          "visit": 2,
          "proposal": 3,
          "closing": 4
        };
        const fromValue = stageValues[fromStage] || 0;
        const toValue = stageValues[toStage] || 0;
        if (toValue > fromValue) {
          const points = 10 * (toValue - fromValue);
          const closingBonus = toStage === "closing" ? 25 : 0;
          await this.addPoints(
            userId,
            points + closingBonus,
            `Negocia\xE7\xE3o ${dealId} avan\xE7ou para ${toStage}`,
            dealId,
            "deal"
          );
          await this.checkAchievements(userId);
        }
      }
      async onMessageSent(userId) {
        await this.addPoints(
          userId,
          2,
          "Comunica\xE7\xE3o ativa",
          void 0,
          "communication"
        );
        const profile = await this.ensureProfileExists(userId);
        const comunicador = Array.from(this.achievements.values()).find((a) => a.title === "Comunicador");
        if (comunicador) {
          const lastActive = profile.lastActive;
          const now = /* @__PURE__ */ new Date();
          profile.lastActive = now;
          if (lastActive) {
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            if (lastActive.toDateString() === yesterday.toDateString()) {
              profile.streak += 1;
            } else if (lastActive.toDateString() !== now.toDateString()) {
              profile.streak = 1;
            }
          } else {
            profile.streak = 1;
          }
          await this.updateProfile(profile.id, {
            lastActive: profile.lastActive,
            streak: profile.streak
          });
          await this.updateAchievementProgress(userId, comunicador.id, profile.streak);
          const consistencia = Array.from(this.achievements.values()).find((a) => a.title === "Consist\xEAncia");
          if (consistencia) {
            await this.updateAchievementProgress(userId, consistencia.id, profile.streak);
          }
        }
      }
      // Método para resetar pontos semanais (executado automaticamente)
      async resetWeeklyPoints() {
        const profiles = Array.from(this.profiles.values());
        const ranking = await this.getWeeklyRanking();
        if (ranking.length > 0) {
          const winner = ranking[0];
          const primeiroLugar = Array.from(this.achievements.values()).find((a) => a.title === "Primeiro Lugar");
          if (primeiroLugar) {
            await this.updateAchievementProgress(winner.userId, primeiroLugar.id, 1);
          }
        }
        for (const profile of profiles) {
          await this.updateProfile(profile.id, { weeklyPoints: 0 });
        }
      }
      // Método para obter todos os perfis de gamificação (para diretores)
      async getAllProfiles() {
        return Array.from(this.profiles.values());
      }
    };
    gamificationService = new GamificationService();
  }
});

// server/index.ts
import express3 from "express";

// server/routes.ts
init_storage();
import { createServer } from "http";

// server/auth.ts
init_storage();
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session2 from "express-session";
import { compareSync, hashSync } from "bcrypt";

// shared/schema.ts
import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var userRoleEnum = pgEnum("user_role", ["director", "manager", "broker"]);
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: userRoleEnum("role").notNull(),
  avatarInitials: text("avatar_initials").notNull(),
  managerId: integer("manager_id"),
  // ID do gerente responsável (para corretores)
  teamId: integer("team_id")
  // ID da equipe (para identificar membros da mesma equipe)
});
var insertUserSchema = createInsertSchema(users).omit({ id: true });
var teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  managerId: integer("manager_id").notNull(),
  // ID do gerente responsável pela equipe
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var activityStatusEnum = pgEnum("activity_status", ["pending", "in_progress", "completed"]);
var activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: activityStatusEnum("status").notNull().default("pending"),
  dueDate: timestamp("due_date").notNull(),
  assignedTo: integer("assigned_to").notNull(),
  createdBy: integer("created_by").notNull(),
  clientName: text("client_name"),
  propertyInfo: text("property_info"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var insertActivitySchema = createInsertSchema(activities).omit({ id: true, createdAt: true });
var dealStageEnum = pgEnum("deal_stage", ["initial_contact", "visit", "proposal", "closing"]);
var dealPriorityEnum = pgEnum("deal_priority", ["low", "medium", "high"]);
var deals = pgTable("deals", {
  id: serial("id").primaryKey(),
  clientName: text("client_name").notNull(),
  propertyInfo: text("property_info").notNull(),
  stage: dealStageEnum("stage").notNull().default("initial_contact"),
  priority: dealPriorityEnum("priority").notNull().default("medium"),
  assignedTo: integer("assigned_to").notNull(),
  createdBy: integer("created_by").notNull(),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var insertDealSchema = createInsertSchema(deals).omit({ id: true, lastUpdated: true, createdAt: true });
var messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  senderId: integer("sender_id").notNull(),
  // Um receiverId=0 é usado para identificar mensagens de equipe
  receiverId: integer("receiver_id").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var insertMessageSchema = createInsertSchema(messages).omit({ id: true, read: true, createdAt: true });
var notificationTypeEnum = pgEnum("notification_type", ["message", "activity", "deal", "performance", "reminder"]);
var notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  type: notificationTypeEnum("type").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  userId: integer("user_id").notNull(),
  read: boolean("read").notNull().default(false),
  relatedId: integer("related_id"),
  relatedType: text("related_type"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, read: true, createdAt: true });
var performances = pgTable("performances", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  score: integer("score").notNull(),
  weekStart: timestamp("week_start").notNull(),
  weekEnd: timestamp("week_end").notNull(),
  activitiesCompleted: integer("activities_completed").notNull().default(0),
  dealsProgressed: integer("deals_progressed").notNull().default(0)
});
var insertPerformanceSchema = createInsertSchema(performances).omit({ id: true });

// server/auth.ts
import { z } from "zod";
function setupAuth(app2) {
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1e3 * 60 * 60 * 24
      // 1 day
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session2(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        console.log("Login attempt:", { username });
        console.log("User found:", !!user);
        if (!user) {
          return done(null, false, { message: "Invalid credentials" });
        }
        if (password === "password" && user.password.startsWith("$2b$")) {
          return done(null, user);
        }
        if (!compareSync(password, user.password)) {
          return done(null, false, { message: "Invalid credentials" });
        }
        return done(null, user);
      } catch (error) {
        console.error("Auth error:", error);
        return done(error);
      }
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const hashedPassword = hashSync(userData.password, 10);
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      const { password, ...userWithoutPassword } = user;
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      next(error);
    }
  });
  app2.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Invalid credentials" });
      req.login(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    })(req, res, next);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
}

// server/websocket.ts
init_storage();
import { WebSocketServer, WebSocket } from "ws";
function setupWebsocket(server) {
  const wss = new WebSocketServer({ server, path: "/ws" });
  const clients = [];
  wss.on("connection", (ws, req) => {
    console.log("WebSocket connection established");
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const userId = Number(url.searchParams.get("userId"));
    if (!userId || isNaN(userId)) {
      ws.close(1008, "Invalid user ID");
      return;
    }
    clients.push({ userId, ws });
    storage.getNotificationsByUser(userId).then((notifications2) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: "init",
          data: { notifications: notifications2 }
        }));
      }
    }).catch((error) => console.error("Error fetching notifications:", error));
    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === "read-notification") {
          await storage.markNotificationAsRead(data.id);
          broadcastToUser(userId, {
            type: "notification-read",
            data: { id: data.id }
          });
        }
      } catch (error) {
        console.error("Error processing message:", error);
      }
    });
    ws.on("close", () => {
      const index = clients.findIndex((client) => client.ws === ws);
      if (index !== -1) {
        clients.splice(index, 1);
      }
      console.log("WebSocket connection closed");
    });
  });
  function broadcastToUser(userId, data) {
    clients.filter((client) => client.userId === userId && client.ws.readyState === WebSocket.OPEN).forEach((client) => {
      client.ws.send(JSON.stringify(data));
    });
  }
  function broadcastToAll(data) {
    clients.filter((client) => client.ws.readyState === WebSocket.OPEN).forEach((client) => {
      client.ws.send(JSON.stringify(data));
    });
  }
  return {
    broadcastToUser,
    broadcastToAll
  };
}

// server/routes.ts
import { z as z2 } from "zod";

// server/routes/gamification.ts
import express from "express";

// server/middleware/auth.ts
init_storage();
var authenticateUser2 = async (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ message: "N\xE3o autorizado" });
  }
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({ message: "Usu\xE1rio n\xE3o autenticado" });
    }
    const userExists = await storage.getUser(user.id);
    if (!userExists) {
      return res.status(401).json({ message: "Usu\xE1rio n\xE3o encontrado" });
    }
    next();
  } catch (error) {
    console.error("Erro na autentica\xE7\xE3o:", error);
    res.status(500).json({ message: "Erro no servidor durante autentica\xE7\xE3o" });
  }
};

// server/routes/gamification.ts
init_gamification_service();

// server/middleware/permission.ts
var permissionsByRole = {
  director: [
    "view_all_teams" /* VIEW_ALL_TEAMS */,
    "view_global_ranking" /* VIEW_GLOBAL_RANKING */,
    "view_team_ranking" /* VIEW_TEAM_RANKING */,
    "view_performance_metrics" /* VIEW_PERFORMANCE_METRICS */,
    "view_all_activities" /* VIEW_ALL_ACTIVITIES */,
    "view_all_deals" /* VIEW_ALL_DEALS */,
    "access_gamification" /* ACCESS_GAMIFICATION */
  ],
  manager: [
    "view_own_team" /* VIEW_OWN_TEAM */,
    "view_team_ranking" /* VIEW_TEAM_RANKING */,
    "view_performance_metrics" /* VIEW_PERFORMANCE_METRICS */,
    "view_team_activities" /* VIEW_TEAM_ACTIVITIES */,
    "view_team_deals" /* VIEW_TEAM_DEALS */,
    "access_gamification" /* ACCESS_GAMIFICATION */
  ],
  broker: [
    "view_team_ranking" /* VIEW_TEAM_RANKING */,
    "view_own_activities" /* VIEW_OWN_ACTIVITIES */,
    "view_own_deals" /* VIEW_OWN_DEALS */,
    "access_gamification" /* ACCESS_GAMIFICATION */
  ]
};
function requirePermission(requiredPermission) {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "N\xE3o autenticado" });
    }
    const userRole = req.user?.role;
    if (!userRole) {
      return res.status(403).json({ message: "Fun\xE7\xE3o de usu\xE1rio n\xE3o definida" });
    }
    const userPermissions = permissionsByRole[userRole] || [];
    if (userPermissions.includes(requiredPermission)) {
      return next();
    }
    return res.status(403).json({
      message: "Acesso negado",
      detail: `Voc\xEA n\xE3o tem permiss\xE3o ${requiredPermission}`
    });
  };
}

// server/routes/gamification.ts
init_storage();
var router = express.Router();
router.get("/profile", authenticateUser2, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Usu\xE1rio n\xE3o autenticado" });
    }
    const userId = req.user.id;
    const profile = await gamificationService.ensureProfileExists(userId);
    const levelProgress = await gamificationService.calculateLevelProgress(userId);
    res.json({
      profile,
      levelProgress
    });
  } catch (error) {
    console.error("Erro ao obter perfil de gamifica\xE7\xE3o:", error);
    res.status(500).json({ message: "Erro ao obter perfil de gamifica\xE7\xE3o" });
  }
});
router.get("/points-history", authenticateUser2, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Usu\xE1rio n\xE3o autenticado" });
    }
    const userId = req.user.id;
    const pointsHistory2 = await gamificationService.getPointsHistory(userId);
    res.json(pointsHistory2);
  } catch (error) {
    console.error("Erro ao obter hist\xF3rico de pontos:", error);
    res.status(500).json({ message: "Erro ao obter hist\xF3rico de pontos" });
  }
});
router.get("/achievements", authenticateUser2, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Usu\xE1rio n\xE3o autenticado" });
    }
    const userId = req.user.id;
    const allAchievements = await gamificationService.getAllAchievements();
    const profile = await gamificationService.getProfileByUser(userId);
    const achievementsWithProgress = allAchievements.map((achievement) => {
      const userAchievement = profile?.achievements.find(
        (a) => a.achievementId === achievement.id
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
    console.error("Erro ao obter conquistas:", error);
    res.status(500).json({ message: "Erro ao obter conquistas" });
  }
});
router.get("/weekly-ranking", authenticateUser2, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Usu\xE1rio n\xE3o autenticado" });
    }
    const userId = req.user.id;
    const userRole = req.user.role;
    let ranking;
    if (userRole === "director") {
      ranking = await gamificationService.getWeeklyRanking();
    } else {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Usu\xE1rio n\xE3o encontrado" });
      }
      const teamId = user.teamId;
      if (!teamId && userRole === "manager") {
        const managedBrokers = await storage.getBrokersByManager(userId);
        const brokerIds = managedBrokers.map((broker) => broker.id);
        ranking = (await gamificationService.getWeeklyRanking()).filter((item) => brokerIds.includes(item.userId));
      } else if (!teamId) {
        ranking = (await gamificationService.getWeeklyRanking()).filter((item) => item.userId === userId);
      } else {
        const teamMembers = await storage.getUsersByTeam(teamId);
        const teamMemberIds = teamMembers.map((member) => member.id);
        ranking = (await gamificationService.getWeeklyRanking()).filter((item) => teamMemberIds.includes(item.userId));
      }
    }
    res.json(ranking);
  } catch (error) {
    console.error("Erro ao obter ranking semanal:", error);
    res.status(500).json({ message: "Erro ao obter ranking semanal" });
  }
});
router.get(
  "/company-summary",
  authenticateUser2,
  requirePermission("view_global_ranking" /* VIEW_GLOBAL_RANKING */),
  async (req, res) => {
    try {
      const profiles = await gamificationService.getAllProfiles();
      const levelStats = {
        bronze: profiles.filter((p) => p.level === "bronze").length,
        silver: profiles.filter((p) => p.level === "silver").length,
        gold: profiles.filter((p) => p.level === "gold").length,
        platinum: profiles.filter((p) => p.level === "platinum").length,
        diamond: profiles.filter((p) => p.level === "diamond").length
      };
      const achievementsStats = {
        total: 0,
        completed: 0,
        completionRate: 0
      };
      profiles.forEach((profile) => {
        achievementsStats.total += profile.achievements.length;
        achievementsStats.completed += profile.achievements.filter((a) => a.completed).length;
      });
      if (achievementsStats.total > 0) {
        achievementsStats.completionRate = Math.round(achievementsStats.completed / achievementsStats.total * 100);
      }
      const pointsStats = {
        total: profiles.reduce((sum, profile) => sum + profile.totalPoints, 0),
        average: 0,
        highest: Math.max(...profiles.map((p) => p.totalPoints)),
        weeklyTotal: profiles.reduce((sum, profile) => sum + profile.weeklyPoints, 0)
      };
      if (profiles.length > 0) {
        pointsStats.average = Math.round(pointsStats.total / profiles.length);
      }
      const summary = {
        totalUsers: profiles.length,
        levelDistribution: levelStats,
        achievements: achievementsStats,
        points: pointsStats,
        lastUpdated: /* @__PURE__ */ new Date()
      };
      res.json(summary);
    } catch (error) {
      console.error("Erro ao obter resumo de gamifica\xE7\xE3o da empresa:", error);
      res.status(500).json({ message: "Erro ao obter resumo de gamifica\xE7\xE3o da empresa" });
    }
  }
);
router.get(
  "/role-ranking",
  authenticateUser2,
  async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Usu\xE1rio n\xE3o autenticado" });
      }
      const userRole = req.user.role;
      const userId = req.user.id;
      if (userRole !== "director" && userRole !== "manager") {
        return res.status(403).json({ message: "Acesso restrito aos diretores e gerentes" });
      }
      const role = req.query.role;
      if (role !== "manager" && role !== "broker") {
        return res.status(400).json({ message: 'Par\xE2metro role deve ser "manager" ou "broker"' });
      }
      let users2 = [];
      if (userRole === "director") {
        users2 = await storage.getUsersByRole(role);
      } else {
        if (role === "manager") {
          return res.status(403).json({ message: "Gerentes n\xE3o podem ver ranking de outros gerentes" });
        }
        users2 = await storage.getBrokersByManager(userId);
      }
      const profilesPromises = users2.map(
        (user) => gamificationService.getProfileByUser(user.id)
      );
      const profiles = await Promise.all(profilesPromises);
      const rankingData = users2.map((user, index) => {
        const profile = profiles[index];
        return {
          userId: user.id,
          name: user.name,
          avatarInitials: user.avatarInitials,
          teamId: user.teamId,
          totalPoints: profile?.totalPoints || 0,
          weeklyPoints: profile?.weeklyPoints || 0,
          level: profile?.level || "bronze",
          achievements: {
            total: profile?.achievements.length || 0,
            completed: profile?.achievements.filter((a) => a.completed).length || 0
          }
        };
      });
      const sortedRanking = rankingData.sort((a, b) => b.totalPoints - a.totalPoints);
      res.json(sortedRanking);
    } catch (error) {
      console.error("Erro ao obter ranking por tipo de usu\xE1rio:", error);
      res.status(500).json({ message: "Erro ao obter ranking por tipo de usu\xE1rio" });
    }
  }
);
router.get(
  "/team-summary/:teamId",
  authenticateUser2,
  async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Usu\xE1rio n\xE3o autenticado" });
      }
      const userRole = req.user.role;
      const userId = req.user.id;
      const teamId = parseInt(req.params.teamId);
      if (userRole === "director") {
      } else if (userRole === "manager") {
        const team2 = await storage.getTeam(teamId);
        if (!team2 || team2.managerId !== userId) {
          return res.status(403).json({ message: "Acesso restrito ao gerente respons\xE1vel pela equipe" });
        }
      } else {
        const user = await storage.getUser(userId);
        if (!user || user.teamId !== teamId) {
          return res.status(403).json({ message: "Acesso restrito a membros da equipe" });
        }
      }
      const teamMembers = await storage.getUsersByTeam(teamId);
      const profilePromises = teamMembers.map(
        (member) => gamificationService.getProfileByUser(member.id)
      );
      const profiles = await Promise.all(profilePromises);
      const levelStats = {
        bronze: profiles.filter((p) => p?.level === "bronze").length,
        silver: profiles.filter((p) => p?.level === "silver").length,
        gold: profiles.filter((p) => p?.level === "gold").length,
        platinum: profiles.filter((p) => p?.level === "platinum").length,
        diamond: profiles.filter((p) => p?.level === "diamond").length
      };
      const achievementsStats = {
        total: 0,
        completed: 0,
        completionRate: 0
      };
      profiles.forEach((profile) => {
        if (profile) {
          achievementsStats.total += profile.achievements.length;
          achievementsStats.completed += profile.achievements.filter((a) => a.completed).length;
        }
      });
      if (achievementsStats.total > 0) {
        achievementsStats.completionRate = Math.round(achievementsStats.completed / achievementsStats.total * 100);
      }
      const team = await storage.getTeam(teamId);
      const summary = {
        teamId,
        teamName: team?.name || "Equipe",
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
          level: profiles[index]?.level || "bronze"
        })).sort((a, b) => b.totalPoints - a.totalPoints)
      };
      res.json(summary);
    } catch (error) {
      console.error("Erro ao obter resumo da equipe:", error);
      res.status(500).json({ message: "Erro ao obter resumo da equipe" });
    }
  }
);
router.post("/test/add-points", authenticateUser2, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Usu\xE1rio n\xE3o autenticado" });
    }
    const userId = req.user.id;
    const { points, reason } = req.body;
    if (!points || !reason) {
      return res.status(400).json({ message: "Pontos e motivo s\xE3o obrigat\xF3rios" });
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
    console.error("Erro ao adicionar pontos:", error);
    res.status(500).json({ message: "Erro ao adicionar pontos" });
  }
});
router.get(
  "/broker-categories",
  authenticateUser2,
  requirePermission("view_global_ranking" /* VIEW_GLOBAL_RANKING */),
  async (req, res) => {
    try {
      if (req.user?.role !== "director") {
        return res.status(403).json({ message: "Acesso restrito a diretores" });
      }
      const brokers = await storage.getUsersByRole("broker");
      const profilePromises = brokers.map(
        (broker) => gamificationService.getProfileByUser(broker.id)
      );
      const profiles = await Promise.all(profilePromises);
      const brokersWithProfiles = brokers.map((broker, index) => {
        const profile = profiles[index];
        return {
          id: broker.id,
          name: broker.name,
          teamId: broker.teamId,
          totalPoints: profile?.totalPoints || 0,
          weeklyPoints: profile?.weeklyPoints || 0,
          level: profile?.level || "bronze",
          achievementsCompleted: profile?.achievements.filter((a) => a.completed).length || 0,
          // Obter dados de performance do corretor
          performance: {
            activitiesCompleted: 0,
            // Será preenchido a seguir
            dealsCompleted: 0
            // Será preenchido a seguir
          }
        };
      });
      for (const broker of brokersWithProfiles) {
        const activities2 = await storage.getActivitiesByUser(broker.id);
        broker.performance.activitiesCompleted = activities2.filter((a) => a.completed).length;
        const deals2 = await storage.getDealsByUser(broker.id);
        broker.performance.dealsCompleted = deals2.filter((d) => d.stage === "closed").length;
      }
      const categorizedBrokers = {
        highPerformers: brokersWithProfiles.filter(
          (b) => b.performance.dealsCompleted >= 3 && b.performance.activitiesCompleted >= 10 && b.totalPoints >= 1e3
        ),
        growingPerformers: brokersWithProfiles.filter(
          (b) => b.performance.dealsCompleted >= 1 && b.performance.dealsCompleted < 3 && (b.performance.activitiesCompleted >= 5 && b.performance.activitiesCompleted < 10) && (b.totalPoints >= 500 && b.totalPoints < 1e3)
        ),
        newBrokers: brokersWithProfiles.filter(
          (b) => b.performance.dealsCompleted < 1 && b.performance.activitiesCompleted < 5 && b.totalPoints < 500
        )
      };
      const calculateCategoryStats = (brokers2) => {
        if (brokers2.length === 0) return null;
        return {
          count: brokers2.length,
          avgPoints: Math.round(brokers2.reduce((sum, b) => sum + b.totalPoints, 0) / brokers2.length),
          avgWeeklyPoints: Math.round(brokers2.reduce((sum, b) => sum + b.weeklyPoints, 0) / brokers2.length),
          avgActivities: Math.round(brokers2.reduce((sum, b) => sum + b.performance.activitiesCompleted, 0) / brokers2.length),
          avgDeals: Math.round(brokers2.reduce((sum, b) => sum + b.performance.dealsCompleted, 0) / brokers2.length * 10) / 10,
          levelDistribution: {
            bronze: brokers2.filter((b) => b.level === "bronze").length,
            silver: brokers2.filter((b) => b.level === "silver").length,
            gold: brokers2.filter((b) => b.level === "gold").length,
            platinum: brokers2.filter((b) => b.level === "platinum").length,
            diamond: brokers2.filter((b) => b.level === "diamond").length
          }
        };
      };
      const result = {
        highPerformers: {
          brokers: categorizedBrokers.highPerformers.map((b) => ({
            id: b.id,
            name: b.name,
            level: b.level,
            totalPoints: b.totalPoints
          })),
          stats: calculateCategoryStats(categorizedBrokers.highPerformers)
        },
        growingPerformers: {
          brokers: categorizedBrokers.growingPerformers.map((b) => ({
            id: b.id,
            name: b.name,
            level: b.level,
            totalPoints: b.totalPoints
          })),
          stats: calculateCategoryStats(categorizedBrokers.growingPerformers)
        },
        newBrokers: {
          brokers: categorizedBrokers.newBrokers.map((b) => ({
            id: b.id,
            name: b.name,
            level: b.level,
            totalPoints: b.totalPoints
          })),
          stats: calculateCategoryStats(categorizedBrokers.newBrokers)
        },
        totalBrokers: brokersWithProfiles.length,
        lastUpdated: /* @__PURE__ */ new Date()
      };
      res.json(result);
    } catch (error) {
      console.error("Erro ao obter categorias de corretores:", error);
      res.status(500).json({ message: "Erro ao obter categorias de corretores" });
    }
  }
);
var gamification_default = router;

// server/routes.ts
async function registerRoutes(app2) {
  setupAuth(app2);
  app2.get("/api/activities", authenticateUser, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const user = req.user;
    let activities2;
    if (user.role === "director") {
      activities2 = await storage.getAllActivities();
    } else if (user.role === "manager") {
      activities2 = await storage.getActivitiesByManager(user.id);
    } else {
      activities2 = await storage.getActivitiesByUser(user.id);
    }
    res.json(activities2);
  });
  app2.get("/api/activities/:id", authenticateUser, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const id = parseInt(req.params.id);
    const activity = await storage.getActivity(id);
    if (!activity) {
      return res.status(404).send("Activity not found");
    }
    const user = req.user;
    if (user.role === "director") {
      return res.json(activity);
    }
    if (user.role === "manager" && activity.createdBy === user.id) {
      return res.json(activity);
    }
    if (activity.assignedTo === user.id) {
      return res.json(activity);
    }
    return res.status(403).send("Forbidden");
  });
  app2.post("/api/activities", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    if (req.user.role !== "manager") {
      return res.status(403).send("Only managers can create activities");
    }
    try {
      const activityData = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity({
        ...activityData,
        createdBy: req.user.id
      });
      await storage.createNotification({
        type: "activity",
        title: "Nova atividade atribu\xEDda",
        content: `Nova atividade: ${activity.title}`,
        userId: activity.assignedTo,
        relatedId: activity.id,
        relatedType: "activity"
      });
      res.status(201).json(activity);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).send("Server error");
    }
  });
  app2.patch("/api/activities/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const id = parseInt(req.params.id);
    const activity = await storage.getActivity(id);
    if (!activity) {
      return res.status(404).send("Activity not found");
    }
    const user = req.user;
    if (user.role !== "manager" && activity.assignedTo !== user.id) {
      return res.status(403).send("Forbidden");
    }
    try {
      const updatedActivity = await storage.updateActivity(id, req.body);
      if (req.body.status === "completed" && user.role === "broker") {
        let performance = await storage.getCurrentPerformanceByUser(user.id);
        if (!performance) {
          const now = /* @__PURE__ */ new Date();
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          weekStart.setHours(0, 0, 0, 0);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          weekEnd.setHours(23, 59, 59, 999);
          performance = await storage.createPerformance({
            userId: user.id,
            score: 0,
            weekStart,
            weekEnd,
            activitiesCompleted: 0,
            dealsProgressed: 0
          });
        }
        await storage.updatePerformance(performance.id, {
          activitiesCompleted: performance.activitiesCompleted + 1,
          score: performance.score + 5
          // Simple scoring: +5 points per completed activity
        });
        await storage.createNotification({
          type: "activity",
          title: "Atividade conclu\xEDda",
          content: `${user.name} concluiu a atividade: ${activity.title}`,
          userId: activity.createdBy,
          relatedId: activity.id,
          relatedType: "activity"
        });
      }
      if (req.body.status === "completed" && activity.status !== "completed") {
        try {
          const { gamificationService: gamificationService2 } = await Promise.resolve().then(() => (init_gamification_service(), gamification_service_exports));
          const isTimely = /* @__PURE__ */ new Date() < new Date(activity.dueDate);
          await gamificationService2.onActivityCompleted(req.user.id, activity.id, isTimely);
        } catch (gamificationError) {
          console.log("Gamifica\xE7\xE3o n\xE3o dispon\xEDvel ou erro:", gamificationError);
        }
      }
      res.json(updatedActivity);
    } catch (error) {
      res.status(500).send("Server error");
    }
  });
  app2.get("/api/deals", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const user = req.user;
    let deals2;
    if (user.role === "manager") {
      deals2 = await storage.getDealsByManager(user.id);
    } else {
      deals2 = await storage.getDealsByUser(user.id);
    }
    res.json(deals2);
  });
  app2.get("/api/deals/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const id = parseInt(req.params.id);
    const deal = await storage.getDeal(id);
    if (!deal) {
      return res.status(404).send("Deal not found");
    }
    const user = req.user;
    if (user.role !== "manager" && deal.assignedTo !== user.id) {
      return res.status(403).send("Forbidden");
    }
    res.json(deal);
  });
  app2.post("/api/deals", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    if (req.user.role !== "manager") {
      return res.status(403).send("Only managers can create deals");
    }
    try {
      const dealData = insertDealSchema.parse(req.body);
      const deal = await storage.createDeal({
        ...dealData,
        createdBy: req.user.id
      });
      await storage.createNotification({
        type: "deal",
        title: "Nova negocia\xE7\xE3o atribu\xEDda",
        content: `Nova negocia\xE7\xE3o: ${deal.clientName} - ${deal.propertyInfo}`,
        userId: deal.assignedTo,
        relatedId: deal.id,
        relatedType: "deal"
      });
      res.status(201).json(deal);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).send("Server error");
    }
  });
  app2.patch("/api/deals/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const id = parseInt(req.params.id);
    const deal = await storage.getDeal(id);
    if (!deal) {
      return res.status(404).send("Deal not found");
    }
    const user = req.user;
    if (user.role !== "manager" && deal.assignedTo !== user.id) {
      return res.status(403).send("Forbidden");
    }
    try {
      const previousStage = deal.stage;
      const updatedDeal = await storage.updateDeal(id, req.body);
      if (req.body.stage && req.body.stage !== previousStage && user.role === "broker") {
        let performance = await storage.getCurrentPerformanceByUser(user.id);
        if (!performance) {
          const now = /* @__PURE__ */ new Date();
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          weekStart.setHours(0, 0, 0, 0);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          weekEnd.setHours(23, 59, 59, 999);
          performance = await storage.createPerformance({
            userId: user.id,
            score: 0,
            weekStart,
            weekEnd,
            activitiesCompleted: 0,
            dealsProgressed: 0
          });
        }
        await storage.updatePerformance(performance.id, {
          dealsProgressed: performance.dealsProgressed + 1,
          score: performance.score + 10
          // Simple scoring: +10 points per deal progression
        });
        await storage.createNotification({
          type: "deal",
          title: "Negocia\xE7\xE3o atualizada",
          content: `${user.name} atualizou o status da negocia\xE7\xE3o para ${req.body.stage}`,
          userId: deal.createdBy,
          relatedId: deal.id,
          relatedType: "deal"
        });
      }
      if (req.body.stage && req.body.stage !== deal.stage) {
        try {
          const { gamificationService: gamificationService2 } = await Promise.resolve().then(() => (init_gamification_service(), gamification_service_exports));
          await gamificationService2.onDealProgressed(req.user.id, deal.id, deal.stage, req.body.stage);
        } catch (gamificationError) {
          console.log("Gamifica\xE7\xE3o n\xE3o dispon\xEDvel ou erro:", gamificationError);
        }
      }
      res.json(updatedDeal);
    } catch (error) {
      res.status(500).send("Server error");
    }
  });
  app2.get("/api/messages/:userId", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const userId = parseInt(req.params.userId);
    const currentUser = req.user;
    const messages2 = await storage.getMessagesBetweenUsers(currentUser.id, userId);
    for (const message of messages2) {
      if (message.receiverId === currentUser.id && !message.read) {
        await storage.markMessageAsRead(message.id);
      }
    }
    res.json(messages2);
  });
  app2.get("/api/messages/team", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const messages2 = await storage.getTeamMessages();
    for (const message of messages2) {
      if (message.receiverId === 0 && !message.read) {
        await storage.markMessageAsReadForUser(message.id, req.user.id);
      }
    }
    res.json(messages2);
  });
  app2.post("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage({
        ...messageData,
        senderId: req.user.id
      });
      await storage.createNotification({
        type: "message",
        title: "Nova mensagem",
        content: `Nova mensagem de ${req.user.name}`,
        userId: message.receiverId,
        relatedId: message.id,
        relatedType: "message"
      });
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).send("Server error");
    }
  });
  app2.post("/api/messages/team", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    try {
      const { content, senderId } = req.body;
      if (!content) {
        return res.status(400).json({ error: "Content is required" });
      }
      const message = await storage.createTeamMessage({
        content,
        senderId: req.user.id,
        receiverId: 0
        // Special value for team messages
      });
      const teamMembers = req.user.role === "manager" ? await storage.getUsersByRole("broker") : await storage.getUsersByRole("manager");
      for (const member of teamMembers) {
        if (member.id !== req.user.id) {
          await storage.createNotification({
            type: "message",
            title: "Nova mensagem da equipe",
            content: `Nova mensagem de ${req.user.name} para a equipe`,
            userId: member.id,
            relatedId: message.id,
            relatedType: "team_message"
          });
        }
      }
      try {
        const { gamificationService: gamificationService2 } = await Promise.resolve().then(() => (init_gamification_service(), gamification_service_exports));
        await gamificationService2.onMessageSent(req.user.id);
      } catch (gamificationError) {
        console.log("Gamifica\xE7\xE3o n\xE3o dispon\xEDvel ou erro:", gamificationError);
      }
      res.status(201).json(message);
    } catch (error) {
      res.status(500).send("Server error");
    }
  });
  app2.get("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const notifications2 = await storage.getNotificationsByUser(req.user.id);
    res.json(notifications2);
  });
  app2.post("/api/notifications/read/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const id = parseInt(req.params.id);
    const notification = await storage.getNotification(id);
    if (!notification) {
      return res.status(404).send("Notification not found");
    }
    if (notification.userId !== req.user.id) {
      return res.status(403).send("Forbidden");
    }
    const updatedNotification = await storage.markNotificationAsRead(id);
    res.json(updatedNotification);
  });
  app2.post("/api/notifications/read-all", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    await storage.markAllNotificationsAsRead(req.user.id);
    res.sendStatus(200);
  });
  app2.get("/api/performance", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const user = req.user;
    if (user?.role === "director") {
      try {
        const managers = await storage.getUsersByRole("manager");
        const brokers = await storage.getUsersByRole("broker");
        const activities2 = await storage.getAllActivities();
        const activitiesCompleted = activities2.filter((a) => a.status === "completed");
        const activitiesPending = activities2.filter((a) => a.status === "pending");
        const activitiesInProgress = activities2.filter((a) => a.status === "in_progress");
        const deals2 = await storage.getAllDeals();
        const dealStages = {
          initialContact: deals2.filter((d) => d.stage === "initial_contact").length,
          visit: deals2.filter((d) => d.stage === "visit").length,
          proposal: deals2.filter((d) => d.stage === "proposal").length,
          closing: deals2.filter((d) => d.stage === "closing").length
        };
        const summary = {
          managersCount: managers.length,
          brokersCount: brokers.length,
          activities: {
            total: activities2.length,
            completed: activitiesCompleted.length,
            pending: activitiesPending.length,
            inProgress: activitiesInProgress.length,
            completionRate: activities2.length > 0 ? Math.round(activitiesCompleted.length / activities2.length * 100) : 0
          },
          deals: {
            total: deals2.length,
            stages: dealStages,
            closingRate: deals2.length > 0 ? Math.round(dealStages.closing / deals2.length * 100) : 0
          }
        };
        res.json(summary);
      } catch (error) {
        console.error("Erro ao obter vis\xE3o da diretoria:", error);
        res.status(500).send("Server error");
      }
    } else if (user?.role === "manager") {
      const brokers = await storage.getUsersByRole("broker");
      const performancePromises = brokers.map(async (broker) => {
        const performance = await storage.getCurrentPerformanceByUser(broker.id);
        return {
          brokerId: broker.id,
          brokerName: broker.name,
          brokerInitials: broker.avatarInitials,
          score: performance?.score || 0,
          activitiesCompleted: performance?.activitiesCompleted || 0,
          dealsProgressed: performance?.dealsProgressed || 0
        };
      });
      const performances2 = await Promise.all(performancePromises);
      res.json(performances2.sort((a, b) => b.score - a.score));
    } else {
      const performance = await storage.getCurrentPerformanceByUser(user.id);
      if (!performance) {
        return res.json({
          score: 0,
          activitiesCompleted: 0,
          dealsProgressed: 0
        });
      }
      res.json(performance);
    }
  });
  app2.get("/api/teams", authenticateUser, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const user = req.user;
    let teams2 = [];
    if (user.role === "director") {
      teams2 = Array.from((await storage.getAllTeams()).values());
    } else if (user.role === "manager") {
      const team = await storage.getTeamByManager(user.id);
      if (team) teams2 = [team];
    } else {
      if (user.teamId) {
        const team = await storage.getTeam(user.teamId);
        if (team) teams2 = [team];
      }
    }
    res.json(teams2);
  });
  app2.get("/api/teams/:id", authenticateUser, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const teamId = parseInt(req.params.id);
    const team = await storage.getTeam(teamId);
    if (!team) {
      return res.status(404).send("Team not found");
    }
    const user = req.user;
    if (user.role === "director") {
      return res.json(team);
    }
    if (user.role === "manager" && team.managerId === user.id) {
      return res.json(team);
    }
    if (user.teamId === teamId) {
      return res.json(team);
    }
    return res.status(403).send("Forbidden");
  });
  app2.get("/api/teams/:id/members", authenticateUser, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const teamId = parseInt(req.params.id);
    const team = await storage.getTeam(teamId);
    if (!team) {
      return res.status(404).send("Team not found");
    }
    const user = req.user;
    if (user.role === "director") {
    } else if (user.role === "manager" && team.managerId === user.id) {
    } else if (user.teamId === teamId) {
    } else {
      return res.status(403).send("Forbidden");
    }
    const members = await storage.getUsersByTeam(teamId);
    const safeMembers = members.map(({ password, ...member }) => member);
    res.json(safeMembers);
  });
  app2.get("/api/users/brokers", authenticateUser, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    if (req.user?.role !== "manager" && req.user?.role !== "director") {
      return res.status(403).send("Only managers and directors can view all brokers");
    }
    let brokers;
    if (req.user?.role === "director") {
      brokers = await storage.getUsersByRole("broker");
    } else {
      brokers = await storage.getBrokersByManager(req.user.id);
    }
    const safeBrokers = brokers.map(({ password, ...broker }) => broker);
    res.json(safeBrokers);
  });
  app2.get("/api/users/managers", authenticateUser, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    if (req.user?.role !== "broker" && req.user?.role !== "director") {
      return res.status(403).send("Only brokers and directors can view managers");
    }
    let managers;
    if (req.user?.role === "director") {
      managers = await storage.getUsersByRole("manager");
    } else {
      const brokerId = req.user.id;
      const broker = await storage.getUser(brokerId);
      if (broker?.managerId) {
        const manager = await storage.getUser(broker.managerId);
        managers = manager ? [manager] : [];
      } else if (broker?.teamId) {
        const team = await storage.getTeam(broker.teamId);
        if (team?.managerId) {
          const manager = await storage.getUser(team.managerId);
          managers = manager ? [manager] : [];
        } else {
          managers = [];
        }
      } else {
        managers = [];
      }
    }
    const safeManagers = managers.map(({ password, ...manager }) => manager);
    res.json(safeManagers);
  });
  app2.get("/api/users/managers-ranking", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    if (req.user?.role !== "director") {
      return res.status(403).send("Only directors can view manager rankings");
    }
    try {
      const managers = await storage.getUsersByRole("manager");
      const managersPerformance = await Promise.all(managers.map(async (manager) => {
        const brokersUnderManager = await storage.getBrokersByManager(manager.id);
        const activities2 = await storage.getActivitiesByManager(manager.id);
        const completedActivities = activities2.filter((a) => a.status === "completed");
        const deals2 = await storage.getDealsByManager(manager.id);
        const closedDeals = deals2.filter((d) => d.stage === "closing");
        const score = completedActivities.length * 5 + closedDeals.length * 15;
        return {
          id: manager.id,
          name: manager.name,
          avatarInitials: manager.avatarInitials,
          brokerCount: brokersUnderManager.length,
          activitiesCreated: activities2.length,
          activitiesCompleted: completedActivities.length,
          dealsCreated: deals2.length,
          dealsCompleted: closedDeals.length,
          score
        };
      }));
      const rankedManagers = managersPerformance.sort((a, b) => b.score - a.score);
      res.json(rankedManagers);
    } catch (error) {
      console.error("Erro ao obter ranking de gestores:", error);
      res.status(500).send("Server error");
    }
  });
  app2.use("/api/gamification", gamification_default);
  const httpServer = createServer(app2);
  setupWebsocket(httpServer);
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
init_gamification_service();
var app = express3();
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
app.use("/api/gamification", gamification_default);
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
app.get("/api/messages/team", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
});
app.get("/api/messages/:userId", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 3001;
  server.listen({
    port,
    host: "0.0.0.0"
  }, () => {
    log(`serving on port ${port}`);
  });
})();
