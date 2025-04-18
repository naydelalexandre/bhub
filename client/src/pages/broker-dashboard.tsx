import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import DashboardHeader from "@/components/layouts/dashboard-header";
import MobileNavigation from "@/components/layouts/mobile-navigation";
import ActivitiesCard from "@/components/dashboard/activities-card";
import NegotiationsCard from "@/components/dashboard/negotiations-card";
import NotificationsCard from "@/components/dashboard/notifications-card";
import ChatContainer from "@/components/chat/chat-container";
import { WebSocketProvider } from "@/lib/websocket";
import { Activity, Deal, Notification, Performance } from "@shared/schema";

export default function BrokerDashboard() {
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

  if (!user) return null;

  return (
    <WebSocketProvider userId={user.id}>
      <div className="min-h-screen bg-neutral-100">
        <DashboardHeader 
          title="Dashboard do Corretor" 
          user={{
            name: user.name,
            initials: user.avatarInitials,
            role: "broker"
          }}
          notificationCount={notifications?.filter(n => !n.read).length || 0}
        />
        
        <main className="container mx-auto px-4 py-6 pb-16 md:pb-6">
          {/* Broker Stats */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <h2 className="text-xl font-semibold text-neutral-400 mb-1">Olá, {user.name.split(' ')[0]}!</h2>
                <p className="text-neutral-300">
                  Seu score da semana: <span className="text-secondary font-semibold">{performance?.score || 0}</span>
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-xs text-neutral-300 mb-1">Atividades</p>
                  <div className="flex items-center justify-center">
                    <span className="material-icons text-primary mr-1">assignment</span>
                    <span className="font-semibold text-lg">{activities?.length || 0}</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-xs text-neutral-300 mb-1">Negociações</p>
                  <div className="flex items-center justify-center">
                    <span className="material-icons text-accent mr-1">handshake</span>
                    <span className="font-semibold text-lg">{deals?.length || 0}</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-xs text-neutral-300 mb-1">Msgs. Novas</p>
                  <div className="flex items-center justify-center">
                    <span className="material-icons text-primary mr-1">chat</span>
                    <span className="font-semibold text-lg">{notifications?.filter(n => n.type === "message" && !n.read).length || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
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
