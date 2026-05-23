import React from 'react';
import { render, act } from '@testing-library/react-native';
import { AuthContext } from '../context/AuthContext';
import TabLayout from '../app/_layout';

// Mock Expo status bar
jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

// Mock WalletContext provider
jest.mock('@/context/WalletContext', () => ({
  WalletProvider: ({ children }: any) => children,
}));

// Mock React Navigation ThemeProvider
jest.mock('@react-navigation/native', () => ({
  DarkTheme: {
    colors: {},
  },
  ThemeProvider: ({ children }: any) => children,
}));

// Mock AnimatedSplashOverlay
jest.mock('@/components/AnimatedIcon', () => ({
  AnimatedSplashOverlay: () => null,
}));

// Mock AppTabs component
jest.mock('@/components/AppTabs', () => {
  const Text = require('react-native').Text;
  return () => <Text>Main App Tabs Content</Text>;
});

// Mock AuthContext and AuthProvider
const mockContextValue = {
  user: null as any,
  loading: false,
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  authenticateBiometrics: jest.fn(),
};

jest.mock('../context/AuthContext', () => {
  const React = require('react');
  const mockContext = React.createContext(mockContextValue);
  return {
    AuthContext: mockContext,
    AuthProvider: ({ children }: any) => {
      // In the layout component, the provider wraps AppContent.
      // We consume the context to dynamically decide rendering,
      // so we use the mock context provider.
      return (
        <mockContext.Provider value={mockContextValue}>
          {children}
        </mockContext.Provider>
      );
    },
  };
});

describe('Route Guard and TabLayout Authentication Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render AuthForm when user is unauthenticated', async () => {
    // Configure mock state before render
    mockContextValue.user = null;
    mockContextValue.loading = false;

    const { getByText } = render(<TabLayout />);

    // AuthForm welcome message should be visible
    expect(getByText('WELCOME BACK')).toBeTruthy();
  });

  it('should render AppTabs when user is authenticated', async () => {
    // Configure mock state before render
    mockContextValue.user = { email: 'admin@pointsarray.com' };
    mockContextValue.loading = false;

    const { getByText } = render(<TabLayout />);

    // Main App content should be visible
    expect(getByText('Main App Tabs Content')).toBeTruthy();
  });
});
