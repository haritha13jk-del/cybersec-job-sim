import axios from "axios";

const API = axios.create({
  baseURL: "https://cybersec-job-sim.onrender.com/api",
});

// 🔥 AUTO ATTACH TOKEN (VERY IMPORTANT)
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

// AUTH
export const authAPI = {
  login: (data) => API.post("/auth/login", data),
  register: (data) => API.post("/auth/register", data),
};

// SCENARIOS
export const scenarioAPI = {
  getAll: () => API.get("/scenarios"),
  getById: (id) => API.get(`/scenarios/${id}`),
};

export default API;