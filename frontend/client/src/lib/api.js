import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export const TOKEN_KEY = "unitree_token";

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function getErrorMessage(err, fallback = "Something went wrong. Please try again.") {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.code === "ERR_NETWORK") return "Cannot reach the server. Please check your connection.";
  return err?.message || fallback;
}

export default api;
