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
import { WebSocketProvider } from '../contexts/WebSocketContext';
import { Link } from 'react-router-dom';
import { Icon } from '@mui/material';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import MobileNavigation from '../components/MobileNavigation';

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
    <WebSocketProvider userId={user.id}>
      <div className="min-h-screen bg-neutral-50">
        <DashboardHeader 
          title="Painel do Diretor" 
          user={{
            name: user.name,
            initials: user.avatarInitials || "BD",
            role: "director"
          }}
          notificationCount={notifications?.filter(n => !n.read).length || 0}
        />
        
        <main className="container mx-auto px-4 py-6">
          {/* Cards de Métricas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatCard 
              title="Imóveis Negociados"
              value={companyMetrics?.propertiesSold || 0}
              suffix={companyMetrics?.propertiesSoldTrend > 0 ? ' ↑' : (companyMetrics?.propertiesSoldTrend < 0 ? ' ↓' : '')}
              icon="real_estate_agent"
              iconColor="text-primary"
              progress={{ 
                current: companyMetrics?.propertiesSold || 0, 
                total: companyMetrics?.propertiesTarget || 1,
                color: "bg-primary"
              }}
              isLoading={isCompanyMetricsLoading}
            />
            
            <StatCard 
              title="Faturamento"
              value={formatCurrency(companyMetrics?.revenue || 0)}
              suffix={companyMetrics?.revenueTrend > 0 ? ' ↑' : (companyMetrics?.revenueTrend < 0 ? ' ↓' : '')}
              icon="attach_money"
              iconColor="text-accent"
              progress={{ 
                current: companyMetrics?.revenue || 0, 
                total: companyMetrics?.revenueTarget || 1,
                color: "bg-accent"
              }}
              isLoading={isCompanyMetricsLoading}
            />
            
            <StatCard 
              title="Desempenho Geral"
              value={companyMetrics?.overallPerformance || 0}
              suffix="/100"
              icon="leaderboard"
              iconColor="text-secondary"
              progress={{ 
                current: companyMetrics?.overallPerformance || 0, 
                total: 100,
                color: "bg-secondary"
              }}
              isLoading={isCompanyMetricsLoading}
            />
          </div>
          
          {/* Desempenho por Filial */}
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Desempenho por Filial</CardTitle>
              </CardHeader>
              <CardContent>
                {isBranchPerformanceLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Spinner size="lg" />
                  </div>
                ) : (
                  <div className="h-64">
                    <BranchPerformanceChart data={branchPerformance || []} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* Melhores Filiais */}
              <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Melhores Filiais</CardTitle>
                  <Button variant="text" size="sm" as={Link} to="/branches">
                    Ver todas <Icon name="arrow_forward" className="ml-1" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {isTopBranchesLoading ? (
                    <div className="flex justify-center my-8">
                      <Spinner />
                    </div>
                  ) : topBranches && topBranches.length > 0 ? (
                    <div className="space-y-4">
                      {topBranches.map((branch) => (
                        <BranchCard 
                          key={branch.id}
                          branch={branch}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon="store"
                      title="Nenhuma filial encontrada"
                      description="Não há filiais cadastradas no sistema."
                      action={{
                        label: "Adicionar filial",
                        onClick: () => {/* Implementar função */}
                      }}
                    />
                  )}
                </CardContent>
              </Card>
              
              {/* Tendências de Mercado */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Tendências de Mercado</CardTitle>
                  <Button variant="text" size="sm" as={Link} to="/market-trends">
                    Ver mais <Icon name="arrow_forward" className="ml-1" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {isMarketTrendsLoading ? (
                    <div className="flex justify-center my-8">
                      <Spinner />
                    </div>
                  ) : marketTrends && marketTrends.length > 0 ? (
                    <div className="space-y-4">
                      {marketTrends.map((trend) => (
                        <MarketTrendCard 
                          key={trend.id}
                          trend={trend}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon="trending_up"
                      title="Sem dados de tendências"
                      description="As tendências de mercado serão atualizadas conforme novos dados forem coletados."
                      size="sm"
                    />
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div>
              {/* Notificações */}
              <NotificationsCard 
                notifications={notifications || []}
                isLoading={isNotificationsLoading}
                className="mb-6"
              />
              
              {/* Destaques da Semana */}
              <Card>
                <CardHeader>
                  <CardTitle>Destaques da Semana</CardTitle>
                </CardHeader>
                <CardContent>
                  {isHighlightsLoading ? (
                    <div className="flex justify-center my-8">
                      <Spinner />
                    </div>
                  ) : highlights && highlights.length > 0 ? (
                    <div className="space-y-3">
                      {highlights.map((highlight) => (
                        <HighlightCard 
                          key={highlight.id}
                          highlight={highlight}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon="stars"
                      title="Sem destaques"
                      description="Os destaques semanais serão exibidos aqui."
                      size="sm"
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        
        <MobileNavigation />
      </div>
    </WebSocketProvider>
  );
} 