import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { setupWebsocket } from "./websocket";
import { z } from "zod";
import { insertActivitySchema, insertDealSchema, insertMessageSchema, insertNotificationSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  // API routes
  // Activities
  app.get("/api/activities", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const user = req.user;
    let activities;
    
    if (user.role === "manager") {
      activities = await storage.getActivitiesByManager(user.id);
    } else {
      activities = await storage.getActivitiesByUser(user.id);
    }
    
    res.json(activities);
  });

  app.get("/api/activities/:id", async (req, res) => {
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
    
    res.json(activity);
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
    
    const user = req.user;
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
      
      res.json(updatedActivity);
    } catch (error) {
      res.status(500).send("Server error");
    }
  });

  // Deals
  app.get("/api/deals", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const user = req.user;
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
    
    const user = req.user;
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
    
    const user = req.user;
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
      
      res.json(updatedDeal);
    } catch (error) {
      res.status(500).send("Server error");
    }
  });

  // Messages
  app.get("/api/messages/:userId", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const currentUserId = req.user.id;
    const otherUserId = parseInt(req.params.userId);
    
    const messages = await storage.getMessagesBetweenUsers(currentUserId, otherUserId);
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
    
    const user = req.user;
    
    if (user.role === "manager") {
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

  // Create HTTP server
  const httpServer = createServer(app);
  
  // Set up WebSocket
  setupWebsocket(httpServer);

  return httpServer;
}
