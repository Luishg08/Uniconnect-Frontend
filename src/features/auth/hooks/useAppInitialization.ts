import { useEffect, useState } from 'react';
import { authController } from '../controllers/AuthController';

/**
 * TSK-4.2: App Initialization Hook
 * 
 * Handles app startup authentication state restoration and token refresh
 * Should be used in the root component of the app
 */
export function useAppInitialization() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Initializing app authentication...');
        await authController.initializeAuth();
        console.log('App authentication initialized successfully');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to initialize app';
        console.error('App initialization error:', error);
        setInitializationError(errorMessage);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, []);

  return {
    isInitializing,
    initializationError,
  };
}