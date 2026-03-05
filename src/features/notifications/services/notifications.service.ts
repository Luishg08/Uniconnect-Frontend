import { api } from '@/src/constants/api';
import { NOTIFICATIONS_ENDPOINTS } from '../api/endpoints';
import { PushTokenPayload, Notification } from '../types';

export const notificationsService = {
  registerExpoPushToken: async (payload: PushTokenPayload) => {
    const { data } = await api.post(NOTIFICATIONS_ENDPOINTS.REGISTER_EXPO_PUSH_TOKEN, payload);
    return data;
  },

  removeExpoPushToken: async (token: string) => {
    const { data } = await api.delete(NOTIFICATIONS_ENDPOINTS.REMOVE_EXPO_PUSH_TOKEN(token));
    return data;
  },

  getMyNotifications: async (): Promise<Notification[]> => {
    const { data } = await api.get(NOTIFICATIONS_ENDPOINTS.GET_MY_NOTIFICATIONS);
    return data;
  },

  markAsRead: async (id: number) => {
    const { data } = await api.patch(NOTIFICATIONS_ENDPOINTS.MARK_AS_READ(id));
    return data;
  },

  markAllAsRead: async () => {
    const { data } = await api.patch(NOTIFICATIONS_ENDPOINTS.MARK_ALL_AS_READ);
    return data;
  },
};