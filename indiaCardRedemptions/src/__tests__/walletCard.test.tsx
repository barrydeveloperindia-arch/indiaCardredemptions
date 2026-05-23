import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { WalletCard } from '../components/WalletCard';

// Mock Reanimated & LinearGradient
jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, style }: any) => <View testID="linear-gradient" style={style}>{children}</View>,
  };
});

describe('WalletCard Component', () => {
  const mockSelect = jest.fn();
  const mockUpdateBalance = jest.fn();
  const mockUpdateSpend = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correct card bank label, name, and credit card number digits', () => {
    const { getByText } = render(
      <WalletCard
        cardId="amex_platinum"
        balance={120000}
        spend={150000}
        isSelected={false}
        onSelect={mockSelect}
        onUpdateBalance={mockUpdateBalance}
        onUpdateSpend={mockUpdateSpend}
      />
    );

    expect(getByText('AMEX CHARGE')).toBeTruthy();
    expect(getByText('Amex Platinum Charge')).toBeTruthy();
    expect(getByText('•••• •••• •••• 2026')).toBeTruthy();
  });

  it('should apply gold border and active accent highlights when selected', () => {
    const { getByTestId } = render(
      <WalletCard
        cardId="amex_platinum"
        balance={120000}
        spend={150000}
        isSelected={true}
        onSelect={mockSelect}
        onUpdateBalance={mockUpdateBalance}
        onUpdateSpend={mockUpdateSpend}
      />
    );

    // Selected border style is gold (#D4AF37)
    const blurView = getByTestId('wallet-card-blur');
    const { StyleSheet } = require('react-native');
    const flatStyle = StyleSheet.flatten(blurView.props.style);
    expect(flatStyle.borderColor).toBe('#D4AF37');
    expect(flatStyle.borderWidth).toBe(2);
  });

  it('should render a holographic chip simulation block and network brand badge', () => {
    const { getByTestId } = render(
      <WalletCard
        cardId="amex_platinum"
        balance={120000}
        spend={150000}
        isSelected={false}
        onSelect={mockSelect}
        onUpdateBalance={mockUpdateBalance}
        onUpdateSpend={mockUpdateSpend}
      />
    );

    expect(getByTestId('holographic-chip')).toBeTruthy();
    expect(getByTestId('card-network-badge')).toBeTruthy();
  });

  it('should trigger update events when balance and spend inputs change', () => {
    const { getByDisplayValue } = render(
      <WalletCard
        cardId="amex_platinum"
        balance={120000}
        spend={150000}
        isSelected={true}
        onSelect={mockSelect}
        onUpdateBalance={mockUpdateBalance}
        onUpdateSpend={mockUpdateSpend}
      />
    );

    const balanceInput = getByDisplayValue('120000');
    fireEvent.changeText(balanceInput, '130000');
    expect(mockUpdateBalance).toHaveBeenCalledWith(130000);

    const spendInput = getByDisplayValue('150000');
    fireEvent.changeText(spendInput, '160000');
    expect(mockUpdateSpend).toHaveBeenCalledWith(160000);
  });
});
