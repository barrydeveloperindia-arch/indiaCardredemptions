import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AuthContext } from '../context/AuthContext';
import { WalletProvider } from '../context/WalletContext';
import HomeScreen from '../app/index';

// Mock Expo components and Reanimated
jest.mock('expo-router/head', () => {
  return {
    __esModule: true,
    default: 'Head',
  };
});

jest.mock('expo-blur', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    BlurView: (props: any) => React.createElement(View, props),
  };
});

jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: (props: any) => React.createElement(View, props),
  };
});

jest.mock('expo-image', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Image: (props: any) => React.createElement(View, props),
  };
});

jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: {
      View: (props: any) => React.createElement(View, props),
    },
    FadeInDown: { delay: () => ({ springify: () => {} }) },
    FadeIn: { duration: () => ({ springify: () => {} }) },
    SlideInRight: { delay: () => ({ springify: () => {} }) },
    useSharedValue: (val: number) => ({ value: val }),
    useAnimatedStyle: (fn: () => any) => fn(),
    withRepeat: (anim: any) => anim,
    withTiming: (toVal: number) => ({ value: toVal }),
    Easing: { linear: () => {} },
  };
});

import { useWallet } from '../context/WalletContext';

// Mock WalletContext hook
jest.mock('../context/WalletContext', () => ({
  useWallet: jest.fn(),
}));

describe('HomeScreen Component & Logout Integration Specs', () => {
  const mockLogout = jest.fn();
  const mockContextValue = {
    user: { email: 'admin@pointsarray.com' },
    loading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: mockLogout,
    authenticateBiometrics: jest.fn(),
  };

  const defaultWalletData = {
    cards: [
      { cardId: 'axis_m4b', balance: 56000, spend: 400000 },
      { cardId: 'amex_platinum', balance: 120000, spend: 350000 },
    ],
    updateBalance: jest.fn(),
    updateSpend: jest.fn(),
    walletBalances: { axis_m4b: 56000, amex_platinum: 120000 },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useWallet as jest.Mock).mockReturnValue(defaultWalletData);
  });

  it('should render the HomeScreen header and trigger logout when pressed', () => {
    const { getByTestId, getByText } = render(
      <AuthContext.Provider value={mockContextValue}>
        <HomeScreen />
      </AuthContext.Provider>
    );

    // Verify title and logout button render
    expect(getByText('Where will your points take you?')).toBeTruthy();
    
    const logoutBtn = getByTestId('logout-button');
    expect(logoutBtn).toBeTruthy();

    // Trigger logout press
    fireEvent.press(logoutBtn);
    expect(mockLogout).toHaveBeenCalled();
  });

  it('should render the search input and placeholder correctly', () => {
    const { getByPlaceholderText } = render(
      <AuthContext.Provider value={mockContextValue}>
        <HomeScreen />
      </AuthContext.Provider>
    );

    const searchInput = getByPlaceholderText('Search "London", "Maldives"...');
    expect(searchInput).toBeTruthy();
  });

  it('should show the VIP High Ticket consultation banner only if points are >= 500,000', () => {
    // 1. Point balance < 500k: Banner should NOT be visible
    const { queryByTestId, rerender } = render(
      <AuthContext.Provider value={mockContextValue}>
        <HomeScreen />
      </AuthContext.Provider>
    );
    expect(queryByTestId('vip-banner')).toBeNull();

    // 2. Point balance >= 500k: Banner should render
    (useWallet as jest.Mock).mockReturnValue({
      ...defaultWalletData,
      cards: [
        { cardId: 'axis_m4b', balance: 350000, spend: 400000 },
        { cardId: 'amex_platinum', balance: 250000, spend: 350000 },
      ],
      walletBalances: { axis_m4b: 350000, amex_platinum: 250000 },
    });

    rerender(
      <AuthContext.Provider value={mockContextValue}>
        <HomeScreen />
      </AuthContext.Provider>
    );

    expect(queryByTestId('vip-banner')).toBeTruthy();
  });
});
