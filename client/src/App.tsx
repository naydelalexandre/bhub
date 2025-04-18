import { Switch, Route, Link } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import ManagerDashboard from "@/pages/manager-dashboard";
import BrokerDashboard from "@/pages/broker-dashboard";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Basic app component as a test
function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <div className="p-8">
        <h1 className="text-3xl font-bold text-center">Sistema de Gestão de Corretores</h1>
        <div className="mt-8">
          <Switch>
            <Route path="/" component={() => (
              <AuthPage />
            )} />
            <Route path="/auth" component={AuthPage} />
            <Route path="/manager" component={ManagerDashboard} />
            <Route path="/broker" component={BrokerDashboard} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default App;
