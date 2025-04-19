import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { User } from '../../shared/schema';

// Middleware para autenticar o usuário
export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  // Verificar se há um usuário autenticado na sessão
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ message: 'Não autorizado' });
  }
  
  try {
    // O objeto req.user deve ser definido pelo sistema de autenticação
    // Assumindo que após o login, o usuário foi adicionado ao objeto req
    const user = req.user;
    
    if (!user || !user.id) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    
    // Podemos validar se o usuário ainda existe no armazenamento
    const userExists = await storage.getUser(user.id);
    if (!userExists) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }
    
    // Se chegou até aqui, o usuário está autenticado
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(500).json({ message: 'Erro no servidor durante autenticação' });
  }
}

// Middleware para verificar se o usuário é gerente
export const requireManagerRole = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: 'Não autorizado' });
  }
  
  if (req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Acesso proibido: Apenas gerentes podem acessar este recurso' });
  }
  
  next();
}

// Adicionar tipos ao express Request
declare global {
  namespace Express {
    interface Request {
      isAuthenticated(): boolean;
      user: User;
    }
  }
} 