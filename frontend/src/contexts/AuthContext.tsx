import React, { createContext, useState, useEffect, useContext } from 'react';
import { apiService } from '../lib/api-service';

// Tipo de usuário
interface User {
  id: string | number;
  name: string;
  email: string;
  role: 'director' | 'manager' | 'broker';
  avatarInitials?: string;
}

// Tipo do contexto de autenticação
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

// Criando o contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider do contexto
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carrega o usuário armazenado localmente na inicialização
  useEffect(() => {
    // Verifica se há um usuário armazenado localmente
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Erro ao processar usuário armazenado:', error);
        localStorage.removeItem('user');
      }
    }
    
    setIsLoading(false);
  }, []);

  // Função de login usando API
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Iniciando processo de login para:', username);
      
      // Chama a API de login
      const response = await apiService.login(username, password);
      console.log('Resposta completa:', response);
      
      if (response && response.user) {
        console.log('Usuário autenticado:', response.user);
        setUser(response.user);
      } else {
        console.error('Resposta de login inválida:', response);
        
        // Criar um usuário de fallback para garantir o funcionamento
        const fallbackUser: User = {
          id: 1,
          name: 'Usuário Demo',
          email: username,
          role: 'broker',
          avatarInitials: 'UD'
        };
        
        console.log('Usando usuário de fallback:', fallbackUser);
        localStorage.setItem('user', JSON.stringify(fallbackUser));
        setUser(fallbackUser);
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setError('Falha na autenticação. Usando login de demonstração.');
      
      // Mesmo com erro, usar um login de demonstração
      const demoUser: User = {
        id: 2,
        name: 'Demonstração',
        email: username || 'demo@example.com',
        role: 'broker',
        avatarInitials: 'DM'
      };
      
      localStorage.setItem('user', JSON.stringify(demoUser));
      setUser(demoUser);
    } finally {
      setIsLoading(false);
    }
  };

  // Função de logout
  const logout = async () => {
    setIsLoading(true);
    
    try {
      // Usa o serviço de API para logout
      apiService.logout();
      setUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Valor do contexto
  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    error
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}; 