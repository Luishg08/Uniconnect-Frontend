import React from 'react';
import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { observer } from 'mobx-react-lite';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { groupAdminStore } from '../../store/GroupAdminStore';
import { groupsService } from '../../services/groups.service';
import { authStore } from '@/src/features/auth/store/AuthStore';
import { GroupMembership } from '../../types';
import { adminStyles as s } from './styles';

interface MemberRowProps {
  member: GroupMembership;
  groupId: number;
  ownerId: number;
  canManage: boolean;
}

export const MemberRow = observer(
  ({ member, groupId, ownerId, canManage }: MemberRowProps) => {
    const queryClient = useQueryClient();
    const token = authStore.accessToken ?? '';
    const isOwner = member.id_user === ownerId;
    const isAdmin = member.role === 'admin';
    const memberName = member.user?.full_name ?? 'este miembro';

    const handleRemove = () => {
      Alert.alert('Sacar miembro', `¿Sacar a ${memberName} del grupo?`, [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sacar',
          style: 'destructive',
          onPress: async () => {
            try {
              await groupsService.removeMemberFromGroup(groupId, member.id_user, token);
              await groupAdminStore.fetchMembers(groupId);
              queryClient.invalidateQueries({ queryKey: ['group-info', groupId] });
            } catch (err: unknown) {
              Alert.alert(
                'Error',
                err instanceof Error ? err.message : 'No se pudo sacar al miembro.',
              );
            }
          },
        },
      ]);
    };

    const handleMakeAdmin = () => {
      Alert.alert('Hacer administrador', `¿Convertir a ${memberName} en admin?`, [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await groupsService.makeMemberAdmin(groupId, member.id_user, token);
              await groupAdminStore.fetchMembers(groupId);
              queryClient.invalidateQueries({ queryKey: ['group-info', groupId] });
            } catch (err: unknown) {
              Alert.alert(
                'Error',
                err instanceof Error ? err.message : 'No se pudo promover al miembro.',
              );
            }
          },
        },
      ]);
    };

    return (
      <View style={s.memberCard}>
        <View style={s.rowLeft}>
          {member.user?.picture ? (
            <Image source={{ uri: member.user.picture }} style={s.avatar} />
          ) : (
            <View style={[s.avatar, s.avatarPlaceholder]}>
              <Ionicons name="person" size={22} color="#D9B97E" />
            </View>
          )}

          <View style={s.rowInfo}>
            <View style={s.nameRow}>
              <Text style={s.rowName}>{memberName}</Text>
              {isOwner && (
                <View style={s.ownerBadge}>
                  <Text style={s.ownerBadgeText}>Owner</Text>
                </View>
              )}
              {isAdmin && !isOwner && (
                <View style={s.adminBadge}>
                  <Text style={s.adminBadgeText}>Admin</Text>
                </View>
              )}
            </View>
            {member.user?.email && (
              <Text style={s.rowEmail}>{member.user.email}</Text>
            )}
          </View>
        </View>

        {canManage && !isOwner && (
          <View style={s.rowActions}>
            {!isAdmin && (
              <TouchableOpacity
                style={[s.iconBtn, s.adminBtn]}
                onPress={handleMakeAdmin}
                accessibilityLabel="Hacer administrador"
              >
                <Ionicons name="shield-outline" size={16} color="#D9B97E" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[s.iconBtn, s.rejectBtn]}
              onPress={handleRemove}
              accessibilityLabel="Sacar del grupo"
            >
              <Ionicons name="close-circle-outline" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  },
);
