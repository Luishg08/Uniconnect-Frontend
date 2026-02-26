import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/useAuthStore';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { showToast } from '@/src/lib/toast';

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: authService.loginWithGoogle,

    onSuccess: (data) => {
      setAuth(data.access_token, data.user);
      showToast.success('¡Éxito!', 'Sesión iniciada correctamente');
      router.replace('/(tabs)');
    },

    onError: (error: any) => {
       const errorMessage = 
        error.response?.data?.message ||  
        error.response?.data?.error ||    
        error.message ||                 
        'No se pudo conectar con el servidor';
      
      showToast.error('Error', errorMessage);
    }
  });
}