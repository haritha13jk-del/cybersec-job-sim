import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  "https://cybersec-job-sim.onrender.com";

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ================= AUTH =================
export const authAPI = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
};

// ================= SCENARIOS =================
export const scenarioAPI = {
  getAll: () => api.get("/scenarios"),
  getById: (id) => api.get(`/scenarios/${id}`),
};

// ================= PROGRESS =================
export const progressAPI = {
  getUserProgress: () => api.get("/progress"),
  updateProgress: (data) => api.post("/progress", data),
};

// ================= AI =================
export const aiAPI = {
  ask: (data) => api.post("/ai", data),
};

export default api;