import React from 'react';
import { render } from '@testing-library/react-native';
import DealsScreen from '../app/deals';
import IntelScreen from '../app/intel';
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

describe('DealsScreen Visual Layout', () => {
  it('should render page headers and active buy deals list with purchase recommendations', () => {
    const { getByText } = render(
      <WalletProvider>
        <DealsScreen />
      </WalletProvider>
    );

    expect(getByText('LIVE POINTS SALES TRACKER')).toBeTruthy();
    expect(getByText('Active Buy Deals')).toBeTruthy();
    expect(getByText(/A dynamic ledger of live airline and hotel point sales/i)).toBeTruthy();

    // Verify list items cost calculation rates are rendering
    expect(getByText('Hilton Honors')).toBeTruthy();
    expect(getByText('Qatar Privilege Club')).toBeTruthy();
  });
});

describe('IntelScreen Visual Layout', () => {
  it('should render devaluations and unannounced updates with impact boxes', () => {
    const { getByText, queryAllByText } = render(<IntelScreen />);

    expect(getByText('THE POINTS ARRAY INTEL')).toBeTruthy();
    expect(getByText('The Latest Intelligence')).toBeTruthy();

    // Devaluations unannounced alert badges
    const devalBadges = queryAllByText('DEVALUATION');
    expect(devalBadges.length).toBeGreaterThan(0);

    // Sweet Spot unannounced alert badges
    const sweetSpotBadges = queryAllByText('SWEET SPOT');
    expect(sweetSpotBadges.length).toBeGreaterThan(0);

    // Tactical impact boxes
    const impactLabels = queryAllByText('TACTICAL IMPACT');
    expect(impactLabels.length).toBeGreaterThan(0);
  });
});
