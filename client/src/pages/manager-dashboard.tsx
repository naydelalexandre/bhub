import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import DashboardHeader from "@/components/layouts/dashboard-header";
import StatCard from "@/components/dashboard/stat-card";
import PerformanceCard from "@/components/dashboard/performance-card";
import PerformanceChart from "@/components/dashboard/performance-chart";
import ActivitiesCard from "@/components/dashboard/activities-card";
import NegotiationsCard from "@/components/dashboard/negotiations-card";
import NotificationsCard from "@/components/dashboard/notifications-card";
import { WebSocketProvider } from "@/lib/websocket";
import { Activity, Deal, Notification } from "@shared/schema";

export default function ManagerDashboard() {
  const { user } = useAuth();

  const { data: activities, isLoading: isActivitiesLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const { data: deals, isLoading: isDealsLoading } = useQuery<Deal[]>({
    queryKey: ["/api/deals"],
  });

  const { data: notifications, isLoading: isNotificationsLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  const { data: performances, isLoading: isPerformancesLoading } = useQuery({
    queryKey: ["/api/performance"],
  });

  if (!user) return null;

  // Calculate stats
  const pendingActivities = activities?.filter(a => a.status !== "completed").length || 0;
  const totalActivities = activities?.length || 0;
  const activeDeals = deals?.length || 0;
  const conversionRate = activeDeals > 0 ? Math.floor((activeDeals / (activeDeals + 5)) * 100) : 0;
  const averagePerformance = performances?.length > 0 
    ? Math.floor(performances.reduce((sum, p) => sum + p.score, 0) / performances.length) 
    : 0;
  const weeklyGrowth = "+3.2%"; // In a real app, this would be calculated based on historical data

  return (
    <WebSocketProvider userId={user.id}>
      <div className="min-h-screen bg-neutral-50">
        <DashboardHeader 
          title="Dashboard do Gestor" 
          user={{
            name: user.name,
            initials: user.avatarInitials || "MG",
            role: "manager"
          }}
          notificationCount={notifications?.filter(n => !n.read).length || 0}
        />
        
        <main className="container mx-auto px-4 py-6">
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
              title="Performance Média"
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
          
          {/* Data Visualization Chart */}
          <div className="mb-6">
            <PerformanceChart 
              activities={activities || []}
              deals={deals || []}
              isLoading={isActivitiesLoading || isDealsLoading}
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* Performance Card */}
              <PerformanceCard 
                performances={performances || []}
                isLoading={isPerformancesLoading} 
                className="mb-6"
              />
              
              {/* Negotiations Card */}
              <NegotiationsCard 
                deals={deals || []}
                isLoading={isDealsLoading}
                userRole="manager"
              />
            </div>
            
            <div>
              {/* Activities Card */}
              <ActivitiesCard 
                activities={activities || []}
                isLoading={isActivitiesLoading}
                userRole="manager"
                className="mb-6"
              />
              
              {/* Notifications Card */}
              <NotificationsCard 
                notifications={notifications || []}
                isLoading={isNotificationsLoading}
              />
            </div>
          </div>
        </main>
      </div>
    </WebSocketProvider>
  );
}
