import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import ManagerDashboard from "@/pages/manager-dashboard";
import BrokerDashboard from "@/pages/broker-dashboard";
import { ProtectedRoute } from "@/lib/protected-route";
import { useAuth } from "./hooks/use-auth";

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <AppRoutes />
    </TooltipProvider>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      
      <ProtectedRoute 
        path="/" 
        component={() => user?.role === 'manager' ? <ManagerDashboard /> : <BrokerDashboard />} 
      />
      
      <ProtectedRoute 
        path="/manager" 
        component={() => <ManagerDashboard />} 
      />
      
      <ProtectedRoute 
        path="/broker" 
        component={() => <BrokerDashboard />} 
      />
      
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
