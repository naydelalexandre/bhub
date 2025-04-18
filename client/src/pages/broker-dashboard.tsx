import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
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

export default function BrokerDashboard() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirect if not authenticated or not a broker
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate("/auth");
      } else if (user.role !== "broker") {
        navigate("/manager");
      }
    }
  }, [user, isLoading, navigate]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If still loading or no user, don't render dashboard yet
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

  // Find a manager to chat with (in a real app, would be based on activities or deals)
  const { data: users } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      // Mock data for users since we don't have an API endpoint for this
      return [{ id: 1, name: "Gestor Márcio", role: "manager" }];
    }
  });

  const manager = users?.find(u => u.role === "manager");

  // Calculate stats
  const pendingActivities = activities?.filter(a => a.status !== "completed").length || 0;
  const totalActivities = activities?.length || 0;
  const activeDeals = deals?.length || 0;
  const completedActivities = activities?.filter(a => a.status === "completed").length || 0;
  const completionRate = totalActivities > 0 ? Math.floor((completedActivities / totalActivities) * 100) : 0;

  return (
    <WebSocketProvider userId={user.id}>
      <div className="min-h-screen bg-neutral-50">
        <DashboardHeader 
          title="Dashboard do Corretor" 
          user={{
            name: user.name,
            initials: user.avatarInitials || "BC",
            role: "broker"
          }}
          notificationCount={notifications?.filter(n => !n.read).length || 0}
        />
        
        <main className="container mx-auto px-4 py-6 pb-16 md:pb-6">
          {/* Stats Cards */}
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
              title="Taxa de Conclusão"
              value={completionRate}
              suffix="%"
              icon="task_alt"
              iconColor="text-primary"
              progress={{ 
                current: completionRate, 
                total: 100,
                color: "bg-primary"
              }}
              isLoading={isActivitiesLoading}
            />
            
            <StatCard 
              title="Performance Score"
              value={performance?.score || 0}
              suffix="/100"
              icon="leaderboard"
              iconColor="text-secondary"
              progress={{ 
                current: performance?.score || 0, 
                total: 100,
                color: "bg-secondary"
              }}
              isLoading={isPerformanceLoading}
            />
          </div>
          
          {/* Performance Chart */}
          <div className="mb-6">
            <PerformanceChart 
              activities={activities || []}
              deals={deals || []}
              isLoading={isActivitiesLoading || isDealsLoading}
            />
          </div>
          
          {/* Performance Metrics */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Metas e Objetivos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Activity Completion Card */}
                <div className="bg-primary/5 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-neutral-400">Atividades Concluídas</p>
                    <span className="text-lg font-semibold text-primary">
                      {completedActivities} de 10
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2 mb-1">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${Math.min(completedActivities, 10) * 10}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-neutral-300">Meta semanal: 10 atividades</p>
                </div>
                
                {/* Deal Progression Card */}
                <div className="bg-secondary/5 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-neutral-400">Negociações Ativas</p>
                    <span className="text-lg font-semibold text-secondary">
                      {activeDeals} de 5
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2 mb-1">
                    <div 
                      className="bg-secondary h-2 rounded-full" 
                      style={{ width: `${Math.min(activeDeals, 5) * 20}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-neutral-300">Meta semanal: 5 negociações</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* Activities Card */}
              <ActivitiesCard 
                activities={activities || []}
                isLoading={isActivitiesLoading}
                userRole="broker"
                className="mb-6"
              />
              
              {/* Negotiations Card */}
              <NegotiationsCard 
                deals={deals || []}
                isLoading={isDealsLoading}
                userRole="broker"
              />
            </div>
            
            <div>
              {/* Notifications Card */}
              <NotificationsCard 
                notifications={notifications || []}
                isLoading={isNotificationsLoading}
                className="mb-6"
              />
              
              {/* Chat Card */}
              {manager && (
                <ChatContainer 
                  otherUser={{
                    id: manager.id,
                    name: manager.name
                  }}
                  currentUserId={user.id}
                />
              )}
            </div>
          </div>
        </main>
        
        <MobileNavigation />
      </div>
    </WebSocketProvider>
  );
}
