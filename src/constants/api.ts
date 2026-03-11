import axios from 'axios';
import { authStore } from '@/src/features/auth/store/AuthStore';

const envApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
const resolvedBaseUrl = (envApiUrl || 'http://10.0.2.2:8007/api').replace(/\/+$/, '');

if (!envApiUrl) {
  console.warn(`Falta configurar EXPO_PUBLIC_API_URL en .env, usando fallback: ${resolvedBaseUrl}`);
}

// Exportar la URL base para uso en endpoints
export const API_BASE_URL = resolvedBaseUrl;

export const api = axios.create({
  baseURL: resolvedBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = authStore.accessToken;

    if (token) {
      // Check if token is expired and try to refresh
      // But only if we're not already refreshing (prevents circular/infinite refresh attempts)
      if (authStore.isTokenExpired && authStore.hasRefreshToken && !authStore.isRefreshing) {
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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    const requestPath = String(error?.config?.url || '');
    const isNotifications404 =
      error?.response?.status === 404 && /\/notifications(\/|$)/.test(requestPath);

    if (error?.response?.status === 404 && !isNotifications404) {
      console.error('API 404', {
        baseURL: error?.config?.baseURL,
        path: error?.config?.url,
        fullUrl: `${error?.config?.baseURL || ''}${error?.config?.url || ''}`,
        response: error?.response?.data,
      });
    }
    
    if (error?.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const token = authStore.accessToken;
      
      // Only attempt refresh if user was authenticated and has refresh token
      // AND if we're not already refreshing (prevents circular/infinite refresh attempts)
      if (token && authStore.hasRefreshToken && !authStore.isRefreshing) {
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