import { useEffect, useRef } from 'react';
import { authController } from '../controllers/AuthController';
import { authStore } from '../store/AuthStore';

export function useTokenRefresh() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkAndRefreshTokens = async () => {
      // Only check if user is authenticated
      if (!authStore.isAuthenticated) {
        return;
      }

      // Check if tokens need refresh (5 minutes before expiration)
      const fiveMinutesInMs = 5 * 60 * 1000;
      const shouldRefresh = authStore.auth0Tokens?.expires_at 
        ? (authStore.auth0Tokens.expires_at - Date.now()) < fiveMinutesInMs
        : false;

      if (shouldRefresh && authStore.hasRefreshToken) {
        console.log('Tokens expiring soon, refreshing...');
        await authController.refreshTokens();
      }
    };

    // Check immediately
    checkAndRefreshTokens();

    // Set up periodic checks every 2 minutes
    intervalRef.current = setInterval(checkAndRefreshTokens, 2 * 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Manual refresh function
  const refreshNow = async () => {
    return await authController.refreshTokens();
  };

  return {
    refreshNow,
  };
}