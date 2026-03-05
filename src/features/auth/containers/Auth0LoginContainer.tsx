import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AuthButton } from '@/src/components/elements';
import { useAuth0Login } from '../hooks/useAuth0Login';
import { authController } from '../controllers/AuthController';

export const Auth0LoginContainer: React.FC = () => {
  const { promptAsync, isLoading, isReady } = useAuth0Login();
  
  // State management for reactive UI updates
  const [isAuthenticated, setIsAuthenticated] = useState(authController.isAuthenticated);
  const [currentUser, setCurrentUser] = useState(authController.currentUser);
  
  useEffect(() => {
    // Reactive state updates (will be replaced with MobX observer when TS issues resolved)
    const interval = setInterval(() => {
      setIsAuthenticated(authController.isAuthenticated);
      setCurrentUser(authController.currentUser);
    }, 100);
    
    return () => clearInterval(interval);
  }, []);

  // Business logic handlers
  const handleAuth0Login = () => {
    promptAsync();
  };

  const handleLogout = () => {
    authController.logout();
  };

  // Authenticated state UI
  if (isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.welcomeText}>
          Bienvenido, {currentUser?.full_name}
        </Text>
        <AuthButton
          authType="logout"
          onPress={handleLogout}
          disabled={isLoading}
        />
      </View>
    );
  }

  // Unauthenticated state UI
  return (
    <View style={styles.container}>
      <AuthButton
        authType="auth0"
        onPress={handleAuth0Login}
        isLoading={isLoading}
        disabled={!isReady}
      />
      
      <Text style={styles.infoText}>
        Autenticación segura con Auth0 Universal Login
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  welcomeText: {
    color: '#333',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  infoText: {
    color: '#666',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});