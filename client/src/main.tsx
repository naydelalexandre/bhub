import { createRoot } from "react-dom/client";
import "./index.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";

// Simple component to display on the page
function TestApp() {
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
        <form className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input 
              type="email" 
              className="w-full p-2 border border-neutral-200 rounded-md" 
              placeholder="seu@email.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Senha</label>
            <input 
              type="password" 
              className="w-full p-2 border border-neutral-200 rounded-md" 
              placeholder="••••••••" 
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
            <button className="text-sm text-primary">
              Esqueceu a senha?
            </button>
          </div>
          <button 
            type="submit" 
            className="w-full bg-primary text-white py-2 rounded-md"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <TooltipProvider>
    <Toaster />
    <TestApp />
  </TooltipProvider>
);
