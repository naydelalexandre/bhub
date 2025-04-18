import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Notification } from "@shared/schema";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import NotificationItem from "@/components/notification-item";

interface NotificationsCardProps {
  notifications: Notification[];
  isLoading: boolean;
  className?: string;
}

export default function NotificationsCard({ notifications, isLoading, className }: NotificationsCardProps) {
  const queryClient = useQueryClient();

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/notifications/read-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    }
  });

  const hasUnreadNotifications = notifications.some(n => !n.read);

  return (
    <div className={cn("bg-white rounded-lg shadow-sm p-4", className)}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-neutral-400">Notificações</h2>
        <Button 
          variant="link" 
          className="text-primary text-sm"
          onClick={() => markAllAsReadMutation.mutate()}
          disabled={!hasUnreadNotifications || markAllAsReadMutation.isPending}
        >
          Marcar {hasUnreadNotifications ? "todas como lidas" : "como lidas"}
        </Button>
      </div>
      
      <div className="space-y-3 scrollable-container pr-2 max-h-[420px] overflow-y-auto">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="flex p-2 rounded-lg">
              <div className="flex-shrink-0 rounded-full p-2 mr-3 bg-neutral-200">
                <Skeleton className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))
        ) : notifications.length > 0 ? (
          notifications.map(notification => (
            <NotificationItem key={notification.id} notification={notification} />
          ))
        ) : (
          <div className="text-center py-8 text-neutral-300">
            Nenhuma notificação
          </div>
        )}
      </div>
      
      <div className="mt-4 text-center">
        <Button variant="link" className="text-primary text-sm font-medium">
          Ver todas as notificações
        </Button>
      </div>
    </div>
  );
}
