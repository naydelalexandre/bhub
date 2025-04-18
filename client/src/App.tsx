import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import ManagerDashboard from "@/pages/manager-dashboard";
import BrokerDashboard from "@/pages/broker-dashboard";

// Main App component that sets up providers and basic structure
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

// App content that uses authentication context
function AppContent() {
  return (
    <TooltipProvider>
      <Toaster />
      <AppRoutes />
    </TooltipProvider>
  );
}

// Routes component that handles navigation based on auth state
function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={AuthPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/manager" component={ProtectedManagerRoute} />
      <Route path="/broker" component={ProtectedBrokerRoute} />
      <Route component={NotFound} />
    </Switch>
  );
}

// Protected route for manager dashboard
function ProtectedManagerRoute() {
  // Simple placeholder - we'll check auth in each component itself
  return <ManagerDashboard />;
}

// Protected route for broker dashboard
function ProtectedBrokerRoute() {
  // Simple placeholder - we'll check auth in each component itself
  return <BrokerDashboard />;
}

export default App;
