import React, { useState } from 'react';
import { useGamification } from '@/contexts/GamificationContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AchievementCard } from '@/components/gamification/achievement-card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Trophy, 
  Calendar, 
  Clock, 
  Users, 
  Award,
  Search
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Componente para exibir o perfil e estatísticas de gamificação do usuário
export default function GamificationPage() {
  const { user } = useAuth();
  const { 
    profile, 
    achievements, 
    weeklyRanking, 
    pointsHistory,
    isLoadingProfile,
    isLoadingAchievements
  } = useGamification();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Função para obter categorias únicas
  const getUniqueCategories = () => {
    const categories = achievements.map(achievement => achievement.category);
    return ['all', ...Array.from(new Set(categories))];
  };
  
  // Filtrar conquistas com base no termo de busca e categoria
  const filteredAchievements = achievements.filter(achievement => {
    const matchesSearch = searchTerm === '' || 
      achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      achievement.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || 
      achievement.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
  // Agrupar conquistas por status (completadas/em andamento)
  const completedAchievements = filteredAchievements.filter(a => a.completed);
  const inProgressAchievements = filteredAchievements.filter(a => !a.completed);
  
  // Calcular estatísticas de conquistas
  const achievementStats = {
    total: achievements.length,
    completed: completedAchievements.length,
    percentComplete: achievements.length 
      ? Math.round((completedAchievements.length / achievements.length) * 100) 
      : 0
  };
  
  // Se os dados estão carregando, exibir esqueletos
  if (isLoadingProfile || isLoadingAchievements) {
    return (
      <div className="container mx-auto py-8 space-y-8">
        <Skeleton className="h-[200px] w-full rounded-xl" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-[120px] rounded-xl" />
          <Skeleton className="h-[120px] rounded-xl" />
          <Skeleton className="h-[120px] rounded-xl" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }
  
  // Se não há perfil, mostrar uma mensagem
  if (!profile) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Perfil não encontrado</h2>
            <p className="text-muted-foreground">
              Não foi possível carregar o perfil de gamificação. Por favor, tente novamente mais tarde.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Perfil e progresso */}
      <Card className="border-0 shadow-md bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-4 border-white shadow-sm">
                <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
                  {user?.avatarInitials}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h1 className="text-2xl font-bold">{user?.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-blue-500 hover:bg-blue-600">
                    Nível {profile.profile.level}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {user?.role === 'broker' && 'Corretor'}
                    {user?.role === 'manager' && 'Gerente'}
                    {user?.role === 'director' && 'Diretor'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col justify-center w-full md:w-1/2">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Progresso para {profile.levelProgress.nextLevel || 'Nível Máximo'}
                </span>
                <span className="text-sm font-medium">
                  {profile.levelProgress.currentPoints} / {profile.levelProgress.pointsForNextLevel} pontos
                </span>
              </div>
              <Progress value={profile.levelProgress.progress} className="h-2.5" />
              <span className="text-xs text-muted-foreground mt-2">
                {profile.levelProgress.progress}% completo
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Cards de estatísticas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Pontos</p>
                <h3 className="text-2xl font-bold">{profile.profile.totalPoints}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-full">
                <Trophy className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Conquistas</p>
                <h3 className="text-2xl font-bold">
                  {achievementStats.completed}/{achievementStats.total}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-100 rounded-full">
                <Calendar className="h-6 w-6 text-purple-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pontos Semanais</p>
                <h3 className="text-2xl font-bold">{profile.profile.weeklyPoints}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-orange-100 rounded-full">
                <Clock className="h-6 w-6 text-orange-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sequência</p>
                <h3 className="text-2xl font-bold">{profile.profile.streak} dias</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Conquistas e Ranking */}
      <Tabs defaultValue="achievements" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="achievements" className="gap-2">
            <Award className="h-4 w-4" /> Conquistas
          </TabsTrigger>
          <TabsTrigger value="ranking" className="gap-2">
            <Users className="h-4 w-4" /> Ranking
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <Clock className="h-4 w-4" /> Histórico
          </TabsTrigger>
        </TabsList>
        
        {/* Aba de Conquistas */}
        <TabsContent value="achievements" className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar conquistas..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select 
              value={categoryFilter} 
              onValueChange={(value) => setCategoryFilter(value)}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                {getUniqueCategories().map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'Todas as categorias' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {filteredAchievements.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
              <h3 className="mt-4 text-lg font-medium">Nenhuma conquista encontrada</h3>
              <p className="text-muted-foreground mt-2">
                Tente ajustar seus filtros ou buscar por outro termo.
              </p>
            </div>
          ) : (
            <>
              {completedAchievements.length > 0 && (
                <>
                  <h3 className="text-lg font-medium mt-6 mb-4">
                    Conquistas completas ({completedAchievements.length})
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {completedAchievements.map((achievement) => (
                      <AchievementCard key={achievement.id} achievement={achievement} />
                    ))}
                  </div>
                </>
              )}
              
              {inProgressAchievements.length > 0 && (
                <>
                  <h3 className="text-lg font-medium mt-8 mb-4">
                    Em progresso ({inProgressAchievements.length})
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {inProgressAchievements.map((achievement) => (
                      <AchievementCard key={achievement.id} achievement={achievement} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </TabsContent>
        
        {/* Aba de Ranking */}
        <TabsContent value="ranking">
          <Card>
            <CardHeader>
              <CardTitle>Ranking Semanal</CardTitle>
            </CardHeader>
            <CardContent>
              {weeklyRanking.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                  <p className="mt-4 text-muted-foreground">
                    Nenhum dado de ranking disponível no momento.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {weeklyRanking.map((entry, index) => (
                    <div 
                      key={entry.userId} 
                      className={`flex items-center p-4 rounded-lg ${
                        entry.userId === user?.id ? 'bg-blue-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-8 font-bold text-center">
                        {entry.position || index + 1}
                      </div>
                      <Avatar className="h-10 w-10 mx-4">
                        <AvatarFallback className="bg-primary">
                          {entry.avatarInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{entry.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Nível {entry.level}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{entry.weeklyPoints}</p>
                        <p className="text-xs text-muted-foreground">pontos</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Aba de Histórico */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Pontos</CardTitle>
            </CardHeader>
            <CardContent>
              {pointsHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                  <p className="mt-4 text-muted-foreground">
                    Nenhum histórico de pontos disponível no momento.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pointsHistory.map((entry) => {
                    const date = new Date(entry.createdAt);
                    return (
                      <div 
                        key={entry.id} 
                        className="flex items-center justify-between p-4 border-b last:border-b-0"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{entry.reason}</p>
                          <p className="text-sm text-muted-foreground">
                            {date.toLocaleDateString('pt-BR')} às {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className={`font-bold ${entry.points >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {entry.points > 0 ? '+' : ''}{entry.points}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 