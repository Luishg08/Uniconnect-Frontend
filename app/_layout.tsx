import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { authStore } from '@/src/features/auth';
import { AppRoot } from '@/src/components/AppRoot';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { observer } from 'mobx-react-lite';
import { reaction } from 'mobx';

const queryClient = new QueryClient();

const RootNavigationWrapper = observer(() => {
  const [token, setToken] = useState(authStore.accessToken);
  const segments = useSegments();
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);

  // Subscribe to auth state changes using MobX
  useEffect(() => {
    const disposer = reaction(
      () => authStore.accessToken,
      (nextToken) => {
        setToken(nextToken);
      },
      { fireImmediately: true }
    );

    return () => {
      disposer();
    };
  }, []);

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

  useEffect(() => {
    async function getExpoToken() {
      if (!Device.isDevice) {
        console.log('Usa un dispositivo físico');
        return;
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();

      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } =
          await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log("Permiso denegado");
        return;
      }

      //const token = (await Notifications.getExpoPushTokenAsync()).data;

      //console.log('EXPO PUSH TOKEN:', token);
    }

    getExpoToken();
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRoot>
        <RootNavigationWrapper />
      </AppRoot>
    </QueryClientProvider>
  );
}