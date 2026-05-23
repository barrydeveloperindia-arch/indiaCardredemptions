import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

interface User {
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  authenticateBiometrics: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => false,
  register: async () => false,
  logout: async () => {},
  authenticateBiometrics: async () => false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const token = await SecureStore.getItemAsync('AUTH_SESSION_TOKEN');
        if (token) {
          setUser({ email: 'admin@pointsarray.com' });
        }
      } catch (err) {
        console.error('Failed to load session', err);
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    if (email === 'admin@pointsarray.com' && pass === 'AdminPass123!') {
      await SecureStore.setItemAsync('AUTH_SESSION_TOKEN', 'dummy-admin-token');
      setUser({ email });
      return true;
    }
    return false;
  };

  const register = async (email: string, pass: string): Promise<boolean> => {
    // For local TDD demo, we allow registration for any valid email
    if (email.includes('@') && pass.length >= 6) {
      await SecureStore.setItemAsync('AUTH_SESSION_TOKEN', 'dummy-new-token');
      setUser({ email });
      return true;
    }
    return false;
  };

  const logout = async (): Promise<void> => {
    await SecureStore.deleteItemAsync('AUTH_SESSION_TOKEN');
    setUser(null);
  };

  const authenticateBiometrics = async (): Promise<boolean> => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      return false;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to access Points Array',
      fallbackLabel: 'Use Password',
    });

    if (result.success) {
      setUser({ email: 'biometric-user@pointsarray.com' });
      return true;
    }

    return false;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, authenticateBiometrics }}>
      {children}
    </AuthContext.Provider>
  );
};
