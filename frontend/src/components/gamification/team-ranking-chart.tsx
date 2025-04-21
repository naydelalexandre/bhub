import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

interface TeamData {
  teamId: number;
  teamName: string;
  totalPoints: number;
  members: number;
  averagePoints: number;
  topPerformer: {
    name: string;
    totalPoints: number;
  } | null;
}

interface TeamRankingChartProps {
  teams: TeamData[];
}

const TeamRankingChart: React.FC<TeamRankingChartProps> = ({ teams }) => {
  if (!teams || teams.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Comparação de Equipes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Nenhuma equipe encontrada para visualizar
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Sort teams by total points in descending order
  const sortedTeams = [...teams].sort((a, b) => b.totalPoints - a.totalPoints);
  
  // Find the highest score to normalize the chart bars
  const maxPoints = Math.max(...sortedTeams.map(team => team.totalPoints));
  
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Comparação de Equipes
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Desempenho comparativo entre equipes baseado em pontos totais
        </Typography>
        
        {sortedTeams.map((team, index) => {
          const barWidth = maxPoints > 0 ? (team.totalPoints / maxPoints) * 100 : 0;
          
          return (
            <Box key={team.teamId} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" fontWeight="medium">
                  {index + 1}. {team.teamName}
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {team.totalPoints} pts
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box 
                  sx={{ 
                    height: 20, 
                    width: `${barWidth}%`,
                    bgcolor: index === 0 ? '#4caf50' : index === 1 ? '#2196f3' : '#9e9e9e',
                    borderRadius: 1,
                    transition: 'width 1s ease-in-out',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      bottom: 0,
                      width: '10px',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3))',
                      borderTopRightRadius: 4,
                      borderBottomRightRadius: 4
                    }
                  }} 
                />
                <Typography variant="caption" sx={{ ml: 1, minWidth: 80 }}>
                  {team.members} membros
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Média: {team.averagePoints} pts/membro • Top: {team.topPerformer?.name || 'N/A'}
              </Typography>
            </Box>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default TeamRankingChart; 