import React from 'react'
import { Switch, Route } from 'wouter'
import { AuthProvider } from './contexts/AuthContext'

// Importações preguiçosas para os componentes de página
const AuthPage = React.lazy(() => import('./pages/auth-page'))
const RegisterPage = React.lazy(() => import('./pages/register-page'))
const BrokerDashboard = React.lazy(() => import('./pages/broker-dashboard'))
const ManagerDashboard = React.lazy(() => import('./pages/manager-dashboard'))
const DirectorDashboard = React.lazy(() => import('./pages/director-dashboard'))
const NotFound = React.lazy(() => import('./pages/not-found'))

// Componente para proteger rotas
import { useAuth } from './contexts/AuthContext'

function ProtectedRoute({ 
  children, 
  role
}: { 
  children: React.ReactNode, 
  role?: 'director' | 'manager' | 'broker' 
}) {
  const { user, isLoading } = useAuth()
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }
  
  if (!user) {
    window.location.href = '/auth'
    return null
  }
  
  if (role && user.role !== role) {
    window.location.href = `/${user.role}`
    return null
  }
  
  return <>{children}</>
}

function App() {
  return (
    <AuthProvider>
      <React.Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      }>
        <Switch>
          {/* Rota pública de autenticação */}
          <Route path="/auth">
            <AuthPage />
          </Route>
          
          {/* Rota pública de registro */}
          <Route path="/register">
            <RegisterPage />
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
            <DashboardRedirect />
          </Route>
          
          {/* Rota para página não encontrada */}
          <Route>
            <NotFound />
          </Route>
        </Switch>
      </React.Suspense>
    </AuthProvider>
  )
}

// Componente auxiliar para redirecionar para o dashboard apropriado
function DashboardRedirect() {
  const { user, isLoading } = useAuth()
  
  React.useEffect(() => {
    if (isLoading) return
    
    if (!user) {
      window.location.href = '/auth'
      return
    }
    
    const redirectPath = {
      director: "/director",
      manager: "/manager",
      broker: "/broker"
    }[user.role]
    
    if (redirectPath) {
      window.location.href = redirectPath
    }
  }, [user, isLoading])
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
    </div>
  )
}

export default App
