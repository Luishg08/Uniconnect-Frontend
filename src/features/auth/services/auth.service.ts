import { api } from '@/src/constants/api';

/**
 * AuthService - Service Layer for Auth0 Integration
 * 
 * Handles HTTP communication with the BFF (Backend for Frontend)
 * Following Kiro Framework architecture patterns
 */
export const authService = {
  
  /**
   * TSK-3.2: Exchange Authorization Code via BFF
   * 
   * Sends the authorization code to the BFF endpoint and receives 
   * the FEN-formatted response with user profile and tokens
   * 
   * @param code - Authorization code received from Auth0 Universal Login
   * @param redirectUri - The redirect URI used in the auth request
   * @returns Promise with FEN-formatted user profile and tokens
   */
  exchangeAuthorizationCode: async (code: string, redirectUri: string) => {
    // Apuntamos al BFF local
    const response = await api.post('http://localhost:8007/api/auth/callback', {
      code,
      redirect_uri: redirectUri
    });
    
    // Retornamos la respuesta (que viene envuelta en formato FEN desde el backend)
    return response.data;
  },

  /**
   * TSK-4.2: Refresh authentication tokens via BFF
   * 
   * Sends refresh token to BFF endpoint to get new Auth0 tokens
   * and updated local JWT
   * 
   * @param refreshToken - Auth0 refresh token
   * @param userId - User ID for validation
   * @returns Promise with FEN-formatted response containing new tokens
   */
  refreshTokens: async (refreshToken: string, userId: number) => {
    const response = await api.post('http://localhost:8007/api/auth/refresh', {
      refresh_token: refreshToken,
      user_id: userId,
    });
    
    return response.data;
  },

  /**
   * Logout from Auth0 and invalidate tokens
   * Foundation for logout flow
   */
  async logout(accessToken: string) {
    // TODO: Implement Auth0 logout endpoint call via BFF
    const { data } = await api.post('http://localhost:8007/api/auth/logout', {
      access_token: accessToken,
    });
    
    return data;
  },

  // Utility function preserved for image handling
  getImageUri: (
    image: string | null | undefined,
  ): string | undefined => {
    if (!image) return undefined;

    if (image.startsWith("data:image")) {
      return image;
    }

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    return `data:image/jpeg;base64,${image}`;
  }
};