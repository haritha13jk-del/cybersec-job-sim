import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  "https://cybersec-job-sim.onrender.com";

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ================= AUTH =================
export const authAPI = {
  login: (data) => api.post("/api/auth/login", data),
  register: (data) => api.post("/api/auth/register", data),
};

// ================= SCENARIOS =================
export const scenarioAPI = {
  getAll: () => api.get("/api/scenarios"),
  getById: (id) => api.get(`/api/scenarios/${id}`),
};

// ================= PROGRESS =================
export const progressAPI = {
  getUserProgress: () => api.get("/api/progress"),
  updateProgress: (data) => api.post("/api/progress", data),
};

// ================= AI =================
export const aiAPI = {
  ask: (data) => api.post("/api/ai", data),
};

export default api;