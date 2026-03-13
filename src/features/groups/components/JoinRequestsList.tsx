import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  usePendingJoinRequests,
  useAcceptJoinRequest,
  useRejectJoinRequest,
} from '../hooks/usePendingJoinRequests';
import { GroupWithJoinRequests } from '../types';

export const JoinRequestsList = () => {
  const { data: groupsWithRequests = [], isLoading, error } = usePendingJoinRequests();
  const acceptMutation = useAcceptJoinRequest();
  const rejectMutation = useRejectJoinRequest();

  const handleAccept = async (groupId: number, requestId: number) => {
    try {
      await acceptMutation.mutateAsync({ groupId, requestId });
      Alert.alert('Éxito', 'Solicitud aceptada');
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo aceptar la solicitud');
    }
  };

  const handleReject = async (groupId: number, requestId: number) => {
    Alert.alert('Rechazar solicitud', '¿Deseas rechazar esta solicitud?', [
      { text: 'Cancelar', onPress: () => {} },
      {
        text: 'Rechazar',
        onPress: async () => {
          try {
            await rejectMutation.mutateAsync({ groupId, requestId });
            Alert.alert('Éxito', 'Solicitud rechazada');
          } catch (error: any) {
            Alert.alert('Error', 'No se pudo rechazar la solicitud');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#D9B97E" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ff6b6b" />
        <Text style={styles.errorText}>Error al cargar solicitudes</Text>
      </View>
    );
  }

  if (groupsWithRequests.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="mail-open-outline" size={48} color="#666" />
        <Text style={styles.emptyText}>No hay solicitudes pendientes</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={groupsWithRequests}
      keyExtractor={(item) => item.id_group.toString()}
      renderItem={({ item: group }) => (
        <View style={styles.groupContainer}>
          <Text style={styles.groupName}>{group.name}</Text>

          <FlatList
            data={group.joinRequests}
            keyExtractor={(request) => request.id_request.toString()}
            scrollEnabled={false}
            renderItem={({ item: request }) => (
              <View style={styles.requestCard}>
                <View style={styles.requesterInfo}>
                  {request.requester.picture ? (
                    <Image
                      source={{ uri: request.requester.picture }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Ionicons name="person" size={24} color="#D9B97E" />
                    </View>
                  )}

                  <View style={styles.infoContainer}>
                    <Text style={styles.requesterName}>
                      {request.requester.full_name}
                    </Text>
                    {request.requester.program && (
                      <Text style={styles.programName}>
                        {request.requester.program.name}
                      </Text>
                    )}
                    <Text style={styles.email}>{request.requester.email}</Text>
                  </View>
                </View>

                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.acceptButton]}
                    onPress={() =>
                      handleAccept(group.id_group, request.id_request)
                    }
                    disabled={acceptMutation.isPending || rejectMutation.isPending}
                  >
                    {acceptMutation.isPending ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() =>
                      handleReject(group.id_group, request.id_request)
                    }
                    disabled={acceptMutation.isPending || rejectMutation.isPending}
                  >
                    {rejectMutation.isPending ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Ionicons name="close-circle" size={20} color="#fff" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </View>
      )}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={
        <View style={styles.centerContainer}>
          <Ionicons name="mail-open-outline" size={48} color="#666" />
          <Text style={styles.emptyText}>No hay solicitudes pendientes</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  listContent: {
    padding: 12,
  },
  groupContainer: {
    marginBottom: 20,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D9B97E',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  requestCard: {
    backgroundColor: 'rgba(26, 26, 26, 0.9)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(217, 185, 126, 0.2)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requesterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(217, 185, 126, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  requesterName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  programName: {
    fontSize: 12,
    color: '#D9B97E',
    marginBottom: 2,
  },
  email: {
    fontSize: 11,
    color: '#999',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: 'rgba(52, 168, 83, 0.8)',
  },
  rejectButton: {
    backgroundColor: 'rgba(255, 77, 77, 0.8)',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    marginTop: 12,
    fontWeight: '500',
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
    marginTop: 12,
    fontWeight: '500',
  },
});
