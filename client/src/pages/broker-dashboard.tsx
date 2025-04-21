import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import DashboardHeader from "@/components/layouts/dashboard-header";
import MobileNavigation from "@/components/layouts/mobile-navigation";
import StatCard from "@/components/dashboard/stat-card";
import PerformanceChart from "@/components/dashboard/performance-chart";
import ActivitiesCard from "@/components/dashboard/activities-card";
import NegotiationsCard from "@/components/dashboard/negotiations-card";
import NotificationsCard from "@/components/dashboard/notifications-card";
import ChatContainer from "@/components/chat/chat-container";
import { WebSocketProvider } from "@/lib/websocket";
import { Activity, Deal, Notification, Performance } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/shared/spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { ActivityCard } from "@/components/activities/activity-card";
import { DealCard } from "@/components/deals/deal-card";
import { AchievementCard } from "@/components/gamification/achievement-card";
import { RankingItem } from "@/components/gamification/ranking-item";

// Função para formatar valores monetários
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Função para lidar com mudanças de status de atividades
const handleActivityStatusChange = (id: string, status: string) => {
  // Implementação futura: Atualizar o status da atividade através da API
  console.log(`Atualizando atividade ${id} para status ${status}`);
};

export default function BrokerDashboard() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirecionar se não estiver autenticado ou não for corretor
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate("/auth");
      } else if (user.role !== "broker") {
        navigate("/manager");
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
  if (!user || user.role !== "broker") {
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

  const { data: performance, isLoading: isPerformanceLoading } = useQuery<Performance>({
    queryKey: ["/api/performance"],
  });

  // Encontrar um gerente para chat (em um app real, seria baseado em atividades ou negociações)
  const { data: users } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      // Dados fictícios para usuários já que não temos um endpoint de API para isso
      return [{ id: 1, name: "Gestor Márcio", role: "manager" }];
    }
  });

  const manager = users?.find(u => u.role === "manager");

  // Calcular estatísticas
  const pendingActivities = activities?.filter(a => a.status !== "completed").length || 0;
  const totalActivities = activities?.length || 0;
  const activeDeals = deals?.length || 0;
  const completedActivities = activities?.filter(a => a.status === "completed").length || 0;
  const completionRate = totalActivities > 0 ? Math.floor((completedActivities / totalActivities) * 100) : 0;

  const [isUserMetricsLoading, setIsUserMetricsLoading] = useState(true);
  const [isAchievementsLoading, setIsAchievementsLoading] = useState(true);
  const [isRankingLoading, setIsRankingLoading] = useState(true);
  const [userMetrics, setUserMetrics] = useState(null);
  const [pendingAchievements, setPendingAchievements] = useState([]);
  const [ranking, setRanking] = useState([]);

  return (
    <WebSocketProvider userId={user.id}>
      <div className="min-h-screen bg-neutral-50">
        <DashboardHeader 
          title="Painel do Corretor" 
          user={{
            name: user.name,
            initials: user.avatarInitials || "AC",
            role: "broker"
          }}
          notificationCount={notifications?.filter(n => !n.read).length || 0}
        />
        
        <main className="container mx-auto px-4 py-6">
          {/* Cards de Métricas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatCard 
              title="Imóveis Vendidos"
              value={userMetrics?.propertiesSold || 0}
              suffix={userMetrics?.propertiesSoldTrend > 0 ? ' ↑' : (userMetrics?.propertiesSoldTrend < 0 ? ' ↓' : '')}
              icon="real_estate_agent"
              iconColor="text-primary"
              progress={{ 
                current: userMetrics?.propertiesSold || 0, 
                total: userMetrics?.propertiesTarget || 1,
                color: "bg-primary"
              }}
              isLoading={isUserMetricsLoading}
            />
            
            <StatCard 
              title="Comissões"
              value={formatCurrency(userMetrics?.commission || 0)}
              suffix={userMetrics?.commissionTrend > 0 ? ' ↑' : (userMetrics?.commissionTrend < 0 ? ' ↓' : '')}
              icon="payments"
              iconColor="text-accent"
              progress={{ 
                current: userMetrics?.commission || 0, 
                total: userMetrics?.commissionTarget || 1,
                color: "bg-accent"
              }}
              isLoading={isUserMetricsLoading}
            />
            
            <StatCard 
              title="Pontuação"
              value={userMetrics?.gamificationPoints || 0}
              suffix={userMetrics?.gamificationPointsTrend > 0 ? ' ↑' : (userMetrics?.gamificationPointsTrend < 0 ? ' ↓' : '')}
              icon="emoji_events"
              iconColor="text-secondary"
              progress={{ 
                current: userMetrics?.gamificationPoints || 0, 
                total: userMetrics?.nextLevelPoints || 1000,
                color: "bg-secondary"
              }}
              isLoading={isUserMetricsLoading}
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              {/* Atividades Recentes */}
              <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Atividades Recentes</CardTitle>
                  <Button variant="text" size="sm" as={Link} to="/activities">
                    Ver todas <Icon name="arrow_forward" className="ml-1" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {isActivitiesLoading ? (
                    <div className="flex justify-center my-8">
                      <Spinner />
                    </div>
                  ) : activities && activities.length > 0 ? (
                    <div className="space-y-4">
                      {activities.slice(0, 5).map((activity) => (
                        <ActivityCard 
                          key={activity.id}
                          activity={activity}
                          onStatusChange={(id, status) => handleActivityStatusChange(id, status)}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon="event_note"
                      title="Sem atividades recentes"
                      description="Suas atividades recentes aparecerão aqui quando disponíveis."
                      action={{
                        label: "Criar atividade",
                        onClick: () => {/* Implementar função */}
                      }}
                    />
                  )}
                </CardContent>
              </Card>
              
              {/* Negociações em Andamento */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Negociações em Andamento</CardTitle>
                  <Button variant="text" size="sm" as={Link} to="/deals">
                    Ver todas <Icon name="arrow_forward" className="ml-1" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {isDealsLoading ? (
                    <div className="flex justify-center my-8">
                      <Spinner />
                    </div>
                  ) : deals && deals.length > 0 ? (
                    <div className="space-y-4">
                      {deals.slice(0, 3).map((deal) => (
                        <DealCard 
                          key={deal.id}
                          deal={deal}
                          showActions
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon="real_estate_agent"
                      title="Sem negociações ativas"
                      description="Suas negociações em andamento aparecerão aqui."
                      action={{
                        label: "Iniciar negociação",
                        onClick: () => {/* Implementar função */}
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div>
              {/* Próximas Conquistas */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Próximas Conquistas</CardTitle>
                </CardHeader>
                <CardContent>
                  {isAchievementsLoading ? (
                    <div className="flex justify-center my-8">
                      <Spinner />
                    </div>
                  ) : pendingAchievements && pendingAchievements.length > 0 ? (
                    <div className="space-y-3">
                      {pendingAchievements.slice(0, 3).map((achievement) => (
                        <AchievementCard 
                          key={achievement.id}
                          achievement={achievement}
                          compact
                        />
                      ))}
                      <div className="pt-2">
                        <Button 
                          variant="text" 
                          size="sm" 
                          fullWidth 
                          as={Link} 
                          to="/gamification/achievements"
                        >
                          Ver todas as conquistas
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <EmptyState
                      icon="emoji_events"
                      title="Todas conquistas completadas!"
                      description="Parabéns! Você completou todas as conquistas disponíveis."
                      size="sm"
                    />
                  )}
                </CardContent>
              </Card>
              
              {/* Notificações */}
              <NotificationsCard 
                notifications={notifications || []}
                isLoading={isNotificationsLoading}
                className="mb-6"
              />
              
              {/* Ranking Semanal */}
              <Card>
                <CardHeader>
                  <CardTitle>Ranking Semanal</CardTitle>
                </CardHeader>
                <CardContent>
                  {isRankingLoading ? (
                    <div className="flex justify-center my-8">
                      <Spinner />
                    </div>
                  ) : ranking && ranking.length > 0 ? (
                    <div className="space-y-3">
                      {ranking.slice(0, 5).map((item, index) => (
                        <RankingItem 
                          key={item.id}
                          rank={index + 1}
                          user={{
                            id: item.id,
                            name: item.name,
                            avatarInitials: item.avatarInitials,
                            role: item.role,
                            level: item.level,
                            points: item.points,
                            weeklyPoints: item.weeklyPoints
                          }}
                          isCurrentUser={item.id === user.id}
                        />
                      ))}
                      <div className="pt-2">
                        <Button 
                          variant="text" 
                          size="sm" 
                          fullWidth 
                          as={Link} 
                          to="/gamification/ranking"
                        >
                          Ver ranking completo
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <EmptyState
                      icon="leaderboard"
                      title="Ranking indisponível"
                      description="O ranking semanal será atualizado em breve."
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
