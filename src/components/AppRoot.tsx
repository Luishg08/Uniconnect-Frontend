import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAppInitialization, useTokenRefresh } from '@/src/features/auth';

interface AppRootProps {
  children: React.ReactNode;
}

export const AppRoot: React.FC<AppRootProps> = ({ children }) => {
  const { isInitializing, initializationError } = useAppInitialization();
  
  useTokenRefresh();

  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0056b3" />
        <Text style={styles.loadingText}>Inicializando aplicación...</Text>
      </View>
    );
  }

  if (initializationError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Error de Inicialización</Text>
        <Text style={styles.errorMessage}>{initializationError}</Text>
        <Text style={styles.errorHint}>
          Por favor, reinicia la aplicación o contacta soporte técnico.
        </Text>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorHint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});