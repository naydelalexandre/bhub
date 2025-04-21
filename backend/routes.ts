import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { setupWebsocket } from "./websocket";
import { z } from "zod";
import { User, insertActivitySchema, insertDealSchema, insertMessageSchema, insertNotificationSchema } from "@shared/schema";
import gamificationRoutes from './routes/gamification';
import { Permission, requirePermission, canAccessResource } from './middleware/permission';

// Adicionar a tipagem correta para Express.User
declare global {
  namespace Express {
    interface User {
      id: number;
      name: string;
      role: 'director' | 'manager' | 'broker';
      avatarInitials: string;
      username: string;
      password: string;
      teamId?: number; // Adicionar campo opcional para teamId
      managerId?: number; // Adicionar campo opcional para managerId
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  // API routes
  // Activities
  app.get("/api/activities", authenticateUser, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const user = req.user!;
    let activities;
    
    if (user.role === "director") {
      // Diretores veem todas as atividades
      activities = await storage.getAllActivities();
    } else if (user.role === "manager") {
      // Gerentes veem atividades criadas por eles (para sua equipe)
      activities = await storage.getActivitiesByManager(user.id);
    } else {
      // Corretores veem apenas suas próprias atividades
      activities = await storage.getActivitiesByUser(user.id);
    }
    
    res.json(activities);
  });

  app.get("/api/activities/:id", authenticateUser, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const id = parseInt(req.params.id);
    const activity = await storage.getActivity(id);
    
    if (!activity) {
      return res.status(404).send("Activity not found");
    }
    
    const user = req.user!;
    // Diretores podem ver todas as atividades
    if (user.role === "director") {
      return res.json(activity);
    }
    
    // Gerentes podem ver atividades que criaram
    if (user.role === "manager" && activity.createdBy === user.id) {
      return res.json(activity);
    }
    
    // Corretores só podem ver atividades atribuídas a eles
    if (activity.assignedTo === user.id) {
      return res.json(activity);
    }
    
    return res.status(403).send("Forbidden");
  });

  app.post("/api/activities", async (req, res) => {
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
      
      // Create notification for the assigned broker
      await storage.createNotification({
        type: "activity",
        title: "Nova atividade atribuída",
        content: `Nova atividade: ${activity.title}`,
        userId: activity.assignedTo,
        relatedId: activity.id,
        relatedType: "activity"
      });
      
      res.status(201).json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).send("Server error");
    }
  });

  app.patch("/api/activities/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const id = parseInt(req.params.id);
    const activity = await storage.getActivity(id);
    
    if (!activity) {
      return res.status(404).send("Activity not found");
    }
    
    const user = req.user!;
    if (user.role !== "manager" && activity.assignedTo !== user.id) {
      return res.status(403).send("Forbidden");
    }
    
    try {
      const updatedActivity = await storage.updateActivity(id, req.body);
      
      // If status was updated to completed and the user is a broker, update their performance
      if (req.body.status === "completed" && user.role === "broker") {
        let performance = await storage.getCurrentPerformanceByUser(user.id);
        
        if (!performance) {
          // Create a new weekly performance if none exists
          const now = new Date();
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
        
        // Update the performance
        await storage.updatePerformance(performance.id, {
          activitiesCompleted: performance.activitiesCompleted + 1,
          score: performance.score + 5 // Simple scoring: +5 points per completed activity
        });
        
        // Create notification for the manager
        await storage.createNotification({
          type: "activity",
          title: "Atividade concluída",
          content: `${user.name} concluiu a atividade: ${activity.title}`,
          userId: activity.createdBy,
          relatedId: activity.id,
          relatedType: "activity"
        });
      }
      
      // Se o status está sendo alterado para "completed", registrar na gamificação
      if (req.body.status === "completed" && activity.status !== "completed") {
        try {
          const { gamificationService } = await import('./gamification-service');
          // Verificar se a atividade foi completada antes do prazo
          const isTimely = new Date() < new Date(activity.dueDate);
          await gamificationService.onActivityCompleted(req.user!.id, activity.id, isTimely);
        } catch (gamificationError) {
          console.log('Gamificação não disponível ou erro:', gamificationError);
        }
      }
      
      res.json(updatedActivity);
    } catch (error) {
      res.status(500).send("Server error");
    }
  });

  // Deals
  app.get("/api/deals", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const user = req.user!;
    let deals;
    
    if (user.role === "manager") {
      deals = await storage.getDealsByManager(user.id);
    } else {
      deals = await storage.getDealsByUser(user.id);
    }
    
    res.json(deals);
  });

  app.get("/api/deals/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const id = parseInt(req.params.id);
    const deal = await storage.getDeal(id);
    
    if (!deal) {
      return res.status(404).send("Deal not found");
    }
    
    const user = req.user!;
    if (user.role !== "manager" && deal.assignedTo !== user.id) {
      return res.status(403).send("Forbidden");
    }
    
    res.json(deal);
  });

  app.post("/api/deals", async (req, res) => {
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
      
      // Create notification for the assigned broker
      await storage.createNotification({
        type: "deal",
        title: "Nova negociação atribuída",
        content: `Nova negociação: ${deal.clientName} - ${deal.propertyInfo}`,
        userId: deal.assignedTo,
        relatedId: deal.id,
        relatedType: "deal"
      });
      
      res.status(201).json(deal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).send("Server error");
    }
  });

  app.patch("/api/deals/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const id = parseInt(req.params.id);
    const deal = await storage.getDeal(id);
    
    if (!deal) {
      return res.status(404).send("Deal not found");
    }
    
    const user = req.user!;
    if (user.role !== "manager" && deal.assignedTo !== user.id) {
      return res.status(403).send("Forbidden");
    }
    
    try {
      const previousStage = deal.stage;
      const updatedDeal = await storage.updateDeal(id, req.body);
      
      // If stage was updated and the user is a broker, update their performance
      if (req.body.stage && req.body.stage !== previousStage && user.role === "broker") {
        let performance = await storage.getCurrentPerformanceByUser(user.id);
        
        if (!performance) {
          // Create a new weekly performance if none exists
          const now = new Date();
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
        
        // Update the performance
        await storage.updatePerformance(performance.id, {
          dealsProgressed: performance.dealsProgressed + 1,
          score: performance.score + 10 // Simple scoring: +10 points per deal progression
        });
        
        // Create notification for the manager
        await storage.createNotification({
          type: "deal",
          title: "Negociação atualizada",
          content: `${user.name} atualizou o status da negociação para ${req.body.stage}`,
          userId: deal.createdBy,
          relatedId: deal.id,
          relatedType: "deal"
        });
      }
      
      // Se o estágio está sendo alterado, registrar na gamificação
      if (req.body.stage && req.body.stage !== deal.stage) {
        try {
          const { gamificationService } = await import('./gamification-service');
          await gamificationService.onDealProgressed(req.user!.id, deal.id, deal.stage, req.body.stage);
        } catch (gamificationError) {
          console.log('Gamificação não disponível ou erro:', gamificationError);
        }
      }
      
      res.json(updatedDeal);
    } catch (error) {
      res.status(500).send("Server error");
    }
  });

  // Messages
  app.get("/api/messages/:userId", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const userId = parseInt(req.params.userId);
    const currentUser = req.user!;
    
    // Get messages between current user and the specified user
    const messages = await storage.getMessagesBetweenUsers(currentUser.id, userId);
    
    // Mark all received messages as read
    for (const message of messages) {
      if (message.receiverId === currentUser.id && !message.read) {
        await storage.markMessageAsRead(message.id);
      }
    }
    
    res.json(messages);
  });
  
  // New endpoint for team messages
  app.get("/api/messages/team", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const messages = await storage.getTeamMessages();
    
    // Mark all team messages as read for the current user
    for (const message of messages) {
      if (message.receiverId === 0 && !message.read) { // receiverId 0 indicates team message
        await storage.markMessageAsReadForUser(message.id, req.user.id);
      }
    }
    
    res.json(messages);
  });

  app.post("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage({
        ...messageData,
        senderId: req.user.id
      });
      
      // Create notification for the receiver
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
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).send("Server error");
    }
  });
  
  // New endpoint for team messages
  app.post("/api/messages/team", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const { content, senderId } = req.body;
      
      if (!content) {
        return res.status(400).json({ error: "Content is required" });
      }
      
      // Create team message (receiverId 0 indicates team message)
      const message = await storage.createTeamMessage({
        content,
        senderId: req.user!.id,
        receiverId: 0 // Special value for team messages
      });
      
      // Get all team members to send notifications to
      const teamMembers = req.user!.role === "manager" 
        ? await storage.getUsersByRole("broker") 
        : await storage.getUsersByRole("manager");
      
      // Create notifications for all team members except the sender
      for (const member of teamMembers) {
        if (member.id !== req.user!.id) {
          await storage.createNotification({
            type: "message",
            title: "Nova mensagem da equipe",
            content: `Nova mensagem de ${req.user!.name} para a equipe`,
            userId: member.id,
            relatedId: message.id,
            relatedType: "team_message"
          });
        }
      }
      
      // Registrar pontos de gamificação pelo envio de mensagem para a equipe
      try {
        // Apenas adiciona pontos se o serviço de gamificação estiver disponível
        const { gamificationService } = await import('./gamification-service');
        await gamificationService.onMessageSent(req.user!.id);
      } catch (gamificationError) {
        console.log('Gamificação não disponível ou erro:', gamificationError);
        // Não interrompe o fluxo principal se houver erro na gamificação
      }
      
      res.status(201).json(message);
    } catch (error) {
      res.status(500).send("Server error");
    }
  });

  // Notifications
  app.get("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const notifications = await storage.getNotificationsByUser(req.user.id);
    res.json(notifications);
  });

  app.post("/api/notifications/read/:id", async (req, res) => {
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

  app.post("/api/notifications/read-all", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    await storage.markAllNotificationsAsRead(req.user.id);
    res.sendStatus(200);
  });

  // Performance
  app.get("/api/performance", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const user = req.user!;
    
    if (user?.role === "director") {
      try {
        // Visão para diretoria: resumo geral da empresa
        // 1. Total de gestores
        const managers = await storage.getUsersByRole("manager");
        
        // 2. Total de corretores
        const brokers = await storage.getUsersByRole("broker");
        
        // 3. Total de atividades
        const activities = await storage.getAllActivities();
        const activitiesCompleted = activities.filter(a => a.status === "completed");
        const activitiesPending = activities.filter(a => a.status === "pending");
        const activitiesInProgress = activities.filter(a => a.status === "in_progress");
        
        // 4. Total de negociações
        const deals = await storage.getAllDeals();
        const dealStages = {
          initialContact: deals.filter(d => d.stage === "initial_contact").length,
          visit: deals.filter(d => d.stage === "visit").length,
          proposal: deals.filter(d => d.stage === "proposal").length,
          closing: deals.filter(d => d.stage === "closing").length
        };
        
        // Resumo geral para diretoria
        const summary = {
          managersCount: managers.length,
          brokersCount: brokers.length,
          activities: {
            total: activities.length,
            completed: activitiesCompleted.length,
            pending: activitiesPending.length,
            inProgress: activitiesInProgress.length,
            completionRate: activities.length > 0 
              ? Math.round((activitiesCompleted.length / activities.length) * 100) 
              : 0
          },
          deals: {
            total: deals.length,
            stages: dealStages,
            closingRate: deals.length > 0 
              ? Math.round((dealStages.closing / deals.length) * 100) 
              : 0
          }
        };
        
        res.json(summary);
      } catch (error) {
        console.error("Erro ao obter visão da diretoria:", error);
        res.status(500).send("Server error");
      }
    } else if (user?.role === "manager") {
      // Get all brokers
      const brokers = await storage.getUsersByRole("broker");
      
      // Get current performance for each broker
      const performancePromises = brokers.map(async broker => {
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
      
      const performances = await Promise.all(performancePromises);
      res.json(performances.sort((a, b) => b.score - a.score));
    } else {
      // Get current broker performance
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

  // Teams
  app.get("/api/teams", authenticateUser, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const user = req.user!;
    let teams = [];
    
    if (user.role === "director") {
      // Diretores veem todas as equipes
      teams = Array.from((await storage.getAllTeams()).values());
    } else if (user.role === "manager") {
      // Gerentes veem apenas as equipes que gerenciam
      const team = await storage.getTeamByManager(user.id);
      if (team) teams = [team];
    } else {
      // Corretores veem apenas a equipe a que pertencem
      if (user.teamId) {
        const team = await storage.getTeam(user.teamId);
        if (team) teams = [team];
      }
    }
    
    res.json(teams);
  });
  
  app.get("/api/teams/:id", authenticateUser, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const teamId = parseInt(req.params.id);
    const team = await storage.getTeam(teamId);
    
    if (!team) {
      return res.status(404).send("Team not found");
    }
    
    const user = req.user!;
    
    // Diretores podem ver todas as equipes
    if (user.role === "director") {
      return res.json(team);
    }
    
    // Gerentes podem ver equipes que gerenciam
    if (user.role === "manager" && team.managerId === user.id) {
      return res.json(team);
    }
    
    // Corretores podem ver apenas a equipe a que pertencem
    if (user.teamId === teamId) {
      return res.json(team);
    }
    
    return res.status(403).send("Forbidden");
  });
  
  app.get("/api/teams/:id/members", authenticateUser, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const teamId = parseInt(req.params.id);
    const team = await storage.getTeam(teamId);
    
    if (!team) {
      return res.status(404).send("Team not found");
    }
    
    const user = req.user!;
    
    // Diretores podem ver membros de todas as equipes
    if (user.role === "director") {
      // Continuar
    } 
    // Gerentes podem ver membros de equipes que gerenciam
    else if (user.role === "manager" && team.managerId === user.id) {
      // Continuar
    }
    // Corretores podem ver membros apenas da equipe a que pertencem
    else if (user.teamId === teamId) {
      // Continuar
    }
    else {
      return res.status(403).send("Forbidden");
    }
    
    const members = await storage.getUsersByTeam(teamId);
    
    // Remover dados sensíveis
    const safeMembers = members.map(({ password, ...member }) => member);
    
    res.json(safeMembers);
  });

  // Users
  app.get("/api/users/brokers", authenticateUser, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    if (req.user?.role !== "manager" && req.user?.role !== "director") {
      return res.status(403).send("Only managers and directors can view all brokers");
    }
    
    let brokers;
    
    if (req.user?.role === "director") {
      // Diretores veem todos os corretores
      brokers = await storage.getUsersByRole("broker");
    } else {
      // Gerentes veem apenas os corretores de sua equipe
      brokers = await storage.getBrokersByManager(req.user!.id);
    }
    
    // Remove sensitive data like passwords
    const safeBrokers = brokers.map(({ password, ...broker }) => broker);
    
    res.json(safeBrokers);
  });
  
  app.get("/api/users/managers", authenticateUser, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    if (req.user?.role !== "broker" && req.user?.role !== "director") {
      return res.status(403).send("Only brokers and directors can view managers");
    }
    
    let managers;
    
    if (req.user?.role === "director") {
      // Diretores veem todos os gerentes
      managers = await storage.getUsersByRole("manager");
    } else {
      // Corretores veem apenas seu próprio gerente
      const brokerId = req.user!.id;
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
    
    // Remove sensitive data like passwords
    const safeManagers = managers.map(({ password, ...manager }) => manager);
    
    res.json(safeManagers);
  });

  // Nova rota para listar todos os gestores para a diretoria
  app.get("/api/users/managers-ranking", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    if (req.user?.role !== "director") {
      return res.status(403).send("Only directors can view manager rankings");
    }
    
    try {
      // Obter todos os gestores
      const managers = await storage.getUsersByRole("manager");
      
      // Para cada gestor, calcular métricas de desempenho
      const managersPerformance = await Promise.all(managers.map(async (manager) => {
        // Obter corretores sob gestão deste gerente
        const brokersUnderManager = await storage.getBrokersByManager(manager.id);
        
        // Obter atividades criadas pelo gestor
        const activities = await storage.getActivitiesByManager(manager.id);
        const completedActivities = activities.filter(a => a.status === "completed");
        
        // Obter negócios iniciados pelo gestor
        const deals = await storage.getDealsByManager(manager.id);
        const closedDeals = deals.filter(d => d.stage === "closing");
        
        // Calcular pontuação baseada em atividades completadas e negócios fechados
        const score = (completedActivities.length * 5) + (closedDeals.length * 15);
        
        // Retornar dados de desempenho do gestor
        return {
          id: manager.id,
          name: manager.name,
          avatarInitials: manager.avatarInitials,
          brokerCount: brokersUnderManager.length,
          activitiesCreated: activities.length,
          activitiesCompleted: completedActivities.length,
          dealsCreated: deals.length,
          dealsCompleted: closedDeals.length,
          score: score
        };
      }));
      
      // Ordenar gestores por pontuação
      const rankedManagers = managersPerformance.sort((a, b) => b.score - a.score);
      
      res.json(rankedManagers);
    } catch (error) {
      console.error("Erro ao obter ranking de gestores:", error);
      res.status(500).send("Server error");
    }
  });

  // Adicionar rotas de gamificação
  app.use('/api/gamification', gamificationRoutes);

  // Create HTTP server
  const httpServer = createServer(app);
  
  // Set up WebSocket
  setupWebsocket(httpServer);

  return httpServer;
}
