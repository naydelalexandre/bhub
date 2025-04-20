import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Interface para as props do componente
interface AchievementCardProps {
  achievement: {
    id: number;
    name: string;
    description: string;
    points: number;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    icon: string;
    requirements: string;
    progress?: number;
    completed?: boolean;
    completedAt?: string;
  };
  className?: string;
}

// Mapa de cores para diferentes níveis de dificuldade
const difficultyColors = {
  easy: 'bg-green-100 text-green-800 hover:bg-green-200',
  medium: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
  hard: 'bg-red-100 text-red-800 hover:bg-red-200',
};

// Componente de Conquista
export function AchievementCard({ achievement, className }: AchievementCardProps) {
  // Calcula o progresso em percentual
  const progressPercentage = achievement.progress ? Math.min(100, achievement.progress) : 0;
  
  // Formata a data de conclusão
  const formattedDate = achievement.completedAt 
    ? new Date(achievement.completedAt).toLocaleDateString('pt-BR') 
    : '';
  
  return (
    <Card className={cn('overflow-hidden transition-all hover:shadow-md', 
      achievement.completed ? 'border-green-200' : '',
      className
    )}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <span className="text-xl">{achievement.icon}</span> 
            {achievement.name}
          </CardTitle>
          <Badge 
            variant="outline" 
            className={cn(
              'font-medium', 
              difficultyColors[achievement.difficulty]
            )}
          >
            {achievement.difficulty === 'easy' && 'Fácil'}
            {achievement.difficulty === 'medium' && 'Médio'}
            {achievement.difficulty === 'hard' && 'Difícil'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {achievement.description}
        </p>
        
        {!achievement.completed && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span>Seu progresso</span>
              <span className="font-medium">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-1 flex justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Trophy className="h-4 w-4" />
          <span>{achievement.points} pontos</span>
        </div>
        
        {achievement.completed ? (
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>Conquistado {formattedDate && `em ${formattedDate}`}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Em andamento</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
} 