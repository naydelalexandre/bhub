import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import DashboardHeader from "@/components/layouts/dashboard-header";
import StatCard from "@/components/dashboard/stat-card";
import PerformanceCard from "@/components/dashboard/performance-card";
import EnhancedPerformanceChart from "@/components/dashboard/enhanced-performance-chart";
import ActivitiesCard from "@/components/dashboard/activities-card";
import NegotiationsCard from "@/components/dashboard/negotiations-card";
import NotificationsCard from "@/components/dashboard/notifications-card";
import TeamChat from "@/components/chat/team-chat";
import { WebSocketProvider } from "@/lib/websocket";
import { Activity, Deal, Notification, Performance } from "@shared/schema";
import { Loader2, MessageCircle, MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { convertPerformancesToPerformerProps } from "@/components/dashboard/performance-converter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { AgentCard } from "@/components/dashboard/agent-card";
import { TeamActivitiesCard } from "@/components/dashboard/team-activities-card";
import { RankingItem } from "@/components/dashboard/ranking-item";
import { MobileNavigation } from "@/components/layouts/mobile-navigation";

export default function ManagerDashboard() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [chatOpen, setChatOpen] = useState(false);
  
  // Redirecionar se não estiver autenticado ou não for gerente
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate("/auth");
      } else if (user.role !== "manager") {
        navigate("/broker");
      }
    }
  }, [user, isLoading, navigate]);

  // Mostrar estado de carregamento enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Se ainda estiver carregando ou sem usuário, não renderizar o dashboard ainda
  if (!user || user.role !== "manager") {
    return null;
  }

  const { data: activities, isLoading: isActivitiesLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const { data: deals, isLoading: isDealsLoading } = useQuery<Deal[]>({
    queryKey: ["/api/deals"],
  });

  const { data: notifications, isLoading: isNotificationsLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  const { data: performances, isLoading: isPerformancesLoading } = useQuery<Performance[]>({
    queryKey: ["/api/performance"],
  });

  // Calcular estatísticas
  const pendingActivities = activities?.filter(a => a.status !== "completed").length || 0;
  const totalActivities = activities?.length || 0;
  const activeDeals = deals?.length || 0;
  const conversionRate = activeDeals > 0 ? Math.floor((activeDeals / (activeDeals + 5)) * 100) : 0;
  const averagePerformance = performances && performances.length > 0
    ? Math.floor(performances.reduce((sum, p) => sum + p.score, 0) / performances.length) 
    : 0;
  const weeklyGrowth = "+3.2%"; // Em um app real, isso seria calculado com base em dados históricos

  // Converter as performances para o formato esperado pelo PerformanceCard
  const performersProps = performances ? convertPerformancesToPerformerProps(performances) : [];

  return (
    <WebSocketProvider userId={user.id}>
      <div className="min-h-screen bg-neutral-50">
        <DashboardHeader 
          title="Painel do Gerente" 
          user={{
            name: user.name,
            initials: user.avatarInitials || "BM",
            role: "manager"
          }}
          notificationCount={notifications?.filter(n => !n.read).length || 0}
        />
        
        <main className="container mx-auto px-4 py-6 pb-16 md:pb-6">
          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatCard 
              title="Equipe Ativa"
              value={teamMetrics?.activeAgents || 0}
              suffix={` de ${teamMetrics?.totalAgents || 0}`}
              icon="groups"
              iconColor="text-primary"
              progress={{ 
                current: teamMetrics?.activeAgents || 0, 
                total: teamMetrics?.totalAgents || 1,
                color: "bg-primary"
              }}
              isLoading={isTeamMetricsLoading}
            />
            
            <StatCard 
              title="Taxa de Produtividade"
              value={teamMetrics?.productivityRate || 0}
              suffix="%"
              icon="productivity"
              iconColor="text-accent"
              progress={{ 
                current: teamMetrics?.productivityRate || 0, 
                total: 100,
                color: "bg-accent"
              }}
              isLoading={isTeamMetricsLoading}
            />
            
            <StatCard 
              title="Desempenho da Equipe"
              value={teamMetrics?.performance || 0}
              suffix="/100"
              icon="leaderboard"
              iconColor="text-secondary"
              progress={{ 
                current: teamMetrics?.performance || 0, 
                total: 100,
                color: "bg-secondary"
              }}
              isLoading={isTeamMetricsLoading}
            />
          </div>
          
          {/* Gráfico de Desempenho */}
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Desempenho da Equipe</CardTitle>
              </CardHeader>
              <CardContent>
                {isTeamChartLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Spinner size="lg" />
                  </div>
                ) : (
                  <div className="h-64">
                    <TeamPerformanceChart data={teamChartData || []} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* Lista de Corretores */}
              <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Corretores</CardTitle>
                  <Button variant="text" size="sm" as={Link} to="/team">
                    Ver todos <Icon name="arrow_forward" className="ml-1" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {isAgentsLoading ? (
                    <div className="flex justify-center my-8">
                      <Spinner />
                    </div>
                  ) : agents && agents.length > 0 ? (
                    <div className="space-y-4">
                      {agents.slice(0, 5).map((agent) => (
                        <AgentCard 
                          key={agent.id}
                          agent={agent}
                          onChatClick={() => {/* Implementar função de chat */}}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon="person_off"
                      title="Nenhum corretor encontrado"
                      description="Não há corretores cadastrados na sua equipe."
                      action={{
                        label: "Adicionar corretor",
                        onClick: () => {/* Implementar função */}
                      }}
                    />
                  )}
                </CardContent>
              </Card>
              
              {/* Atividades da Equipe */}
              <TeamActivitiesCard 
                activities={teamActivities || []}
                isLoading={isTeamActivitiesLoading}
              />
            </div>
            
            <div>
              {/* Notificações */}
              <NotificationsCard 
                notifications={notifications || []}
                isLoading={isNotificationsLoading}
                className="mb-6"
              />
              
              {/* Ranking da Equipe */}
              <Card>
                <CardHeader>
                  <CardTitle>Ranking de Desempenho</CardTitle>
                </CardHeader>
                <CardContent>
                  {isTeamRankingLoading ? (
                    <div className="flex justify-center my-8">
                      <Spinner />
                    </div>
                  ) : teamRanking && teamRanking.length > 0 ? (
                    <div className="space-y-3">
                      {teamRanking.map((agent, index) => (
                        <RankingItem 
                          key={agent.id}
                          position={index + 1}
                          name={agent.name}
                          score={agent.score}
                          avatarUrl={agent.avatar}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon="leaderboard"
                      title="Sem dados de ranking"
                      description="O ranking será atualizado conforme a equipe registrar atividades."
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
