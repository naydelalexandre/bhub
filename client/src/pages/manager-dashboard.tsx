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
      <div className="min-h-screen bg-neutral-50 pb-16 md:pb-0 relative">
        <DashboardHeader 
          title="Painel do Gerente" 
          user={{
            name: user.name,
            initials: user.avatarInitials || "MG",
            role: "manager"
          }}
          notificationCount={notifications?.filter(n => !n.read).length || 0}
        />
        
        <main className="container mx-auto px-4 py-6">
          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatCard 
              title="Atividades Pendentes"
              value={pendingActivities}
              icon="assignment"
              iconColor="text-accent"
              progress={{ 
                current: pendingActivities, 
                total: totalActivities || 1,
                color: "bg-accent" 
              }}
              isLoading={isActivitiesLoading}
            />
            
            <StatCard 
              title="Negociações Ativas"
              value={activeDeals}
              icon="handshake"
              iconColor="text-primary"
              progress={{ 
                current: conversionRate, 
                total: 100,
                color: "bg-primary",
                label: "Taxa de Conversão"
              }}
              isLoading={isDealsLoading}
            />
            
            <StatCard 
              title="Desempenho Médio"
              value={averagePerformance}
              suffix="/100"
              icon="leaderboard"
              iconColor="text-secondary"
              progress={{ 
                current: averagePerformance, 
                total: 100,
                color: "bg-secondary",
                label: "Crescimento Semanal",
                trend: weeklyGrowth,
                trendColor: "text-secondary"
              }}
              isLoading={isPerformancesLoading}
            />
          </div>
          
          {/* Gráfico de Desempenho Avançado */}
          <div className="mb-6">
            <EnhancedPerformanceChart 
              activities={activities || []}
              deals={deals || []}
              performances={performances || []}
              isLoading={isActivitiesLoading || isDealsLoading || isPerformancesLoading}
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* Card de Desempenho */}
              <PerformanceCard 
                performances={performersProps}
                isLoading={isPerformancesLoading} 
                className="mb-6"
              />
              
              {/* Card de Negociações */}
              <NegotiationsCard 
                deals={deals || []}
                isLoading={isDealsLoading}
                userRole="manager"
              />
            </div>
            
            <div>
              {/* Card de Atividades */}
              <ActivitiesCard 
                activities={activities || []}
                isLoading={isActivitiesLoading}
                userRole="manager"
                className="mb-6"
              />
              
              {/* Card de Notificações */}
              <NotificationsCard 
                notifications={notifications || []}
                isLoading={isNotificationsLoading}
              />
            </div>
          </div>
        </main>
        
        {/* Botão de Chat Mobile */}
        <div className="md:hidden fixed bottom-4 right-4 z-10">
          <Button 
            onClick={() => setChatOpen(true)}
            className="h-14 w-14 rounded-full bg-primary shadow-lg flex justify-center items-center"
          >
            <MessageCircle className="h-6 w-6 text-white" />
          </Button>
        </div>
        
        {/* Drawer de Chat Mobile */}
        <Drawer open={chatOpen} onOpenChange={setChatOpen}>
          <DrawerContent className="h-[90vh]">
            <div className="h-full p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Chat da Equipe</h2>
                <Button variant="ghost" size="icon" onClick={() => setChatOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <TeamChat currentUser={user} className="h-[calc(100%-50px)]" />
            </div>
          </DrawerContent>
        </Drawer>
        
        {/* Chat para Desktop */}
        <div className="hidden md:block fixed right-4 bottom-4 w-[350px] h-[500px] shadow-xl rounded-lg overflow-hidden border border-neutral-200 z-10">
          <TeamChat currentUser={user} />
        </div>
      </div>
    </WebSocketProvider>
  );
}
