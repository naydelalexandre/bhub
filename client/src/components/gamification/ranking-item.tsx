import React from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Interface ampliada para suportar diferentes formatos de dados
interface RankingItemProps {
  // Compatibilidade com gamification-page
  rank?: number;
  position?: number;
  user?: {
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
  // Compatibilidade com manager-dashboard
  name?: string;
  score?: number;
  avatarUrl?: string;
  // Compatibilidade mista
  isCurrentUser?: boolean;
  showAchievements?: boolean;
}

export const RankingItem: React.FC<RankingItemProps> = ({
  rank,
  position,
  user,
  name,
  score,
  avatarUrl,
  isCurrentUser = false,
  showAchievements = false
}) => {
  // Determinar posição no ranking
  const rankPosition = rank || position || 1;
  
  // Determinar nome do usuário
  const userName = user?.name || name || "";
  
  // Determinar pontuação
  const points = user?.points || score || 0;
  
  // Determinar iniciais para avatar
  const userInitials = user?.avatarInitials || 
    (userName ? userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : "");
  
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
  
  // Calcular percentual de conclusão de conquistas
  const achievementPercentage = user?.achievements 
    ? Math.round((user.achievements.completed / user.achievements.total) * 100) 
    : 0;

  return (
    <div 
      className={cn(
        "flex items-center p-3 rounded-lg transition-colors", 
        isCurrentUser ? "bg-blue-50" : "hover:bg-gray-50",
        rankPosition <= 3 ? "border-l-4" : "",
        rankPosition <= 3 ? rankColors[rankPosition as keyof typeof rankColors]?.border : ""
      )}
    >
      {/* Posição no ranking */}
      <div 
        className={cn(
          "w-8 h-8 flex items-center justify-center rounded-full mr-3 font-semibold",
          rankPosition === 1 ? "bg-yellow-100 text-yellow-700" :
          rankPosition === 2 ? "bg-slate-100 text-slate-700" :
          rankPosition === 3 ? "bg-amber-100 text-amber-700" :
          "bg-gray-100 text-gray-700"
        )}
      >
        {rankPosition}
      </div>
      
      {/* Avatar do usuário */}
      <Avatar className="h-10 w-10 mr-3">
        {avatarUrl ? (
          <img src={avatarUrl} alt={userName} className="h-full w-full object-cover" />
        ) : (
          <AvatarFallback className={isCurrentUser ? "bg-primary text-primary-foreground" : ""}>
            {userInitials}
          </AvatarFallback>
        )}
      </Avatar>
      
      {/* Informações do usuário */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center">
          <p className={cn("text-sm font-medium truncate", isCurrentUser ? "font-bold" : "")}>
            {userName}
          </p>
          {isCurrentUser && (
            <Badge variant="outline" className="ml-2 text-xs bg-blue-50">
              Você
            </Badge>
          )}
          {rankPosition <= 3 && (
            <Badge className={cn("ml-2 text-xs", rankColors[rankPosition as keyof typeof rankColors]?.badge)}>
              {rankColors[rankPosition as keyof typeof rankColors]?.label}
            </Badge>
          )}
        </div>
        
        {/* Função e nível */}
        {(user?.role || user?.level) && (
          <p className="text-xs text-gray-500 truncate">
            {user.role} {user.level && `• `}
            {user.level && (
              <span className="font-medium text-blue-600">{user.level}</span>
            )}
          </p>
        )}
        
        {/* Barra de progresso para conquistas (opcional) */}
        {showAchievements && user?.achievements && (
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
        <span className="text-sm font-bold">{points} pts</span>
        {user?.weeklyPoints !== undefined && (
          <span className="text-xs text-gray-500">
            {user.weeklyPoints} pts esta semana
          </span>
        )}
      </div>
    </div>
  );
}; 