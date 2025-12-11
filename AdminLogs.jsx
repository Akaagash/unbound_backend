import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add API key
api.interceptors.request.use(
  (config) => {
    const apiKey = localStorage.getItem('apiKey');
    if (apiKey) {
      config.headers['x-api-key'] = apiKey;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear API key and redirect to login
      localStorage.removeItem('apiKey');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  getCurrentUser: () => api.get('/auth/me'),
  verifyApiKey: (apiKey) => {
    // Temporarily store API key for this request
    return api.get('/auth/me', {
      headers: { 'x-api-key': apiKey }
    });
  }
};

// Commands API
export const commandsAPI = {
  submit: (commandText) => api.post('/commands/submit', { command_text: commandText }),
  getHistory: (limit = 50, offset = 0) => api.get('/commands/history', { params: { limit, offset } }),
  getStatus: (commandId) => api.get(`/commands/${commandId}`)
};

// Rules API (Admin)
export const rulesAPI = {
  getAll: () => api.get('/rules'),
  getById: (id) => api.get(`/rules/${id}`),
  create: (pattern, action) => api.post('/rules', { pattern, action }),
  update: (id, pattern, action) => api.put(`/rules/${id}`, { pattern, action }),
  delete: (id) => api.delete(`/rules/${id}`),
  validate: (pattern) => api.post('/rules/validate', { pattern })
};

// Users API (Admin)
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (name, role, credits = 100) => api.post('/users', { name, role, credits }),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  addCredits: (userId, credits) => api.post(`/users/${userId}/credits`, { credits }),
  regenerateKey: (id) => api.post(`/users/${id}/regenerate-key`)
};

// Logs API (Admin)
export const logsAPI = {
  getAll: (limit = 100, offset = 0, filters = {}) => {
    const params = { limit, offset, ...filters };
    return api.get('/logs', { params });
  },
  getStats: () => api.get('/logs/stats')
};

export default api;

