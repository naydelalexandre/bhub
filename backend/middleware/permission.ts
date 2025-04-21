import { Request, Response, NextFunction } from 'express';

// Tipos de permissões
export enum Permission {
  VIEW_ALL_TEAMS = 'view_all_teams',
  VIEW_OWN_TEAM = 'view_own_team',
  VIEW_GLOBAL_RANKING = 'view_global_ranking',
  VIEW_TEAM_RANKING = 'view_team_ranking',
  VIEW_PERFORMANCE_METRICS = 'view_performance_metrics',
  VIEW_ALL_ACTIVITIES = 'view_all_activities',
  VIEW_TEAM_ACTIVITIES = 'view_team_activities',
  VIEW_OWN_ACTIVITIES = 'view_own_activities',
  VIEW_ALL_DEALS = 'view_all_deals',
  VIEW_TEAM_DEALS = 'view_team_deals',
  VIEW_OWN_DEALS = 'view_own_deals',
  ACCESS_GAMIFICATION = 'access_gamification'
}

// Mapeamento de permissões por tipo de usuário
const permissionsByRole: Record<string, Permission[]> = {
  director: [
    Permission.VIEW_ALL_TEAMS,
    Permission.VIEW_GLOBAL_RANKING,
    Permission.VIEW_TEAM_RANKING,
    Permission.VIEW_PERFORMANCE_METRICS,
    Permission.VIEW_ALL_ACTIVITIES,
    Permission.VIEW_ALL_DEALS,
    Permission.ACCESS_GAMIFICATION
  ],
  manager: [
    Permission.VIEW_OWN_TEAM,
    Permission.VIEW_TEAM_RANKING,
    Permission.VIEW_PERFORMANCE_METRICS,
    Permission.VIEW_TEAM_ACTIVITIES,
    Permission.VIEW_TEAM_DEALS,
    Permission.ACCESS_GAMIFICATION
  ],
  broker: [
    Permission.VIEW_TEAM_RANKING,
    Permission.VIEW_OWN_ACTIVITIES,
    Permission.VIEW_OWN_DEALS,
    Permission.ACCESS_GAMIFICATION
  ]
};

/**
 * Middleware que verifica se o usuário tem a permissão necessária
 * @param requiredPermission Permissão necessária para acessar o recurso
 */
export function requirePermission(requiredPermission: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Não autenticado' });
    }

    const userRole = req.user?.role;
    
    if (!userRole) {
      return res.status(403).json({ message: 'Função de usuário não definida' });
    }

    const userPermissions = permissionsByRole[userRole] || [];
    
    if (userPermissions.includes(requiredPermission)) {
      return next();
    }
    
    return res.status(403).json({ 
      message: 'Acesso negado',
      detail: `Você não tem permissão ${requiredPermission}`
    });
  };
}

/**
 * Verifica se o usuário tem acesso a um recurso específico (atividade, negociação, etc.)
 * - Diretores têm acesso a todos os recursos
 * - Gerentes têm acesso aos recursos de sua equipe (corretores cadastrados por eles)
 * - Corretores têm acesso apenas aos seus próprios recursos
 */
export function canAccessResource(req: Request, resourceUserId: number): boolean {
  if (!req.user) return false;
  
  const { id, role } = req.user;
  
  // Diretores têm acesso a todos os recursos
  if (role === 'director') return true;
  
  // Gestores têm acesso aos recursos da sua equipe
  if (role === 'manager' && req.user.team?.includes(resourceUserId)) return true;
  
  // Corretores têm acesso apenas aos seus próprios recursos
  if (role === 'broker' && id === resourceUserId) return true;
  
  return false;
}

/**
 * Middleware que verifica se o usuário pode acessar um recurso específico
 * Espera que o ID do recurso esteja disponível como req.params.id
 * e que o recurso esteja disponível como req.resource após middleware anterior
 */
export function requireResourceAccess(getUserIdFromResource: (resource: any) => number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.resource) {
      return res.status(404).json({ message: 'Recurso não encontrado' });
    }
    
    const resourceUserId = getUserIdFromResource(req.resource);
    
    if (canAccessResource(req, resourceUserId)) {
      return next();
    }
    
    return res.status(403).json({ message: 'Acesso negado a este recurso' });
  };
} 