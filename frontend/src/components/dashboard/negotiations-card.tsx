import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Deal } from "@shared/schema";
import { cn, formatDate, translateDealStage, getStatusColor } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, MoreVertical } from "lucide-react";
import DealItem from "@/components/deal-item";

interface NegotiationsCardProps {
  deals: Deal[];
  isLoading: boolean;
  userRole: "manager" | "broker";
  className?: string;
}

const createDealSchema = z.object({
  clientName: z.string().min(3, { message: "Nome do cliente deve ter pelo menos 3 caracteres" }),
  propertyInfo: z.string().min(3, { message: "Informações do imóvel são obrigatórias" }),
  assignedTo: z.number({ message: "Selecione um corretor" }),
  stage: z.enum(["initial_contact", "visit", "proposal", "closing"], {
    message: "Selecione uma etapa válida"
  }),
  priority: z.enum(["low", "medium", "high"], {
    message: "Selecione uma prioridade válida"
  }),
});

type CreateDealFormValues = z.infer<typeof createDealSchema>;

export default function NegotiationsCard({ deals, isLoading, userRole, className }: NegotiationsCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const createDealMutation = useMutation({
    mutationFn: async (data: CreateDealFormValues) => {
      return apiRequest("POST", "/api/deals", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      form.reset();
      setDialogOpen(false);
    }
  });

  const form = useForm<CreateDealFormValues>({
    resolver: zodResolver(createDealSchema),
    defaultValues: {
      clientName: "",
      propertyInfo: "",
      assignedTo: 0,
      stage: "initial_contact",
      priority: "medium"
    }
  });

  const onSubmit = (data: CreateDealFormValues) => {
    createDealMutation.mutate(data);
  };

  const title = userRole === "manager" ? "Negociações Ativas" : "Minhas Negociações";

  // Mock brokers for the select dropdown - in a real app, would fetch from API
  const brokers = [
    { id: 2, name: "Ana Rodrigues" },
    { id: 3, name: "Carlos Silva" },
    { id: 4, name: "Márcia Gomes" },
    { id: 5, name: "Roberto Costa" },
    { id: 6, name: "Lucia Pereira" }
  ];

  return (
    <div className={cn("bg-white rounded-lg shadow-sm p-4", className)}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-neutral-400">{title}</h2>
        {userRole === "manager" ? (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center text-white bg-primary px-3 py-1.5 rounded-md text-sm">
                <span className="material-icons text-sm mr-1">add</span>
                Nova Negociação
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Negociação</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="clientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cliente</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do cliente" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="propertyInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Imóvel</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Apt. 302 - Jardins" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="assignedTo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Corretor Responsável</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          defaultValue={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um corretor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {brokers.map(broker => (
                              <SelectItem key={broker.id} value={broker.id.toString()}>
                                {broker.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="stage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Etapa</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a etapa" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="initial_contact">Contato Inicial</SelectItem>
                              <SelectItem value="visit">Visita</SelectItem>
                              <SelectItem value="proposal">Proposta</SelectItem>
                              <SelectItem value="closing">Fechamento</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prioridade</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a prioridade" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Baixa</SelectItem>
                              <SelectItem value="medium">Média</SelectItem>
                              <SelectItem value="high">Alta</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button type="submit" disabled={createDealMutation.isPending} className="w-full">
                    {createDealMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Criar Negociação
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        ) : (
          <Select>
            <SelectTrigger className="w-[180px] text-sm border border-neutral-200 rounded-md h-8">
              <SelectValue placeholder="Todas as etapas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as etapas</SelectItem>
              <SelectItem value="initial_contact">Contato Inicial</SelectItem>
              <SelectItem value="visit">Visita</SelectItem>
              <SelectItem value="proposal">Proposta</SelectItem>
              <SelectItem value="closing">Fechamento</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
      
      {userRole === "broker" ? (
        <div className="space-y-4 scrollable-container pr-2 max-h-[420px] overflow-y-auto">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="border border-neutral-200 rounded-lg p-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <div>
                    <div className="flex items-center mb-2">
                      <Skeleton className="h-5 w-28 mr-2" />
                      <Skeleton className="h-5 w-5 mx-2" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                    <div className="flex flex-wrap items-center text-xs">
                      <Skeleton className="h-6 w-20 rounded-full mr-2" />
                      <Skeleton className="h-4 w-24 mr-2" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </div>
                  <div className="flex mt-3 sm:mt-0">
                    <Skeleton className="h-8 w-28 rounded-md mr-2" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              </div>
            ))
          ) : deals.length > 0 ? (
            deals.map(deal => (
              <DealItem key={deal.id} deal={deal} userRole={userRole} />
            ))
          ) : (
            <div className="text-center py-8 text-neutral-300">
              Nenhuma negociação encontrada
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-xs text-neutral-300 border-b border-neutral-200">
                <th className="pb-2 font-medium">Cliente</th>
                <th className="pb-2 font-medium">Imóvel</th>
                <th className="pb-2 font-medium">Corretor</th>
                <th className="pb-2 font-medium">Etapa</th>
                <th className="pb-2 font-medium">Última Atualização</th>
                <th className="pb-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-neutral-200 text-sm">
                    <td className="py-3 pr-4"><Skeleton className="h-5 w-28" /></td>
                    <td className="py-3 pr-4"><Skeleton className="h-5 w-32" /></td>
                    <td className="py-3 pr-4"><Skeleton className="h-5 w-28" /></td>
                    <td className="py-3 pr-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                    <td className="py-3 pr-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="py-3"><Skeleton className="h-8 w-8 rounded-full" /></td>
                  </tr>
                ))
              ) : deals.length > 0 ? (
                deals.slice(0, 4).map(deal => (
                  <tr key={deal.id} className="border-b border-neutral-200 text-sm">
                    <td className="py-3 pr-4">{deal.clientName}</td>
                    <td className="py-3 pr-4">{deal.propertyInfo}</td>
                    <td className="py-3 pr-4">{getBrokerName(deal.assignedTo)}</td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(deal.stage)}`}>
                        {translateDealStage(deal.stage)}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-xs text-neutral-300">{formatDate(deal.lastUpdated)}</td>
                    <td className="py-3">
                      <Button variant="ghost" size="icon" className="text-neutral-300 hover:text-primary">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-neutral-300">
                    Nenhuma negociação encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="mt-4 text-center">
        <Button variant="link" className="text-primary text-sm font-medium">
          Ver todas as negociações
        </Button>
      </div>
    </div>
  );
}

// Helper function to get the broker name - in a real app, would be fetched from the API
function getBrokerName(brokerId: number): string {
  const brokers: Record<number, string> = {
    2: "Ana Rodrigues",
    3: "Carlos Silva",
    4: "Márcia Gomes",
    5: "Roberto Costa",
    6: "Lucia Pereira"
  };
  return brokers[brokerId] || "Corretor Desconhecido";
}
