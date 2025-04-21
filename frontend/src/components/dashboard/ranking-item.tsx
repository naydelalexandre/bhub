import React from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RankingItemProps {
  rank: number;
  user: {
    id: number;
    name: string;
    avatarInitials?: string;
    role?: string;
    level?: string;
    points: number;
  };
  isCurrentUser?: boolean;
}

export const RankingItem: React.FC<RankingItemProps> = ({
  rank,
  user,
  isCurrentUser = false
}) => {
  // Cores dos rankings por posição
  const rankColors = {
    1: "bg-yellow-100 text-yellow-700 border-yellow-300",
    2: "bg-slate-100 text-slate-700 border-slate-300",
    3: "bg-amber-100 text-amber-700 border-amber-300"
  };

  // Iniciais para o avatar (se não fornecidas)
  const initials = user.avatarInitials || user.name.split(' ').map(n => n[0]).join('').substring(0, 2);

  return (
    <div 
      className={cn(
        "flex items-center p-2 rounded-lg", 
        isCurrentUser ? "bg-blue-50" : "",
        rank <= 3 ? "border-l-4" : "",
        rank === 1 ? "border-yellow-400" : rank === 2 ? "border-slate-400" : rank === 3 ? "border-amber-400" : ""
      )}
    >
      <div 
        className={cn(
          "w-8 h-8 flex items-center justify-center rounded-full mr-3 font-semibold",
          rankColors[rank as keyof typeof rankColors] || "bg-gray-100 text-gray-700"
        )}
      >
        {rank}
      </div>
      
      <Avatar className="h-9 w-9 mr-3">
        <AvatarFallback className={isCurrentUser ? "bg-primary text-primary-foreground" : ""}>
          {initials}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium truncate", isCurrentUser ? "font-bold" : "")}>
          {user.name}
        </p>
        {user.role && (
          <p className="text-xs text-gray-500 truncate">
            {user.role} {user.level && `• `}
            {user.level && (
              <span className="font-medium text-blue-600">{user.level}</span>
            )}
          </p>
        )}
      </div>
      
      <div className="flex flex-col items-end">
        <span className="text-sm font-bold">{user.points} pts</span>
        {isCurrentUser && (
          <Badge variant="outline" className="text-xs bg-blue-50">
            Você
          </Badge>
        )}
      </div>
    </div>
  );
}; 