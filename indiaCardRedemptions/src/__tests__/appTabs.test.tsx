import React from 'react';
import { render } from '@testing-library/react-native';
import AppTabs from '../components/AppTabs';

// Mock expo-router/unstable-native-tabs
jest.mock('expo-router/unstable-native-tabs', () => {
  const React = require('react');
  const { View, Text } = require('react-native');

  const MockNativeTabs = ({ children, backgroundColor, indicatorColor, labelStyle }: any) => (
    <View testID="native-tabs" style={{ backgroundColor }}>
      <Text testID="native-tabs-indicator-color">{indicatorColor}</Text>
      <Text testID="native-tabs-selected-color">{labelStyle?.selected?.color}</Text>
      {children}
    </View>
  );

  const MockTrigger = ({ children, name }: any) => (
    <View testID={`tab-trigger-${name}`}>
      {children}
    </View>
  );

  MockTrigger.Label = ({ children }: any) => <Text testID="tab-label">{children}</Text>;
  MockTrigger.Icon = () => <View testID="tab-icon" />;

  MockNativeTabs.Trigger = MockTrigger;

  return {
    NativeTabs: MockNativeTabs,
  };
});

describe('AppTabs Navigation Component', () => {
  it('should render all custom bottom navigation triggers', () => {
    const { getByTestId, getAllByTestId } = render(<AppTabs />);
    
    // Assert all tab triggers exist
    expect(getByTestId('tab-trigger-index')).toBeTruthy();
    expect(getByTestId('tab-trigger-explore')).toBeTruthy();
    expect(getByTestId('tab-trigger-concierge')).toBeTruthy();
    expect(getByTestId('tab-trigger-insights')).toBeTruthy();
    expect(getByTestId('tab-trigger-intel')).toBeTruthy();
    expect(getByTestId('tab-trigger-deals')).toBeTruthy();

    // Assert labels
    const labels = getAllByTestId('tab-label').map((node) => node.children[0]);
    expect(labels).toContain('Home');
    expect(labels).toContain('Explore');
    expect(labels).toContain('Concierge');
    expect(labels).toContain('Hacks');
    expect(labels).toContain('Intel');
    expect(labels).toContain('Deals');
  });

  it('should apply dark luxury background and gold accent styling', () => {
    const { getByTestId } = render(<AppTabs />);

    // Assert dark metal background
    expect(getByTestId('native-tabs').props.style.backgroundColor).toBe('#14161F');

    // Assert gold indicator accent color
    expect(getByTestId('native-tabs-indicator-color').props.children).toBe('#D4AF37');
    expect(getByTestId('native-tabs-selected-color').props.children).toBe('#D4AF37');
  });
});
