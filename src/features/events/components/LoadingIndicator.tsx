import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

/**
 * LoadingIndicator - Pure component for loading state
 * Shows spinner and loading message
 * ⭐ FIX: Shows helpful message for slow connections (Render cold start)
 */
export const LoadingIndicator: React.FC = () => {
  const [showSlowMessage, setShowSlowMessage] = useState(false);

  useEffect(() => {
    // Show "slow connection" message after 5 seconds
    const timer = setTimeout(() => {
      setShowSlowMessage(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0056b3" />
      <Text style={styles.text}>Cargando eventos...</Text>
      {showSlowMessage && (
        <Text style={styles.slowText}>
          El servidor está iniciando, esto puede tomar hasta 60 segundos...
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  slowText: {
    marginTop: 12,
    fontSize: 14,
    color: '#ff9800',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 20,
  },
});
