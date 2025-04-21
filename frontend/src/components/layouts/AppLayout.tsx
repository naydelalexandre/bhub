import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { useIsMobile } from '@/hooks/use-mobile';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = React.useState(!isMobile);
  
  // Determinar qual item de menu está ativo com base no caminho
  const isActive = (path: string) => location.startsWith(path);
  
  // Determinar que itens mostrar com base no papel do usuário
  const menuItems = React.useMemo(() => {
    if (!user) return [];
    
    const items = [
      { label: 'Dashboard', path: `/${user.role}`, icon: 'dashboard' },
      { label: 'Atividades', path: `/${user.role}/activities`, icon: 'task_alt' },
    ];
    
    // Adicionar itens específicos por papel
    if (user.role === 'broker') {
      items.push(
        { label: 'Negociações', path: `/${user.role}/deals`, icon: 'handshake' },
        { label: 'Gamificação', path: `/${user.role}/gamification`, icon: 'emoji_events' }
      );
    }
    
    if (user.role === 'manager') {
      items.push(
        { label: 'Negociações', path: `/${user.role}/deals`, icon: 'handshake' },
        { label: 'Equipe', path: `/${user.role}/team`, icon: 'group' },
        { label: 'Gamificação', path: `/${user.role}/gamification`, icon: 'emoji_events' }
      );
    }
    
    if (user.role === 'director') {
      items.push(
        { label: 'Negociações', path: `/${user.role}/deals`, icon: 'handshake' },
        { label: 'Gerentes', path: `/${user.role}/managers`, icon: 'supervised_user_circle' },
        { label: 'Corretores', path: `/${user.role}/brokers`, icon: 'people' },
        { label: 'Gamificação', path: `/${user.role}/gamification`, icon: 'emoji_events' }
      );
    }
    
    return items;
  }, [user, location]);
  
  // Função para navegar
  const navigate = (path: string) => {
    setLocation(path);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };
  
  // Função para fazer logout
  const handleLogout = async () => {
    await logout();
  };
  
  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Sidebar */}
      <aside 
        className={`bg-white shadow-md transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-0 md:w-16'
        } overflow-hidden fixed md:relative h-screen z-50`}
      >
        {/* Logo */}
        <div className="p-4 h-16 flex items-center border-b">
          {sidebarOpen ? (
            <h1 className="text-lg font-bold text-primary">BrokerBooster</h1>
          ) : (
            <span className="text-primary font-bold text-xl mx-auto">BB</span>
          )}
        </div>
        
        {/* Menu Items */}
        <nav className="mt-4">
          <ul>
            {menuItems.map((item) => (
              <li key={item.path} className="mb-1">
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center p-3 ${
                    isActive(item.path)
                      ? 'bg-primary text-white'
                      : 'text-neutral-500 hover:bg-neutral-100'
                  } transition-colors ${sidebarOpen ? 'justify-start' : 'justify-center'}`}
                >
                  <span className="material-icons">{item.icon}</span>
                  {sidebarOpen && <span className="ml-3">{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-neutral-500 mr-4 focus:outline-none"
            >
              <span className="material-icons">
                {sidebarOpen ? 'menu_open' : 'menu'}
              </span>
            </button>
            <h1 className="text-lg font-medium text-neutral-700">
              {menuItems.find(item => isActive(item.path))?.label || 'Dashboard'}
            </h1>
          </div>
          
          {/* User Menu */}
          <div className="flex items-center">
            <div className="hidden md:flex items-center mr-4">
              <div className="mr-2 text-right">
                <p className="text-sm font-medium text-neutral-700">{user?.name}</p>
                <p className="text-xs text-neutral-500 capitalize">{user?.role}</p>
              </div>
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center">
                {user?.avatarInitials}
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="text-neutral-500 p-2 hover:bg-neutral-100 rounded-full"
            >
              <span className="material-icons">logout</span>
            </button>
          </div>
        </header>
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-neutral-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout; 