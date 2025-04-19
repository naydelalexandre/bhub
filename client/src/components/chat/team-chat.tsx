import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Message, User } from "@shared/schema";
import { cn, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { Send, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TeamChatProps {
  currentUser: User;
  className?: string;
}

export default function TeamChat({ currentUser, className }: TeamChatProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch team members (brokers if current user is manager)
  const { data: teamMembers, isLoading: isTeamLoading } = useQuery<User[]>({
    queryKey: ["/api/users/brokers"],
    queryFn: async () => {
      const res = await fetch("/api/users/brokers");
      if (!res.ok) throw new Error("Failed to fetch team members");
      return res.json();
    },
    enabled: currentUser.role === "manager"
  });

  // Fetch team messages
  const { data: messages, isLoading: isMessagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages/team"],
    queryFn: async () => {
      const res = await fetch("/api/messages/team");
      if (!res.ok) throw new Error("Failed to fetch team messages");
      return res.json();
    }
  });

  const sendTeamMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", "/api/messages/team", {
        content,
        senderId: currentUser.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages/team"] });
      setMessage("");
    }
  });

  const handleSendMessage = () => {
    if (message.trim()) {
      sendTeamMessageMutation.mutate(message);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Get user name by ID
  const getUserById = (userId: number) => {
    if (userId === currentUser.id) return currentUser;
    return teamMembers?.find(user => user.id === userId);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={cn("bg-white rounded-lg shadow-sm h-full flex flex-col", className)}>
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center">
          <div className="bg-primary/10 p-2 rounded-full mr-3">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-neutral-700">Chat da Equipe</h2>
        </div>
        <div className="flex -space-x-2">
          {isTeamLoading ? (
            <Skeleton className="h-8 w-8 rounded-full" />
          ) : (
            teamMembers?.slice(0, 3).map(member => (
              <Avatar key={member.id} className="border-2 border-white">
                <AvatarFallback className="bg-primary/20 text-primary">
                  {member.avatarInitials}
                </AvatarFallback>
              </Avatar>
            ))
          )}
          {teamMembers && teamMembers.length > 3 && (
            <div className="h-8 w-8 rounded-full bg-neutral-200 flex items-center justify-center text-xs text-neutral-600 border-2 border-white">
              +{teamMembers.length - 3}
            </div>
          )}
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {isMessagesLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="flex items-start gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-16 w-full max-w-[80%] rounded-lg" />
              </div>
            ))
          ) : messages && messages.length > 0 ? (
            messages.map(msg => {
              const sender = getUserById(msg.senderId);
              const isCurrentUser = msg.senderId === currentUser.id;
              
              return (
                <div 
                  key={msg.id} 
                  className={`flex items-start gap-2 ${isCurrentUser ? 'justify-end' : ''}`}
                >
                  {!isCurrentUser && (
                    <Avatar>
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {sender?.avatarInitials || '??'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={cn(
                    "max-w-[80%] rounded-lg p-3",
                    isCurrentUser 
                      ? "bg-primary text-white rounded-tr-none" 
                      : "bg-neutral-100 text-neutral-800 rounded-tl-none"
                  )}>
                    {!isCurrentUser && (
                      <p className="font-semibold text-sm mb-1">{sender?.name || 'Usuário'}</p>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p className={cn(
                      "text-xs mt-1 text-right",
                      isCurrentUser ? "text-white/70" : "text-neutral-500"
                    )}>
                      {formatDateTime(msg.createdAt).split(',')[1]}
                    </p>
                  </div>
                  
                  {isCurrentUser && (
                    <Avatar>
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {currentUser.avatarInitials}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })
          ) : (
            <div className="flex items-center justify-center h-32">
              <p className="text-neutral-400 text-sm">Nenhuma mensagem ainda. Inicie a conversa com sua equipe!</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t">
        <div className="flex">
          <Input 
            type="text" 
            placeholder="Digite sua mensagem para a equipe..." 
            className="flex-1 border border-neutral-200 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sendTeamMessageMutation.isPending}
          />
          <Button 
            className="bg-primary text-white px-4 py-2 rounded-r-lg"
            onClick={handleSendMessage}
            disabled={!message.trim() || sendTeamMessageMutation.isPending}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
} 