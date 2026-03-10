import { authStore } from '../store/AuthStore';
import { authService } from '../services/auth.service';
import { showToast } from '@/src/lib/toast';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { AUTH0_CONFIG } from '../constants/auth0';
import { makeRedirectUri } from 'expo-auth-session';

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
        message: fenResponse.message,
        hasData: !!fenResponse.data,
      });

      // Validate FEN response format
      if (!fenResponse.success || fenResponse.statusCode !== 200) {
        console.error('BFF returned error:', fenResponse.message);
        const errorDetail = fenResponse.message || 'Autenticación fallida';
        authStore.setError(errorDetail);
        showToast.error('Error de autenticación', errorDetail);
        return; // No lanzar excepción, solo mostrar el error
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

      showToast.success('¡Éxito!', 'Autenticación completada correctamente');

      // Route based on onboarding status from the backend
      if (user.needsOnboarding) {
        console.log('User needs onboarding, navigating to onboarding screen...');
        router.replace('/(auth)/onboarding');
      } else {
        console.log('Navigating to authenticated area...');
        router.replace('/(tabs)');
      }
      
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
      
      // Clear local authentication state first
      authStore.clearAuth();

      // Close Auth0 session on their servers to allow account switching
      try {
        const redirectUri = makeRedirectUri({
          scheme: 'uniconnect',
          path: 'login',
        });
        
        const logoutUrl = `https://${AUTH0_CONFIG.domain}/v2/logout?client_id=${AUTH0_CONFIG.clientId}&returnTo=${encodeURIComponent(redirectUri)}`;
        
        // Open Auth0 logout URL in browser (clears Auth0 session cookies)
        await WebBrowser.openBrowserAsync(logoutUrl);
        
        console.log('Auth0 session terminated successfully');
      } catch (auth0Error) {
        // Log but don't fail if Auth0 logout has issues
        console.log('Note: Auth0 logout URL could not be opened, but local session cleared');
      }

      showToast.success('Sesión cerrada', 'Has cerrado sesión correctamente. Ya puedes cambiar de cuenta.');
      
      // Navigate to login screen
      router.replace('/(auth)/login');
      
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

      // Fetch fresh profile to get up-to-date needsOnboarding status
      if (authStore.isAuthenticated) {
        try {
          const profile = await authService.getUserProfile();
          authStore.setNeedsOnboarding(profile.needsOnboarding ?? false);
        } catch {
          // Use persisted needsOnboarding — don't fail initialization
        }
      }
    }
  }

  async completeOnboarding(id_program: number, current_semester: number): Promise<void> {
    try {
      authStore.setLoading(true);
      authStore.clearError();
      await authService.completeOnboarding(id_program, current_semester);
      authStore.setNeedsOnboarding(false);
      showToast.success('¡Listo!', 'Perfil académico guardado correctamente');
      router.replace('/(tabs)');
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 400) {
        const msg = error?.response?.data?.message || 'Verifica los datos ingresados.';
        authStore.setError(msg);
        throw error;
      } else if (status === 404) {
        authStore.setError('Programa no válido, selecciona otro.');
        throw error;
      } else if (status === 409) {
        // Already completed — treat as success
        authStore.setNeedsOnboarding(false);
        router.replace('/(tabs)');
      } else if (status === 401) {
        authStore.clearAuth();
        router.replace('/(auth)/login');
      } else {
        const msg = error instanceof Error ? error.message : 'Error al guardar el perfil';
        authStore.setError(msg);
        showToast.error('Error', msg);
        throw error;
      }
    } finally {
      authStore.setLoading(false);
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

  /**
   * Get current error message
   */
  get error() {
    return authStore.error;
  }
}

// Singleton instance for dependency injection (Kiro Pattern)
export const authController = new AuthController();