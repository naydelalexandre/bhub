import { 
  User, InsertUser, Activity, InsertActivity, Deal, InsertDeal, 
  Message, InsertMessage, Notification, InsertNotification, 
  Performance, InsertPerformance
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private activities: Map<number, Activity>;
  private deals: Map<number, Deal>;
  private messages: Map<number, Message>;
  private notifications: Map<number, Notification>;
  private performances: Map<number, Performance>;
  private teams: Map<number, any>;
  
  sessionStore: SessionStoreType;
  private userId: number = 1;
  private activityId: number = 1;
  private dealId: number = 1;
  private messageId: number = 1;
  private notificationId: number = 1;
  private performanceId: number = 1;
  private teamId: number = 1;

  constructor() {
    this.users = new Map();
    this.activities = new Map();
    this.deals = new Map();
    this.messages = new Map();
    this.notifications = new Map();
    this.performances = new Map();
    this.teams = new Map();
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000
    });
    
    // Add seed data - two users for testing
    this.createUser({
      username: "manager@example.com",
      password: "$2b$10$EvxA6XeZU7T8TmAT.1UGa.wOZXKzGR1hu5xMcFGGPwE/EgmGaGR5m", // "password"
      name: "Gestor Márcio",
      role: "manager",
      avatarInitials: "GM"
    }).then(() => {
      console.log("Manager user created");
    }).catch(err => {
      console.error("Error creating manager user:", err);
    });
    
    this.createUser({
      username: "broker@example.com",
      password: "$2b$10$EvxA6XeZU7T8TmAT.1UGa.wOZXKzGR1hu5xMcFGGPwE/EgmGaGR5m", // "password"
      name: "Ana Rodrigues",
      role: "broker",
      avatarInitials: "AR"
    }).then(() => {
      console.log("Broker user created");
    }).catch(err => {
      console.error("Error creating broker user:", err);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUsersByRole(role: 'manager' | 'broker'): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === role);
  }

  // Activity methods
  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }

  async getAllActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values());
  }

  async getActivitiesByUser(userId: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.assignedTo === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getActivitiesByManager(managerId: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.createdBy === managerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.activityId++;
    const now = new Date();
    const newActivity: Activity = { 
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

  async updateActivity(id: number, activityUpdate: Partial<Activity>): Promise<Activity | undefined> {
    const activity = this.activities.get(id);
    if (!activity) return undefined;
    
    const updatedActivity = { ...activity, ...activityUpdate };
    this.activities.set(id, updatedActivity);
    return updatedActivity;
  }

  // Deal methods
  async getDeal(id: number): Promise<Deal | undefined> {
    return this.deals.get(id);
  }

  async getAllDeals(): Promise<Deal[]> {
    return Array.from(this.deals.values());
  }

  async getDealsByUser(userId: number): Promise<Deal[]> {
    return Array.from(this.deals.values())
      .filter(deal => deal.assignedTo === userId)
      .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
  }

  async getDealsByManager(managerId: number): Promise<Deal[]> {
    return Array.from(this.deals.values())
      .filter(deal => deal.createdBy === managerId)
      .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
  }

  async createDeal(deal: InsertDeal): Promise<Deal> {
    const id = this.dealId++;
    const now = new Date();
    const newDeal: Deal = { 
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

  async updateDeal(id: number, dealUpdate: Partial<Deal>): Promise<Deal | undefined> {
    const deal = this.deals.get(id);
    if (!deal) return undefined;
    
    const now = new Date();
    const updatedDeal = { 
      ...deal, 
      ...dealUpdate,
      lastUpdated: now
    };
    this.deals.set(id, updatedDeal);
    return updatedDeal;
  }

  // Message methods
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getMessagesBetweenUsers(userId1: number, userId2: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => 
        (message.senderId === userId1 && message.receiverId === userId2) ||
        (message.senderId === userId2 && message.receiverId === userId1)
      )
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async getTeamMessages(): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.receiverId === 0) // receiverId 0 for team messages
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.messageId++;
    const now = new Date();
    const newMessage: Message = { 
      ...message, 
      id, 
      read: false,
      createdAt: now 
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async createTeamMessage(message: InsertMessage): Promise<Message> {
    // Uses same implementation as regular messages, but team messages have receiverId=0
    return this.createMessage(message);
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;
    
    const updatedMessage = { ...message, read: true };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }

  async markMessageAsReadForUser(messageId: number, userId: number): Promise<void> {
    // For team messages, we need a way to track which users have read the message
    // In a real implementation, this would use a join table
    // For this demo, we'll just mark the message as read globally
    await this.markMessageAsRead(messageId);
  }

  // Notification methods
  async getNotification(id: number): Promise<Notification | undefined> {
    return this.notifications.get(id);
  }

  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.notificationId++;
    const now = new Date();
    const newNotification: Notification = { 
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

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;
    
    const updatedNotification = { ...notification, read: true };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }

  async markAllNotificationsAsRead(userId: number): Promise<void> {
    Array.from(this.notifications.entries())
      .filter(([_, notification]) => notification.userId === userId)
      .forEach(([id, notification]) => {
        this.notifications.set(id, { ...notification, read: true });
      });
  }

  // Performance methods
  async getPerformance(id: number): Promise<Performance | undefined> {
    return this.performances.get(id);
  }

  async getCurrentPerformanceByUser(userId: number): Promise<Performance | undefined> {
    const now = new Date();
    return Array.from(this.performances.values())
      .filter(performance => 
        performance.userId === userId &&
        new Date(performance.weekStart) <= now &&
        new Date(performance.weekEnd) >= now
      )[0];
  }

  async getPerformancesByUser(userId: number): Promise<Performance[]> {
    return Array.from(this.performances.values())
      .filter(performance => performance.userId === userId)
      .sort((a, b) => new Date(b.weekEnd).getTime() - new Date(a.weekEnd).getTime());
  }

  async createPerformance(performance: InsertPerformance): Promise<Performance> {
    const id = this.performanceId++;
    const newPerformance: Performance = { 
      ...performance, 
      id,
      activitiesCompleted: performance.activitiesCompleted || 0,
      dealsProgressed: performance.dealsProgressed || 0 
    };
    this.performances.set(id, newPerformance);
    return newPerformance;
  }

  async updatePerformance(id: number, performanceUpdate: Partial<Performance>): Promise<Performance | undefined> {
    const performance = this.performances.get(id);
    if (!performance) return undefined;
    
    const updatedPerformance = { ...performance, ...performanceUpdate };
    this.performances.set(id, updatedPerformance);
    return updatedPerformance;
  }

  // Team methods
  async getTeam(id: number): Promise<any | undefined> {
    return this.teams.get(id);
  }
  
  async createTeam(team: { name: string; managerId: number }): Promise<any> {
    const id = this.teamId++;
    const now = new Date();
    const newTeam = {
      ...team,
      id,
      createdAt: now
    };
    this.teams.set(id, newTeam);
    return newTeam;
  }
  
  async getUsersByTeam(teamId: number): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.teamId === teamId);
  }
  
  async addUserToTeam(userId: number, teamId: number): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const team = this.teams.get(teamId);
    if (!team) return undefined;
    
    // Se o usuário for um corretor e a equipe pertencer a um gerente,
    // definir o gerente como responsável pelo corretor
    if (user.role === 'broker') {
      user.managerId = team.managerId;
    }
    
    user.teamId = teamId;
    this.users.set(userId, user);
    return user;
  }
  
  async removeUserFromTeam(userId: number): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    user.teamId = undefined;
    
    // Se o usuário for um corretor, remover a referência ao gerente
    if (user.role === 'broker') {
      user.managerId = undefined;
    }
    
    this.users.set(userId, user);
    return user;
  }

  // Métodos para a visão da diretoria
  async getAllActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values());
  }
  
  async getAllDeals(): Promise<Deal[]> {
    return Array.from(this.deals.values());
  }
  
  async getBrokersByManager(managerId: number): Promise<User[]> {
    // Na implementação atual, não há uma relação direta entre gerentes e corretores
    // Vamos usar a relação criada pelos campos managerId
    
    // Primeiramente, buscar corretores que têm este gerente como responsável direto
    const brokersByManagerId = Array.from(this.users.values())
      .filter(user => user.role === "broker" && user.managerId === managerId);
    
    if (brokersByManagerId.length > 0) {
      return brokersByManagerId;
    }
    
    // Se não houver relação direta, tentar encontrar por equipe
    const manager = await this.getUser(managerId);
    if (!manager || manager.role !== "manager") return [];
    
    // Se o gerente tem uma equipe, buscar corretores dessa equipe
    if (manager.teamId) {
      return Array.from(this.users.values())
        .filter(user => user.role === "broker" && user.teamId === manager.teamId);
    }
    
    // Se nenhuma das opções acima funcionar, buscar por atividades e negócios como antes
    const activities = await this.getActivitiesByManager(managerId);
    const deals = await this.getDealsByManager(managerId);
    
    // Coletar IDs de corretores únicos para os quais o gerente atribuiu atividades ou negócios
    const brokerIds = new Set<number>();
    
    activities.forEach(activity => {
      brokerIds.add(activity.assignedTo);
    });
    
    deals.forEach(deal => {
      brokerIds.add(deal.assignedTo);
    });
    
    // Obter os usuários correspondentes aos IDs de corretores
    const brokers: User[] = [];
    
    // Converter para array antes de iterar
    for (const brokerId of Array.from(brokerIds)) {
      const broker = await this.getUser(brokerId);
      if (broker && broker.role === "broker") {
        brokers.push(broker);
      }
    }
    
    return brokers;
  }
}

export const storage = new MemStorage();
