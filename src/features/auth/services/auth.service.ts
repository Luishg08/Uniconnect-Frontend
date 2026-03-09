import { api } from '@/src/constants/api';

export const authService = {
  
  exchangeAuthorizationCode: async (code: string, redirectUri: string, codeVerifier: string) => {
    try {
      // Use the environment-configured API URL for consistency
      const bffUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8007/api';
      const response = await api.post(`${bffUrl}/auth/callback`, {
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier, // PKCE: Send code_verifier for secure exchange
      });
      
      // Retornamos la respuesta (que viene envuelta en formato FEN desde el backend)
      return response.data;
    } catch (error: any) {
      // Extraer el mensaje de error del backend
      const errorMessage = error?.response?.data?.message || error?.message || 'Authentication failed';
      console.error('Auth service error:', errorMessage);
      
      // Retornar error en formato FEN para mantener consistencia
      return {
        success: false,
        statusCode: error?.response?.status || 500,
        message: errorMessage,
        data: null,
      };
    }
  },

  refreshTokens: async (refreshToken: string, userId: number) => {
    const bffUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8007/api';
    const response = await api.post(`${bffUrl}/auth/refresh`, {
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
    const bffUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8007/api';
    const { data } = await api.post(`${bffUrl}/auth/logout`, {
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