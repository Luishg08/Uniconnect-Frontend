import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuthStore } from '@/src/features/auth';

export default function HomeScreen() {
  const { user, logout } = useAuthStore();

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>¡Bienvenido, {user?.full_name}!</Text>
      <Text style={styles.email}>{user?.email}</Text>
      
      <View style={{ marginTop: 20 }}>
        <Button title="Cerrar Sesión" onPress={logout} color="red" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  welcome: { fontSize: 20, fontWeight: 'bold' },
  email: { color: 'gray' }
});