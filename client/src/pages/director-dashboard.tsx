import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Typography, Card, CardContent, Tabs, Tab, Button, Divider } from '@mui/material';
import { styled } from '@mui/system';
import { useLocation } from "wouter";
import DashboardHeader from '../components/layouts/dashboard-header';
import StatCard from '../components/dashboard/stat-card';
import ActivitiesCard from '../components/dashboard/activities-card';
import PerformanceChart from '../components/dashboard/performance-chart';
import PerformanceCard from '../components/dashboard/performance-card';
import NotificationsCard from '../components/dashboard/notifications-card';
import { useAuth } from '../hooks/use-auth';
import TeamRankingChart from '../components/gamification/team-ranking-chart';
import GamificationStatsCard from '../components/gamification/gamification-stats-card';
import RoleComparisonChart from '../components/gamification/role-comparison-chart';
import GamificationLeaderboard from '../components/gamification/gamification-leaderboard';

const StyledTab = styled(Tab)({
  textTransform: 'none',
  minWidth: 72,
  fontWeight: 600,
  '&.Mui-selected': {
    color: '#1976d2',
  },
});

const TabPanel = (props: { children: React.ReactNode; value: number; index: number }) => {
  const { children, value, index } = props;
  return (
    <div role="tabpanel" hidden={value !== index} style={{ marginTop: '20px' }}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

export default function DirectorDashboard() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [companyStats, setCompanyStats] = useState<any>(null);
  const [teamRanking, setTeamRanking] = useState<any[]>([]);
  const [brokerRanking, setBrokerRanking] = useState<any[]>([]);
  const [managerRanking, setManagerRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'director')) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    const fetchGamificationData = async () => {
      try {
        const [companyResponse, brokerResponse, managerResponse] = await Promise.all([
          fetch('/api/gamification/company-summary'),
          fetch('/api/gamification/role-ranking?role=broker'),
          fetch('/api/gamification/role-ranking?role=manager')
        ]);

        if (companyResponse.ok && brokerResponse.ok && managerResponse.ok) {
          const companyData = await companyResponse.json();
          const brokerData = await brokerResponse.json();
          const managerData = await managerResponse.json();

          setCompanyStats(companyData);
          setBrokerRanking(brokerData);
          setManagerRanking(managerData);

          // Create team aggregated data from broker data
          const teamMap = new Map();
          brokerData.forEach((broker: any) => {
            if (broker.teamId) {
              if (!teamMap.has(broker.teamId)) {
                teamMap.set(broker.teamId, {
                  teamId: broker.teamId,
                  teamName: `Team ${broker.teamId}`, // This would ideally come from a team API
                  totalPoints: 0,
                  members: 0,
                  averagePoints: 0,
                  topPerformer: null
                });
              }

              const team = teamMap.get(broker.teamId);
              team.totalPoints += broker.totalPoints;
              team.members += 1;
              
              if (!team.topPerformer || broker.totalPoints > team.topPerformer.totalPoints) {
                team.topPerformer = {
                  name: broker.name,
                  totalPoints: broker.totalPoints
                };
              }
            }
          });

          // Calculate averages and prepare for display
          const teamRankingData = Array.from(teamMap.values()).map(team => ({
            ...team,
            averagePoints: Math.round(team.totalPoints / team.members)
          })).sort((a, b) => b.totalPoints - a.totalPoints);

          setTeamRanking(teamRankingData);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching gamification data:', error);
        setLoading(false);
      }
    };

    fetchGamificationData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (isLoading || !user || loading) {
    return <div>Loading...</div>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <DashboardHeader />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Visão da Diretoria: Gamificação
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Acompanhe o desempenho global e por equipe no sistema de gamificação
          </Typography>
        </Box>

        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="scrollable" 
          scrollButtons="auto"
        >
          <StyledTab label="Visão Geral" />
          <StyledTab label="Comparação de Equipes" />
          <StyledTab label="Ranking de Corretores" />
          <StyledTab label="Ranking de Gerentes" />
        </Tabs>

        {/* Visão Geral */}
        <TabPanel value={activeTab} index={0}>
          {companyStats && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6} lg={3}>
                <StatCard 
                  title="Total de Usuários"
                  value={companyStats.totalUsers}
                  icon="people"
                  color="#2196f3"
                />
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <StatCard 
                  title="Pontos Semanais"
                  value={companyStats.points.weeklyTotal}
                  icon="star"
                  color="#ff9800"
                />
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <StatCard 
                  title="Média de Pontos"
                  value={companyStats.points.average}
                  icon="equalizer"
                  color="#4caf50"
                />
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <StatCard 
                  title="Taxa de Conquistas"
                  value={`${companyStats.achievements.completionRate}%`}
                  icon="emoji_events"
                  color="#e91e63"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <GamificationStatsCard 
                  title="Distribuição por Nível"
                  stats={companyStats.levelDistribution}
                  levels={["bronze", "silver", "gold", "platinum", "diamond"]}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Estatísticas de Conquistas
                    </Typography>
                    <Box sx={{ mt: 2, mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Total de Conquistas
                      </Typography>
                      <Typography variant="h5">
                        {companyStats.achievements.total}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ mt: 2, mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Conquistas Completadas
                      </Typography>
                      <Typography variant="h5">
                        {companyStats.achievements.completed}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Taxa de Conclusão
                      </Typography>
                      <Typography variant="h5">
                        {companyStats.achievements.completionRate}%
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <RoleComparisonChart 
                  brokers={brokerRanking}
                  managers={managerRanking}
                />
              </Grid>
            </Grid>
          )}
        </TabPanel>

        {/* Comparação de Equipes */}
        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TeamRankingChart teams={teamRanking} />
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Ranking de Equipes
                  </Typography>
                  <Box sx={{ overflowX: 'auto' }}>
                    <Box sx={{ minWidth: 650, mt: 2 }}>
                      <Box sx={{ display: 'flex', fontWeight: 'bold', borderBottom: '1px solid rgba(224, 224, 224, 1)', p: 1 }}>
                        <Box sx={{ flex: '0 0 60px' }}>Rank</Box>
                        <Box sx={{ flex: '1 1 auto' }}>Equipe</Box>
                        <Box sx={{ flex: '0 0 120px' }}>Pontos Totais</Box>
                        <Box sx={{ flex: '0 0 120px' }}>Média/Membro</Box>
                        <Box sx={{ flex: '0 0 180px' }}>Top Performer</Box>
                      </Box>
                      {teamRanking.map((team, index) => (
                        <Box key={team.teamId} sx={{ display: 'flex', borderBottom: '1px solid rgba(224, 224, 224, 0.5)', p: 1 }}>
                          <Box sx={{ flex: '0 0 60px' }}>{index + 1}</Box>
                          <Box sx={{ flex: '1 1 auto' }}>{team.teamName}</Box>
                          <Box sx={{ flex: '0 0 120px' }}>{team.totalPoints}</Box>
                          <Box sx={{ flex: '0 0 120px' }}>{team.averagePoints}</Box>
                          <Box sx={{ flex: '0 0 180px' }}>{team.topPerformer?.name} ({team.topPerformer?.totalPoints})</Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <Button variant="outlined" color="primary">
                    Ver Detalhes Completos
                  </Button>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Ranking de Corretores */}
        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <GamificationLeaderboard 
                title="Ranking de Corretores"
                users={brokerRanking}
                userType="broker"
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Ranking de Gerentes */}
        <TabPanel value={activeTab} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <GamificationLeaderboard 
                title="Ranking de Gerentes"
                users={managerRanking}
                userType="manager"
              />
            </Grid>
          </Grid>
        </TabPanel>
      </Container>
    </Box>
  );
} 