import React, { useState } from 'react';
import { useIsMobile } from '../../hooks/use-media-query';
import { useAuth } from '../../contexts/AuthContext';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function MainLayout({ 
  children, 
  title = 'BrokerBooster' 
}: MainLayoutProps) {
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {isMobile && (
              <button 
                onClick={toggleMenu}
                className="text-gray-700 hover:text-blue-600 focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <h1 className="text-xl md:text-2xl font-bold text-blue-600">{title}</h1>
          </div>
          
          {user && (
            <div className="flex items-center space-x-2">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role === 'broker' ? 'Corretor' : user.role === 'manager' ? 'Gerente' : 'Diretor'}</p>
              </div>
              <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                {user.avatarInitials || user.name.substring(0, 2).toUpperCase()}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Sidebar para mobile (quando aberta) */}
      {isMobile && menuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20">
          <div className="bg-white w-64 h-full shadow-lg p-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-blue-600">Menu</h2>
              <button 
                onClick={toggleMenu}
                className="text-gray-700 hover:text-red-600 focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <MobileNavigation onItemClick={() => setMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Layout principal */}
      <div className="flex flex-1">
        {/* Sidebar para desktop */}
        {!isMobile && (
          <aside className="w-64 bg-white shadow-sm h-full p-4 hidden md:block">
            <DesktopNavigation />
          </aside>
        )}
        
        {/* Conteúdo principal */}
        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
      
      {/* Footer */}
      <footer className="bg-white shadow-sm p-4 mt-auto">
        <div className="container mx-auto text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} BrokerBooster - Sistema de Gamificação para Corretores
        </div>
      </footer>
    </div>
  );
}

// Componente de navegação para mobile
function MobileNavigation({ onItemClick }: { onItemClick: () => void }) {
  const { logout } = useAuth();
  
  return (
    <nav className="space-y-2">
      <NavItem href="/" label="Dashboard" icon="dashboard" onClick={onItemClick} />
      <NavItem href="/perfil" label="Meu Perfil" icon="person" onClick={onItemClick} />
      <NavItem href="/gamificacao" label="Gamificação" icon="emoji_events" onClick={onItemClick} />
      <NavItem href="/imoveis" label="Imóveis" icon="home" onClick={onItemClick} />
      <NavItem href="/clientes" label="Clientes" icon="people" onClick={onItemClick} />
      <NavItem href="/notificacoes" label="Notificações" icon="notifications" onClick={onItemClick} />
      <div className="pt-4 mt-4 border-t border-gray-200">
        <button
          onClick={() => {
            logout();
            onItemClick();
          }}
          className="flex items-center space-x-2 w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-md"
        >
          <span className="material-icons">logout</span>
          <span>Sair</span>
        </button>
      </div>
    </nav>
  );
}

// Componente de navegação para desktop
function DesktopNavigation() {
  return (
    <nav className="space-y-2">
      <NavItem href="/" label="Dashboard" icon="dashboard" />
      <NavItem href="/perfil" label="Meu Perfil" icon="person" />
      <NavItem href="/gamificacao" label="Gamificação" icon="emoji_events" />
      <NavItem href="/imoveis" label="Imóveis" icon="home" />
      <NavItem href="/clientes" label="Clientes" icon="people" />
      <NavItem href="/notificacoes" label="Notificações" icon="notifications" />
      <div className="pt-4 mt-4 border-t border-gray-200">
        <LogoutButton />
      </div>
    </nav>
  );
}

// Componente de item de navegação
function NavItem({ 
  href, 
  label, 
  icon, 
  onClick 
}: { 
  href: string; 
  label: string; 
  icon: string;
  onClick?: () => void;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md"
    >
      <span className="material-icons">{icon}</span>
      <span>{label}</span>
    </a>
  );
}

// Componente de botão de logout
function LogoutButton() {
  const { logout } = useAuth();
  
  return (
    <button
      onClick={logout}
      className="flex items-center space-x-2 w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-md"
    >
      <span className="material-icons">logout</span>
      <span>Sair</span>
    </button>
  );
} 