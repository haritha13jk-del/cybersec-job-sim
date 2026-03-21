import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

export const scenarioAPI = {
  getAll: (filters) => api.get('/scenarios', { params: filters }),
  getById: (id) => api.get(`/scenarios/${id}`),
  getByRole: (role) => api.get(`/scenarios/role/${role}`),
  submit: (id, data) => api.post(`/scenarios/${id}/submit`, data),
  getRandom: (role, difficulty) => api.get(`/scenarios/random/${role}/${difficulty}`)
};

export const progressAPI = {
  getProgress: () => api.get('/progress'),
  getStats: () => api.get('/progress/stats'),
  getLeaderboard: (limit) => api.get('/progress/leaderboard', { params: { limit } })
};

export const aiAPI = {
  chat: (data) => api.post('/ai/chat', data),
  getHint: (scenarioId) => api.post('/ai/hint', { scenarioId }),
  getHistory: (params) => api.get('/ai/history', { params })
};

export default api;