import { Route, Switch } from "wouter";
import AuthPage from "@/pages/auth-page";
import BrokerDashboard from "@/pages/broker-dashboard";
import ManagerDashboard from "@/pages/manager-dashboard";
import DirectorDashboard from "@/pages/director-dashboard";
import GamificationPage from "@/pages/gamification-page";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "@/lib/protected-route";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { AppLayout } from "@/components/layouts/app-layout";

// Componente de rotas da aplicação
const AppRoutes = () => {
  return (
    <Switch>
      {/* Rota pública de autenticação */}
      <Route path="/auth" component={AuthPage} />
      
      {/* Rota para página de gamificação */}
      <Route path="/gamification">
        <ProtectedRoute>
          <AppLayout>
            <GamificationPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      
      {/* Dashboards protegidos por papel do usuário */}
      <Route path="/broker">
        <ProtectedRoute role="broker">
          <BrokerDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/manager">
        <ProtectedRoute role="manager">
          <ManagerDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/director">
        <ProtectedRoute role="director">
          <DirectorDashboard />
        </ProtectedRoute>
      </Route>
      
      {/* Redirecionamento para o dashboard apropriado */}
      <Route path="/">
        <ProtectedRoute>
          <DashboardRedirect />
        </ProtectedRoute>
      </Route>
      
      {/* Rota para página não encontrada */}
      <Route component={NotFound} />
    </Switch>
  );
};

// Componente auxiliar para redirecionar para o dashboard apropriado
const DashboardRedirect = () => {
  const { user } = useAuth();
  
  // Efeito para redirecionar com base no papel do usuário
  useEffect(() => {
    if (!user) return;
    
    const redirectPath = {
      director: "/director",
      manager: "/manager",
      broker: "/broker"
    }[user.role];
    
    if (redirectPath) {
      window.location.href = redirectPath;
    }
  }, [user]);
  
  return <div>Redirecionando...</div>;
};

export default AppRoutes; 