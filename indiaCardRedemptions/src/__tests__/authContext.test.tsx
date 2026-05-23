import React, { useContext } from 'react';
import { renderHook, act } from '@testing-library/react-native';
import SecureStore from 'expo-secure-store';
import LocalAuthentication from 'expo-local-authentication';
import { AuthProvider, AuthContext } from '../context/AuthContext';

// Mock Expo SecureStore
jest.mock('expo-secure-store', () => {
  let store: Record<string, string> = {};
  return {
    setItemAsync: jest.fn((key: string, value: string) => {
      store[key] = value;
      return Promise.resolve();
    }),
    getItemAsync: jest.fn((key: string) => {
      return Promise.resolve(store[key] || null);
    }),
    deleteItemAsync: jest.fn((key: string) => {
      delete store[key];
      return Promise.resolve();
    }),
    __clear: () => {
      store = {};
    }
  };
});

// Mock Expo LocalAuthentication
jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn().mockResolvedValue(true),
  isEnrolledAsync: jest.fn().mockResolvedValue(true),
  authenticateAsync: jest.fn().mockResolvedValue({ success: true }),
}));

describe('AuthContext TDD Specifications', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    const secureStoreMock = require('expo-secure-store');
    if (secureStoreMock.__clear) {
      secureStoreMock.__clear();
    }
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  it('should initialize with null user and loading true', async () => {
    const { result } = renderHook(() => useContext(AuthContext), { wrapper });
    // Initially user is null, and it is loading session from secure store
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(true);
    await act(async () => {
      await Promise.resolve();
    });
  });

  it('should login successfully with valid credentials and save session', async () => {
    const { result } = renderHook(() => useContext(AuthContext), { wrapper });
    
    // Wait for auto-login check to finish
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      const success = await result.current.login('admin@pointsarray.com', 'AdminPass123!');
      expect(success).toBe(true);
    });

    expect(result.current.user).toEqual({ email: 'admin@pointsarray.com' });
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      'AUTH_SESSION_TOKEN',
      expect.any(String)
    );
  });

  it('should fail login with invalid credentials', async () => {
    const { result } = renderHook(() => useContext(AuthContext), { wrapper });
    
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      const success = await result.current.login('wrong@email.com', 'badpass');
      expect(success).toBe(false);
    });

    expect(result.current.user).toBeNull();
  });

  it('should register a new user successfully', async () => {
    const { result } = renderHook(() => useContext(AuthContext), { wrapper });
    
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      const success = await result.current.register('new@pointsarray.com', 'Password123!');
      expect(success).toBe(true);
    });

    expect(result.current.user).toEqual({ email: 'new@pointsarray.com' });
  });

  it('should authenticate biometrics successfully', async () => {
    const { result } = renderHook(() => useContext(AuthContext), { wrapper });
    
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      const success = await result.current.authenticateBiometrics();
      expect(success).toBe(true);
    });

    expect(result.current.user).toEqual({ email: 'biometric-user@pointsarray.com' });
    expect(LocalAuthentication.authenticateAsync).toHaveBeenCalled();
  });

  it('should fail biometric auth if sensor rejects or user cancels', async () => {
    const localAuth = require('expo-local-authentication');
    localAuth.authenticateAsync.mockResolvedValueOnce({ success: false, error: 'user_cancel' });

    const { result } = renderHook(() => useContext(AuthContext), { wrapper });
    
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      const success = await result.current.authenticateBiometrics();
      expect(success).toBe(false);
    });

    expect(result.current.user).toBeNull();
  });

  it('should logout and clear session from secure store', async () => {
    const { result } = renderHook(() => useContext(AuthContext), { wrapper });
    
    await act(async () => {
      await Promise.resolve();
    });

    // Login first
    await act(async () => {
      await result.current.login('admin@pointsarray.com', 'AdminPass123!');
    });

    // Logout
    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('AUTH_SESSION_TOKEN');
  });

  it('should auto-login if token is found in secure store', async () => {
    // Seed secure store
    await SecureStore.setItemAsync('AUTH_SESSION_TOKEN', 'valid-session-token');

    const { result } = renderHook(() => useContext(AuthContext), { wrapper });
    
    await act(async () => {
      await Promise.resolve(); // trigger useEffect auto-login check
    });

    expect(result.current.user).toEqual({ email: 'admin@pointsarray.com' });
    expect(result.current.loading).toBe(false);
  });
});
