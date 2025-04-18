import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Notification } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { formatDate, getNotificationIcon, getNotificationIconColor } from "@/lib/utils";
import { useWebSocket } from "@/lib/websocket";

interface NotificationItemProps {
  notification: Notification;
}

export default function NotificationItem({ notification }: NotificationItemProps) {
  const queryClient = useQueryClient();
  const { sendMessage } = useWebSocket();

  const markAsReadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/notifications/read/${notification.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      // Also notify the WebSocket server
      sendMessage({
        type: 'read-notification',
        id: notification.id
      });
    }
  });

  const handleClick = () => {
    if (!notification.read) {
      markAsReadMutation.mutate();
    }
  };

  return (
    <div 
      className={`flex p-2 rounded-lg ${!notification.read ? 'bg-primary/5' : ''}`}
      onClick={handleClick}
    >
      <div className={`flex-shrink-0 rounded-full p-2 mr-3 ${getNotificationIconColor(notification.type)}`}>
        <span className="material-icons">{getNotificationIcon(notification.type)}</span>
      </div>
      <div>
        <p className="text-sm text-neutral-400" dangerouslySetInnerHTML={{ __html: notification.content }} />
        <p className="text-xs text-neutral-300 mt-1">{formatDate(notification.createdAt)}</p>
      </div>
    </div>
  );
}
