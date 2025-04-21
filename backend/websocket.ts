import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { storage } from "./storage";

interface ConnectedClient {
  userId: number;
  ws: WebSocket;
}

export function setupWebsocket(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });
  
  const clients: ConnectedClient[] = [];

  wss.on('connection', (ws, req) => {
    console.log('WebSocket connection established');
    
    // Extract userId from URL query parameter
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const userId = Number(url.searchParams.get('userId'));

    if (!userId || isNaN(userId)) {
      ws.close(1008, 'Invalid user ID');
      return;
    }

    // Add to clients array
    clients.push({ userId, ws });

    // Send existing notifications to the client on connection
    storage.getNotificationsByUser(userId)
      .then(notifications => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'init',
            data: { notifications }
          }));
        }
      })
      .catch(error => console.error('Error fetching notifications:', error));

    // Handle messages from clients
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'read-notification') {
          await storage.markNotificationAsRead(data.id);
          // Broadcast notification update
          broadcastToUser(userId, {
            type: 'notification-read',
            data: { id: data.id }
          });
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });

    // Handle client disconnection
    ws.on('close', () => {
      const index = clients.findIndex(client => client.ws === ws);
      if (index !== -1) {
        clients.splice(index, 1);
      }
      console.log('WebSocket connection closed');
    });
  });

  // Helper function to broadcast to a specific user
  function broadcastToUser(userId: number, data: any) {
    clients
      .filter(client => client.userId === userId && client.ws.readyState === WebSocket.OPEN)
      .forEach(client => {
        client.ws.send(JSON.stringify(data));
      });
  }

  // Helper function to broadcast to all users
  function broadcastToAll(data: any) {
    clients
      .filter(client => client.ws.readyState === WebSocket.OPEN)
      .forEach(client => {
        client.ws.send(JSON.stringify(data));
      });
  }

  // Export these functions so they can be called from other modules
  return {
    broadcastToUser,
    broadcastToAll
  };
}
