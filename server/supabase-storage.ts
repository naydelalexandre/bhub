import { 
  User, InsertUser, Activity, InsertActivity, Deal, InsertDeal, 
  Message, InsertMessage, Notification, InsertNotification, 
  Performance, InsertPerformance
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { supabase } from './supabase';
import { IStorage } from './storage';

const MemoryStore = createMemoryStore(session);
type SessionStoreType = any;

/**
 * SupabaseStorage - Implementação da interface IStorage utilizando Supabase
 * 
 * Esta classe substitui a implementação em memória/SQLite por chamadas ao Supabase
 */
export class SupabaseStorage implements IStorage {
  sessionStore: SessionStoreType;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000
    });
    
    console.log('Supabase Storage inicializado');
  }

  // === User Methods ===
  
  async getUser(id: number): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error('Erro ao buscar usuário:', error);
      return undefined;
    }
    
    return data as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') { // Não encontrado
        return undefined;
      }
      console.error('Erro ao buscar usuário por username:', error);
      return undefined;
    }
    
    return data as User;
  }

  async createUser(user: InsertUser): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();
      
    if (error) {
      console.error('Erro ao criar usuário:', error);
      throw new Error(`Erro ao criar usuário: ${error.message}`);
    }
    
    return data as User;
  }

  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*');
      
    if (error) {
      console.error('Erro ao buscar todos os usuários:', error);
      return [];
    }
    
    return data as User[];
  }

  async getUsersByRole(role: 'manager' | 'broker'): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', role);
      
    if (error) {
      console.error(`Erro ao buscar usuários com role ${role}:`, error);
      return [];
    }
    
    return data as User[];
  }

  // === Activity Methods ===
  
  async getActivity(id: number): Promise<Activity | undefined> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error('Erro ao buscar atividade:', error);
      return undefined;
    }
    
    return data as Activity;
  }

  async getAllActivities(): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('createdAt', { ascending: false });
      
    if (error) {
      console.error('Erro ao buscar todas as atividades:', error);
      return [];
    }
    
    return data as Activity[];
  }

  async getActivitiesByUser(userId: number): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('assignedTo', userId)
      .order('createdAt', { ascending: false });
      
    if (error) {
      console.error(`Erro ao buscar atividades do usuário ${userId}:`, error);
      return [];
    }
    
    return data as Activity[];
  }

  async getActivitiesByManager(managerId: number): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('createdBy', managerId)
      .order('createdAt', { ascending: false });
      
    if (error) {
      console.error(`Erro ao buscar atividades do gerente ${managerId}:`, error);
      return [];
    }
    
    return data as Activity[];
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const now = new Date();
    const activityWithDefaults = { 
      ...activity, 
      status: activity.status || "pending",
      description: activity.description || null,
      clientName: activity.clientName || null,
      propertyInfo: activity.propertyInfo || null,
      createdAt: now 
    };
    
    const { data, error } = await supabase
      .from('activities')
      .insert(activityWithDefaults)
      .select()
      .single();
      
    if (error) {
      console.error('Erro ao criar atividade:', error);
      throw new Error(`Erro ao criar atividade: ${error.message}`);
    }
    
    return data as Activity;
  }

  async updateActivity(id: number, activityUpdate: Partial<Activity>): Promise<Activity | undefined> {
    const { data, error } = await supabase
      .from('activities')
      .update(activityUpdate)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error(`Erro ao atualizar atividade ${id}:`, error);
      return undefined;
    }
    
    return data as Activity;
  }

  // === Deal Methods ===
  
  async getDeal(id: number): Promise<Deal | undefined> {
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error('Erro ao buscar negociação:', error);
      return undefined;
    }
    
    return data as Deal;
  }

  async getAllDeals(): Promise<Deal[]> {
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .order('createdAt', { ascending: false });
      
    if (error) {
      console.error('Erro ao buscar todas as negociações:', error);
      return [];
    }
    
    return data as Deal[];
  }

  async getDealsByUser(userId: number): Promise<Deal[]> {
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('brokerId', userId)
      .order('createdAt', { ascending: false });
      
    if (error) {
      console.error(`Erro ao buscar negociações do usuário ${userId}:`, error);
      return [];
    }
    
    return data as Deal[];
  }

  async getDealsByManager(managerId: number): Promise<Deal[]> {
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('managerId', managerId)
      .order('createdAt', { ascending: false });
      
    if (error) {
      console.error(`Erro ao buscar negociações do gerente ${managerId}:`, error);
      return [];
    }
    
    return data as Deal[];
  }

  async createDeal(deal: InsertDeal): Promise<Deal> {
    const now = new Date();
    const dealWithDefaults = {
      ...deal,
      status: deal.status || "prospecting",
      notes: deal.notes || null,
      clientName: deal.clientName || null,
      propertyAddress: deal.propertyAddress || null,
      propertyValue: deal.propertyValue || 0,
      commissionValue: deal.commissionValue || 0,
      createdAt: now
    };
    
    const { data, error } = await supabase
      .from('deals')
      .insert(dealWithDefaults)
      .select()
      .single();
      
    if (error) {
      console.error('Erro ao criar negociação:', error);
      throw new Error(`Erro ao criar negociação: ${error.message}`);
    }
    
    return data as Deal;
  }

  async updateDeal(id: number, dealUpdate: Partial<Deal>): Promise<Deal | undefined> {
    const { data, error } = await supabase
      .from('deals')
      .update(dealUpdate)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error(`Erro ao atualizar negociação ${id}:`, error);
      return undefined;
    }
    
    return data as Deal;
  }

  // === Message Methods ===
  
  async getMessage(id: number): Promise<Message | undefined> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error('Erro ao buscar mensagem:', error);
      return undefined;
    }
    
    return data as Message;
  }

  async getMessagesBetweenUsers(userId1: number, userId2: number): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(senderId.eq.${userId1},receiverId.eq.${userId2}),and(senderId.eq.${userId2},receiverId.eq.${userId1})`)
      .is('isTeamMessage', false)
      .order('sentAt', { ascending: true });
      
    if (error) {
      console.error(`Erro ao buscar mensagens entre usuários ${userId1} e ${userId2}:`, error);
      return [];
    }
    
    return data as Message[];
  }

  async getTeamMessages(): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('isTeamMessage', true)
      .order('sentAt', { ascending: true });
      
    if (error) {
      console.error('Erro ao buscar mensagens da equipe:', error);
      return [];
    }
    
    return data as Message[];
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const now = new Date();
    const messageWithDefaults = {
      ...message,
      isTeamMessage: message.isTeamMessage || false,
      read: false,
      sentAt: now
    };
    
    const { data, error } = await supabase
      .from('messages')
      .insert(messageWithDefaults)
      .select()
      .single();
      
    if (error) {
      console.error('Erro ao criar mensagem:', error);
      throw new Error(`Erro ao criar mensagem: ${error.message}`);
    }
    
    return data as Message;
  }

  async createTeamMessage(message: InsertMessage): Promise<Message> {
    return this.createMessage({ ...message, isTeamMessage: true });
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const { data, error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error(`Erro ao marcar mensagem ${id} como lida:`, error);
      return undefined;
    }
    
    return data as Message;
  }

  async markMessageAsReadForUser(messageId: number, userId: number): Promise<void> {
    const { error } = await supabase
      .from('message_read_status')
      .insert({ messageId, userId, read: true });
      
    if (error) {
      console.error(`Erro ao marcar mensagem ${messageId} como lida para usuário ${userId}:`, error);
    }
  }

  // === Notification Methods ===
  
  async getNotification(id: number): Promise<Notification | undefined> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error('Erro ao buscar notificação:', error);
      return undefined;
    }
    
    return data as Notification;
  }

  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false });
      
    if (error) {
      console.error(`Erro ao buscar notificações do usuário ${userId}:`, error);
      return [];
    }
    
    return data as Notification[];
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const now = new Date();
    const notificationWithDefaults = {
      ...notification,
      read: false,
      createdAt: now,
      // Garantir que valores opcionais são tratados corretamente
      relatedEntityId: notification.relatedEntityId || null,
      relatedEntityType: notification.relatedEntityType || null
    };
    
    const { data, error } = await supabase
      .from('notifications')
      .insert(notificationWithDefaults)
      .select()
      .single();
      
    if (error) {
      console.error('Erro ao criar notificação:', error);
      throw new Error(`Erro ao criar notificação: ${error.message}`);
    }
    
    return data as Notification;
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error(`Erro ao marcar notificação ${id} como lida:`, error);
      return undefined;
    }
    
    return data as Notification;
  }

  async markAllNotificationsAsRead(userId: number): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('userId', userId);
      
    if (error) {
      console.error(`Erro ao marcar todas notificações do usuário ${userId} como lidas:`, error);
    }
  }

  // === Performance Methods ===
  
  async getPerformance(id: number): Promise<Performance | undefined> {
    const { data, error } = await supabase
      .from('performances')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error('Erro ao buscar performance:', error);
      return undefined;
    }
    
    return data as Performance;
  }

  async getCurrentPerformanceByUser(userId: number): Promise<Performance | undefined> {
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // Janeiro é 0
    const currentYear = today.getFullYear();
    
    const { data, error } = await supabase
      .from('performances')
      .select('*')
      .eq('userId', userId)
      .eq('month', currentMonth)
      .eq('year', currentYear)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') { // Não encontrado
        return undefined;
      }
      console.error(`Erro ao buscar performance atual do usuário ${userId}:`, error);
      return undefined;
    }
    
    return data as Performance;
  }

  async getPerformancesByUser(userId: number): Promise<Performance[]> {
    const { data, error } = await supabase
      .from('performances')
      .select('*')
      .eq('userId', userId)
      .order('year', { ascending: false })
      .order('month', { ascending: false });
      
    if (error) {
      console.error(`Erro ao buscar histórico de performance do usuário ${userId}:`, error);
      return [];
    }
    
    return data as Performance[];
  }

  async createPerformance(performance: InsertPerformance): Promise<Performance> {
    const now = new Date();
    const performanceWithDefaults = {
      ...performance,
      createdAt: now,
      // Atribuir valores padrão para campos numéricos
      propertiesSold: performance.propertiesSold || 0,
      salesVolume: performance.salesVolume || 0,
      commission: performance.commission || 0,
      activitiesCompleted: performance.activitiesCompleted || 0
    };
    
    const { data, error } = await supabase
      .from('performances')
      .insert(performanceWithDefaults)
      .select()
      .single();
      
    if (error) {
      console.error('Erro ao criar performance:', error);
      throw new Error(`Erro ao criar performance: ${error.message}`);
    }
    
    return data as Performance;
  }

  async updatePerformance(id: number, performanceUpdate: Partial<Performance>): Promise<Performance | undefined> {
    const { data, error } = await supabase
      .from('performances')
      .update(performanceUpdate)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error(`Erro ao atualizar performance ${id}:`, error);
      return undefined;
    }
    
    return data as Performance;
  }

  // === Team Methods ===
  
  async getTeam(id: number): Promise<any | undefined> {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error('Erro ao buscar equipe:', error);
      return undefined;
    }
    
    return data;
  }

  async createTeam(team: { name: string; managerId: number }): Promise<any> {
    const now = new Date();
    const teamWithDefaults = {
      ...team,
      createdAt: now
    };
    
    const { data, error } = await supabase
      .from('teams')
      .insert(teamWithDefaults)
      .select()
      .single();
      
    if (error) {
      console.error('Erro ao criar equipe:', error);
      throw new Error(`Erro ao criar equipe: ${error.message}`);
    }
    
    return data;
  }

  async getUsersByTeam(teamId: number): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('teamId', teamId);
      
    if (error) {
      console.error(`Erro ao buscar usuários da equipe ${teamId}:`, error);
      return [];
    }
    
    return data as User[];
  }

  async addUserToTeam(userId: number, teamId: number): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .update({ teamId })
      .eq('id', userId)
      .select()
      .single();
      
    if (error) {
      console.error(`Erro ao adicionar usuário ${userId} à equipe ${teamId}:`, error);
      return undefined;
    }
    
    return data as User;
  }

  async removeUserFromTeam(userId: number): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .update({ teamId: null })
      .eq('id', userId)
      .select()
      .single();
      
    if (error) {
      console.error(`Erro ao remover usuário ${userId} da equipe:`, error);
      return undefined;
    }
    
    return data as User;
  }
  
  // === Director Dashboard Methods ===
  
  async getBrokersByManager(managerId: number): Promise<User[]> {
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id')
      .eq('managerId', managerId)
      .single();
      
    if (teamError) {
      console.error(`Erro ao buscar equipe do gerente ${managerId}:`, teamError);
      return [];
    }
    
    if (!team) {
      return [];
    }
    
    return this.getUsersByTeam(team.id);
  }
} 