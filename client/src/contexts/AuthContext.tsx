import React, { createContext, useState, useEffect, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { User } from '@shared/schema';

// Definindo o tipo para o contexto de autenticação
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
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Consulta para buscar o usuário atual
  const { data: user, isLoading, error: queryError } = useQuery<User | null>({
    queryKey: ['/api/auth/me'],
    staleTime: 1000 * 60 * 5, // 5 minutos
    // Quando há erro de autenticação, retorna null em vez de lançar erro
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/auth/me');
        return await response.json();
      } catch (error: any) { // Tipando o erro como any para acessar a propriedade message
        // Se for um erro 401, retornamos null (usuário não autenticado)
        if (error.message.includes('401')) {
          return null;
        }
        throw error;
      }
    }
  });

  // Mutation para login
  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const response = await apiRequest('POST', '/api/auth/login', { username, password });
      return response.json();
    },
    onSuccess: () => {
      // Ao fazer login com sucesso, invalidamos a query para buscar os dados atualizados
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      setError(null);
    },
    onError: (error: Error) => {
      setError('Credenciais inválidas. Tente novamente.');
    }
  });

  // Mutation para logout
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/auth/logout');
    },
    onSuccess: () => {
      // Ao fazer logout, invalidamos a query
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      // E redirecionamos para a página de login
      window.location.href = '/auth';
    }
  });

  // Função de login
  const login = async (username: string, password: string) => {
    await loginMutation.mutateAsync({ username, password });
  };

  // Função de logout
  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  // Exibe erros da consulta
  useEffect(() => {
    if (queryError) {
      setError('Erro ao verificar autenticação. Por favor, recarregue a página.');
    }
  }, [queryError]);

  // Valor do contexto
  const value: AuthContextType = {
    user: user || null,
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