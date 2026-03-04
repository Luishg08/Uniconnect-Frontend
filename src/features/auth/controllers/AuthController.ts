import { authStore } from '../store/AuthStore';
import { authService } from '../services/auth.service';
import { showToast } from '@/src/lib/toast';
import { router } from 'expo-router';

/**
 * AuthController - MVC Local Controller (Kiro Framework)
 * 
 * Handles business logic for authentication operations.
 * Coordinates between Auth0 service layer and AuthStore (Model).
 * 
 * Foundation for TSK-3.2: BFF Integration
 */
export class AuthController {
  
  /**
   * TSK-3.2: Handle Authorization Code Exchange via BFF
   * 
   * Sends the authorization code to the BFF endpoint,
   * receives the FEN-formatted response with user profile,
   * and updates the AuthStore with the authentication data
   * 
   * @param authorizationCode - The code received from Auth0 Universal Login
   * @param redirectUri - The redirect URI used in the auth request
   */
  async handleAuthorizationCode(authorizationCode: string, redirectUri: string): Promise<void> {
    try {
      authStore.setLoading(true);
      authStore.clearError();

      console.log('AuthController: Processing authorization code via BFF', {
        code: authorizationCode,
        redirectUri,
      });

      // TSK-3.2: Call BFF endpoint to exchange authorization code
      const fenResponse = await authService.exchangeAuthorizationCode(authorizationCode, redirectUri);
      
      // Validate FEN response format
      if (!fenResponse.success || fenResponse.statusCode !== 200) {
        throw new Error(fenResponse.message || 'Authentication failed');
      }

      // Extract data from FEN response
      const { access_token, user, auth0_tokens } = fenResponse.data;
      
      if (!access_token || !user) {
        throw new Error('Invalid response format from BFF');
      }

      // Update AuthStore with the received data (MVC Local pattern)
      authStore.setAuth(access_token, user, auth0_tokens);
      
      // Store Auth0 tokens for potential future use (refresh tokens, etc.)
      // Note: In a production app, you might want to store these securely
      console.log('Auth0 tokens received:', {
        hasAccessToken: !!auth0_tokens?.access_token,
        hasIdToken: !!auth0_tokens?.id_token,
        hasRefreshToken: !!auth0_tokens?.refresh_token,
        expiresIn: auth0_tokens?.expires_in
      });

      showToast.success('¡Éxito!', 'Autenticación completada correctamente');
      
      // Navigate to authenticated area
      router.replace('/(tabs)');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error en la autenticación';
      authStore.setError(errorMessage);
      showToast.error('Error', errorMessage);
      
      console.error('AuthController: Authentication error', error);
    } finally {
      authStore.setLoading(false);
    }
  }

  /**
   * Handle user logout
   * Clears the authentication state and shows success message
   */
  async logout(): Promise<void> {
    try {
      authStore.setLoading(true);
      
      // Clear local authentication state
      authStore.clearAuth();
      
      // TODO: TSK-4.2 - Implement Auth0 logout URL redirection
      // TODO: Invalidate refresh tokens if implemented
      
      showToast.success('Sesión cerrada', 'Has cerrado sesión correctamente');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cerrar sesión';
      authStore.setError(errorMessage);
      showToast.error('Error', errorMessage);
    } finally {
      authStore.setLoading(false);
    }
  }

  /**
   * TSK-4.2: Refresh authentication tokens
   * 
   * Attempts to refresh the user's session using the stored refresh token
   * Updates AuthStore with new tokens if successful
   */
  async refreshTokens(): Promise<boolean> {
    try {
      // Check if we have a refresh token
      if (!authStore.hasRefreshToken || !authStore.auth0Tokens?.refresh_token || !authStore.user?.id_user) {
        console.log('No refresh token available or user data missing');
        return false;
      }

      console.log('Attempting to refresh tokens...');
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
      authStore.setLoading(false);
    }
  }

  /**
   * TSK-4.2: Check if tokens need refresh and refresh if necessary
   * 
   * Should be called periodically or before making API requests
   */
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

  /**
   * TSK-4.2: Initialize authentication state from storage
   * 
   * Should be called when the app starts
   */
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