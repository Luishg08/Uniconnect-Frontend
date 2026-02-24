import { View, StyleSheet, Text } from 'react-native';
import { GoogleLoginButton } from '@/src/features/auth';

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>UniConnect</Text>
      <GoogleLoginButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});