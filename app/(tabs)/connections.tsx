import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConnections } from '@/src/features/connections/hooks/useConnections';
import { ConnectionRequestCard } from '@/src/features/connections/components/ConnectionRequestCard';
import { useQueryClient } from '@tanstack/react-query';

export default function ConnectionsScreen() {
  const {
    pendingRequests,
    isLoading,
    isError,
    refetch,
  } = useConnections();
  const queryClient = useQueryClient();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#D9B97E" />
        <Text style={styles.loadingText}>Cargando solicitudes...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#ff4d4d" />
        <Text style={styles.errorText}>Error al cargar solicitudes</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Vínculos</Text>
          <Text style={styles.subtitle}>
            {pendingRequests.length > 0
              ? `${pendingRequests.length} ${pendingRequests.length === 1 ? 'solicitud pendiente' : 'solicitudes pendientes'}`
              : 'No hay solicitudes pendientes'}
          </Text>
        </View>
      </View>

      {/* Lista de solicitudes */}
      {pendingRequests && pendingRequests.length > 0 ? (
        <FlatList
          data={pendingRequests}
          keyExtractor={(item) => item.id_connection.toString()}
          renderItem={({ item }) => (
            <ConnectionRequestCard
              request={item}
              onUpdated={() => queryClient.invalidateQueries({ queryKey: ['pending-connections'] })}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#D9B97E"
              colors={['#D9B97E']}
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={80} color="#666" />
          <Text style={styles.emptyText}>No hay solicitudes</Text>
          <Text style={styles.emptySubtext}>
            Las solicitudes de conexión aparecerán aquí
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#363636',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#363636',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(217, 185, 126, 0.3)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#fff',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#ff4d4d',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 8,
    textAlign: 'center',
  },
});