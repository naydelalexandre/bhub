import React, { useState, useEffect } from 'react';
import { useLocation } from "wouter";
import { useAuth } from '../contexts/AuthContext';
import { useGamification } from '../contexts/GamificationContext';
import { Spinner } from '../components/ui/spinner';
import MainLayout from '../components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { CircleCheck, Target, Calendar, Award, Activity, ArrowRight, TrendingUp, PlusCircle, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import MobileNavigation from '../components/layouts/mobile-navigation';

// Dados de exemplo - em uma aplicação real, seriam buscados da API
const mockActivities = [
  {
    id: 1,
    title: "Captação de Imóvel",
    status: "completed",
    category: "captacao",
    points: 25,
    dueDate: new Date(Date.now() + 86400000),
    createdAt: new Date(),
    assignedTo: 2
  },
  {
    id: 2,
    title: "Visita com cliente",
    status: "in_progress",
    category: "visita",
    points: 15,
    dueDate: new Date(Date.now() + 86400000 * 2),
    createdAt: new Date(),
    assignedTo: 2
  },
  {
    id: 3,
    title: "Reunião de Alinhamento",
    status: "pending",
    category: "tarefa",
    points: 10,
    dueDate: new Date(Date.now() + 86400000 * 3),
    createdAt: new Date(),
    assignedTo: 2
  },
];

// Dados de exemplo para VGN
const mockVgnData = {
  daily: 35000,
  weekly: 180000,
  monthly: 720000,
  target: 1000000,
  history: [
    { date: "2023-07-01", value: 28000 },
    { date: "2023-07-02", value: 32000 },
    { date: "2023-07-03", value: 30000 },
    { date: "2023-07-04", value: 35000 },
    { date: "2023-07-05", value: 38000 },
    { date: "2023-07-06", value: 42000 },
    { date: "2023-07-07", value: 35000 },
  ]
};

// Schema para validação do formulário de VGN
const vgnFormSchema = z.object({
  value: z.string()
    .refine(val => !isNaN(Number(val)), {
      message: "Valor deve ser um número"
    })
    .refine(val => Number(val) > 0, {
      message: "Valor deve ser maior que zero"
    })
});

