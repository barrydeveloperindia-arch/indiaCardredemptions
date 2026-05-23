import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PassengerForm } from '../components/PassengerForm';

// Mocks for standard styles or components
jest.mock('expo-blur', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { BlurView: (props: any) => React.createElement(View, props) };
});

describe('PassengerForm Component', () => {
  const mockSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render form fields correctly', () => {
    const { getByPlaceholderText, getByText } = render(
      <PassengerForm onSubmit={mockSubmit} />
    );

    expect(getByPlaceholderText('First Name (e.g. John)')).toBeTruthy();
    expect(getByPlaceholderText('Last Name (e.g. Doe)')).toBeTruthy();
    expect(getByPlaceholderText('Email Address')).toBeTruthy();
    expect(getByPlaceholderText('Passport Number')).toBeTruthy();
    expect(getByText('Confirm Flight Details')).toBeTruthy();
  });

  it('should validate inputs and display error if fields are empty', () => {
    const { getByText } = render(
      <PassengerForm onSubmit={mockSubmit} />
    );

    const submitBtn = getByText('Confirm Flight Details');
    fireEvent.press(submitBtn);

    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('should submit successfully when all fields are filled correctly', () => {
    const { getByPlaceholderText, getByText } = render(
      <PassengerForm onSubmit={mockSubmit} />
    );

    fireEvent.changeText(getByPlaceholderText('First Name (e.g. John)'), 'Barry');
    fireEvent.changeText(getByPlaceholderText('Last Name (e.g. Doe)'), 'Developer');
    fireEvent.changeText(getByPlaceholderText('Email Address'), 'barry@example.com');
    fireEvent.changeText(getByPlaceholderText('Passport Number'), 'A1234567');

    const submitBtn = getByText('Confirm Flight Details');
    fireEvent.press(submitBtn);

    expect(mockSubmit).toHaveBeenCalledWith({
      firstName: 'Barry',
      lastName: 'Developer',
      email: 'barry@example.com',
      passportNumber: 'A1234567',
    });
  });
});
