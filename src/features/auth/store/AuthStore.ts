import { makeAutoObservable } from 'mobx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/user.types';

export class AuthStore {
  accessToken: string | null = null;
  user: User | null = null; // ⭐ FIX: Properly typed User interface
  isLoading: boolean = false;
  error: string | null = null;
  needsOnboarding: boolean = false;
  
  auth0Tokens: {
    access_token?: string;
    id_token?: string;
    refresh_token?: string;
    expires_in?: number;
    expires_at?: number; // Calculated expiration timestamp
  } | null = null;

  isInitialized: boolean = false;
  isRefreshing: boolean = false; // Guard against simultaneous refresh attempts

  constructor() {
    makeAutoObservable(this);
    this.initializeFromStorage();
  }

  get isAuthenticated() {
    return !!this.accessToken;
  }

  get isTokenExpired() {
    if (!this.auth0Tokens?.expires_at) return false;
    return Date.now() >= this.auth0Tokens.expires_at;
  }

  get hasRefreshToken() {
    return !!this.auth0Tokens?.refresh_token;
  }

  setAuth(token: string, userData: User, auth0TokensData?: any) {
    this.accessToken = token;
    
    // ⭐ FIX: Properly extract and store role data
    // Ensure role object and roleName are preserved
    this.user = {
      ...userData,
      role: userData.role, // Role object from backend response
      roleName: userData.roleName, // Role name from JWT or backend
    };
    
    this.error = null;
    this.needsOnboarding = userData?.needsOnboarding ?? false;
    
    // Store Auth0 tokens with expiration calculation
    if (auth0TokensData) {
      // Ensure expires_in has a reasonable default (24 hours = 86400 seconds)
      const expiresIn = auth0TokensData.expires_in || 86400;
      
      // Validate that expires_in is a reasonable duration (at least 60 seconds, at most 30 days)
      const validExpiresIn = Math.max(60, Math.min(expiresIn, 30 * 24 * 60 * 60));
      
      this.auth0Tokens = {
        ...auth0TokensData,
        expires_in: validExpiresIn,
        expires_at: Date.now() + (validExpiresIn * 1000)
      };
      
      console.log('Auth tokens stored:', {
        hasAccessToken: !!auth0TokensData.access_token,
        hasIdToken: !!auth0TokensData.id_token,
        hasRefreshToken: !!auth0TokensData.refresh_token,
        expiresIn: validExpiresIn,
        expiresAt: this.auth0Tokens?.expires_at ? new Date(this.auth0Tokens.expires_at).toISOString() : 'unknown',
      });
      
      if (!auth0TokensData.refresh_token) {
        console.warn('WARNING: No refresh_token received from backend!');
      }
    } else {
      console.warn('WARNING: No auth0TokensData provided to setAuth!');
    }

    // Persist to storage
    this.persistToStorage();
  }

  setLoading(status: boolean) {
    this.isLoading = status;
  }

  setError(errorMessage: string) {
    this.error = errorMessage;
    this.isLoading = false;
  }

  clearError() {
    this.error = null;
  }

  clearAuth() {
    this.accessToken = null;
    this.user = null;
    this.error = null;
    this.auth0Tokens = null;
    this.needsOnboarding = false;
    this.isRefreshing = false; // Reset refresh guard
    
    // Clear from storage
    this.clearFromStorage();
  }

  /**
   * Update user profile data (for profile updates)
   */
  updateUser(userData: User) {
    // ⭐ FIX: Preserve role data when updating user
    this.user = {
      ...userData,
      role: userData.role,
      roleName: userData.roleName,
    };
    this.persistToStorage();
  }

  setNeedsOnboarding(value: boolean) {
    this.needsOnboarding = value;
    this.persistToStorage();
  }

  private async initializeFromStorage() {
    try {
      const storedAuth = await AsyncStorage.getItem('uniconnect-auth');
      if (storedAuth) {
        const authData = JSON.parse(storedAuth);
        
        // ⭐ FIX: Detect and clean legacy cached data without role structure
        if (authData.user && authData.user.id_role && !authData.user.role && !authData.user.roleName) {
          console.warn('Legacy cached data detected without role structure - clearing auth');
          await this.clearFromStorage();
          this.isInitialized = true;
          return;
        }
        
        // Restore auth state
        this.accessToken = authData.accessToken;
        this.user = authData.user;
        this.auth0Tokens = authData.auth0Tokens;
        this.needsOnboarding = authData.needsOnboarding ?? false;
        
        console.log('Auth state restored from storage');
      }
    } catch (error) {
      console.error('Failed to restore auth state from storage:', error);
    } finally {
      this.isInitialized = true;
    }
  }

  private async persistToStorage() {
    try {
      const authData = {
        accessToken: this.accessToken,
        user: this.user,
        auth0Tokens: this.auth0Tokens,
        needsOnboarding: this.needsOnboarding,
      };
      
      await AsyncStorage.setItem('uniconnect-auth', JSON.stringify(authData));
      console.log('Auth state persisted to storage');
    } catch (error) {
      console.error('Failed to persist auth state to storage:', error);
    }
  }

  private async clearFromStorage() {
    try {
      await AsyncStorage.removeItem('uniconnect-auth');
      console.log('Auth state cleared from storage');
    } catch (error) {
      console.error('Failed to clear auth state from storage:', error);
    }
  }
}

// Instancia Singleton para inyección simple (Kiro Pattern Base)
export const authStore = new AuthStore();