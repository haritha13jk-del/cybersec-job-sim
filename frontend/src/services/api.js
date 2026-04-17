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


// ================= AI =================
export const sendMessage = (data) => API.post("/api/ai/chat", data);
export const getHint = (data) => API.post("/api/ai/hint", data);
export const getChatHistory = (scenarioId) =>
  API.get(`/api/ai/history?scenarioId=${scenarioId}`);


// ================= SCENARIOS =================
export const getScenarios = () => API.get("/api/scenarios");
export const getScenarioById = (id) => API.get(`/api/scenarios/${id}`);


// ================= USER =================
export const getProfile = () => API.get("/api/users/profile");


// ================= PROGRESS (🔥 THIS FIXES YOUR ERROR) =================
export const progressAPI = {
  getProgress: () => API.get("/api/progress"),
  updateProgress: (data) => API.post("/api/progress", data),
};


export default API;