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

export default function ConnectionsScreen() {
  const {
    pendingRequests,
    isLoading,
    isError,
    acceptConnectionRequest,
    rejectConnectionRequest,
    isAccepting,
    isRejecting,
  } = useConnections();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    // React Query automáticamente refetch cuando se invalida
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4169e1" />
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
              onAccept={() => acceptConnectionRequest(item.id_connection)}
              onReject={() => rejectConnectionRequest(item.id_connection)}
              isAccepting={isAccepting}
              isRejecting={isRejecting}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#4169e1"
              colors={['#4169e1']}
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
    backgroundColor: '#192331',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#192331',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#181835',
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