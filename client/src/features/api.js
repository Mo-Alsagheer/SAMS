import axios from "axios";
import { clearAuthSession, getAuthToken } from "@/features/auth/session";

const api = axios.create({
  baseURL: "http://localhost:3000",
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || "";

    if ((status === 401 || status === 403) && requestUrl !== "/auth/login") {
      clearAuthSession();

     
    }

    return Promise.reject(error);
  },
);

export default api;
