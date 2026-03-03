import axios from 'axios';
import { showToast } from '@/src/lib/toast';
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
    const status = error.response?.status;

    // sólo actuamos si la petición llevaba un Authorization
    const isAuthRequest = Boolean(error.config?.headers?.Authorization);

    if (isAuthRequest && (status === 401 || status === 403)) {
      showToast.error('Sesión expirada o no autorizada.');
    }
    return Promise.reject(error);
  }
);