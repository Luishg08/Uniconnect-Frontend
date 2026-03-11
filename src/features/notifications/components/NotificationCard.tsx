import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Notification } from '../types';

interface NotificationCardProps {
  notification: Notification;
  onPress: () => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onPress,
}) => {
  const getIcon = () => {
    switch (notification.notification_type) {
      case 'group_invitation':
        return { name: 'mail' as const, color: '#3B82F6' };
      case 'new_message':
        return { name: 'chatbubble' as const, color: '#10B981' };
      case 'invitation_accepted':
        return { name: 'checkmark-circle' as const, color: '#8B5CF6' };
      case 'new_member':
        return { name: 'person-add' as const, color: '#F59E0B' };
      default:
        return { name: 'notifications' as const, color: '#6B7280' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins} min`;
    if (diffHours < 24) return `${diffHours} h`;
    if (diffDays < 7) return `${diffDays} días`;
    
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit',
      month: 'short'
    });
  };

  const icon = getIcon();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        !notification.is_read && styles.unread,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${icon.color}20` }]}>
        <Ionicons name={icon.name} size={24} color={icon.color} />
      </View>

      <View style={styles.content}>
        <Text style={styles.message}>
          {notification.message}
        </Text>
        <Text style={styles.date}>
          {formatDate(notification.created_at)}
        </Text>
      </View>

      {!notification.is_read && (
        <View style={styles.unreadBadge} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  unread: {
    backgroundColor: '#F0F9FF',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  message: {
    fontSize: 15,
    color: '#111827',
    lineHeight: 20,
    marginBottom: 4,
  },
  date: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  unreadBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3B82F6',
    marginLeft: 8,
  },
});
