import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { OfflineBanner } from '../components/OfflineBanner';
import { getNetworkState } from '../utils/network';

jest.mock('../utils/network', () => {
  return {
    getNetworkState: jest.fn(),
  };
});

jest.mock('expo-blur', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    BlurView: (props: any) => React.createElement(View, props),
  };
});

describe('Offline Connection Status Banner UI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should remain hidden when device has active internet reachability', async () => {
    (getNetworkState as jest.Mock).mockResolvedValue({
      isConnected: true,
    });

    const { queryByText } = render(<OfflineBanner />);
    
    // Banner should not be visible when online
    await waitFor(() => {
      expect(queryByText(/YOU ARE OFFLINE/i)).toBeNull();
    });
  });

  it('should render warning banner when connection reports offline status', async () => {
    (getNetworkState as jest.Mock).mockResolvedValue({
      isConnected: false,
    });

    const { getByText } = render(<OfflineBanner />);

    // Banner must display the warning message when offline
    await waitFor(() => {
      expect(getByText(/YOU ARE OFFLINE/i)).toBeTruthy();
    });
  });
});
