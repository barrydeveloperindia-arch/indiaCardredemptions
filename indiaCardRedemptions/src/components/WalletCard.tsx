import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Pressable } from 'react-native';
import { ThemedText } from './ThemedText';
import { PremiumSlider } from './PremiumSlider';
import { Spacing } from '@/constants/theme';
import { calculateAxisAtlasProgress, calculateAmexTravelProgress, calculateAxisMagnusBurgundyProgress } from '@/utils/milestoneTracker';
import { CC_PORTFOLIO } from '@/utils/loyaltyMatrixEngine';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

export interface CardState {
  cardId: string;
  balance: number;
  spend: number;
  isSelected: boolean;
}

interface WalletCardProps {
  cardId: string;
  balance: number;
  spend: number;
  isSelected: boolean;
  onSelect: () => void;
  onUpdateBalance: (val: number) => void;
  onUpdateSpend: (val: number) => void;
}

export function WalletCard({
  cardId,
  balance,
  spend,
  isSelected,
  onSelect,
  onUpdateBalance,
  onUpdateSpend,
}: WalletCardProps) {
  const cardInfo = CC_PORTFOLIO[cardId];
  if (!cardInfo) return null;

  // Determine card specific style details with translucent light glass colors
  let cardGradient: [string, string] = ['rgba(243, 244, 246, 0.7)', 'rgba(229, 231, 235, 0.9)'];
  let accentColor = '#6B7280';
  let textColor = '#374151';
  let badgeText = cardInfo.bank;
  let borderColor = 'rgba(0,0,0,0.1)';

  if (cardId === 'axis_m4b') {
    cardGradient = ['rgba(253, 242, 248, 0.7)', 'rgba(251, 207, 232, 0.9)']; // light rose/burgundy glass
    accentColor = '#9D174D'; // dark burgundy
    textColor = '#831843';
    badgeText = 'AXIS BURGUNDY';
    borderColor = 'rgba(157, 23, 77, 0.3)';
  } else if (cardId === 'amex_platinum') {
    cardGradient = ['rgba(243, 244, 246, 0.7)', 'rgba(209, 213, 219, 0.9)']; // light silver glass
    accentColor = '#4B5563';
    textColor = '#1F2937';
    badgeText = 'AMEX CHARGE';
    borderColor = 'rgba(75, 85, 99, 0.3)';
  } else if (cardId === 'hsbc_premier') {
    cardGradient = ['rgba(254, 242, 242, 0.7)', 'rgba(252, 165, 165, 0.9)']; // light red glass
    accentColor = '#B91C1C';
    textColor = '#991B1B';
    badgeText = 'HSBC PREMIER';
    borderColor = 'rgba(185, 28, 28, 0.3)';
  } else if (cardId === 'yes_private') {
    cardGradient = ['rgba(255, 251, 235, 0.7)', 'rgba(253, 230, 138, 0.9)']; // light gold glass
    accentColor = '#D97706'; // gold accent
    textColor = '#92400E';
    badgeText = 'YES PRIVATE';
    borderColor = 'rgba(217, 119, 6, 0.3)';
  }

  // Calculate milestone progression
  let milestoneProgress = null;
  if (cardId === 'axis_m4b') {
    milestoneProgress = calculateAxisMagnusBurgundyProgress(spend);
  } else if (cardId === 'amex_platinum') {
    milestoneProgress = calculateAmexTravelProgress(spend);
  }

  const isDarkCard = false;
  
  // Use a softer selection border
  const activeBorderColor = isSelected ? accentColor : borderColor;

  return (
    <Pressable onPress={onSelect}>
      <BlurView
        intensity={30}
        tint="light"
        style={[
          styles.cardContainer,
          {
            borderColor: activeBorderColor,
            borderWidth: isSelected ? 2 : 1,
            shadowColor: accentColor,
            shadowOpacity: isSelected ? 0.4 : 0.1,
          },
        ]}>
        
        {/* Deep glass gradient overlay */}
        <LinearGradient
          colors={cardGradient}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={styles.cardHeader}>
          <ThemedText
            style={[styles.bankLabel, { color: isDarkCard ? '#4B5563' : '#4B5563' }]}
            type="smallBold">
            {badgeText}
          </ThemedText>
          <View
            style={[
              styles.chipIcon,
              { backgroundColor: isDarkCard ? '#F59E0B' : '#B45309', opacity: 0.8 },
            ]}
          />
        </View>

        <View style={styles.cardBody}>
          <ThemedText style={[{ color: textColor }, styles.cardTitle]} type="subtitle">
            {cardInfo.name}
          </ThemedText>
          <ThemedText style={[styles.cardNumber, { color: isDarkCard ? '#4B5563' : '#4B5563' }]}>
            •••• •••• •••• {cardId === 'amex_platinum' ? '2026' : '4890'}
          </ThemedText>
        </View>

        <View style={[styles.inputSection, { borderTopColor: isDarkCard ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.1)' }]}>
          <View style={styles.inputRow}>
            <View style={styles.inputCol}>
              <ThemedText
                style={[styles.inputLabel, { color: isDarkCard ? '#4B5563' : '#374151' }]}
                type="code">
                PORTFOLIO BALANCE
              </ThemedText>
              <TextInput
                style={[
                  styles.cardInput,
                  {
                    color: textColor,
                    backgroundColor: isDarkCard ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.08)',
                    borderColor: isDarkCard ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.1)',
                  },
                ]}
                keyboardType="numeric"
                value={balance.toString()}
                onChangeText={(val) => onUpdateBalance(Number(val) || 0)}
              />
            </View>

            {milestoneProgress && (
              <View style={styles.inputCol}>
                <ThemedText
                  style={[styles.inputLabel, { color: isDarkCard ? '#4B5563' : '#374151' }]}
                  type="code">
                  ANNUAL SPEND (INR)
                </ThemedText>
                <TextInput
                  style={[
                    styles.cardInput,
                    {
                      color: textColor,
                      backgroundColor: isDarkCard ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.08)',
                      borderColor: isDarkCard ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.1)',
                    },
                  ]}
                  keyboardType="numeric"
                  value={spend.toString()}
                  onChangeText={(val) => onUpdateSpend(Number(val) || 0)}
                />
              </View>
            )}
          </View>

          {/* Interactive sliders for selected cards */}
          {isSelected && (
            <View style={[styles.sliderContainer, { backgroundColor: isDarkCard ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.3)' }]}>
              <PremiumSlider
                label="Slide Balance"
                value={balance}
                min={0}
                max={500000}
                step={5000}
                onChange={onUpdateBalance}
                accentColor={accentColor}
                valueSuffix=" pts"
              />
              {milestoneProgress && (
                <PremiumSlider
                  label="Slide Annual Spend"
                  value={spend}
                  min={0}
                  max={2000000}
                  step={10000}
                  onChange={onUpdateSpend}
                  accentColor={accentColor}
                  valueSuffix=" INR"
                />
              )}
            </View>
          )}

          {/* Milestone progress bar */}
          {milestoneProgress && (
            <View style={styles.milestoneSection}>
              <View style={styles.milestoneTextRow}>
                <ThemedText
                  style={{ color: isDarkCard ? '#374151' : '#1F2937' }}
                  type="code">
                  Next Milestone: ₹{(milestoneProgress.nextTarget / 100000).toFixed(1)}L
                </ThemedText>
                <ThemedText
                  style={{ color: isDarkCard ? '#374151' : '#1F2937' }}
                  type="code">
                  Bonus: +{milestoneProgress.bonusEarned.toLocaleString()} pts
                </ThemedText>
              </View>
              <View
                style={[
                  styles.progressTrack,
                  { backgroundColor: isDarkCard ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.1)' },
                ]}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${milestoneProgress.progressPercent}%`,
                      backgroundColor: accentColor,
                    },
                  ]}
                />
              </View>
              {milestoneProgress.tajVoucherEarned && (
                <View style={styles.tajBadge}>
                  <ThemedText style={styles.tajText} type="code">
                    👑 ₹10,000 Taj Voucher Unlocked!
                  </ThemedText>
                </View>
              )}
            </View>
          )}
        </View>
      </BlurView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: Spacing.four,
    padding: Spacing.five,
    marginBottom: Spacing.four,
    position: 'relative',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  bankLabel: {
    fontSize: 10,
    letterSpacing: 3,
  },
  chipIcon: {
    width: 32,
    height: 22,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cardBody: {
    marginBottom: Spacing.five,
  },
  cardTitle: {
    fontSize: 22
  },
  cardNumber: {
    fontSize: 15,
    marginTop: Spacing.one,
    letterSpacing: 2,
  },
  inputSection: {
    borderTopWidth: 1,
    paddingTop: Spacing.four,
  },
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  inputCol: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 9,
    letterSpacing: 2,
    marginBottom: Spacing.two,
  },
  cardInput: {
    height: 36,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    fontSize: 15,
    fontWeight: 'bold',
    borderWidth: 1,
  },
  milestoneSection: {
    marginTop: Spacing.four,
  },
  milestoneTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  tajBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: 'rgba(245, 158, 11, 0.4)',
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    marginTop: Spacing.three,
    alignSelf: 'flex-start',
  },
  tajText: {
    color: '#FCD34D',
    fontSize: 10,
    fontWeight: 'bold',
  },
  sliderContainer: {
    marginTop: Spacing.four,
    borderRadius: Spacing.three,
    padding: Spacing.four,
    gap: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
});
