import { createRoot } from "react-dom/client";
import { useState } from "react";
import "./index.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";

// Simple Dashboard Component
function Dashboard({ userRole, userName, onLogout }: { userRole: string, userName: string, onLogout: () => void }) {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <header className="bg-white border-b p-4 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold text-primary">Plataforma de Performance</h1>
          <div className="flex items-center gap-4">
            <span>Olá, {userName}</span>
            <button 
              onClick={onLogout}
              className="px-3 py-1 bg-neutral-100 rounded-md hover:bg-neutral-200"
            >
              Sair
            </button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-6 flex-1">
        <h2 className="text-2xl font-bold mb-6">
          {userRole === 'manager' ? 'Dashboard do Gestor' : 'Dashboard do Corretor'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-medium mb-4">Desempenho Geral</h3>
            <div className="h-40 bg-neutral-100 rounded-lg flex items-center justify-center">
              Gráfico de Desempenho
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-medium mb-4">Atividades Recentes</h3>
            <ul className="space-y-2">
              <li className="p-2 border-b">Reunião com cliente</li>
              <li className="p-2 border-b">Visita ao imóvel</li>
              <li className="p-2">Envio de proposta</li>
            </ul>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-medium mb-4">Negociações Ativas</h3>
            <ul className="space-y-2">
              <li className="p-2 border-b">Apartamento Jardins</li>
              <li className="p-2 border-b">Casa Vila Mariana</li>
              <li className="p-2">Escritório Paulista</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

// Login Component
function LoginForm({ onLogin }: { onLogin: (email: string, role: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (email === "manager@example.com" && password === "password") {
      onLogin(email, "manager");
    } else if (email === "broker@example.com" && password === "password") {
      onLogin(email, "broker");
    } else {
      alert("Credenciais inválidas. Use manager@example.com ou broker@example.com com senha 'password'");
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-100">
      <div className="w-full max-w-md p-8 shadow-lg rounded-xl bg-white">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-primary mb-1">
            Plataforma de Performance
          </h1>
          <p className="text-muted-foreground">
            Gestão de atividades e negociações
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input 
              type="email" 
              className="w-full p-2 border border-neutral-200 rounded-md" 
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Senha</label>
            <input 
              type="password" 
              className="w-full p-2 border border-neutral-200 rounded-md" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="remember" 
              />
              <label htmlFor="remember" className="text-sm text-muted-foreground">
                Lembrar-me
              </label>
            </div>
            <button type="button" className="text-sm text-primary">
              Esqueceu a senha?
            </button>
          </div>
          <button 
            type="submit" 
            className="w-full bg-primary text-white py-2 rounded-md"
          >
            Entrar
          </button>
          <div className="text-sm text-center text-neutral-500 mt-4">
            <p>Credenciais de teste:</p>
            <p>Manager: manager@example.com / password</p>
            <p>Broker: broker@example.com / password</p>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main App Component
function TestApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("");
  
  const handleLogin = (email: string, role: string) => {
    setUserEmail(email);
    setUserRole(role);
    setIsAuthenticated(true);
  };
  
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserEmail("");
    setUserRole("");
  };
  
  return (
    <>
      {isAuthenticated ? (
        <Dashboard 
          userRole={userRole} 
          userName={userEmail.split('@')[0]} 
          onLogout={handleLogout} 
        />
      ) : (
        <LoginForm onLogin={handleLogin} />
      )}
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <TooltipProvider>
    <Toaster />
    <TestApp />
  </TooltipProvider>
);
