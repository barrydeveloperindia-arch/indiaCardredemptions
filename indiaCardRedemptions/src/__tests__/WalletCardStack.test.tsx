import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { WalletCardStack } from '../components/WalletCardStack';

// Mock Reanimated & LinearGradient & BlurView
jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, style }: any) => <View testID="linear-gradient" style={style}>{children}</View>,
  };
});

jest.mock('expo-blur', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    BlurView: ({ children, style }: any) => <View testID="wallet-card-blur" style={style}>{children}</View>,
  };
});

describe('WalletCardStack Component [FT-101_StackedCardUX]', () => {
  const mockCards = [
    { cardId: 'amex_platinum', balance: 120000, spend: 150000 },
    { cardId: 'axis_m4b', balance: 80000, spend: 300000 },
  ];
  const mockSelectCard = jest.fn();
  const mockUpdateBalance = jest.fn();
  const mockUpdateSpend = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render a vertical list or stacked layout of cards', () => {
    const { getByText } = render(
      <WalletCardStack
        cards={mockCards}
        selectedCardId="amex_platinum"
        onSelectCard={mockSelectCard}
        onUpdateBalance={mockUpdateBalance}
        onUpdateSpend={mockUpdateSpend}
      />
    );

    expect(getByText('Amex Platinum Charge')).toBeTruthy();
    expect(getByText('Axis Magnus for Burgundy')).toBeTruthy();
  });

  it('should trigger onSelectCard callback when a stacked card is tapped', () => {
    const { getByText } = render(
      <WalletCardStack
        cards={mockCards}
        selectedCardId="amex_platinum"
        onSelectCard={mockSelectCard}
        onUpdateBalance={mockUpdateBalance}
        onUpdateSpend={mockUpdateSpend}
      />
    );

    const axisCard = getByText('Axis Magnus for Burgundy');
    fireEvent.press(axisCard);
    expect(mockSelectCard).toHaveBeenCalledWith('axis_m4b');
  });
});
