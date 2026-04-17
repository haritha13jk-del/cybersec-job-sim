import axios from "axios";

// ================= BASE URL =================
const BASE_URL =
  process.env.REACT_APP_API_URL ||
  "https://cybersec-job-sim.onrender.com";

console.log("API URL:", BASE_URL);

// ================= AXIOS INSTANCE =================
const API = axios.create({
  baseURL: BASE_URL,
});

// ================= TOKEN INTERCEPTOR =================
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

// ================= AUTH =================
export const authAPI = {
  login: (data) => API.post("/api/auth/login", data),
  register: (data) => API.post("/api/auth/register", data),
};

// ================= AI =================
export const aiAPI = {
  sendMessage: (data) => API.post("/api/ai/chat", data),
  getHint: (data) => API.post("/api/ai/hint", data),
  getChatHistory: (scenarioId) =>
    API.get(`/api/ai/history?scenarioId=${scenarioId}`),
};

// ================= SCENARIOS =================
export const scenarioAPI = {
  getAll: () => API.get("/api/scenarios"),
  getById: (id) => API.get(`/api/scenarios/${id}`),
};

// ================= USER =================
export const userAPI = {
  getProfile: () => API.get("/api/users/profile"),
};

// ================= PROGRESS =================
export const progressAPI = {
  getProgress: () => API.get("/api/progress"),

  updateProgress: (data) =>
    API.post("/api/progress", data),

  getStats: () => API.get("/api/progress/stats"),

  getLeaderboard: (limit = 10) =>
    API.get(`/api/leaderboard?limit=${limit}`),
};

// ================= OPTIONAL EXPORT =================
export default API;