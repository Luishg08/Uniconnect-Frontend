import { useState, useEffect, useCallback } from 'react';
import { notificationsService } from '../services/notifications.service';
import { Notification } from '../types';

export const useUserNotifications = (userId: number, token: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar notificaciones
  const loadNotifications = useCallback(async (isRead?: boolean) => {
    try {
      setLoading(true);
      const data = await notificationsService.getUserNotifications(userId, token, isRead);
      setNotifications(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar notificaciones');
      console.error('Error al cargar notificaciones:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, token]);

  // Cargar conteo de no leídas
  const loadUnreadCount = useCallback(async () => {
    try {
      const data = await notificationsService.getUnreadCount(userId, token);
      setUnreadCount(data.count);
    } catch (err: any) {
      console.error('Error al cargar conteo de no leídas:', err);
    }
  }, [userId, token]);

  // Marcar como leída
  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await notificationsService.markAsRead(notificationId, token);
      
      // Actualizar estado local
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id_notification === notificationId
            ? { ...notif, is_read: true }
            : notif
        )
      );
      
      // Actualizar conteo
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('Error al marcar como leída:', err);
      throw err;
    }
  }, [token]);

  // Marcar todas como leídas
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsService.markAllAsRead(userId, token);
      
      // Actualizar estado local
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, is_read: true }))
      );
      
      // Resetear conteo
      setUnreadCount(0);
    } catch (err: any) {
      console.error('Error al marcar todas como leídas:', err);
      throw err;
    }
  }, [userId, token]);

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, [loadNotifications, loadUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    reloadNotifications: loadNotifications,
    reloadUnreadCount: loadUnreadCount,
  };
};
