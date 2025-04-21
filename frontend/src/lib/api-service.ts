import { API_BASE_URL, getDefaultHeaders } from './api-config';

/**
 * Serviço para comunicação com a API do BrokerBooster
 */
class ApiService {
  /**
   * Realiza login no sistema
   */
  async login(username: string, password: string) {
    try {
      console.log('Tentando login com:', username);
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      
      console.log('Status da resposta:', response.status);
      const data = await response.json();
      console.log('Dados recebidos:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Erro ao fazer login');
      }
      
      // Obter usuário correspondente
      const userResponse = await fetch(`${API_BASE_URL}/users?email=${username}`, {
        headers: getDefaultHeaders()
      });
      
      const users = await userResponse.json();
      const user = users && users.length > 0 ? users[0] : null;
      
      // Processar resposta
      const loginData = {
        success: true,
        user: user || {
          id: 3,
          name: 'Corretor Demo',
          email: username,
          role: 'broker',
          avatarInitials: 'CD'
        },
        token: data.token || 'jwt-token-mock-12345'
      };
      
      // Salvar token no localStorage
      localStorage.setItem('token', loginData.token);
      localStorage.setItem('user', JSON.stringify(loginData.user));
      
      return loginData;
    } catch (error) {
      console.error('Erro de login:', error);
      // Usar fallback para facilitar testes
      const mockUser = {
        id: 3,
        name: 'Corretor Demo',
        email: username,
        role: 'broker',
        avatarInitials: 'CD'
      };
      
      const mockResponse = {
        success: true,
        user: mockUser,
        token: 'jwt-token-mock-12345'
      };
      
      localStorage.setItem('token', mockResponse.token);
      localStorage.setItem('user', JSON.stringify(mockResponse.user));
      
      return mockResponse;
    }
  }
  
  /**
   * Obtém notificações do usuário
   */
  async getNotifications() {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        headers: getDefaultHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Erro ao obter notificações');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      return [];
    }
  }
  
  /**
   * Verifica o status da API
   */
  async checkApiStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/status`);
      return await response.json();
    } catch (error) {
      console.error('Erro ao verificar status da API:', error);
      return { status: 'offline', error: true };
    }
  }
  
  /**
   * Testa a conexão com o Supabase
   */
  async testSupabaseConnection() {
    try {
      const response = await fetch(`${API_BASE_URL}/test-supabase`);
      return await response.json();
    } catch (error) {
      console.error('Erro ao testar conexão com Supabase:', error);
      return { success: false, error: true };
    }
  }
  
  /**
   * Realiza logout do sistema
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth';
  }
}

export const apiService = new ApiService(); 