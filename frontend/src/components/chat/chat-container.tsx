import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Message } from "@shared/schema";
import { cn, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { Send } from "lucide-react";

interface ChatContainerProps {
  otherUser: {
    id: number;
    name: string;
  };
  currentUserId: number;
  className?: string;
}

export default function ChatContainer({ otherUser, currentUserId, className }: ChatContainerProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: messages, isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages", otherUser.id],
    queryFn: async () => {
      const res = await fetch(`/api/messages/${otherUser.id}`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", "/api/messages", {
        content,
        senderId: currentUserId,
        receiverId: otherUser.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", otherUser.id] });
      setMessage("");
    }
  });

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessageMutation.mutate(message);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={cn("bg-white rounded-lg shadow-sm p-4", className)}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-neutral-400">Chat com {otherUser.name}</h2>
        <div className="flex items-center">
          <span className="w-2 h-2 bg-secondary rounded-full mr-1"></span>
          <span className="text-xs text-neutral-300">Online</span>
        </div>
      </div>
      
      <div className="chat-container">
        <div className="chat-messages">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div 
                key={i} 
                className={`message ${i % 2 === 0 ? 'message-received' : 'message-sent'}`}
              >
                <Skeleton className={`h-16 w-full ${i % 2 === 0 ? 'bg-neutral-300' : 'bg-primary/40'}`} />
              </div>
            ))
          ) : messages && messages.length > 0 ? (
            messages.map(msg => (
              <div 
                key={msg.id} 
                className={`message ${msg.senderId === currentUserId ? 'message-sent' : 'message-received'}`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className={`text-xs ${msg.senderId === currentUserId ? 'text-white/70' : 'text-neutral-300/70'} mt-1 text-right`}>
                  {formatDateTime(msg.createdAt).split(',')[1]}
                </p>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-neutral-300 text-sm">Nenhuma mensagem ainda. Comece a conversa!</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="mt-4 flex">
          <Input 
            type="text" 
            placeholder="Digite sua mensagem..." 
            className="flex-1 border border-neutral-200 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sendMessageMutation.isPending}
          />
          <Button 
            className="bg-primary text-white px-4 py-2 rounded-r-lg"
            onClick={handleSendMessage}
            disabled={!message.trim() || sendMessageMutation.isPending}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
