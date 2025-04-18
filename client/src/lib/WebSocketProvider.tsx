import { createContext, useContext, ReactNode, useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from './queryClient';

// Define the shape of our context
type WebSocketContextType = {
  isConnected: boolean;
  sendMessage: (data: any) => void;
};

// Create the context
const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
  sendMessage: () => console.warn('WebSocket not initialized')
});

interface WebSocketProviderProps {
  children: ReactNode;
  userId: number;
}

// Create a provider component
export function WebSocketProvider({ children, userId }: WebSocketProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();
  
  // Establish WebSocket connection
  useEffect(() => {
    // Create WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws?userId=${userId}`;
    
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;
    
    socket.onopen = () => {
      console.log('WebSocket connection established');
      setIsConnected(true);
    };
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        
        // Handle different message types
        if (data.type === 'notification') {
          toast({
            title: data.title || data.data?.title,
            description: data.content || data.data?.content,
          });
        } else if (data.type === 'init') {
          console.log('Received initial data:', data.data);
          // Handle initial data - could update local state with latest notifications
        } else if (data.type === 'notification-read') {
          console.log('Notification marked as read:', data.data?.id);
          // Invalidate notifications query to refresh the UI
          queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
          
          // Also invalidate related entity data if available
          if (data.relatedType === 'activity') {
            queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
          } else if (data.relatedType === 'deal') {
            queryClient.invalidateQueries({ queryKey: ['/api/deals'] });
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };
    
    socket.onclose = () => {
      console.log('WebSocket connection closed');
      setIsConnected(false);
    };
    
    // Clean up the WebSocket connection when the component unmounts
    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [userId, toast]);
  
  // Send message function
  const sendMessage = useCallback((data: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        ...data,
        userId: userId
      }));
    } else {
      console.warn('WebSocket not connected, message not sent', data);
    }
  }, [userId]);
  
  const contextValue = {
    isConnected,
    sendMessage
  };
  
  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
}

// Hook to use the WebSocket context
export function useWebSocket() {
  return useContext(WebSocketContext);
}