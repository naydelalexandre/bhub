import React from 'react';
import { Card, CardContent, Typography, Box, LinearProgress } from '@mui/material';

interface GamificationStatsCardProps {
  title: string;
  stats: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
    diamond: number;
  };
  levels: string[];
}

const levelColors = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2',
  diamond: '#B9F2FF'
};

const GamificationStatsCard: React.FC<GamificationStatsCardProps> = ({ title, stats, levels }) => {
  // Calculate total count for percentages
  const total = Object.values(stats).reduce((sum, count) => sum + count, 0);

  // Format level name with first letter capitalized
  const formatLevelName = (level: string) => {
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {title}
        </Typography>
        
        {levels.map(level => {
          const count = stats[level as keyof typeof stats] || 0;
          const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
          
          return (
            <Box key={level} sx={{ mt: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box 
                    component="span" 
                    sx={{ 
                      display: 'inline-block', 
                      width: 12, 
                      height: 12, 
                      borderRadius: '50%', 
                      backgroundColor: levelColors[level as keyof typeof levelColors] || '#ccc',
                      mr: 1 
                    }} 
                  />
                  {formatLevelName(level)}
                </Typography>
                <Typography variant="body2">
                  {count} ({percentage}%)
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={percentage} 
                sx={{ 
                  height: 8, 
                  borderRadius: 1,
                  backgroundColor: 'rgba(0,0,0,0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: levelColors[level as keyof typeof levelColors] || '#ccc'
                  }
                }} 
              />
            </Box>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default GamificationStatsCard; 