import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import TabTwoScreen from '../app/explore';
import { WalletProvider } from '../context/WalletContext';

// Mocks
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
    useSharedValue: jest.fn(() => ({ value: 0 })),
    useAnimatedStyle: jest.fn(() => ({})),
    withRepeat: jest.fn(),
    withTiming: jest.fn(),
    withSequence: jest.fn(),
    withDelay: jest.fn(),
    Easing: { linear: jest.fn() },
  };
});

jest.mock('expo-image', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Image: (props: any) => React.createElement(View, props),
  };
});

jest.mock('expo-symbols', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    SymbolView: (props: any) => React.createElement(View, props),
  };
});

describe('TabTwoScreen (Explore/Arbitrage Screen) [FT-104_ExploreScreen]', () => {
  it('should render headers, default to Hotel Arbitrage, and display the calculator', () => {
    const { getByText } = render(
      <WalletProvider>
        <TabTwoScreen />
      </WalletProvider>
    );

    expect(getByText('THE INDIAN POINTS ARRAY')).toBeTruthy();
    expect(getByText('Point Arbitrage')).toBeTruthy();
    expect(getByText('Hotel Arbitrage')).toBeTruthy();
    expect(getByText('London & Europe Solver')).toBeTruthy();

    // Default activeMode is 'hotel', so ArbitrageCalculator should render
    expect(getByText('Arbitrage Yield Analyzer')).toBeTruthy();
  });

  it('should toggle to Flight Solver mode and show trip solver details', () => {
    const { getByText, queryByText } = render(
      <WalletProvider>
        <TabTwoScreen />
      </WalletProvider>
    );

    const flightTab = getByText('London & Europe Solver');
    fireEvent.press(flightTab);

    // Should display Flight Solver UI
    expect(getByText('London & Europe Trip Solver')).toBeTruthy();
    expect(getByText('SELECT DESIRED CABIN CLASS')).toBeTruthy();
    expect(getByText('Business Class (65k Aeroplan)')).toBeTruthy();

    // Hotel Arbitrage calculator should be hidden
    expect(queryByText('Arbitrage Yield Analyzer')).toBeNull();
  });

  it('should change cabin class and update target programs and required points', () => {
    const { getByText } = render(
      <WalletProvider>
        <TabTwoScreen />
      </WalletProvider>
    );

    fireEvent.press(getByText('London & Europe Solver'));

    // Default should be business class (Aeroplan)
    expect(getByText('TARGET PROGRAM: Air Canada Aeroplan (Star Alliance)')).toBeTruthy();

    // Switch to Economy class
    const economyTab = getByText('Economy Class (35k Avios)');
    fireEvent.press(economyTab);

    expect(getByText('TARGET PROGRAM: Qatar Airways Avios (Oneworld)')).toBeTruthy();
  });

  it('should run E2E flight booking checkout flow successfully', async () => {
    const { getByText, getByPlaceholderText, findByText } = render(
      <WalletProvider>
        <TabTwoScreen />
      </WalletProvider>
    );

    fireEvent.press(getByText('London & Europe Solver'));

    // Trigger Book flight cash booking
    const bookBtn = getByText('Book Cash Flight (Duffel API Checkout)');
    expect(bookBtn).toBeTruthy();
    fireEvent.press(bookBtn);

    // Form details
    expect(getByText('Passenger Details')).toBeTruthy();
    fireEvent.changeText(getByPlaceholderText('First Name (e.g. John)'), 'Barry');
    fireEvent.changeText(getByPlaceholderText('Last Name (e.g. Doe)'), 'Developer');
    fireEvent.changeText(getByPlaceholderText('Email Address'), 'barry@example.com');
    fireEvent.changeText(getByPlaceholderText('Passport Number'), 'Z1234567');

    const confirmBtn = getByText('Confirm Flight Details');
    fireEvent.press(confirmBtn);

    // Assert confirmed details
    expect(await findByText('Booking Confirmed!')).toBeTruthy();
    expect(getByText('PNR Reference:')).toBeTruthy();

    const resetBtn = getByText('Book Another Flight');
    fireEvent.press(resetBtn);

    // Back to flight main screen
    expect(getByText('Book Cash Flight (Duffel API Checkout)')).toBeTruthy();
  });
});
