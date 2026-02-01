import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// Base URL dal file .env
const API_URL = import.meta.env.VITE_API_URL;

// Crea istanza Axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: aggiunge token JWT alle richieste
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// Response interceptor: gestisce errori globali
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Redirect a login se token non valido o scaduto
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