export default function BrokerDashboard() {
  const { user, isLoading } = useAuth();
  const { profile, isLoadingProfile } = useGamification();
  const [loading, setLoading] = useState(true);
  const [, navigate] = useLocation();
  const [isVgnDialogOpen, setIsVgnDialogOpen] = useState(false);
  const [vgnData, setVgnData] = useState(mockVgnData);

  // Configuração do formulário de VGN
  const vgnForm = useForm<z.infer<typeof vgnFormSchema>>({
    resolver: zodResolver(vgnFormSchema),
    defaultValues: {
      value: vgnData.daily.toString()
    }
  });

  const onSubmitVgn = (values: z.infer<typeof vgnFormSchema>) => {
    // Em uma aplicação real, seria enviado para API
    const newValue = Number(values.value);
    
    setVgnData(prev => ({
      ...prev,
      daily: newValue,
      weekly: prev.weekly - prev.daily + newValue,
      monthly: prev.monthly - prev.daily + newValue,
      history: [...prev.history.slice(0, -1), { date: new Date().toISOString().split('T')[0], value: newValue }]
    }));
    
    setIsVgnDialogOpen(false);
  };

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'broker')) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    // Simula carregamento de dados
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading || !user || loading || isLoadingProfile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  // Calcular estatísticas de atividades
  const completedActivities = mockActivities.filter(a => a.status === "completed");
  const pendingActivities = mockActivities.filter(a => a.status === "pending");
  const inProgressActivities = mockActivities.filter(a => a.status === "in_progress");
  
  // Calcular pontos das atividades
  const activityPoints = completedActivities.reduce((sum, activity) => sum + (activity.points || 0), 0);
  
  // Próximas atividades ordenadas por data
  const upcomingActivities = [...pendingActivities, ...inProgressActivities]
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 3);

  // Formatar valor monetário
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Calcular progresso do VGN em relação à meta
  const vgnProgress = Math.min(Math.round((vgnData.monthly / vgnData.target) * 100), 100);

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <Spinner size="lg" />
        </div>
      ) : user ? (
        <div className="min-h-screen pb-20">
          <MainLayout title="Painel do Corretor">
            {/* Seção de status do perfil */}
            {profile && (
              <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary/20">
                      <AvatarFallback className="bg-primary text-xl text-primary-foreground">
                        {user?.avatarInitials}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <h2 className="text-lg font-semibold">{user.name}</h2>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-primary">{profile.profile.level}</Badge>
                            <span className="text-sm text-gray-500">{activityPoints} pontos em atividades</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="gap-1" onClick={() => navigate('/gamification')}>
                          <Award className="h-4 w-4" />
                          Gamificação
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Progresso para {profile.levelProgress.nextLevel}</span>
                          <span>{profile.levelProgress.currentPoints} / {profile.levelProgress.pointsForNextLevel}</span>
                        </div>
                        <Progress value={profile.levelProgress.progress} className="h-2" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Card de VGN (Volume Geral de Negócios) */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Volume Geral de Negócios
                  </CardTitle>
                  <CardDescription>Atualizado diariamente</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-3xl font-bold text-green-600">{formatCurrency(vgnData.daily)}</div>
                      <div className="text-sm text-gray-500">VGN de hoje</div>
                    </div>
                    <Dialog open={isVgnDialogOpen} onOpenChange={setIsVgnDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="flex items-center gap-1">
                          <Edit className="h-3 w-3" />
                          Atualizar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Atualizar VGN</DialogTitle>
                        </DialogHeader>
                        <Form {...vgnForm}>
                          <form onSubmit={vgnForm.handleSubmit(onSubmitVgn)}>
                            <FormField
                              control={vgnForm.control}
                              name="value"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Valor de VGN (R$)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      placeholder="Ex: 35000" 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <DialogFooter className="mt-4">
                              <Button type="submit">Salvar</Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-sm text-gray-500">Semanal</div>
                      <div className="font-medium">{formatCurrency(vgnData.weekly)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Mensal</div>
                      <div className="font-medium">{formatCurrency(vgnData.monthly)}</div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Meta mensal</span>
                      <span>{formatCurrency(vgnData.monthly)} / {formatCurrency(vgnData.target)}</span>
                    </div>
                    <Progress value={vgnProgress} className="h-2" />
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="ghost" className="w-full text-sm">
                    Ver relatório completo
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Card de Atividades */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-500" />
                    Atividades
                  </CardTitle>
                  <CardDescription>Progresso nas suas tarefas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-500">{completedActivities.length}</div>
                      <div className="text-xs text-gray-500">Concluídas</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-500">{inProgressActivities.length}</div>
                      <div className="text-xs text-gray-500">Em Andamento</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-500">{pendingActivities.length}</div>
                      <div className="text-xs text-gray-500">Pendentes</div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="ghost" className="w-full text-sm" onClick={() => navigate(`/broker/activities`)}>
                    Ver todas as atividades
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Card de Pontos */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-500" />
                    Pontos
                  </CardTitle>
                  <CardDescription>Pontuação e conquistas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-1">{profile?.profile.weeklyPoints || 0}</div>
                    <div className="text-sm text-gray-500 mb-3">Pontos esta semana</div>
                    <div className="flex justify-center gap-1">
                      {[0, 1, 2, 3, 4].map((day) => (
                        <div 
                          key={day}
                          className={`h-2 w-8 rounded-full ${
                            day < (profile?.profile.streak || 0) % 5 ? 'bg-green-500' : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {profile?.profile.streak || 0} dias de atividade
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="ghost" className="w-full text-sm" onClick={() => navigate('/gamification')}>
                    Ver ranking
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Card de Metas */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-500" />
                    Metas
                  </CardTitle>
                  <CardDescription>Seu progresso mensal</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Captações</span>
                        <span className="font-medium">3/5</span>
                      </div>
                      <Progress value={60} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Visitas</span>
                        <span className="font-medium">8/10</span>
                      </div>
                      <Progress value={80} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Vendas</span>
                        <span className="font-medium">1/3</span>
                      </div>
                      <Progress value={33} className="h-2" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="ghost" className="w-full text-sm">
                    Ver detalhes
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Estatísticas VGN (opcional) */}
              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    Evolução de VGN
                  </CardTitle>
                  <CardDescription>Últimos 7 dias</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[140px] flex items-end justify-between">
                    {vgnData.history.map((day, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div className="text-xs text-gray-500 mb-1">{formatShortDate(day.date)}</div>
                        <div 
                          className={`w-8 rounded-t-sm ${day.value === vgnData.daily ? 'bg-green-500' : 'bg-blue-400'}`} 
                          style={{ height: `${(day.value / (Math.max(...vgnData.history.map(d => d.value)) * 1.2)) * 100}px` }}
                        ></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="ghost" className="w-full text-sm">
                    Ver histórico completo
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            {/* Seção de Próximas Atividades */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  Próximas Atividades
                </CardTitle>
                <CardDescription>Atividades pendentes ordenadas por data</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingActivities.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingActivities.map(activity => (
                      <div key={activity.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{activity.title}</h3>
                            <Badge variant="outline" className="text-xs">
                              {getCategoryName(activity.category)}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            Vencimento: {formatDate(activity.dueDate)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-yellow-500 text-white">{activity.points} pts</Badge>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center gap-1"
                          >
                            <CircleCheck className="h-4 w-4" />
                            Concluir
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Nenhuma atividade pendente no momento.
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Ver todas as atividades
                </Button>
              </CardFooter>
            </Card>
          </MainLayout>
          
          <MobileNavigation />
        </div>
      ) : (
        <div className="flex justify-center items-center h-screen">
          <Spinner size="lg" />
        </div>
      )}
    </>
  );
}

function getCategoryName(categoryId: string): string {
  const categories: Record<string, string> = {
    "tarefa": "Tarefa",
    "captacao": "Captação",
    "visita": "Visita",
    "negociacao": "Negociação",
    "fechamento": "Fechamento",
    "pos_venda": "Pós-Venda"
  };
  
  return categories[categoryId] || "Tarefa";
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit'
  }).format(date);
}
