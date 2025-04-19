import React, { useMemo } from 'react';
import { Card, CardContent, Typography, Box, Divider } from '@mui/material';

interface UserData {
  userId: number;
  name: string;
  avatarInitials: string;
  teamId?: number;
  totalPoints: number;
  weeklyPoints: number;
  level: string;
  achievements?: {
    total: number;
    completed: number;
  };
}

interface RoleComparisonChartProps {
  brokers: UserData[];
  managers: UserData[];
}

const RoleComparisonChart: React.FC<RoleComparisonChartProps> = ({ brokers, managers }) => {
  // Calculate metrics
  const metrics = useMemo(() => {
    const calculateAverage = (users: UserData[], field: 'totalPoints' | 'weeklyPoints') => {
      if (!users.length) return 0;
      return Math.round(users.reduce((sum, user) => sum + user[field], 0) / users.length);
    };

    const calculateCompletionRate = (users: UserData[]) => {
      let totalAchievements = 0;
      let completedAchievements = 0;
      
      users.forEach(user => {
        if (user.achievements) {
          totalAchievements += user.achievements.total;
          completedAchievements += user.achievements.completed;
        }
      });
      
      if (totalAchievements === 0) return 0;
      return Math.round((completedAchievements / totalAchievements) * 100);
    };

    const countByLevel = (users: UserData[]) => {
      const levels = { bronze: 0, silver: 0, gold: 0, platinum: 0, diamond: 0 };
      users.forEach(user => {
        if (levels.hasOwnProperty(user.level)) {
          levels[user.level as keyof typeof levels]++;
        }
      });
      return levels;
    };

    return {
      brokers: {
        count: brokers.length,
        avgTotalPoints: calculateAverage(brokers, 'totalPoints'),
        avgWeeklyPoints: calculateAverage(brokers, 'weeklyPoints'),
        completionRate: calculateCompletionRate(brokers),
        levelDistribution: countByLevel(brokers)
      },
      managers: {
        count: managers.length,
        avgTotalPoints: calculateAverage(managers, 'totalPoints'),
        avgWeeklyPoints: calculateAverage(managers, 'weeklyPoints'),
        completionRate: calculateCompletionRate(managers),
        levelDistribution: countByLevel(managers)
      }
    };
  }, [brokers, managers]);

  // Find the maximum average total points for scaling bars
  const maxAvgPoints = Math.max(metrics.brokers.avgTotalPoints, metrics.managers.avgTotalPoints);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Comparação por Função
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Análise comparativa entre corretores e gerentes no sistema de gamificação
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          {/* Left column - Brokers */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, color: '#2196f3' }}>
              Corretores ({metrics.brokers.count})
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Média de Pontos Totais
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Box 
                  sx={{ 
                    height: 24, 
                    width: `${maxAvgPoints ? (metrics.brokers.avgTotalPoints / maxAvgPoints) * 100 : 0}%`,
                    bgcolor: '#2196f3',
                    borderRadius: 1,
                    minWidth: '10px',
                    transition: 'width 1s ease-in-out'
                  }} 
                />
                <Typography variant="body1" fontWeight="bold" sx={{ ml: 2 }}>
                  {metrics.brokers.avgTotalPoints}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Média de Pontos Semanais
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="#2196f3">
                {metrics.brokers.avgWeeklyPoints}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Taxa de Conclusão de Conquistas
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="#2196f3">
                {metrics.brokers.completionRate}%
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Distribuição por Níveis
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {Object.entries(metrics.brokers.levelDistribution).map(([level, count]) => (
                  <Box 
                    key={level}
                    sx={{ 
                      px: 1.5, 
                      py: 0.5, 
                      borderRadius: 1, 
                      bgcolor: 'rgba(33, 150, 243, 0.1)',
                      border: '1px solid rgba(33, 150, 243, 0.3)',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                      {level}:
                    </Typography>
                    <Typography variant="caption" fontWeight="bold" sx={{ ml: 0.5 }}>
                      {count}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />
          <Divider sx={{ display: { xs: 'block', md: 'none' }, my: 2 }} />

          {/* Right column - Managers */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, color: '#ff9800' }}>
              Gerentes ({metrics.managers.count})
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Média de Pontos Totais
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Box 
                  sx={{ 
                    height: 24, 
                    width: `${maxAvgPoints ? (metrics.managers.avgTotalPoints / maxAvgPoints) * 100 : 0}%`,
                    bgcolor: '#ff9800',
                    borderRadius: 1,
                    minWidth: '10px',
                    transition: 'width 1s ease-in-out'
                  }} 
                />
                <Typography variant="body1" fontWeight="bold" sx={{ ml: 2 }}>
                  {metrics.managers.avgTotalPoints}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Média de Pontos Semanais
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="#ff9800">
                {metrics.managers.avgWeeklyPoints}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Taxa de Conclusão de Conquistas
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="#ff9800">
                {metrics.managers.completionRate}%
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Distribuição por Níveis
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {Object.entries(metrics.managers.levelDistribution).map(([level, count]) => (
                  <Box 
                    key={level}
                    sx={{ 
                      px: 1.5, 
                      py: 0.5, 
                      borderRadius: 1, 
                      bgcolor: 'rgba(255, 152, 0, 0.1)',
                      border: '1px solid rgba(255, 152, 0, 0.3)',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                      {level}:
                    </Typography>
                    <Typography variant="caption" fontWeight="bold" sx={{ ml: 0.5 }}>
                      {count}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RoleComparisonChart; 