import React from 'react';
import { RankingItem as GamificationRankingItem } from "@/components/gamification/ranking-item";

interface RankingItemProps {
  position: number;
  name: string;
  score: number;
  avatarUrl?: string;
  isCurrentUser?: boolean;
}

/**
 * RankingItem para o Dashboard
 * Este componente é um wrapper para manter compatibilidade com implementações existentes,
 * mas internamente usa o componente RankingItem da gamificação.
 */
export const RankingItem: React.FC<RankingItemProps> = ({
  position,
  name,
  score,
  avatarUrl,
  isCurrentUser = false
}) => {
  return (
    <GamificationRankingItem
      position={position}
      name={name}
      score={score}
      avatarUrl={avatarUrl}
      isCurrentUser={isCurrentUser}
    />
  );
}; 