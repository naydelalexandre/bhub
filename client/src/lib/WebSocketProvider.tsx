import React, { createContext, useContext, ReactNode } from 'react';

// Define the shape of our context
type WebSocketContextType = {
  isConnected: boolean;
  sendMessage: (data: any) => void;
};

// Create the context
const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
  sendMessage: () => console.log('WebSocket not initialized')
});

// Create a provider component
export function WebSocketProvider({ children }: { children: ReactNode }) {
  // For now, we're just providing a dummy implementation
  const contextValue = {
    isConnected: false,
    sendMessage: (data: any) => {
      console.log('WebSocket not connected', data);
    }
  };

  return React.createElement(
    WebSocketContext.Provider,
    { value: contextValue },
    children
  );
}

// Hook to use the WebSocket context
export function useWebSocket() {
  return useContext(WebSocketContext);
}