import React from 'react';
import { render } from '@testing-library/react-native';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ThemedText } from '../components/ThemedText';

// A component that throws an error when rendered
const ThrowingComponent = () => {
  throw new Error('Test rendering error');
};

describe('ErrorBoundary Component', () => {
  // Prevent Jest from flooding output with error logs during throwing tests
  let originalError: typeof console.error;
  beforeAll(() => {
    originalError = console.error;
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('renders children normally when no error occurs', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThemedText type="default">Safe Content</ThemedText>
      </ErrorBoundary>
    );

    expect(getByText('Safe Content')).toBeTruthy();
  });

  it('catches runtime errors and renders the recovery UI', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(getByText('Something went wrong.')).toBeTruthy();
    expect(getByText(/The Points Array application encountered an unexpected error/i)).toBeTruthy();
  });
});
