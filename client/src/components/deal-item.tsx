import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Deal } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate, translateDealStage, getStatusColor } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface DealItemProps {
  deal: Deal;
  userRole: "manager" | "broker";
}

export default function DealItem({ deal, userRole }: DealItemProps) {
  const [updating, setUpdating] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (stage: string) => {
      return apiRequest("PATCH", `/api/deals/${deal.id}`, { stage });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/performance"] });
      setStatusDialogOpen(false);
    },
    onSettled: () => {
      setUpdating(false);
    }
  });

  const handleStageUpdate = (stage: string) => {
    setUpdating(true);
    updateMutation.mutate(stage);
  };

  const getPriorityDisplay = () => {
    switch (deal.priority) {
      case "high":
        return (
          <span className="flex items-center text-secondary text-xs">
            <span className="material-icons text-sm mr-1">trending_up</span>
            <span>Alta prioridade</span>
          </span>
        );
      case "medium":
        return (
          <span className="flex items-center text-accent text-xs">
            <span className="material-icons text-sm mr-1">trending_flat</span>
            <span>Média prioridade</span>
          </span>
        );
      case "low":
        return (
          <span className="flex items-center text-neutral-300 text-xs">
            <span className="material-icons text-sm mr-1">trending_down</span>
            <span>Baixa prioridade</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="border border-neutral-200 rounded-lg p-3">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div>
          <div className="flex items-center mb-2">
            <h3 className="font-medium text-neutral-400">{deal.clientName}</h3>
            <span className="mx-2 text-neutral-200">•</span>
            <span className="text-sm text-neutral-300">{deal.propertyInfo}</span>
          </div>
          <div className="flex flex-wrap items-center text-xs">
            <span className={`px-2 py-1 rounded-full mr-2 mb-2 sm:mb-0 ${getStatusColor(deal.stage)}`}>
              {translateDealStage(deal.stage)}
            </span>
            <span className="flex items-center text-neutral-300 mr-2 mb-2 sm:mb-0">
              <span className="material-icons text-sm mr-1">calendar_today</span>
              <span>Atualizado {formatDate(deal.lastUpdated)}</span>
            </span>
            {getPriorityDisplay()}
          </div>
        </div>
        <div className="flex mt-3 sm:mt-0">
          {userRole === "broker" && (
            <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="sm"
                  className="bg-primary text-white text-xs rounded-md px-3 py-1.5 mr-2"
                >
                  Atualizar status
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Atualizar Status da Negociação</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Cliente</label>
                    <p className="text-sm">{deal.clientName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Imóvel</label>
                    <p className="text-sm">{deal.propertyInfo}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status Atual</label>
                    <p className="text-sm">{translateDealStage(deal.stage)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Novo Status</label>
                    <Select onValueChange={handleStageUpdate} disabled={updating}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o novo status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="initial_contact">Contato Inicial</SelectItem>
                        <SelectItem value="visit">Visita</SelectItem>
                        <SelectItem value="proposal">Proposta</SelectItem>
                        <SelectItem value="closing">Fechamento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {updating && (
                    <div className="flex justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
          <Button variant="link" className="text-primary hover:text-primary/80 text-sm p-0 h-auto">
            Detalhes
          </Button>
        </div>
      </div>
    </div>
  );
}
