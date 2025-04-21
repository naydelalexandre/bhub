import React, { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Definindo tipos para os dados de gamificação
interface GamificationProfile {
  id: number;
  userId: number;
  level: string;
  totalPoints: number;
  weeklyPoints: number;
  streak: number;
  lastActive?: string;
  achievements: Array<{ achievementId: number; progress: number; completed: boolean; completedAt?: string }>;
  createdAt: string;
  updatedAt: string;
}

interface LevelProgress {
  level: string;
  nextLevel?: string;
  currentPoints: number;
  pointsForNextLevel: number;
  progress: number;
}

interface GamificationProfileResponse {
  profile: GamificationProfile;
  levelProgress: LevelProgress;
}

// Tipo para conquistas
interface Achievement {
  id: number;
  name: string;
  description: string;
  points: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  icon: string;
  requirements: string;
  createdAt: string;
  updatedAt: string;
  progress?: number;
  completed?: boolean;
  completedAt?: string;
}

// Tipo para entrada no ranking
interface RankingEntry {
  userId: number;
  name: string;
  avatarInitials: string;
  level: string;
  totalPoints: number;
  weeklyPoints: number;
  position: number;
  teamId?: number;
}

// Tipo para entrada no histórico de pontos
interface PointsHistoryEntry {
  id: number;
  userId: number;
  points: number;
  reason: string;
  sourceId?: number;
  sourceType?: string;
  createdAt: string;
}

// Tipo do contexto
interface GamificationContextType {
  profile: GamificationProfileResponse | null;
  achievements: Achievement[];
  weeklyRanking: RankingEntry[];
  pointsHistory: PointsHistoryEntry[];
  isLoadingProfile: boolean;
  isLoadingAchievements: boolean;
  isLoadingRanking: boolean;
  isLoadingHistory: boolean;
  error: string | null;
  refetchAll: () => Promise<void>;
}

// Criando o contexto
const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

// Provider do contexto
export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Query para o perfil de gamificação
  const { 
    data: profile, 
    isLoading: isLoadingProfile,
    error: profileError,
    refetch: refetchProfile
  } = useQuery<GamificationProfileResponse>({
    queryKey: ['/api/gamification/profile'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/gamification/profile');
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
  
  // Query para as conquistas
  const { 
    data: achievements = [], 
    isLoading: isLoadingAchievements,
    error: achievementsError,
    refetch: refetchAchievements
  } = useQuery<Achievement[]>({
    queryKey: ['/api/gamification/achievements'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/gamification/achievements');
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
  
  // Query para o ranking semanal
  const { 
    data: weeklyRanking = [], 
    isLoading: isLoadingRanking,
    error: rankingError,
    refetch: refetchRanking
  } = useQuery<RankingEntry[]>({
    queryKey: ['/api/gamification/weekly-ranking'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/gamification/weekly-ranking');
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
  
  // Query para o histórico de pontos
  const { 
    data: pointsHistory = [], 
    isLoading: isLoadingHistory,
    error: historyError,
    refetch: refetchHistory
  } = useQuery<PointsHistoryEntry[]>({
    queryKey: ['/api/gamification/points-history'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/gamification/points-history');
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
  
  // Função para atualizar todos os dados
  const refetchAll = async () => {
    await Promise.all([
      refetchProfile(),
      refetchAchievements(),
      refetchRanking(),
      refetchHistory()
    ]);
  };
  
  // Tratamento de erros
  const error = profileError || achievementsError || rankingError || historyError 
    ? 'Erro ao carregar dados de gamificação. Por favor, tente novamente.'
    : null;
  
  // Valor do contexto (corrigido para lidar com undefined -> null)
  const value: GamificationContextType = {
    profile: profile || null,
    achievements,
    weeklyRanking,
    pointsHistory,
    isLoadingProfile,
    isLoadingAchievements,
    isLoadingRanking,
    isLoadingHistory,
    error,
    refetchAll
  };
  
  return <GamificationContext.Provider value={value}>{children}</GamificationContext.Provider>;
};

// Hook personalizado para usar o contexto
export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification deve ser usado dentro de um GamificationProvider');
  }
  return context;
}; 