import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import SpringView from '../components/SpringView';
import { triggerHapticLight, triggerHapticSuccess, triggerHapticError } from '../utils/haptics';

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: {
    Light: 'light',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Error: 'error',
  },
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;
  return {
    __esModule: true,
    default: {
      View: View,
    },
    useSharedValue: (val: number) => ({ value: val }),
    useAnimatedStyle: (fn: () => any) => fn(),
    withSpring: (toVal: number) => ({ value: toVal }),
  };
});

describe('Haptics Utilities TDD Specifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should trigger light impact feedback', async () => {
    await triggerHapticLight();
    expect(Haptics.impactAsync).toHaveBeenCalledWith('light');
  });

  it('should trigger success notification feedback', async () => {
    await triggerHapticSuccess();
    expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');
  });

  it('should trigger error notification feedback', async () => {
    await triggerHapticError();
    expect(Haptics.notificationAsync).toHaveBeenCalledWith('error');
  });
});

describe('SpringView Component TDD Specifications', () => {
  it('should render children and trigger onPress and haptic action', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <SpringView onPress={mockOnPress}>
        <Text>TAP ME</Text>
      </SpringView>
    );

    const button = getByText('TAP ME');
    expect(button).toBeTruthy();

    fireEvent.press(button);
    expect(mockOnPress).toHaveBeenCalled();
    expect(Haptics.impactAsync).toHaveBeenCalledWith('light');
  });
});
