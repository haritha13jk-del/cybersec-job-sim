import axios from 'axios';

// ✅ PRODUCTION BACKEND URL (Railway)
const API_URL = 'https://cybersec-job-sim.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ✅ Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Handle unauthorized errors
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

// 🔐 AUTH APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

// 📚 SCENARIO APIs
export const scenarioAPI = {
  getAll: (filters) => api.get('/scenarios', { params: filters }),
  getById: (id) => api.get(`/scenarios/${id}`),
  getByRole: (role) => api.get(`/scenarios/role/${role}`),
  submit: (id, data) => api.post(`/scenarios/${id}/submit`, data),
  getRandom: (role, difficulty) =>
    api.get(`/scenarios/random/${role}/${difficulty}`)
};

// 📊 PROGRESS APIs
export const progressAPI = {
  getProgress: () => api.get('/progress'),
  getStats: () => api.get('/progress/stats'),
  getLeaderboard: (limit) =>
    api.get('/progress/leaderboard', { params: { limit } })
};

// 🤖 AI APIs
export const aiAPI = {
  chat: (data) => api.post('/ai/chat', data),
  getHint: (scenarioId) => api.post('/ai/hint', { scenarioId }),
  getHistory: (params) => api.get('/ai/history', { params })
};

export default api;