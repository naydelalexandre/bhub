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
    weeklyPoints?: number;
    achievements?: {
      total: number;
      completed: number;
    };
  };
  isCurrentUser?: boolean;
  showAchievements?: boolean;
}

export const RankingItem: React.FC<RankingItemProps> = ({
  rank,
  user,
  isCurrentUser = false,
  showAchievements = false
}) => {
  // Determinar cor de destaque baseada na posição
  const rankColors = {
    1: {
      border: "border-yellow-400",
      badge: "bg-yellow-100 text-yellow-800",
      text: "text-yellow-700",
      label: "Primeiro lugar"
    },
    2: {
      border: "border-slate-400",
      badge: "bg-slate-100 text-slate-800",
      text: "text-slate-700",
      label: "Segundo lugar"
    },
    3: {
      border: "border-amber-400",
      badge: "bg-amber-100 text-amber-800",
      text: "text-amber-700",
      label: "Terceiro lugar"
    }
  };

  // Formatar as iniciais do nome
  const initials = user.avatarInitials || user.name.split(' ').map(n => n[0]).join('').substring(0, 2);
  
  // Calcular percentual de conclusão de conquistas
  const achievementPercentage = user.achievements 
    ? Math.round((user.achievements.completed / user.achievements.total) * 100) 
    : 0;

  return (
    <div 
      className={cn(
        "flex items-center p-3 rounded-lg transition-colors", 
        isCurrentUser ? "bg-blue-50" : "hover:bg-gray-50",
        rank <= 3 ? "border-l-4" : "",
        rank <= 3 ? rankColors[rank as keyof typeof rankColors]?.border : ""
      )}
    >
      {/* Posição no ranking */}
      <div 
        className={cn(
          "w-8 h-8 flex items-center justify-center rounded-full mr-3 font-semibold",
          rank === 1 ? "bg-yellow-100 text-yellow-700" :
          rank === 2 ? "bg-slate-100 text-slate-700" :
          rank === 3 ? "bg-amber-100 text-amber-700" :
          "bg-gray-100 text-gray-700"
        )}
      >
        {rank}
      </div>
      
      {/* Avatar do usuário */}
      <Avatar className="h-10 w-10 mr-3">
        <AvatarFallback className={isCurrentUser ? "bg-primary text-primary-foreground" : ""}>
          {initials}
        </AvatarFallback>
      </Avatar>
      
      {/* Informações do usuário */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center">
          <p className={cn("text-sm font-medium truncate", isCurrentUser ? "font-bold" : "")}>
            {user.name}
          </p>
          {isCurrentUser && (
            <Badge variant="outline" className="ml-2 text-xs bg-blue-50">
              Você
            </Badge>
          )}
          {rank <= 3 && (
            <Badge className={cn("ml-2 text-xs", rankColors[rank as keyof typeof rankColors]?.badge)}>
              {rankColors[rank as keyof typeof rankColors]?.label}
            </Badge>
          )}
        </div>
        
        {/* Função e nível */}
        {user.role && (
          <p className="text-xs text-gray-500 truncate">
            {user.role} {user.level && `• `}
            {user.level && (
              <span className="font-medium text-blue-600">{user.level}</span>
            )}
          </p>
        )}
        
        {/* Barra de progresso para conquistas (opcional) */}
        {showAchievements && user.achievements && (
          <div className="mt-1">
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
              <div 
                className="bg-blue-600 h-1.5 rounded-full" 
                style={{ width: `${achievementPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {user.achievements.completed} de {user.achievements.total} conquistas
            </p>
          </div>
        )}
      </div>
      
      {/* Pontuação */}
      <div className="flex flex-col items-end">
        <span className="text-sm font-bold">{user.points} pts</span>
        {user.weeklyPoints !== undefined && (
          <span className="text-xs text-gray-500">
            {user.weeklyPoints} pts esta semana
          </span>
        )}
      </div>
    </div>
  );
}; 