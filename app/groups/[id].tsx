import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatScreen } from '@/src/features/messages/components/ChatScreen';
import { authStore } from '@/src/features/auth';
import { groupsService } from '@/src/features/groups/services/groups.service';
import { Group } from '@/src/features/groups/types';

export default function GroupChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = authStore.user?.id_user;
  const token = authStore.accessToken || '';

  useEffect(() => {
    const loadGroupDetail = async () => {
      try {
        setLoading(true);
        const groupId = parseInt(id as string);
        const groupData = await groupsService.getGroupDetail(groupId, token);
        setGroup(groupData);
        setError(null);
      } catch (err: any) {
        console.error('Error loading group:', err);
        setError(err.message || 'Error al cargar el grupo');
      } finally {
        setLoading(false);
      }
    };

    if (id && token) {
      loadGroupDetail();
    }
  }, [id, token]);

  const handleGoBack = () => {
    router.push('/(tabs)/groups');
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="light-content" backgroundColor="#363636" />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#D9B97E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cargando...</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D9B97E" />
          <Text style={styles.loadingText}>Cargando chat...</Text>
        </View>
      </View>
    );
  }

  if (error || !group) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="light-content" backgroundColor="#363636" />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#D9B97E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Error</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#ff4d4d" />
          <Text style={styles.errorText}>{error || 'Grupo no encontrado'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleGoBack}>
            <Text style={styles.retryText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Obtener la información de la membresía del usuario
  const userMembership = group.user_membership;
  
  // Si no hay membership info, asumir que es miembro regular
  // (esto puede pasar si el backend no incluye user_membership en la respuesta)
  const membershipId = userMembership?.id_membership ?? 0;
  const isAdmin = userMembership?.id_role === 1 || userMembership?.role === 'admin';

  // Si el membershipId es 0, mostrar advertencia pero permitir continuar
  if (membershipId === 0) {
    console.warn('Warning: No membership ID found for user in group. Using fallback value.');
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#363636" />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#D9B97E" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {group.name}
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {group.course?.name || 'Grupo de estudio'}
          </Text>
        </View>
        <TouchableOpacity style={styles.infoButton}>
          <Ionicons name="information-circle-outline" size={24} color="#D9B97E" />
        </TouchableOpacity>
      </View>

      <ChatScreen
        groupId={group.id_group}
        userId={userId!}
        membershipId={membershipId}
        token={token}
        isAdmin={isAdmin}
        userFullName={authStore.user?.full_name || 'Usuario'}
        serverUrl={process.env.EXPO_PUBLIC_API_URL?.replace('/api', '') || 'http://10.0.2.2:8007'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#363636',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#888',
  },
  infoButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#888',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff4d4d',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#D9B97E',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '600',
  },
});
