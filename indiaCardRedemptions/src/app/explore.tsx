import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Pressable, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { ArbitrageCalculator } from '@/components/ArbitrageCalculator';
import { useWallet } from '@/context/WalletContext';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

export default function TabTwoScreen() {
  const { walletBalances, cards } = useWallet();
  const [activeMode, setActiveMode] = useState<'hotel' | 'flight'>('hotel');
  const [cabinClass, setCabinClass] = useState<'business' | 'economy'>('business');

  // Compute total points in active wallet
  const totalPoints = cards.reduce((acc, c) => acc + c.balance, 0);

  // Flight requirements for London (per person one-way)
  const aeroplanBizReq = 65000;
  const qatarEconReq = 35000;

  const pointsNeeded = cabinClass === 'business' ? aeroplanBizReq : qatarEconReq;
  const targetProgram = cabinClass === 'business' ? 'Air Canada Aeroplan (Star Alliance)' : 'Qatar Airways Avios (Oneworld)';

  // Calculate live transfer rates for each card in the user's wallet
  const hsbcBalance = walletBalances['hsbc_premier'] || 0;
  const axisBalance = walletBalances['axis_m4b'] || 0;

  // HSBC Premier transfer ratio is 1:1 -> Points needed matches exactly
  const hsbcPointsRequired = pointsNeeded;
  const hsbcFeasible = hsbcBalance >= hsbcPointsRequired;

  // Axis Magnus Burgundy transfer ratio is 5:4 -> Axis points required is pointsNeeded * 1.25
  const axisPointsRequired = Math.round(pointsNeeded * 1.25);
  const axisFeasible = axisBalance >= axisPointsRequired;

  return (
    <ImageBackground 
      source={require('../../assets/images/minimalist_white_luxury_bg.png')} 
      style={styles.container}
      resizeMode="cover"
      imageStyle={{ width: '100%', height: '100%', opacity: 0.7 }}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.8)']}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText style={styles.subTitle} type="code">
              THE POINTS ARRAY
            </ThemedText>
            <ThemedText style={styles.mainTitle} type="title">
              Point Arbitrage
            </ThemedText>
          </View>

          {/* Luxury Switch Selector */}
          <BlurView intensity={20} tint="light" style={styles.modeSelector}>
            <Pressable
              onPress={() => setActiveMode('hotel')}
              style={[styles.modeButton, activeMode === 'hotel' && styles.modeButtonActive]}>
              <ThemedText
                style={activeMode === 'hotel' ? styles.modeButtonTextActive : styles.modeButtonText}
                type="smallBold">
                🏨 Hotel Arbitrage
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={() => setActiveMode('flight')}
              style={[styles.modeButton, activeMode === 'flight' && styles.modeButtonActive]}>
              <ThemedText
                style={activeMode === 'flight' ? styles.modeButtonTextActive : styles.modeButtonText}
                type="smallBold">
                ✈️ London & Europe Solver
              </ThemedText>
            </Pressable>
          </BlurView>

          {activeMode === 'hotel' ? (
            /* Arbitrage Core Calculator */
            <ArbitrageCalculator walletBalances={walletBalances} />
          ) : (
            /* London & Europe Flight Solver */
            <View style={styles.flightSolverContainer}>
              <ThemedText style={styles.sectionTitle} type="title">
                London & Europe Trip Solver
              </ThemedText>

              <BlurView intensity={20} tint="light" style={styles.flightCard}>
                <ThemedText style={styles.inputLabel} type="code">
                  SELECT DESIRED CABIN CLASS
                </ThemedText>
                
                <View style={styles.cabinRow}>
                  <Pressable
                    onPress={() => setCabinClass('business')}
                    style={[styles.cabinTab, cabinClass === 'business' && styles.cabinTabActive]}>
                    <ThemedText
                      style={cabinClass === 'business' ? styles.cabinTextActive : styles.cabinText}
                      type="smallBold">
                      👑 Business Class (65k Aeroplan)
                    </ThemedText>
                  </Pressable>

                  <Pressable
                    onPress={() => setCabinClass('economy')}
                    style={[styles.cabinTab, cabinClass === 'economy' && styles.cabinTabActive]}>
                    <ThemedText
                      style={cabinClass === 'economy' ? styles.cabinTextActive : styles.cabinText}
                      type="smallBold">
                      🎫 Economy Class (35k Avios)
                    </ThemedText>
                  </Pressable>
                </View>

                <ThemedText style={styles.targetLabel} type="code">
                  TARGET PROGRAM: {targetProgram}
                </ThemedText>
              </BlurView>

              {/* Dynamic live transfer pathways */}
              <ThemedText style={styles.pathwayTitle} type="subtitle">
                Available Bank Transfer Options
              </ThemedText>

              {/* HSBC Premier Pathway */}
              <BlurView intensity={20} tint="light" style={styles.pathwayRow}>
                <View style={styles.pathwayLeft}>
                  <ThemedText style={{ color: '#111827', fontWeight: 'bold' }} type="smallBold">
                    HSBC Premier Credit Card
                  </ThemedText>
                  <ThemedText style={{ color: '#4B5563', fontSize: 11 }}>
                    Ratio: 10:10 | Points Required: {hsbcPointsRequired.toLocaleString()}
                  </ThemedText>
                  <ThemedText style={[styles.notesText, { color: hsbcFeasible ? '#34D399' : '#FCA5A5' }]}>
                    {hsbcFeasible 
                      ? `👑 Best 1:1 Value. Feasible from your ${hsbcBalance.toLocaleString()} points balance!` 
                      : `❌ Insufficient balance. You have ${hsbcBalance.toLocaleString()} points, need ${hsbcPointsRequired.toLocaleString()}!`
                    }
                  </ThemedText>
                </View>
                <View
                  style={[
                    styles.feasibilityBadge,
                    { backgroundColor: hsbcFeasible ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)' },
                  ]}>
                  <ThemedText
                    style={{ color: hsbcFeasible ? '#34D399' : '#FCA5A5', fontSize: 10, fontWeight: 'bold' }}>
                    {hsbcFeasible ? 'FEASIBLE' : 'NEED POINTS'}
                  </ThemedText>
                </View>
              </BlurView>

              {/* Axis Magnus Burgundy Pathway */}
              <BlurView intensity={20} tint="light" style={styles.pathwayRow}>
                <View style={styles.pathwayLeft}>
                  <ThemedText style={{ color: '#111827', fontWeight: 'bold' }} type="smallBold">
                    Axis Magnus for Burgundy
                  </ThemedText>
                  <ThemedText style={{ color: '#4B5563', fontSize: 11 }}>
                    Ratio: 5:4 | Points Required: {axisPointsRequired.toLocaleString()}
                  </ThemedText>
                  <ThemedText style={[styles.notesText, { color: axisFeasible ? '#34D399' : '#FCA5A5' }]}>
                    {axisFeasible 
                      ? `⚡ Burgundy Accelerated Partner. Feasible from your ${axisBalance.toLocaleString()} points balance!`
                      : `❌ Insufficient balance. You have ${axisBalance.toLocaleString()} points, need ${axisPointsRequired.toLocaleString()}!`
                    }
                  </ThemedText>
                </View>
                <View
                  style={[
                    styles.feasibilityBadge,
                    { backgroundColor: axisFeasible ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)' },
                  ]}>
                  <ThemedText
                    style={{ color: axisFeasible ? '#34D399' : '#FCA5A5', fontSize: 10, fontWeight: 'bold' }}>
                    {axisFeasible ? 'FEASIBLE' : 'NEED POINTS'}
                  </ThemedText>
                </View>
              </BlurView>

              {/* Step-by-Step London Strategy */}
              <BlurView intensity={20} tint="light" style={styles.strategyCard}>
                <ThemedText style={styles.strategyTitle} type="subtitle">
                  🗺️ London Outbound Action Plan
                </ThemedText>

                <View style={styles.strategyRow}>
                  <View style={styles.strategyNum}><ThemedText style={styles.strategyNumText}>1</ThemedText></View>
                  <View style={styles.strategyTextCol}>
                    <ThemedText style={styles.strategyHeading} type="smallBold">Transfer to Outbound Partner</ThemedText>
                    <ThemedText style={styles.strategyDesc}>
                      {cabinClass === 'business' 
                        ? 'Transfer 65,000 points from HSBC Premier directly to Air Canada Aeroplan. Aeroplan has no fuel surcharges on Star Alliance flights (Swiss/Lufthansa).'
                        : 'Transfer 35,000 points from HSBC Premier directly to Qatar Airways Avios. Standard economy taxes DEL-LHR are under ₹5,000.'
                      }
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.strategyRow}>
                  <View style={styles.strategyNum}><ThemedText style={styles.strategyNumText}>2</ThemedText></View>
                  <View style={styles.strategyTextCol}>
                    <ThemedText style={styles.strategyHeading} type="smallBold">Secure the Return Leg</ThemedText>
                    <ThemedText style={styles.strategyDesc}>
                      Use Singapore Airlines KrisFlyer (from HSBC/Axis) or Virgin Atlantic Flying Club to return to India, checking for Promo Awards that lower points required by up to 25%.
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.strategyRow}>
                  <View style={styles.strategyNum}><ThemedText style={styles.strategyNumText}>3</ThemedText></View>
                  <View style={styles.strategyTextCol}>
                    <ThemedText style={styles.strategyHeading} type="smallBold">Maximize London Hotels</ThemedText>
                    <ThemedText style={styles.strategyDesc}>
                      Use the 🏨 Hotel Arbitrage tab to check Fairmont Windsor Park or Marriott hotels. London cash rates are high, yielding elite RpP values of ₹1.2+ per point!
                    </ThemedText>
                  </View>
                </View>
              </BlurView>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.six,
  },
  header: {
    marginBottom: Spacing.four,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    paddingBottom: Spacing.four,
  },
  subTitle: {
    fontSize: 10,
    letterSpacing: 3,
    color: '#4B5563',
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '900',
    marginTop: Spacing.one,
    color: '#111827'
  },
  modeSelector: {
    flexDirection: 'row',
    borderRadius: Spacing.three,
    padding: Spacing.one,
    marginBottom: Spacing.five,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  modeButton: {
    flex: 1,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    borderRadius: Spacing.two,
  },
  modeButtonActive: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  modeButtonText: {
    color: '#4B5563',
  },
  modeButtonTextActive: {
    color: '#111827',
  },
  flightSolverContainer: {
    gap: Spacing.four,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: Spacing.two
  },
  flightCard: {
    borderRadius: Spacing.three,
    padding: Spacing.five,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  inputLabel: {
    fontSize: 10,
    letterSpacing: 2,
    color: '#4B5563',
    marginBottom: Spacing.three,
  },
  cabinRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  cabinTab: {
    flex: 1,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  cabinTabActive: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  cabinText: {
    color: '#4B5563',
    fontSize: 11,
  },
  cabinTextActive: {
    color: '#34D399',
    fontSize: 11,
  },
  targetLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: Spacing.one,
  },
  pathwayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: Spacing.two
  },
  pathwayRow: {
    borderRadius: Spacing.three,
    padding: Spacing.five,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  pathwayLeft: {
    flex: 1,
    gap: Spacing.one,
  },
  notesText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: Spacing.one,
  },
  feasibilityBadge: {
    borderRadius: Spacing.three,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
  },
  strategyCard: {
    borderRadius: Spacing.three,
    padding: Spacing.five,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    marginTop: Spacing.two,
    gap: Spacing.four,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  strategyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: Spacing.two,
  },
  strategyRow: {
    flexDirection: 'row',
    gap: Spacing.four,
    alignItems: 'flex-start',
  },
  strategyNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: 'rgba(16, 185, 129, 0.6)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  strategyNumText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: 'bold',
  },
  strategyTextCol: {
    flex: 1,
  },
  strategyHeading: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: Spacing.half,
  },
  strategyDesc: {
    color: '#4B5563',
    fontSize: 12,
    lineHeight: 18,
  },
});
