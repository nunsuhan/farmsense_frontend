import { Platform } from 'react-native';

const STORAGE_KEY = 'auth_tokens';

// 웹/네이티브 분기 처리
const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    const SecureStore = await import('expo-secure-store');
    return SecureStore.getItemAsync(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    const SecureStore = await import('expo-secure-store');
    await SecureStore.setItemAsync(key, value);
  },

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    const SecureStore = await import('expo-secure-store');
    await SecureStore.deleteItemAsync(key);
  }
};

/**
 * Save auth tokens securely
 */
export const setAuthTokens = async (accessToken: string, refreshToken: string) => {
  try {
    const tokens = JSON.stringify({ access: accessToken, refresh: refreshToken });
    await storage.setItem(STORAGE_KEY, tokens);
    console.log('🔐 [SecureStorage] Tokens saved');
  } catch (error) {
    console.error('❌ [SecureStorage] Failed to save tokens:', error);
  }
};

/**
 * Retrieve auth tokens
 */
export const getAuthTokens = async (): Promise<{ access: string; refresh: string } | null> => {
  try {
    const jsonValue = await storage.getItem(STORAGE_KEY);
    if (jsonValue) {
      return JSON.parse(jsonValue);
    }
    return null;
  } catch (error) {
    console.error('❌ [SecureStorage] Failed to retrieve tokens:', error);
    return null;
  }
};

/**
 * Clear auth tokens (Logout)
 */
export const clearAuthTokens = async () => {
  try {
    await storage.removeItem(STORAGE_KEY);
    console.log('🗑️ [SecureStorage] Tokens cleared');
  } catch (error) {
    console.error('❌ [SecureStorage] Failed to clear tokens:', error);
  }
};