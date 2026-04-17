import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// 🔐 Attach token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});


// ================= AUTH =================
export const loginUser = (data) => API.post("/api/auth/login", data);
export const registerUser = (data) => API.post("/api/auth/register", data);

export const authAPI = {
  login: (data) => API.post("/api/auth/login", data),
  register: (data) => API.post("/api/auth/register", data),
};


// ================= AI =================
export const sendMessage = (data) => API.post("/api/ai/chat", data);
export const getHint = (data) => API.post("/api/ai/hint", data);
export const getChatHistory = (scenarioId) =>
  API.get(`/api/ai/history?scenarioId=${scenarioId}`);


// ================= SCENARIOS =================
export const scenarioAPI = {
  getAll: () => API.get("/api/scenarios"),
  getById: (id) => API.get(`/api/scenarios/${id}`),
};
// ================= USER =================
export const getProfile = () => API.get("/api/users/profile");


// ================= PROGRESS =================
export const progressAPI = {
  getProgress: () => API.get("/api/progress"),
  updateProgress: (data) => API.post("/api/progress", data),

  getStats: () => API.get("/api/progress/stats"),
  getLeaderboard: (limit = 10) =>
    API.get(`/api/leaderboard?limit=${limit}`),
};


export default API;