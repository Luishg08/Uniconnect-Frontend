import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/useAuthStore';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: authService.loginWithGoogle,
    
    onSuccess: (data) => {
      setAuth(data.access_token, data.user); 
      Alert.alert("¡Éxito!", "Sesión iniciada correctamente");
      router.replace('/(tabs)');
    },
    
    onError: (error) => {
      Alert.alert("Error", "No se pudo conectar con el servidor");
      console.error(error);
    }
  });
}