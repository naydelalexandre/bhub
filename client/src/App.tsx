import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import ManagerDashboard from "@/pages/manager-dashboard";
import BrokerDashboard from "@/pages/broker-dashboard";

function App() {
  const { user, isLoading } = useAuth();

  // Simple loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Toaster />
      <Switch>
        {/* If user is not logged in or on auth pages, show auth page */}
        <Route path="/" component={AuthPage} />
        <Route path="/auth" component={AuthPage} />
        
        {/* Manager route - only show if user is a manager */}
        <Route path="/manager">
          {user && user.role === "manager" ? <ManagerDashboard /> : <AuthPage />}
        </Route>
        
        {/* Broker route - only show if user is a broker */}
        <Route path="/broker">
          {user && user.role === "broker" ? <BrokerDashboard /> : <AuthPage />}
        </Route>
        
        <Route component={NotFound} />
      </Switch>
    </TooltipProvider>
  );
}

export default App;
