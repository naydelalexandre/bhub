import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Redirect } from 'wouter';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: 'director' | 'manager' | 'broker';
}

export function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Redirect to="/auth" />;
  }
  
  // Se uma role específica foi solicitada, verifica se o usuário tem essa role
  if (role && user.role !== role) {
    return <Redirect to={`/${user.role}`} />;
  }
  
  return <>{children}</>;
}
