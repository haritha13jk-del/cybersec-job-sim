import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://cybersec-job-sim.onrender.com';

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  login: (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
};

export const scenarioAPI = {
  getAll: (filters = {}) => api.get('/api/scenarios', { params: filters }),
  getById: (id) => api.get(`/api/scenarios/${id}`),
  submit: (id, data) => api.post(`/api/scenarios/${id}/submit`, data),
};

export const progressAPI = {
  getUserProgress: () => api.get('/api/progress'),
  getStats: () => api.get('/api/progress/stats'),
  getLeaderboard: (limit = 10) => api.get(`/api/progress/leaderboard?limit=${limit}`),
  updateProgress: (data) => api.post('/api/progress', data),
};

export const aiAPI = {
  chat: (data) => api.post('/api/ai/chat', data),
  getHint: (scenarioId) => api.post('/api/ai/hint', { scenarioId }),
  ask: (data) => api.post('/api/ai/chat', data),
};

export default api;
