import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { Redirect } from "wouter";
import React from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: "director" | "manager" | "broker";
}

export function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
