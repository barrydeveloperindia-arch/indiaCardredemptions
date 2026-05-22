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

  // Determine card specific style details with translucent deep metallic colors
  let cardGradient: [string, string] = ['#1E2530', '#0B0F19']; // Default deep charcoal steel
  let accentColor = '#D4AF37'; // Royal Gold active highlight
  let textColor = '#F3F4F6';
  let badgeText = cardInfo.bank;
  let borderColor = 'rgba(255, 255, 255, 0.1)';

  if (cardId === 'axis_m4b') {
    cardGradient = ['#3B0819', '#150107']; // Deep Burgundy Velvet
    accentColor = '#D4AF37';
    textColor = '#F9F9FA';
    badgeText = 'AXIS BURGUNDY';
    borderColor = 'rgba(212, 175, 55, 0.3)';
  } else if (cardId === 'amex_platinum') {
    cardGradient = ['#2E3440', '#1C2028']; // Deep Platinum Charcoal
    accentColor = '#E5E9F0';
    textColor = '#ECEFF4';
    badgeText = 'AMEX CHARGE';
    borderColor = 'rgba(229, 233, 240, 0.4)';
  } else if (cardId === 'hsbc_premier') {
    cardGradient = ['#5C0612', '#230206']; // Royal Crimson
    accentColor = '#D4AF37';
    textColor = '#F9F9FA';
    badgeText = 'HSBC PREMIER';
    borderColor = 'rgba(185, 28, 28, 0.3)';
  } else if (cardId === 'yes_private') {
    cardGradient = ['#1C1915', '#0A0908']; // Rich Gold-Black Obsidian
    accentColor = '#D4AF37';
    textColor = '#FCD34D';
    badgeText = 'YES PRIVATE';
    borderColor = 'rgba(212, 175, 55, 0.4)';
  } else if (cardId === 'sbi_aurum') {
    cardGradient = ['#111215', '#08080A']; // Pitch Aurum Black
    accentColor = '#F59E0B';
    textColor = '#FCD34D';
    badgeText = 'SBI AURUM';
    borderColor = 'rgba(245, 158, 11, 0.5)';
  }

  // Calculate milestone progression
  let milestoneProgress = null;
  if (cardId === 'axis_m4b') {
    milestoneProgress = calculateAxisMagnusBurgundyProgress(spend);
  } else if (cardId === 'amex_platinum') {
    milestoneProgress = calculateAmexTravelProgress(spend);
  }

  const isDarkCard = true;
  
  // Use a softer selection border
  const activeBorderColor = isSelected ? accentColor : borderColor;

  return (
    <Pressable onPress={onSelect}>
      <BlurView
        intensity={30}
        tint={isDarkCard ? "dark" : "light"}
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
            style={[styles.bankLabel, { color: isDarkCard ? '#9CA3AF' : '#9CA3AF' }]}
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
          <ThemedText style={[styles.cardNumber, { color: isDarkCard ? '#D1D5DB' : '#9CA3AF' }]}>
            •••• •••• •••• {cardId === 'amex_platinum' ? '2026' : '4890'}
          </ThemedText>
        </View>

        <View style={[styles.inputSection, { borderTopColor: isDarkCard ? 'rgba(255,255,255,0.1)' : 'rgba(255, 255, 255, 0.1)' }]}>
          <View style={styles.inputRow}>
            <View style={styles.inputCol}>
              <ThemedText
                style={[styles.inputLabel, { color: isDarkCard ? '#9CA3AF' : '#D1D5DB' }]}
                type="code">
                PORTFOLIO BALANCE
              </ThemedText>
              <TextInput
                style={[
                  styles.cardInput,
                  {
                    color: textColor,
                    backgroundColor: isDarkCard ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                    borderColor: isDarkCard ? 'rgba(255,255,255,0.1)' : 'rgba(255, 255, 255, 0.1)',
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
                  style={[styles.inputLabel, { color: isDarkCard ? '#9CA3AF' : '#D1D5DB' }]}
                  type="code">
                  ANNUAL SPEND (INR)
                </ThemedText>
                <TextInput
                  style={[
                    styles.cardInput,
                    {
                      color: textColor,
                      backgroundColor: isDarkCard ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                      borderColor: isDarkCard ? 'rgba(255,255,255,0.1)' : 'rgba(255, 255, 255, 0.1)',
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
            <View style={[styles.sliderContainer, { backgroundColor: isDarkCard ? 'rgba(255,255,255,0.1)' : 'rgba(9, 10, 15, 0.4)' }]}>
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
                  style={{ color: isDarkCard ? '#E5E7EB' : '#1F2937' }}
                  type="code">
                  Next Milestone: ₹{(milestoneProgress.nextTarget / 100000).toFixed(1)}L
                </ThemedText>
                <ThemedText
                  style={{ color: isDarkCard ? '#E5E7EB' : '#1F2937' }}
                  type="code">
                  Bonus: +{milestoneProgress.bonusEarned.toLocaleString()} pts
                </ThemedText>
              </View>
              <View
                style={[
                  styles.progressTrack,
                  { backgroundColor: isDarkCard ? 'rgba(9, 10, 15, 0.4)' : 'rgba(255, 255, 255, 0.1)' },
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
    borderColor: 'rgba(9, 10, 15, 0.4)',
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
