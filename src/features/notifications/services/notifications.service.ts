import axios from 'axios';
import { api } from '@/src/constants/api';
import { notificationsEndpoints } from '../api/endpoints';
import { Notification, NotificationCount, PushTokenPayload } from '../types';

class NotificationsService {
  /**
   * Obtener todas las notificaciones del usuario
   */
  async getUserNotifications(userId: number, token: string, isRead?: boolean): Promise<Notification[]> {
    try {
      const response = await axios.get(notificationsEndpoints.getUserNotifications(userId, isRead), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      throw error;
    }
  }

  /**
   * Contar notificaciones no leídas
   */
  async getUnreadCount(userId: number, token: string): Promise<NotificationCount> {
    try {
      const response = await axios.get(notificationsEndpoints.getUnreadCount(userId), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error al contar notificaciones no leídas:', error);
      throw error;
    }
  }

  /**
   * Marcar notificación como leída
   */
  async markAsRead(notificationId: number, token: string): Promise<Notification> {
    try {
      const response = await axios.patch(notificationsEndpoints.markAsRead(notificationId), {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
      throw error;
    }
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  async markAllAsRead(userId: number, token: string): Promise<void> {
    try {
      await axios.patch(notificationsEndpoints.markAllAsRead(userId), {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error al marcar todas las notificaciones como leídas:', error);
      throw error;
    }
  }

  // Mantener compatibilidad con métodos antiguos usando api instance
  async getMyNotifications(): Promise<Notification[]> {
    const { data } = await api.get('/notifications');
    return data;
  }

  async registerExpoPushToken(payload: PushTokenPayload) {
    const { data } = await api.post(notificationsEndpoints.registerExpoPushToken(), payload);
    return data;
  }

  async removeExpoPushToken(token: string) {
    const { data } = await api.delete(notificationsEndpoints.removeExpoPushToken(token));
    return data;
  }
}

export const notificationsService = new NotificationsService();
export default NotificationsService;