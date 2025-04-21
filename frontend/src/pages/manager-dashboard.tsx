import React, { useState, useEffect } from 'react';
import { useLocation } from "wouter";
import { useAuth } from '../contexts/AuthContext';
import { Spinner } from '../components/ui/spinner';
import MobileNavigation from '../components/layouts/mobile-navigation';

export default function ManagerDashboard() {
  const { user, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'manager')) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    // Simula carregamento de dados
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading || !user || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white shadow-sm p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Painel do Gerente</h1>
          <p className="text-gray-500">Bem-vindo, {user.name}</p>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Card de Estatísticas 1 */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 mb-1">Equipe</p>
                <h2 className="text-3xl font-bold">8 corretores</h2>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <span className="material-icons text-blue-600">group</span>
              </div>
            </div>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '80%' }}></div>
            </div>
            <p className="text-sm text-gray-500 mt-1">80% ativos</p>
          </div>
          
          {/* Card de Estatísticas 2 */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 mb-1">Vendas da Equipe</p>
                <h2 className="text-3xl font-bold">R$ 1.2M</h2>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <span className="material-icons text-green-600">trending_up</span>
              </div>
            </div>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '65%' }}></div>
            </div>
            <p className="text-sm text-gray-500 mt-1">65% da meta</p>
          </div>
          
          {/* Card de Estatísticas 3 */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 mb-1">Atividades</p>
                <h2 className="text-3xl font-bold">23 pendentes</h2>
              </div>
              <div className="bg-amber-100 p-2 rounded-full">
                <span className="material-icons text-amber-600">event_note</span>
              </div>
            </div>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-amber-600 h-2 rounded-full" style={{ width: '70%' }}></div>
            </div>
            <p className="text-sm text-gray-500 mt-1">70% completadas</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-xl font-bold mb-4">Desempenho da Equipe</h2>
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500">Gráfico de desempenho será exibido aqui</p>
          </div>
        </div>
      </main>
      
      <MobileNavigation />
    </div>
  );
}
