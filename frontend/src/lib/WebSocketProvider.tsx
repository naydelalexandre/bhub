import React, { createContext, useContext, useEffect, useState } from 'react';

// Define o tipo para os dados do contexto
type WebSocketContextType = {
  sendMessage: (message: any) => void;
  lastMessage: any;
  isConnected: boolean;
};

// Cria o contexto com valores padrão
const WebSocketContext = createContext<WebSocketContextType>({
  sendMessage: () => {},
  lastMessage: null,
  isConnected: false,
});

// Props para o provedor
interface WebSocketProviderProps {
  children: React.ReactNode;
  userId: string | number;
}

// Componente provedor que encapsula a lógica do WebSocket
export function WebSocketProvider({ children, userId }: WebSocketProviderProps) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Função para enviar mensagens
  const sendMessage = (message: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      console.error('Socket não está conectado');
    }
  };

  // Conecta ao WebSocket quando o componente monta
  useEffect(() => {
    // No desenvolvimento, usa localhost, em produção usa o mesmo host da aplicação
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.NODE_ENV === 'production' 
      ? window.location.host
      : 'localhost:3001';
    
    const wsUrl = `${protocol}//${host}/ws?userId=${userId}`;
    const newSocket = new WebSocket(wsUrl);

    // Manipuladores de eventos para o WebSocket
    const onOpen = () => {
      console.log('WebSocket conectado');
      setIsConnected(true);
      
      // Envia uma mensagem de ping a cada 30 segundos para manter a conexão viva
      const interval = setInterval(() => {
        if (newSocket.readyState === WebSocket.OPEN) {
          newSocket.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000);

      // Limpa o intervalo quando o componente for desmontado
      return () => clearInterval(interval);
    };

    const onMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
        
        // Processar diferentes tipos de mensagens aqui
        if (data.type === 'notification') {
          // Mostrar notificação
          console.log('Nova notificação:', data.message);
        } else if (data.type === 'update') {
          // Atualizar dados
          console.log('Atualização recebida:', data);
        }
      } catch (error) {
        console.error('Erro ao processar mensagem do WebSocket:', error);
      }
    };

    const onClose = () => {
      console.log('WebSocket desconectado');
      setIsConnected(false);
      
      // Tenta reconectar após 5 segundos
      setTimeout(() => {
        setSocket(null);
      }, 5000);
    };

    const onError = (error: Event) => {
      console.error('Erro no WebSocket:', error);
      newSocket.close();
    };

    // Registra os manipuladores de eventos
    newSocket.addEventListener('open', onOpen);
    newSocket.addEventListener('message', onMessage);
    newSocket.addEventListener('close', onClose);
    newSocket.addEventListener('error', onError);

    // Atualiza o estado
    setSocket(newSocket);

    // Limpa quando o componente for desmontado
    return () => {
      if (newSocket) {
        newSocket.close();
        newSocket.removeEventListener('open', onOpen);
        newSocket.removeEventListener('message', onMessage);
        newSocket.removeEventListener('close', onClose);
        newSocket.removeEventListener('error', onError);
      }
    };
  }, [userId]);

  // Valor do contexto a ser fornecido
  const contextValue: WebSocketContextType = {
    sendMessage,
    lastMessage,
    isConnected,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
}

// Hook personalizado para usar o contexto
export function useWebSocket() {
  return useContext(WebSocketContext);
}