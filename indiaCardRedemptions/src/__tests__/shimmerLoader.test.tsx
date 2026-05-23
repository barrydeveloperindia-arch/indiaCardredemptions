import React from 'react';
import { render } from '@testing-library/react-native';
import ShimmerLoader from '../components/ShimmerLoader';

// Mock Reanimated components for test isolation
jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;
  return {
    __esModule: true,
    default: {
      View: View,
    },
    useSharedValue: (val: number) => ({ value: val }),
    useAnimatedStyle: (fn: () => any) => fn(),
    withRepeat: (anim: any) => anim,
    withTiming: (toVal: number) => ({ value: toVal }),
    cancelAnimation: jest.fn(),
  };
});

describe('ShimmerLoader Component TDD Specifications', () => {
  it('should render the shimmer container with custom dimensions', () => {
    const { getByTestId } = render(
      <ShimmerLoader width={250} height={40} borderRadius={8} testID="shimmer-view" />
    );

    const view = getByTestId('shimmer-view');
    expect(view).toBeTruthy();
    
    // Assert style properties are passed down correctly
    expect(view.props.style).toContainEqual(
      expect.objectContaining({
        width: 250,
        height: 40,
        borderRadius: 8,
      })
    );
  });
});
