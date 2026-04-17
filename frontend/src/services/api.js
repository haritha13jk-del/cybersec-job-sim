import axios from "axios";

const API_URL = "https://cybersec-job-sim.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
});

// attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// AUTH
export const authAPI = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
};

// SCENARIOS
export const scenarioAPI = {
  getAll: () => api.get("/scenarios"),
  getById: (id) => api.get(`/scenarios/${id}`),
};

// PROGRESS  ✅ (THIS FIXES YOUR ERROR)
export const progressAPI = {
  get: () => api.get("/progress"),
  update: (data) => api.post("/progress", data),
};

// AI (if used)
export const aiAPI = {
  ask: (data) => api.post("/ai", data),
};