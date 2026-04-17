import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  "https://cybersec-job-sim.onrender.com";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// 🔐 Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🚨 Auto logout on 401 - but don't redirect if on login/register page
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== "/login" && currentPath !== "/register") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

// ================= AUTH =================
export const authAPI = {
  login: (data) => api.post("/api/auth/login", data),
  register: (data) => api.post("/api/auth/register", data),
};

// ================= SCENARIOS =================
export const scenarioAPI = {
  getAll: () => api.get("/api/scenarios"),
  getById: (id) => api.get(`/api/scenarios/${id}`),
  // ✅ FIX: submit was missing — called in ScenarioDetail.js
  submit: (id, data) => api.post(`/api/scenarios/${id}/submit`, data),
};

// ================= PROGRESS =================
export const progressAPI = {
  getUserProgress: () => api.get("/api/progress"),
  // ✅ FIX: getStats was missing — caused "Hr.getStats is not a function"
  getStats: () => api.get("/api/progress/stats"),
  getLeaderboard: () => api.get("/api/leaderboard"),
  updateProgress: (data) => api.post("/api/progress", data),
};

// ================= AI =================
export const aiAPI = {
  ask: (data) => api.post("/api/ai", data),
  // ✅ FIX: chat and getHint were missing — called in ScenarioDetail.js
  chat: (data) => api.post("/api/ai/chat", data),
  getHint: (scenarioId) => api.post("/api/ai/hint", { scenarioId }),
};

export default api;