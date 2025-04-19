import { pgTable, text, serial, integer, boolean, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enum para os níveis de gamificação
export const gamificationLevelEnum = pgEnum("gamification_level", [
  "bronze", 
  "silver", 
  "gold", 
  "platinum", 
  "diamond"
]);

// Enum para os tipos de conquistas
export const achievementTypeEnum = pgEnum("achievement_type", [
  "activity", 
  "deal", 
  "communication", 
  "streak", 
  "ranking"
]);

// Schema da tabela de gamificação
export const gamificationProfiles = pgTable("gamification_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  level: gamificationLevelEnum("level").notNull().default("bronze"),
  totalPoints: integer("total_points").notNull().default(0),
  weeklyPoints: integer("weekly_points").notNull().default(0),
  streak: integer("streak").notNull().default(0),
  lastActive: timestamp("last_active"),
  achievements: jsonb("achievements").notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Schema da tabela de conquistas
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: achievementTypeEnum("type").notNull(),
  icon: text("icon").notNull(),
  pointsReward: integer("points_reward").notNull().default(10),
  requirement: integer("requirement").notNull(),
  level: integer("level").notNull().default(0), // Nível mínimo para desbloquear
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Schema da tabela de histórico de pontos
export const pointsHistory = pgTable("points_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  points: integer("points").notNull(),
  reason: text("reason").notNull(),
  relatedId: integer("related_id"),
  relatedType: text("related_type"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Types para TypeScript
export type GamificationLevel = "bronze" | "silver" | "gold" | "platinum" | "diamond";
export type AchievementType = "activity" | "deal" | "communication" | "streak" | "ranking";

export interface Achievement {
  id: number;
  title: string;
  description: string;
  type: AchievementType;
  icon: string;
  pointsReward: number;
  requirement: number;
  level: number; // Nível mínimo para desbloquear
  createdAt: Date;
}

export interface UserAchievement {
  achievementId: number;
  progress: number;
  completed: boolean;
  completedAt?: Date;
}

export interface GamificationProfile {
  id: number;
  userId: number;
  level: GamificationLevel;
  totalPoints: number;
  weeklyPoints: number;
  streak: number;
  lastActive?: Date;
  achievements: UserAchievement[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PointsHistoryEntry {
  id: number;
  userId: number;
  points: number;
  reason: string;
  relatedId?: number;
  relatedType?: string;
  createdAt: Date;
}

// Esquema de inserção via Zod
export const insertGamificationProfileSchema = createInsertSchema(gamificationProfiles).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({ 
  id: true, 
  createdAt: true 
});

export const insertPointsHistorySchema = createInsertSchema(pointsHistory).omit({ 
  id: true, 
  createdAt: true 
});

// Constantes para exigências de níveis (pontos necessários)
export const LEVEL_REQUIREMENTS = {
  bronze: 0,
  silver: 1000,
  gold: 2000,
  platinum: 3500,
  diamond: 5000
};

// Conquistas padrão do sistema
export const DEFAULT_ACHIEVEMENTS: Omit<Achievement, "id" | "createdAt">[] = [
  {
    title: "Velocista",
    description: "Concluir 5 atividades antes do prazo",
    type: "activity",
    icon: "⚡",
    pointsReward: 50,
    requirement: 5,
    level: 0
  },
  {
    title: "Comunicador",
    description: "Manter comunicação diária por 5 dias consecutivos",
    type: "communication",
    icon: "💬",
    pointsReward: 50,
    requirement: 5,
    level: 0
  },
  {
    title: "Negociador Master",
    description: "Concluir 3 negociações em uma semana",
    type: "deal",
    icon: "🤝",
    pointsReward: 100,
    requirement: 3,
    level: 0
  },
  {
    title: "Consistência",
    description: "Completar pelo menos 1 atividade por dia durante 7 dias",
    type: "streak",
    icon: "🔄",
    pointsReward: 75,
    requirement: 7,
    level: 0
  },
  {
    title: "Super Produtivo",
    description: "Concluir 10 atividades em um único dia",
    type: "activity",
    icon: "🚀",
    pointsReward: 150,
    requirement: 10,
    level: 1
  },
  {
    title: "Primeiro Lugar",
    description: "Ficar em primeiro lugar no ranking semanal",
    type: "ranking",
    icon: "🏆",
    pointsReward: 200,
    requirement: 1,
    level: 1
  }
];

// Estrutura para o ranking semanal
export interface RankingEntry {
  userId: number;
  userName: string;
  userAvatar?: string;
  weeklyPoints: number;
  rank: number;
}

// Estrutura para retornar o progresso de nível
export interface LevelProgress {
  level: number;
  currentPoints: number;
  pointsForCurrentLevel: number;
  pointsForNextLevel: number;
  progressPercentage: number;
}

// Constantes para cálculo de níveis
export const POINTS_PER_LEVEL = 1000;
export const BASE_POINTS = 500; 