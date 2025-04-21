// Configuração da API para diferentes ambientes

// Determina se estamos em produção (Vercel) ou desenvolvimento
const isProd = typeof window !== 'undefined' && window.location.hostname !== 'localhost';

// URL base da API
export const API_BASE_URL = isProd 
  ? 'https://brokerbooster-api.vercel.app' // URL da API em produção
  : 'http://localhost:3000'; // URL da API em desenvolvimento

// Configura endpoints específicos para cada tipo de usuário
export const USER_ENDPOINTS = {
  broker: '/broker-api',
  manager: '/manager-api',
  director: '/director-api',
};

// URL de login compartilhada
export const LOGIN_ENDPOINT = '/auth/login';

// URL para registro de usuários
export const REGISTER_ENDPOINT = '/auth/register';

// Timeout para requisições em milissegundos
export const API_TIMEOUT = 8000;

// Função para obter headers padrão
export const getDefaultHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// Função para obter o endpoint correto baseado no tipo de usuário
export const getUserEndpoint = (role: 'broker' | 'manager' | 'director') => {
  return USER_ENDPOINTS[role] || USER_ENDPOINTS.broker;
};

// Versão da API
export const API_VERSION = 'v1'; 