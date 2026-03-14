import axios from 'axios';
import { authStore } from '@/src/features/auth/store/AuthStore';

// Única fuente de verdad: EXPO_PUBLIC_API_URL
const envApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

const resolvedBaseUrl = (envApiUrl || 'http://10.146.13.164:8007/api').replace(/\/+$/, '');

if (!envApiUrl) {
  console.warn('[api.ts] Falta EXPO_PUBLIC_API_URL en .env, usando fallback:', resolvedBaseUrl);
}

// Exportar URLs
export const API_BASE_URL = resolvedBaseUrl; // Ej: http://10.146.13.164:8007/api
export const WEBSOCKET_URL = resolvedBaseUrl.replace('/api', ''); // Ej: http://10.146.13.164:8007

export const api = axios.create({
  baseURL: resolvedBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos timeout
});

api.interceptors.request.use(
  async (config) => {
    const token = authStore.accessToken;

    // ⭐ DIAGNOSTIC: Log token status
    console.log('🔍 [API Interceptor] Request:', {
      url: config.url,
      method: config.method,
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'none',
      isExpired: authStore.isTokenExpired,
      hasRefreshToken: authStore.hasRefreshToken,
    });

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
          console.log('✅ [API Interceptor] Token refreshed successfully');
        } else {
          // Refresh failed, request will fail with 401
          config.headers.Authorization = `Bearer ${token}`;
          console.log('❌ [API Interceptor] Token refresh failed, using old token');
        }
      } else {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ [API Interceptor] Token added to request');
      }
    } else {
      console.warn('⚠️ [API Interceptor] No token available for request');
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