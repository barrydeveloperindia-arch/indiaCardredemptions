import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ConciergeScreen from '../app/concierge';

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

describe('ConciergeScreen Inquiry Submission Flow', () => {
  it('should allow filling and submitting the concierge strategy blueprint request', () => {
    const { getByText, getByPlaceholderText } = render(<ConciergeScreen />);

    expect(getByText('Executive Concierge')).toBeTruthy();
    expect(getByText('Request a Strategy Blueprint')).toBeTruthy();

    const nameInput = getByPlaceholderText('e.g. Rahul Sharma');
    const portfolioInput = getByPlaceholderText('e.g. 400,000 HDFC + 200,000 Amex');
    const destInput = getByPlaceholderText('e.g. 2 adults to London in Business Class, late November.');

    fireEvent.changeText(nameInput, 'Rahul Sharma');
    fireEvent.changeText(portfolioInput, 'Infinia & Atlas');
    fireEvent.changeText(destInput, 'London business class');

    const submitBtn = getByText(/Initialize Request/);
    fireEvent.press(submitBtn);

    // Verify success box
    expect(getByText('Request Received.')).toBeTruthy();
    expect(getByText('An architect will contact you within 4 hours.')).toBeTruthy();
  });
});
