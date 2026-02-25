import { api } from '@/src/constants/api';
import { AUTH_ENDPOINTS } from '../api/endpoints';

export const authService = {
  loginWithGoogle: async (accessToken: string) => {
    const { data } = await api.post(AUTH_ENDPOINTS.LOGIN_GOOGLE, { access_token: accessToken });
    return data;
  },

  loginWithGoogleSub: async (sub: string) => {
    const { data } = await api.post(AUTH_ENDPOINTS.ALTERNATIVE_LOGIN, { googleSub:sub });
    return data;
  },

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