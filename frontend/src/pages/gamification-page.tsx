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

// Componente principal para visualização do perfil e sistema de gamificação
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
  
  // Obter as categorias disponíveis para filtro
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
  
  // Agrupar conquistas por status
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
  
  // Exibir indicadores de carregamento
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
  
  // Mensagem quando os dados do perfil não estão disponíveis
  if (!profile) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Perfil não disponível</h2>
            <p className="text-muted-foreground">
              Não foi possível carregar seu perfil de gamificação. Tente novamente em alguns instantes.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Cartão de perfil e barra de progresso */}
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
                  Progresso para o {profile.levelProgress.nextLevel || 'Nível Máximo'}
                </span>
                <span className="text-sm font-medium">
                  {profile.levelProgress.currentPoints} / {profile.levelProgress.pointsForNextLevel} pontos
                </span>
              </div>
              <Progress value={profile.levelProgress.progress} className="h-2.5" />
              <span className="text-xs text-muted-foreground mt-2">
                {profile.levelProgress.progress}% concluído
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Resumo de estatísticas */}
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
                <p className="text-sm text-muted-foreground">Dias Ativos</p>
                <h3 className="text-2xl font-bold">{profile.profile.streak} dias</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Abas: Conquistas, Ranking e Histórico */}
      <Tabs defaultValue="achievements" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="achievements" className="gap-2">
            <Award className="h-4 w-4" /> Minhas Conquistas
          </TabsTrigger>
          <TabsTrigger value="ranking" className="gap-2">
            <Users className="h-4 w-4" /> Ranking da Equipe
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <Clock className="h-4 w-4" /> Histórico de Pontos
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
          
          {/* Barra de progresso das conquistas */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold">Progresso das Conquistas</h3>
                  <p className="text-sm text-muted-foreground">
                    Você completou {achievementStats.completed} de {achievementStats.total} conquistas disponíveis
                  </p>
                </div>
                <Badge className="self-start md:self-center">
                  {achievementStats.percentComplete}% Concluído
                </Badge>
              </div>
              
              <Progress 
                value={achievementStats.percentComplete} 
                className="h-2.5"
              />
            </CardContent>
          </Card>
          
          {/* Lista de conquistas completadas */}
          {completedAchievements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Conquistas Completadas</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {completedAchievements.map((achievement) => (
                  <AchievementCard 
                    key={achievement.id} 
                    achievement={achievement} 
                  />
                ))}
              </CardContent>
            </Card>
          )}
          
          {/* Lista de conquistas em andamento */}
          {inProgressAchievements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Conquistas em Andamento</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {inProgressAchievements.map((achievement) => (
                  <AchievementCard 
                    key={achievement.id} 
                    achievement={achievement} 
                  />
                ))}
              </CardContent>
            </Card>
          )}
          
          {/* Mensagem quando não há conquistas */}
          {filteredAchievements.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-bold mb-2">Nenhuma conquista encontrada</h3>
                <p className="text-muted-foreground">
                  Não foram encontradas conquistas com os filtros selecionados. Tente ajustar seus critérios de busca.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Aba de Ranking */}
        <TabsContent value="ranking">
          <Card>
            <CardHeader>
              <CardTitle>Ranking Semanal da Equipe</CardTitle>
            </CardHeader>
            <CardContent>
              {weeklyRanking.length === 0 ? (
                <div className="text-center p-8">
                  <h3 className="text-lg font-bold mb-2">Sem dados disponíveis</h3>
                  <p className="text-muted-foreground">
                    Ranking não disponível no momento.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {weeklyRanking.map((entry, index) => (
                    <div 
                      key={entry.userId}
                      className={`flex items-center p-3 rounded-lg border ${
                        entry.userId === user?.id ? 'bg-blue-50 border-blue-200' : 'border-gray-100'
                      }`}
                    >
                      <div className={`
                        w-8 h-8 flex items-center justify-center rounded-full mr-3 font-semibold
                        ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                          index === 1 ? 'bg-gray-100 text-gray-700' :
                          index === 2 ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-50 text-blue-700'}
                      `}>
                        {entry.position || index + 1}
                      </div>
                      
                      <Avatar className="h-9 w-9 mr-3">
                        <AvatarFallback>
                          {entry.avatarInitials}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center">
                          <p className="text-sm font-medium">
                            {entry.name}
                          </p>
                          {entry.userId === user?.id && (
                            <Badge variant="outline" className="ml-2 text-xs">Você</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Nível {entry.level}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm font-bold">{entry.weeklyPoints} pts</p>
                        <p className="text-xs text-muted-foreground">
                          Total: {entry.totalPoints} pts
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Aba de Histórico de Pontos */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Pontos</CardTitle>
            </CardHeader>
            <CardContent>
              {pointsHistory.length === 0 ? (
                <div className="text-center p-8">
                  <h3 className="text-lg font-bold mb-2">Nenhum histórico disponível</h3>
                  <p className="text-muted-foreground">
                    Seus pontos serão registrados aqui conforme você realiza atividades no sistema.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pointsHistory.map((entry) => (
                    <div 
                      key={entry.id}
                      className="flex items-start p-3 rounded-lg border border-gray-100"
                    >
                      <div className={`
                        p-2 rounded-full mr-3
                        ${entry.sourceType === 'activity' ? 'bg-green-100 text-green-700' :
                          entry.sourceType === 'deal' ? 'bg-blue-100 text-blue-700' :
                          entry.sourceType === 'achievement' ? 'bg-purple-100 text-purple-700' :
                          entry.sourceType === 'bonus' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-700'}
                      `}>
                        {entry.sourceType === 'activity' && <Calendar className="h-5 w-5" />}
                        {entry.sourceType === 'deal' && <TrendingUp className="h-5 w-5" />}
                        {entry.sourceType === 'achievement' && <Trophy className="h-5 w-5" />}
                        {entry.sourceType === 'bonus' && <Award className="h-5 w-5" />}
                        {!['activity', 'deal', 'achievement', 'bonus'].includes(entry.sourceType || '') && 
                          <Clock className="h-5 w-5" />
                        }
                      </div>
                      
                      <div className="flex-1">
                        <p className="text-sm font-medium">{entry.reason}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(entry.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className={`text-sm font-bold ${
                          entry.points > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {entry.points > 0 ? '+' : ''}{entry.points} pts
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 