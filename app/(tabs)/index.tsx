import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuthStore } from '@/src/features/auth';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const firstName = user?.full_name?.split(' ')[0] || 'Usuario';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.welcomeSection}>
        <Text style={styles.greeting}>¡Hola, {firstName}! 👋</Text>
        <Text style={styles.subtitle}>Bienvenido a tu panel de UniConnect.</Text>
      </View>
      
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>Tip: Usa el menú superior para navegar rápidamente entre secciones.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  welcomeSection: { marginBottom: 25, marginTop: 10 },
  greeting: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a' },
  subtitle: { fontSize: 16, color: '#666' },
  statusCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    borderLeftWidth: 5,
    borderLeftColor: '#007AFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    marginBottom: 20,
  },
  statusTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  statusText: { color: '#444' },
  infoBox: { padding: 15, backgroundColor: '#e1f5fe', borderRadius: 10 },
  infoText: { color: '#01579b', fontSize: 13, textAlign: 'center' }
});