import { API_BASE_URL } from '@/constants/api';

export const notificationsEndpoints = {
  // Obtener todas las notificaciones del usuario
  getUserNotifications: (userId: number, isRead?: boolean) => {
    const url = `${API_BASE_URL}/notifications/user/${userId}`;
    return isRead !== undefined ? `${url}?is_read=${isRead}` : url;
  },
  
  // Contar notificaciones no leídas
  getUnreadCount: (userId: number) =>
    `${API_BASE_URL}/notifications/user/${userId}/unread-count`,
  
  // Marcar notificación como leída
  markAsRead: (notificationId: number) =>
    `${API_BASE_URL}/notifications/${notificationId}/read`,
  
  // Marcar todas como leídas
  markAllAsRead: (userId: number) =>
    `${API_BASE_URL}/notifications/user/${userId}/read-all`,
  
  // Expo Push Token (mantener compatibilidad)
  registerExpoPushToken: () =>
    `${API_BASE_URL}/notifications/expo-push-token`,
  
  removeExpoPushToken: (token: string) =>
    `${API_BASE_URL}/notifications/expo-push-token/${token}`,
};