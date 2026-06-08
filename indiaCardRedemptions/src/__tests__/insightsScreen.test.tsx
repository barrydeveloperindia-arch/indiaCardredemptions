import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import InsightsScreen from '../app/insights';

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

describe('InsightsScreen (Hacks & Multi-Dips) [FT-107_InsightsScreen]', () => {
  it('should render the facts section with live MCC checker by default', () => {
    const { getByText, getByPlaceholderText } = render(<InsightsScreen />);

    expect(getByText('THE INDIAN POINTS ARRAY HACKS')).toBeTruthy();
    expect(getByText('Insights & Multi-Dips')).toBeTruthy();
    expect(getByText('CARD FACTS & EXCLUSIONS')).toBeTruthy();
    expect(getByText('DOUBLE & TRIPLE DIPS')).toBeTruthy();

    // Live MCC checker
    expect(getByText('Interactive Axis Atlas MCC Checker')).toBeTruthy();
    expect(getByPlaceholderText('Enter merchant or processor name...')).toBeTruthy();
  });

  it('should verify live MCC eligibility outputs', () => {
    const { getByPlaceholderText, getByText } = render(<InsightsScreen />);

    const searchInput = getByPlaceholderText('Enter merchant or processor name...');

    // Type rent spends
    fireEvent.changeText(searchInput, 'Rent payment via RedGirraffe');
    expect(getByText('EXCLUDED (0X Edge Miles)')).toBeTruthy();

    // Type eligible merchant
    fireEvent.changeText(searchInput, 'Marriott luxury hotel stay');
    expect(getByText('ELIGIBLE (5X Edge Miles)')).toBeTruthy();
  });

  it('should lock the double dips section behind a paywall and unlock on subscription', () => {
    const { getByText, queryByText } = render(<InsightsScreen />);

    // Toggle to dips tab
    fireEvent.press(getByText('DOUBLE & TRIPLE DIPS'));

    // Should display paywall
    expect(getByText('Unlock The Indian Points Array Pro')).toBeTruthy();
    expect(getByText('Subscribe ₹4,999 / year')).toBeTruthy();

    // Calculators should be present but locked visually (within DOM)
    expect(getByText('Double/Triple Dip ROI Calculator')).toBeTruthy();

    // Click subscribe button to bypass paywall
    fireEvent.press(getByText('Subscribe ₹4,999 / year'));

    // Paywall should disappear
    expect(queryByText('Unlock The Indian Points Array Pro')).toBeNull();
  });
});
