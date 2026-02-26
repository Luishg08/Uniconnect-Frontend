import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/src/features/auth';
import { Platform } from 'react-native';


const queryClient = new QueryClient();

function RootNavigation() {
  const { token } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const inAuthGroup = segments[0] === '(auth)';

    setTimeout(() => {
      if (!token && !inAuthGroup) {
        router.replace('/(auth)/login');
      } else if (token && inAuthGroup) {
        router.replace('/(tabs)');
      }
    }, 1);

  }, [token, segments, isMounted]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootNavigation />
    </QueryClientProvider>
  );
}