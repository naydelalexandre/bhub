import { pgTable, text, serial, integer, boolean, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const userRoleEnum = pgEnum('user_role', ['director', 'manager', 'broker']);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: userRoleEnum("role").notNull(),
  avatarInitials: text("avatar_initials").notNull(),
  managerId: integer("manager_id"), // ID do gerente responsável (para corretores)
  teamId: integer("team_id"),       // ID da equipe (para identificar membros da mesma equipe)
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });

// Team schema
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  managerId: integer("manager_id").notNull(), // ID do gerente responsável pela equipe
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Activity schema
export const activityStatusEnum = pgEnum('activity_status', ['pending', 'in_progress', 'completed']);

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: activityStatusEnum("status").notNull().default('pending'),
  dueDate: timestamp("due_date").notNull(),
  assignedTo: integer("assigned_to").notNull(),
  createdBy: integer("created_by").notNull(),
  clientName: text("client_name"),
  propertyInfo: text("property_info"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertActivitySchema = createInsertSchema(activities).omit({ id: true, createdAt: true });

// Deal schema
export const dealStageEnum = pgEnum('deal_stage', ['initial_contact', 'visit', 'proposal', 'closing']);
export const dealPriorityEnum = pgEnum('deal_priority', ['low', 'medium', 'high']);

export const deals = pgTable("deals", {
  id: serial("id").primaryKey(),
  clientName: text("client_name").notNull(),
  propertyInfo: text("property_info").notNull(),
  stage: dealStageEnum("stage").notNull().default('initial_contact'),
  priority: dealPriorityEnum("priority").notNull().default('medium'),
  assignedTo: integer("assigned_to").notNull(),
  createdBy: integer("created_by").notNull(),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDealSchema = createInsertSchema(deals).omit({ id: true, lastUpdated: true, createdAt: true });

// Message schema
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  senderId: integer("sender_id").notNull(),
  // Um receiverId=0 é usado para identificar mensagens de equipe
  receiverId: integer("receiver_id").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, read: true, createdAt: true });

// Notification schema
export const notificationTypeEnum = pgEnum('notification_type', ['message', 'activity', 'deal', 'performance', 'reminder']);

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  type: notificationTypeEnum("type").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  userId: integer("user_id").notNull(),
  read: boolean("read").notNull().default(false),
  relatedId: integer("related_id"),
  relatedType: text("related_type"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, read: true, createdAt: true });

// Performance schema
export const performances = pgTable("performances", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  score: integer("score").notNull(),
  weekStart: timestamp("week_start").notNull(),
  weekEnd: timestamp("week_end").notNull(),
  activitiesCompleted: integer("activities_completed").notNull().default(0),
  dealsProgressed: integer("deals_progressed").notNull().default(0),
});

export const insertPerformanceSchema = createInsertSchema(performances).omit({ id: true });

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type Deal = typeof deals.$inferSelect;
export type InsertDeal = z.infer<typeof insertDealSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type Performance = typeof performances.$inferSelect;
export type InsertPerformance = z.infer<typeof insertPerformanceSchema>;
