import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ConsultationScreen from '../app/consultation';

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

jest.mock('expo-image', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Image: (props: any) => React.createElement(View, props),
  };
});

describe('ConsultationScreen Submission Flow', () => {
  it('should render forms and submit strategy consultation request successfully', () => {
    const { getByText, getByPlaceholderText } = render(<ConsultationScreen />);

    expect(getByText('AWARD CONCIERGE')).toBeTruthy();
    expect(getByText('Book a 1-on-1 Strategy Session')).toBeTruthy();

    const nameInput = getByPlaceholderText('Your Name');
    const goalInput = getByPlaceholderText('Destination / Goal (e.g. Honeymoon to Maldives)');

    fireEvent.changeText(nameInput, 'Barry Developer');
    fireEvent.changeText(goalInput, 'Maldives flight sweet spot');

    const submitBtn = getByText('Submit Request');
    fireEvent.press(submitBtn);

    // Verify success box
    expect(getByText('Request Received!')).toBeTruthy();
    expect(getByText(/Our concierge team will reach out to Barry Developer shortly/i)).toBeTruthy();
  });
});
