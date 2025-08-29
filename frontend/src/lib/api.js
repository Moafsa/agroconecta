import { API_BASE_URL } from '../config/api.js';

// --- Requisição para Usuários (Clientes/Profissionais) ---
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  console.log(`[API Request] Endpoint: ${endpoint}`);
  console.log(`[API Request] Token from localStorage: ${token}`);

  const url = `${API_BASE_URL}${endpoint}`; // Adiciona esta linha

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('[API Request] Authorization header set.');
  } else if (!endpoint.includes('/public/') && !endpoint.includes('/auth/')) {
    console.error('[API Request] Access token is required but not found.');
    throw new Error('Token de acesso requerido');
  }

  try {
    const response = await fetch(url, { // Garante que 'url' seja usado aqui
      ...options,
      headers,
    });
    const data = await response.json();
    if (!response.ok) {
      // Pass the whole data object in the error
      throw { status: response.status, ...data };
    }
    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// --- Requisição para Administradores ---
const adminApiRequest = async (endpoint, options = {}) => {
  // Use 'adminToken' for admins
  const token = localStorage.getItem('adminToken'); 
  
  let url = `${API_BASE_URL}${endpoint}`;
  
  // Constrói a query string se houver parâmetros
  if (options.params) {
    const queryParams = new URLSearchParams();
    // Filtra apenas os parâmetros que têm valor
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, value);
      }
    });
    const queryString = queryParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };

  try {
    const response = await fetch(url, { ...options, headers });
    const data = await response.json();
    if (!response.ok) {
        throw { status: response.status, ...data };
    }
    return data;
  } catch (error) {
    console.error('Admin API Request Error:', error);
    throw error;
  }
};


// --- Funções da API para Usuários ---
export const authAPI = {
  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  registerCliente: (userData) => apiRequest('/auth/register-cliente', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  googleLogin: (googleData) => apiRequest('/auth/google', {
    method: 'POST',
    body: JSON.stringify(googleData),
  }),
  createDirectPayment: (paymentData) => apiRequest('/assinaturas/pagamento-direto', {
    method: 'POST',
    body: JSON.stringify(paymentData),
  }),
  getMe: () => apiRequest('/auth/me'),
};

export const professionalAPI = {
  getProfile: () => apiRequest('/profissionais/me'),
  updateProfile: (data) => apiRequest('/profissionais/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  createProfile: (data) => apiRequest('/profissionais', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

export const subscriptionAPI = {
    getMySubscription: () => apiRequest('/assinaturas/minha'),
};

export const chatAPI = {
  sendMessage: (message, produtorId = null) => 
    apiRequest('/chat/message', {
      method: 'POST',
      body: JSON.stringify({ message, produtor_id: produtorId }),
    }),
};

export const interactionAPI = {
  getInteractions: (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/interacoes${queryParams ? `?${queryParams}` : ''}`);
  },
  
  getInteraction: (id) => 
    apiRequest(`/interacoes/${id}`),
};

// ... (outras APIs de usuário podem continuar usando apiRequest)

export const testAPI = {
  generateTestLink: (billingType) => apiRequest('/teste-pagamento/gerar-link', {
    method: 'POST',
    body: JSON.stringify({ billingType }),
  }),
};

// Função para buscar planos públicos (sem autenticação)
export const publicAPI = {
  getPlanos: async (categoria = null) => {
    const url = categoria ? `${API_BASE_URL}/planos?categoria=${categoria}` : `${API_BASE_URL}/planos`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Erro ao buscar planos');
    }
    return response.json();
  }
};


// --- Funções da API para Administradores ---
export const adminAPI = {
  login: (credentials) => adminApiRequest('/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  getProfile: () => adminApiRequest('/admin/auth/profile'),
  updateProfile: (data) => adminApiRequest('/admin/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  getMe: () => 
    adminApiRequest('/admin/auth/me'),

  // Clientes
  getClientes: (params) => adminApiRequest('/admin/clientes', { params }),
  getCliente: (id) => adminApiRequest(`/admin/clientes/${id}`),
  getClientePagamentos: (id) => adminApiRequest(`/admin/clientes/${id}/pagamentos`),
  deleteCliente: (id) => adminApiRequest(`/admin/clientes/${id}`, { method: 'DELETE' }),
  updateCliente: (id, data) =>
    adminApiRequest(`/admin/clientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Profissionais
  getProfissionais: (params) => adminApiRequest('/admin/profissionais', { params }),
  getProfissional: (id) => adminApiRequest(`/admin/profissionais/${id}`),
  getProfissionalPagamentos: (id) => adminApiRequest(`/admin/profissionais/${id}/pagamentos`),

  // Planos
  getPlanos: () => adminApiRequest('/admin/planos'),

  // Pagamentos
  confirmarPagamento: (paymentId) =>
    adminApiRequest(`/admin/pagamentos/${paymentId}/confirmar`, {
      method: 'POST',
    }),
};

export default apiRequest; // Export default for user-facing requests

