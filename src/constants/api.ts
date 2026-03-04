import axios from 'axios';
import { authStore } from '@/src/features/auth/store/AuthStore';

if (!process.env.EXPO_PUBLIC_API_URL) {
  console.warn("Falta configurar EXPO_PUBLIC_API_URL en el archivo .env");
}

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.41:3000/api",
  headers: {
    'Content-Type': 'application/json',
  },
});

// TSK-4.2: Enhanced request interceptor with token refresh
api.interceptors.request.use(
  async (config) => {
    const token = authStore.accessToken;

    if (token) {
      // Check if token is expired and try to refresh
      if (authStore.isTokenExpired && authStore.hasRefreshToken) {
        console.log('Token expired, attempting refresh before request...');
        
        // Import authController dynamically to avoid circular dependency
        const { authController } = await import('@/src/features/auth/controllers/AuthController');
        const refreshSuccess = await authController.refreshTokens();
        
        if (refreshSuccess) {
          // Use the new token
          config.headers.Authorization = `Bearer ${authStore.accessToken}`;
        } else {
          // Refresh failed, request will fail with 401
          config.headers.Authorization = `Bearer ${token}`;
        }
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// TSK-4.2: Enhanced response interceptor with token refresh retry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      const token = authStore.accessToken;
      
      // Only attempt refresh if user was authenticated and has refresh token
      if (token && authStore.hasRefreshToken) {
        originalRequest._retry = true;
        
        console.log('Received 401, attempting token refresh...');
        
        // Import authController dynamically to avoid circular dependency
        const { authController } = await import('@/src/features/auth/controllers/AuthController');
        const refreshSuccess = await authController.refreshTokens();
        
        if (refreshSuccess) {
          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${authStore.accessToken}`;
          return api(originalRequest);
        } else {
          // Refresh failed, user needs to login again
          console.error("Token refresh failed, user needs to re-authenticate");
        }
      } else if (token) {
        // User was authenticated but no refresh token available
        console.error("Sesión expirada o no autorizada - no refresh token available");
        authStore.clearAuth();
      }
      // If no token, silently reject (first time without login)
    }
    
    return Promise.reject(error);
  }
);