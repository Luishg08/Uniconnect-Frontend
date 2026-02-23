import { api } from '@/src/constants/api';
import { AUTH_ENDPOINTS } from '../api/endpoints';

export const authService = {
  loginWithGoogle: async (accessToken: string) => {
    const { data } = await api.post(AUTH_ENDPOINTS.LOGIN_GOOGLE, { access_token: accessToken });
    return data;
  },
};