import { useAuthRequest, makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import Constants from 'expo-constants';
import { AUTH0_CONFIG } from '../constants/auth0';
import { authStore } from '../store/AuthStore';
import { authController } from '../controllers/AuthController';
import { showToast } from '@/src/lib/toast';

// Complete the auth session for web browsers
WebBrowser.maybeCompleteAuthSession();

/**
 * TSK-2.3: Auth0 Universal Login Hook
 * Implements Authorization Code with PKCE flow for Auth0 authentication
 * Following Kiro Framework MVC Local pattern
 */
export function useAuth0Login() {
  const isExpoGo =
    Constants.executionEnvironment === 'storeClient' ||
    Constants.appOwnership === 'expo' ||
    Constants.appOwnership === 'guest';

  const appOwner = Constants.expoConfig?.owner;
  const appSlug = Constants.expoConfig?.slug;
  const projectFullName = appOwner && appSlug ? `@${appOwner}/${appSlug}` : null;

  const nativeReturnUrl = makeRedirectUri({
    scheme: 'uniconnect', // Exactamente como está en el app.json del Director
    path: 'callback',
  });

  const expoProxyRedirectUri = projectFullName
    ? `https://auth.expo.io/${projectFullName}`
    : null;

  const redirectUri = isExpoGo && expoProxyRedirectUri ? expoProxyRedirectUri : nativeReturnUrl;

  console.log('\n======================================================');
  console.log('✅ URL DEFINITIVA (LÓGICA DEL PROFESOR):');
  console.log(redirectUri);
  console.log('======================================================\n');

  // Configure Auth0 authorization request
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: AUTH0_CONFIG.clientId,
      scopes: AUTH0_CONFIG.scopes,
      responseType: 'code', // Authorization Code flow
      redirectUri,
      extraParams: {
        audience: AUTH0_CONFIG.audience, // Move audience to extraParams
        // Enable PKCE for security
        code_challenge_method: 'S256',
      },
    },
    {
      authorizationEndpoint: `https://${AUTH0_CONFIG.domain}/authorize`,
    }
  );

  // Handle the authentication response
  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      
      if (code) {
        // Delegate to AuthController (MVC Local pattern)
        authController.handleAuthorizationCode(code, redirectUri);
      }
    } else if (response?.type === 'error') {
      const errorMessage = response.params?.error_description || 'Error en la autenticación';
      authStore.setError(errorMessage);
      showToast.error('Error', errorMessage);
    } else if (response?.type === 'cancel') {
      authStore.setLoading(false);
      showToast.error('Cancelado', 'Autenticación cancelada por el usuario');
    }
  }, [response, redirectUri]);

  // Return the prompt function and loading state
  return {
    promptAsync: () => {
      authStore.setLoading(true);
      authStore.clearError();
      promptAsync();
    },
    isLoading: authStore.isLoading,
    isReady: !!request,
  };
}