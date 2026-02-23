import axios from 'axios';
import { useAuthStore } from '@/src/features/auth/store/useAuthStore'; 

if (!process.env.EXPO_PUBLIC_API_URL) {
  console.warn("Falta configurar EXPO_PUBLIC_API_URL en el archivo .env");
}

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.41:3000/api",
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Sesión expirada o no autorizada.");
      useAuthStore.getState().logout(); 
    }
    return Promise.reject(error);
  }
);