import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { GamificationProvider } from "@/contexts/GamificationContext";
import { Loader2 } from "lucide-react";
import AppRoutes from "@/lib/routes";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

// Cliente de Query para o React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Main App component that sets up providers and basic structure
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

// App content that uses authentication context
function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Após verificar o status de autenticação, inicialize o provider de gamificação
  useEffect(() => {
    if (!isLoading) {
      // Terminamos de inicializar quando o status de autenticação é conhecido
      setIsInitializing(false);
    }
  }, [isLoading]);
  
  // Tela de carregamento durante a inicialização
  if (isInitializing) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-xl font-medium">Carregando...</span>
      </div>
    );
  }
  
  return (
    <TooltipProvider>
      <Toaster />
      {isAuthenticated ? (
        <GamificationProvider>
          <AppRoutes />
        </GamificationProvider>
      ) : (
        <AppRoutes />
      )}
    </TooltipProvider>
  );
}

export default App;
