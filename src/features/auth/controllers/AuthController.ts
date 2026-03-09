import { authStore } from '../store/AuthStore';
import { authService } from '../services/auth.service';
import { showToast } from '@/src/lib/toast';
import { router } from 'expo-router';

export class AuthController {
  
  async handleAuthorizationCode(authorizationCode: string, redirectUri: string, codeVerifier: string): Promise<void> {
    try {
      authStore.setLoading(true);
      authStore.clearError();

      console.log('AuthController: Starting authorization code exchange', {
        code: authorizationCode.substring(0, 20) + '...',
        redirectUri,
        codeVerifier: codeVerifier.substring(0, 20) + '...',
      });

      console.log('Calling authService.exchangeAuthorizationCode...');
      const fenResponse = await authService.exchangeAuthorizationCode(authorizationCode, redirectUri, codeVerifier);
      
      console.log('BFF Response received:', {
        success: fenResponse.success,
        statusCode: fenResponse.statusCode,
        hasData: !!fenResponse.data,
      });

      // Validate FEN response format
      if (!fenResponse.success || fenResponse.statusCode !== 200) {
        console.error('BFF returned error:', fenResponse.message);
        throw new Error(fenResponse.message || 'Authentication failed');
      }

      // Extract data from FEN response
      const { access_token, user, auth0_tokens } = fenResponse.data;
      
      if (!access_token || !user) {
        console.error('Invalid FEN response - missing access_token or user:', {
          hasAccessToken: !!access_token,
          hasUser: !!user,
        });
        throw new Error('Invalid response format from BFF');
      }

      console.log('Valid FEN response received, updating AuthStore...');
      // Update AuthStore with the received data (MVC Local pattern)
      authStore.setAuth(access_token, user, auth0_tokens);
      
      // Store Auth0 tokens for potential future use (refresh tokens, etc.)
      console.log('Auth0 tokens stored:', {
        hasAccessToken: !!auth0_tokens?.access_token,
        hasIdToken: !!auth0_tokens?.id_token,
        hasRefreshToken: !!auth0_tokens?.refresh_token,
        expiresIn: auth0_tokens?.expires_in
      });

      showToast.success('¡Éxito!', 'Autenticación completada correctamente');
      
      console.log('Navigating to authenticated area...');
      // Navigate to authenticated area
      router.replace('/(tabs)');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error en la autenticación';
      console.error('AuthController: Authentication error', {
        message: errorMessage,
        error: error instanceof Error ? error.stack : error,
      });
      authStore.setError(errorMessage);
      showToast.error('Error', errorMessage);
    } finally {
      authStore.setLoading(false);
    }
  }

  async logout(): Promise<void> {
    try {
      authStore.setLoading(true);
      
      // Clear local authentication state
      authStore.clearAuth();

      showToast.success('Sesión cerrada', 'Has cerrado sesión correctamente');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cerrar sesión';
      authStore.setError(errorMessage);
      showToast.error('Error', errorMessage);
    } finally {
      authStore.setLoading(false);
    }
  }

  async refreshTokens(): Promise<boolean> {
    try {
      // Check if already refreshing to prevent simultaneous refresh attempts
      if (authStore.isRefreshing) {
        console.log('Already refreshing tokens, skipping duplicate refresh attempt');
        return false;
      }

      // Check if we have a refresh token
      if (!authStore.hasRefreshToken || !authStore.auth0Tokens?.refresh_token || !authStore.user?.id_user) {
        console.log('No refresh token available or user data missing');
        return false;
      }

      console.log('Attempting to refresh tokens...');
      authStore.isRefreshing = true;
      authStore.setLoading(true);
      authStore.clearError();

      // Call BFF to refresh tokens
      const fenResponse = await authService.refreshTokens(
        authStore.auth0Tokens.refresh_token,
        authStore.user.id_user
      );

      // Validate FEN response format
      if (!fenResponse.success || fenResponse.statusCode !== 200) {
        throw new Error(fenResponse.message || 'Token refresh failed');
      }

      // Extract data from FEN response
      const { access_token, user, auth0_tokens } = fenResponse.data;
      
      if (!access_token || !user) {
        throw new Error('Invalid refresh response format from BFF');
      }

      // Update AuthStore with new tokens
      authStore.setAuth(access_token, user, auth0_tokens);
      
      console.log('Tokens refreshed successfully');
      showToast.success('Sesión renovada', 'Tu sesión ha sido renovada automáticamente');
      
      return true;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al renovar la sesión';
      console.error('Token refresh failed:', error);
      
      // If refresh fails, clear auth state (user needs to login again)
      authStore.clearAuth();
      showToast.error('Sesión expirada', 'Por favor, inicia sesión nuevamente');
      
      return false;
    } finally {
      authStore.isRefreshing = false;
      authStore.setLoading(false);
    }
  }

  async ensureValidTokens(): Promise<boolean> {
    // If not authenticated, no need to refresh
    if (!authStore.isAuthenticated) {
      return false;
    }

    // If token is not expired, no need to refresh
    if (!authStore.isTokenExpired) {
      return true;
    }

    // Token is expired, try to refresh
    console.log('Token expired, attempting refresh...');
    return await this.refreshTokens();
  }

  async initializeAuth(): Promise<void> {
    // Wait for AuthStore to initialize from storage
    while (!authStore.isInitialized) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // If we have a stored session, validate it
    if (authStore.isAuthenticated) {
      console.log('Found stored session, validating...');
      
      // Check if we need to refresh tokens
      if (authStore.isTokenExpired && authStore.hasRefreshToken) {
        console.log('Stored session expired, attempting refresh...');
        await this.refreshTokens();
      } else if (authStore.isTokenExpired && !authStore.hasRefreshToken) {
        console.log('Stored session expired and no refresh token, clearing auth...');
        authStore.clearAuth();
      } else {
        console.log('Stored session is valid');
      }
    }
  }

  /**
   * Get current authentication status
   */
  get isAuthenticated(): boolean {
    return authStore.isAuthenticated;
  }

  /**
   * Get current user data
   */
  get currentUser() {
    return authStore.user;
  }
}

// Singleton instance for dependency injection (Kiro Pattern)
export const authController = new AuthController();