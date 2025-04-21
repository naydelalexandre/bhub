import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Table, 
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip
} from '@mui/material';

interface UserData {
  userId: number;
  name: string;
  avatarInitials: string;
  teamId?: number;
  totalPoints: number;
  weeklyPoints: number;
  level: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  achievements?: {
    total: number;
    completed: number;
  };
}

interface GamificationLeaderboardProps {
  title: string;
  users: UserData[];
  userType: 'broker' | 'manager';
}

const levelColors = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2',
  diamond: '#B9F2FF'
};

const GamificationLeaderboard: React.FC<GamificationLeaderboardProps> = ({ title, users, userType }) => {
  // Sort users by total points (descending)
  const sortedUsers = [...users].sort((a, b) => b.totalPoints - a.totalPoints);
  
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {title}
        </Typography>
        
        {users.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Nenhum dado disponível para exibição.
          </Typography>
        ) : (
          <TableContainer sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width={60}>Rank</TableCell>
                  <TableCell>Nome</TableCell>
                  <TableCell>Nível</TableCell>
                  <TableCell align="right">Pontos Totais</TableCell>
                  <TableCell align="right">Pontos Semanais</TableCell>
                  <TableCell align="right">Conquistas</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedUsers.map((user, index) => (
                  <TableRow 
                    key={user.userId}
                    sx={{ 
                      '&:nth-of-type(odd)': { backgroundColor: 'rgba(0, 0, 0, 0.02)' },
                      ...(index < 3 ? { backgroundColor: index === 0 ? 'rgba(255, 215, 0, 0.05)' : 
                                       index === 1 ? 'rgba(192, 192, 192, 0.05)' : 
                                                    'rgba(205, 127, 50, 0.05)' } : {})
                    }}
                  >
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        fontWeight="bold"
                        sx={{
                          color: index === 0 ? '#FFD700' : 
                                index === 1 ? '#C0C0C0' : 
                                index === 2 ? '#CD7F32' : 'inherit'
                        }}
                      >
                        {index + 1}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          sx={{ 
                            width: 32, 
                            height: 32, 
                            backgroundColor: userType === 'broker' ? '#2196f3' : '#ff9800',
                            mr: 1.5,
                            fontSize: '0.875rem'
                          }}
                        >
                          {user.avatarInitials}
                        </Avatar>
                        <Typography variant="body2">{user.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.level.charAt(0).toUpperCase() + user.level.slice(1)} 
                        size="small"
                        sx={{ 
                          backgroundColor: levelColors[user.level] + '40',
                          borderColor: levelColors[user.level],
                          color: 'text.primary',
                          fontWeight: 'medium',
                          borderWidth: 1,
                          borderStyle: 'solid'
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold">
                        {user.totalPoints}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {user.weeklyPoints}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {user.achievements ? (
                        <Typography variant="body2">
                          {user.achievements.completed}/{user.achievements.total}
                        </Typography>
                      ) : (
                        <Typography variant="body2">0/0</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        
        {users.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Total de {userType === 'broker' ? 'corretores' : 'gerentes'}: {users.length}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default GamificationLeaderboard; 