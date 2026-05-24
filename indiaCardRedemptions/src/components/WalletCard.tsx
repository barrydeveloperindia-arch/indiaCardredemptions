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

  // Determine card specific style details with metallic finishes
  let cardGradient: [string, string] = ['#1E2028', '#101115']; // Polished Dark Steel
  let accentColor = '#D4AF37'; // Champagne Gold active highlight
  let textColor = '#F3F4F6'; // White text
  let badgeText = cardInfo.bank;
  let borderColor = 'rgba(255, 255, 255, 0.08)';

  if (cardId === 'axis_m4b') {
    cardGradient = ['#2E111E', '#14050B']; // Metallic Burgundy
    accentColor = '#D4AF37'; // Gold
    textColor = '#F3F4F6';
    badgeText = 'AXIS BURGUNDY';
  } else if (cardId === 'amex_platinum') {
    cardGradient = ['#2D3139', '#14161B']; // Metallic Platinum
    accentColor = '#D4AF37'; // Gold
    textColor = '#F3F4F6';
    badgeText = 'AMEX CHARGE';
  } else if (cardId === 'hsbc_premier') {
    cardGradient = ['#300C0C', '#120202']; // Metallic Crimson
    accentColor = '#D4AF37'; // Gold
    textColor = '#F3F4F6';
    badgeText = 'HSBC PREMIER';
  } else if (cardId === 'yes_private') {
    cardGradient = ['#2A2312', '#0E0B05']; // Metallic Gold Quartz
    accentColor = '#D4AF37'; // Gold
    textColor = '#F3F4F6';
    badgeText = 'YES PRIVATE';
  } else if (cardId === 'sbi_aurum') {
    cardGradient = ['#2C220E', '#0D0A04']; // Metallic Aurum
    accentColor = '#D4AF37'; // Gold
    textColor = '#F3F4F6';
    badgeText = 'SBI AURUM';
  }

  // Calculate milestone progression
  let milestoneProgress = null;
  if (cardId === 'axis_m4b') {
    milestoneProgress = calculateAxisMagnusBurgundyProgress(spend);
  } else if (cardId === 'amex_platinum') {
    milestoneProgress = calculateAmexTravelProgress(spend);
  }

  const isDarkCard = true;
  
  // Use a gold selection border
  const activeBorderColor = isSelected ? '#D4AF37' : borderColor;

  return (
    <Pressable onPress={onSelect}>
      <BlurView
        testID="wallet-card-blur"
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
            style={[styles.bankLabel, { color: '#9CA3AF' }]}
            type="smallBold">
            {badgeText}
          </ThemedText>
          <View
            testID="holographic-chip"
            style={[
              styles.chipIcon,
              { backgroundColor: '#D4AF37', opacity: 0.85 },
            ]}
          />
        </View>

        <View style={styles.cardBody}>
          <ThemedText style={[{ color: textColor }, styles.cardTitle]} type="subtitle">
            {cardInfo.name}
          </ThemedText>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <ThemedText style={[styles.cardNumber, { color: '#9CA3AF' }]}>
              •••• •••• •••• {cardId === 'amex_platinum' ? '2026' : '4890'}
            </ThemedText>
            <View
              testID="card-network-badge"
              style={[
                styles.networkBadge,
                { borderColor: '#D4AF37' }
              ]}>
              <ThemedText style={{ color: '#D4AF37', fontSize: 9, fontWeight: 'bold' }}>
                {cardId === 'amex_platinum' ? 'AMEX' : 'VISA'}
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={[styles.inputSection, { borderTopColor: isDarkCard ? 'rgba(212, 175, 55, 0.12)' : 'rgba(212, 175, 55, 0.12)' }]}>
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
                    backgroundColor: isDarkCard ? 'rgba(212, 175, 55, 0.12)' : 'rgba(0,0,0,0.08)',
                    borderColor: isDarkCard ? 'rgba(212, 175, 55, 0.12)' : 'rgba(212, 175, 55, 0.12)',
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
                      backgroundColor: isDarkCard ? 'rgba(212, 175, 55, 0.12)' : 'rgba(0,0,0,0.08)',
                      borderColor: isDarkCard ? 'rgba(212, 175, 55, 0.12)' : 'rgba(212, 175, 55, 0.12)',
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
            <View style={[styles.sliderContainer, { backgroundColor: isDarkCard ? 'rgba(212, 175, 55, 0.12)' : 'rgba(255, 255, 255, 0.45)' }]}>
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
                  { backgroundColor: isDarkCard ? 'rgba(255, 255, 255, 0.45)' : 'rgba(212, 175, 55, 0.12)' },
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
    borderColor: 'rgba(255, 255, 255, 0.45)',
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
    paddingVertical: 0,
    textAlignVertical: 'center',
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
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  networkBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
  },
});
