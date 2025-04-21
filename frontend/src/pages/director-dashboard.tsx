import React, { useState, useEffect } from 'react';
import { useLocation } from "wouter";
import { useAuth } from '../contexts/AuthContext';
import { Spinner } from '../components/ui/spinner';
import { EmptyState } from '../components/ui/empty-state';
import MobileNavigation from '../components/layouts/mobile-navigation';
import { Button } from '../components/ui/button';

export default function DirectorDashboard() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'director')) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    // Simula carregamento de dados
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
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
          <h1 className="text-2xl font-bold">Painel do Diretor</h1>
          <p className="text-gray-500">Bem-vindo, {user.name}</p>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Card de Estatísticas 1 */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 mb-1">Imóveis Negociados</p>
                <h2 className="text-3xl font-bold">127</h2>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <span className="material-icons text-blue-600">real_estate_agent</span>
              </div>
            </div>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
            </div>
            <p className="text-sm text-gray-500 mt-1">65% da meta</p>
          </div>
          
          {/* Card de Estatísticas 2 */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 mb-1">Faturamento</p>
                <h2 className="text-3xl font-bold">R$ 1.2M</h2>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <span className="material-icons text-green-600">attach_money</span>
              </div>
            </div>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '78%' }}></div>
            </div>
            <p className="text-sm text-gray-500 mt-1">78% da meta</p>
          </div>
          
          {/* Card de Estatísticas 3 */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 mb-1">Desempenho Geral</p>
                <h2 className="text-3xl font-bold">82/100</h2>
              </div>
              <div className="bg-purple-100 p-2 rounded-full">
                <span className="material-icons text-purple-600">leaderboard</span>
              </div>
            </div>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '82%' }}></div>
            </div>
            <p className="text-sm text-gray-500 mt-1">Pontuação atual</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-xl font-bold mb-4">Desempenho por Filial</h2>
          <EmptyState 
            icon="analytics"
            title="Dados sendo carregados" 
            description="Os gráficos de desempenho das filiais estarão disponíveis em breve."
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <h2 className="text-xl font-bold mb-4">Melhores Filiais</h2>
              <div className="space-y-4">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">Filial {index}</h3>
                        <p className="text-sm text-gray-500">São Paulo, SP</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">R$ {(Math.random() * 500000).toFixed(0)}</p>
                        <p className="text-xs text-green-600">↑ 12% mês anterior</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <h2 className="text-xl font-bold mb-4">Notificações</h2>
              <EmptyState 
                icon="notifications"
                title="Nenhuma notificação"
                description="Você não possui notificações não lidas."
              />
            </div>
          </div>
        </div>
      </main>
      
      <MobileNavigation />
    </div>
  );
} 