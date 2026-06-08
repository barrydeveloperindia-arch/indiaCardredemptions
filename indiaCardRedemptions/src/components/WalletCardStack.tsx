import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WalletCard } from './WalletCard';
import { Spacing } from '@/constants/theme';

/**
 * @feature FT-101_StackedCardUX
 */

export interface CardItem {
  cardId: string;
  balance: number;
  spend: number;
}

interface WalletCardStackProps {
  cards: CardItem[];
  selectedCardId: string;
  onSelectCard: (cardId: string) => void;
  onUpdateBalance: (cardId: string, balance: number) => void;
  onUpdateSpend: (cardId: string, spend: number) => void;
}

export function WalletCardStack({
  cards,
  selectedCardId,
  onSelectCard,
  onUpdateBalance,
  onUpdateSpend,
}: WalletCardStackProps) {
  return (
    <View style={styles.stackContainer}>
      {cards.map((card, index) => {
        const isSelected = card.cardId === selectedCardId;
        // Overlap unselected cards so they fan/stack behind each other.
        // The active card expands fully.
        const cardStyle = index > 0 && !isSelected ? { marginTop: -140 } : {};

        return (
          <View key={card.cardId} style={cardStyle}>
            <WalletCard
              cardId={card.cardId}
              balance={card.balance}
              spend={card.spend}
              isSelected={isSelected}
              onSelect={() => onSelectCard(card.cardId)}
              onUpdateBalance={(val) => onUpdateBalance(card.cardId, val)}
              onUpdateSpend={(val) => onUpdateSpend(card.cardId, val)}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  stackContainer: {
    paddingVertical: Spacing.two,
  },
});
