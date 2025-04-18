import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Activity } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { formatDate, translateActivityStatus, getStatusColor } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface TaskItemProps {
  activity: Activity;
  userRole: "manager" | "broker";
}

export default function TaskItem({ activity, userRole }: TaskItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (status: string) => {
      return apiRequest("PATCH", `/api/activities/${activity.id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/performance"] });
    },
    onSettled: () => {
      setIsUpdating(false);
    }
  });

  const handleStatusUpdate = (status: string) => {
    setIsUpdating(true);
    updateMutation.mutate(status);
  };

  return (
    <div className="border border-neutral-200 rounded-lg p-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-neutral-400">{activity.title}</h3>
          <p className="text-xs text-neutral-300 mt-1">
            {activity.clientName} {activity.propertyInfo ? `• ${activity.propertyInfo}` : ""}
          </p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(activity.status)}`}>
          {translateActivityStatus(activity.status)}
        </span>
      </div>
      <div className="mt-3 flex justify-between items-center">
        <div className="flex items-center text-xs text-neutral-300">
          <span className="material-icons text-neutral-300 text-sm mr-1">calendar_today</span>
          <span>Vencimento: {formatDate(activity.dueDate)}</span>
        </div>
        <div className="flex space-x-2">
          {userRole === "broker" && activity.status === "pending" && (
            <Button 
              size="sm" 
              className="bg-primary text-white text-xs rounded-md px-3 py-1.5"
              onClick={() => handleStatusUpdate("in_progress")}
              disabled={isUpdating}
            >
              {isUpdating ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
              Iniciar
            </Button>
          )}
          
          {userRole === "broker" && activity.status === "in_progress" && (
            <Button 
              size="sm"
              className="bg-secondary text-white text-xs rounded-md px-3 py-1.5"
              onClick={() => handleStatusUpdate("completed")}
              disabled={isUpdating}
            >
              {isUpdating ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
              Marcar como concluída
            </Button>
          )}
          
          <Button variant="link" className="text-primary hover:text-primary/80 text-sm p-0 h-auto">
            Ver detalhes
          </Button>
        </div>
      </div>
    </div>
  );
}
