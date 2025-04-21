import React, { useState, useEffect } from 'react';
import { useLocation } from "wouter";
import { useAuth } from '../contexts/AuthContext';
import Spinner from '../components/Spinner';
import MainLayout from '../components/layouts/MainLayout';

export default function BrokerDashboard() {
  const { user, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'broker')) {
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
    <MainLayout title="Painel do Corretor">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Card de Estatísticas 1 */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 mb-1">Imóveis Vendidos</p>
              <h2 className="text-3xl font-bold">12</h2>
            </div>
            <div className="bg-blue-100 p-2 rounded-full">
              <span className="material-icons text-blue-600">real_estate_agent</span>
            </div>
          </div>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
          </div>
          <p className="text-sm text-gray-500 mt-1">60% da meta</p>
        </div>
        
        {/* Card de Estatísticas 2 */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 mb-1">Comissões</p>
              <h2 className="text-3xl font-bold">R$ 36.500</h2>
            </div>
            <div className="bg-green-100 p-2 rounded-full">
              <span className="material-icons text-green-600">payments</span>
            </div>
          </div>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full" style={{ width: '73%' }}></div>
          </div>
          <p className="text-sm text-gray-500 mt-1">73% da meta</p>
        </div>
        
        {/* Card de Estatísticas 3 */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 mb-1">Pontuação</p>
              <h2 className="text-3xl font-bold">820</h2>
            </div>
            <div className="bg-purple-100 p-2 rounded-full">
              <span className="material-icons text-purple-600">emoji_events</span>
            </div>
          </div>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-purple-600 h-2 rounded-full" style={{ width: '82%' }}></div>
          </div>
          <p className="text-sm text-gray-500 mt-1">Nível atual: Experiente</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-xl font-bold mb-4">Suas Atividades</h2>
        <p className="text-gray-500">Sem atividades pendentes no momento.</p>
      </div>
    </MainLayout>
  );
}
