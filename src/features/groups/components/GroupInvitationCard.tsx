import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GroupInvitation } from '../types';

interface GroupInvitationCardProps {
  invitation: GroupInvitation;
  onAccept: () => void;
  onReject: () => void;
  loading?: boolean;
}

export const GroupInvitationCard: React.FC<GroupInvitationCardProps> = ({
  invitation,
  onAccept,
  onReject,
  loading = false,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays < 7) return `Hace ${diffDays} días`;
    
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit',
      month: 'short'
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.inviterInfo}>
          {invitation.inviter?.picture ? (
            <Image
              source={{ uri: invitation.inviter.picture }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={20} color="#fff" />
            </View>
          )}
          <View style={styles.headerText}>
            <Text style={styles.inviterName}>
              {invitation.inviter?.full_name || 'Usuario'}
            </Text>
            <Text style={styles.invitationText}>
              te invitó a unirte a un grupo
            </Text>
          </View>
        </View>
        <Text style={styles.date}>{formatDate(invitation.created_at)}</Text>
      </View>

      <View style={styles.groupInfo}>
        <View style={styles.groupIcon}>
          <Ionicons name="people" size={24} color="#3B82F6" />
        </View>
        <View style={styles.groupDetails}>
          <Text style={styles.groupName}>{invitation.group?.name}</Text>
          {invitation.group?.course && (
            <Text style={styles.courseName}>
              {invitation.group.course.name}
            </Text>
          )}
          {invitation.group?.description && (
            <Text style={styles.groupDescription} numberOfLines={2}>
              {invitation.group.description}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.rejectButton]}
          onPress={onReject}
          disabled={loading}
        >
          <Ionicons name="close" size={20} color="#EF4444" />
          <Text style={styles.rejectText}>Rechazar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.acceptButton]}
          onPress={onAccept}
          disabled={loading}
        >
          <Ionicons name="checkmark" size={20} color="#fff" />
          <Text style={styles.acceptText}>Aceptar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  inviterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: '#9CA3AF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  inviterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  invitationText: {
    fontSize: 14,
    color: '#6B7280',
  },
  date: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  groupInfo: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  groupIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  groupDetails: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  courseName: {
    fontSize: 14,
    color: '#3B82F6',
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  rejectButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  rejectText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  acceptButton: {
    backgroundColor: '#3B82F6',
  },
  acceptText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
