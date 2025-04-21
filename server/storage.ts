import { 
  User, InsertUser, Activity, InsertActivity, Deal, InsertDeal, 
  Message, InsertMessage, Notification, InsertNotification, 
  Performance, InsertPerformance
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { SupabaseStorage } from './supabase-storage';

const MemoryStore = createMemoryStore(session);
// Usamos any para simplificar a tipagem do sessionStore
type SessionStoreType = any;

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: 'manager' | 'broker'): Promise<User[]>;
  
  // Activity methods
  getActivity(id: number): Promise<Activity | undefined>;
  getAllActivities(): Promise<Activity[]>;
  getActivitiesByUser(userId: number): Promise<Activity[]>;
  getActivitiesByManager(managerId: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  updateActivity(id: number, activity: Partial<Activity>): Promise<Activity | undefined>;
  
  // Deal methods
  getDeal(id: number): Promise<Deal | undefined>;
  getAllDeals(): Promise<Deal[]>;
  getDealsByUser(userId: number): Promise<Deal[]>;
  getDealsByManager(managerId: number): Promise<Deal[]>;
  createDeal(deal: InsertDeal): Promise<Deal>;
  updateDeal(id: number, deal: Partial<Deal>): Promise<Deal | undefined>;
  
  // Message methods
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesBetweenUsers(userId1: number, userId2: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<Message | undefined>;
  getTeamMessages(): Promise<Message[]>;
  createTeamMessage(message: InsertMessage): Promise<Message>;
  markMessageAsReadForUser(messageId: number, userId: number): Promise<void>;
  
  // Notification methods
  getNotification(id: number): Promise<Notification | undefined>;
  getNotificationsByUser(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  markAllNotificationsAsRead(userId: number): Promise<void>;
  
  // Performance methods
  getPerformance(id: number): Promise<Performance | undefined>;
  getCurrentPerformanceByUser(userId: number): Promise<Performance | undefined>;
  getPerformancesByUser(userId: number): Promise<Performance[]>;
  createPerformance(performance: InsertPerformance): Promise<Performance>;
  updatePerformance(id: number, performance: Partial<Performance>): Promise<Performance | undefined>;
  
  // Session store
  sessionStore: SessionStoreType;
  
  // Métodos para equipes e relacionamentos
  getTeam(id: number): Promise<any | undefined>;
  createTeam(team: { name: string; managerId: number }): Promise<any>;
  getUsersByTeam(teamId: number): Promise<User[]>;
  addUserToTeam(userId: number, teamId: number): Promise<User | undefined>;
  removeUserFromTeam(userId: number): Promise<User | undefined>;
  
  // Métodos para a visão da diretoria
  getAllActivities(): Promise<Activity[]>;
  getAllDeals(): Promise<Deal[]>;
  getBrokersByManager(managerId: number): Promise<User[]>;
}

// Cria e exporta uma instância da implementação SupabaseStorage
export const storage = new SupabaseStorage();
