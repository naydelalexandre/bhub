import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Activity } from "@shared/schema";
import { cn, formatDate, getStatusColor, translateActivityStatus } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import TaskItem from "@/components/task-item";

interface ActivitiesCardProps {
  activities: Activity[];
  isLoading: boolean;
  userRole: "manager" | "broker";
  className?: string;
}

const createActivitySchema = z.object({
  title: z.string().min(3, { message: "Título deve ter pelo menos 3 caracteres" }),
  description: z.string().optional(),
  assignedTo: z.number({ message: "Selecione um corretor" }),
  dueDate: z.string().min(1, { message: "Selecione uma data de vencimento" }),
});

type CreateActivityFormValues = z.infer<typeof createActivitySchema>;

export default function ActivitiesCard({ activities, isLoading, userRole, className }: ActivitiesCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const createActivityMutation = useMutation({
    mutationFn: async (data: CreateActivityFormValues) => {
      return apiRequest("POST", "/api/activities", {
        ...data,
        dueDate: new Date(data.dueDate),
        status: "pending"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      form.reset();
      setDialogOpen(false);
    }
  });

  const form = useForm<CreateActivityFormValues>({
    resolver: zodResolver(createActivitySchema),
    defaultValues: {
      title: "",
      description: "",
      assignedTo: 0,
      dueDate: "",
    }
  });

  const onSubmit = (data: CreateActivityFormValues) => {
    createActivityMutation.mutate(data);
  };

  const title = userRole === "manager" ? "Atividades Recentes" : "Minhas Atividades";

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
        {userRole === "manager" && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center text-white bg-primary px-3 py-1.5 rounded-md text-sm">
                <span className="material-icons text-sm mr-1">add</span>
                Nova Atividade
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Atividade</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Contactar cliente" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Detalhes da atividade" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
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
                    
                    <FormField
                      control={form.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Vencimento</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button type="submit" disabled={createActivityMutation.isPending} className="w-full">
                    {createActivityMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Criar Atividade
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
        {userRole === "broker" && (
          <Select>
            <SelectTrigger className="w-[180px] text-sm border border-neutral-200 rounded-md h-8">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="in_progress">Em andamento</SelectItem>
              <SelectItem value="completed">Concluídas</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
      
      <div className="space-y-4 scrollable-container pr-2 max-h-[420px] overflow-y-auto">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="border border-neutral-200 rounded-lg p-3">
              <div className="flex justify-between items-start">
                <div>
                  <Skeleton className="h-5 w-40 mb-1" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="mt-3 flex justify-between items-center">
                <Skeleton className="h-4 w-28" />
                <div className="flex space-x-2">
                  <Skeleton className="h-8 w-32 rounded-md" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            </div>
          ))
        ) : userRole === "broker" ? (
          activities.length > 0 ? (
            activities.map(activity => (
              <TaskItem key={activity.id} activity={activity} userRole={userRole} />
            ))
          ) : (
            <div className="text-center py-8 text-neutral-300">
              Nenhuma atividade encontrada
            </div>
          )
        ) : (
          activities.length > 0 ? (
            activities.slice(0, 5).map(activity => (
              <div key={activity.id} className={`border-l-4 pl-3 py-1 ${getStatusBorderColor(activity.status)}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-neutral-400">{activity.title}</h3>
                    <p className="text-xs text-neutral-300 mt-1">
                      {getBrokerName(activity.assignedTo)} • {translateActivityStatus(activity.status)}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(activity.status)}`}>
                    {formatDate(activity.createdAt)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-neutral-300">
              Nenhuma atividade encontrada
            </div>
          )
        )}
      </div>
      
      <div className="mt-4 text-center">
        <Button variant="link" className="text-primary text-sm font-medium">
          Ver todas as atividades
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

// Helper function to get the border color based on status
function getStatusBorderColor(status: string): string {
  switch (status) {
    case "completed":
      return "border-secondary";
    case "in_progress":
      return "border-primary";
    case "pending":
      return "border-neutral-200";
    default:
      return "border-neutral-200";
  }
}
