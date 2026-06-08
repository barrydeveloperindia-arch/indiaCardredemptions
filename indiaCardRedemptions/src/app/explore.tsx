import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Pressable, ImageBackground, ActivityIndicator, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { ArbitrageCalculator } from '@/components/ArbitrageCalculator';
import { TransferBridge } from '@/components/TransferBridge';
import { useWallet } from '@/context/WalletContext';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { PassengerForm } from '@/components/PassengerForm';
import { createDuffelOrder } from '@/utils/travelApi';

/**
 * @feature FT-104_ExploreScreen
 */
export default function TabTwoScreen() {
  const { walletBalances, cards } = useWallet();
  const [activeMode, setActiveMode] = useState<'hotel' | 'flight'>('hotel');
  const [cabinClass, setCabinClass] = useState<'business' | 'economy'>('business');
  
  const [bookingState, setBookingState] = useState<'idle' | 'form' | 'booking' | 'confirmed'>('idle');
  const [passengerData, setPassengerData] = useState<any>(null);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  const handlePassengerSubmit = async (data: any) => {
    setPassengerData(data);
    setBookingState('booking');
    const order = await createDuffelOrder('off_economy_lhr_bom_01', data, 'test_duffel_token_123');
    if (order) {
      setBookingDetails(order);
      setBookingState('confirmed');
    } else {
      setBookingState('idle');
    }
  };

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

  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  const cabinSelectionSection = (
    <BlurView intensity={20} tint="dark" style={styles.flightCard}>
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
            Business Class (65k Aeroplan)
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={() => setCabinClass('economy')}
          style={[styles.cabinTab, cabinClass === 'economy' && styles.cabinTabActive]}>
          <ThemedText
            style={cabinClass === 'economy' ? styles.cabinTextActive : styles.cabinText}
            type="smallBold">
            Economy Class (35k Avios)
          </ThemedText>
        </Pressable>
      </View>

      <ThemedText style={styles.targetLabel} type="code">
        TARGET PROGRAM: {targetProgram}
      </ThemedText>
    </BlurView>
  );

  const transferBridgeSection = (
    <TransferBridge
      fromBank="HSBC / AXIS"
      toProgram={cabinClass === 'business' ? 'Aeroplan' : 'Qatar Avios'}
      ratio={cabinClass === 'business' ? '1:1 / 5:4' : '1:1 / 5:4'}
    />
  );

  const bankTransferOptionsSection = (
    <View style={{ gap: Spacing.three }}>
      <ThemedText style={styles.pathwayTitle} type="subtitle">
        Available Bank Transfer Options
      </ThemedText>

      {/* HSBC Premier Pathway */}
      <BlurView intensity={20} tint="dark" style={styles.pathwayRow}>
        <View style={styles.pathwayLeft}>
          <ThemedText style={{ color: '#F3F4F6', fontWeight: 'bold' }} type="smallBold">
            HSBC Premier Credit Card
          </ThemedText>
          <ThemedText style={{ color: '#9CA3AF', fontSize: 11 }}>
            Ratio: 10:10 | Points Required: {hsbcPointsRequired.toLocaleString()}
          </ThemedText>
          <ThemedText style={[styles.notesText, { color: hsbcFeasible ? '#34D399' : '#FCA5A5' }]}>
            {hsbcFeasible 
              ? `Best 1:1 Value. Feasible from your ${hsbcBalance.toLocaleString()} points balance!` 
              : `Insufficient balance. You have ${hsbcBalance.toLocaleString()} points, need ${hsbcPointsRequired.toLocaleString()}!`
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
      <BlurView intensity={20} tint="dark" style={styles.pathwayRow}>
        <View style={styles.pathwayLeft}>
          <ThemedText style={{ color: '#F3F4F6', fontWeight: 'bold' }} type="smallBold">
            Axis Magnus for Burgundy
          </ThemedText>
          <ThemedText style={{ color: '#9CA3AF', fontSize: 11 }}>
            Ratio: 5:4 | Points Required: {axisPointsRequired.toLocaleString()}
          </ThemedText>
          <ThemedText style={[styles.notesText, { color: axisFeasible ? '#34D399' : '#FCA5A5' }]}>
            {axisFeasible 
              ? `Burgundy Accelerated Partner. Feasible from your ${axisBalance.toLocaleString()} points balance!`
              : `Insufficient balance. You have ${axisBalance.toLocaleString()} points, need ${axisPointsRequired.toLocaleString()}!`
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
    </View>
  );

  const actionPlanSection = (
    <BlurView intensity={20} tint="dark" style={styles.strategyCard}>
      <ThemedText style={styles.strategyTitle} type="subtitle">
        London Outbound Action Plan
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
            Use the Hotel Arbitrage tab to check Fairmont Windsor Park or Marriott hotels. London cash rates are high, yielding elite RpP values of ₹1.2+ per point!
          </ThemedText>
        </View>
      </View>
    </BlurView>
  );

  const cashBookingSection = (
    <View style={styles.bookingContainer}>
      {bookingState === 'idle' && (
        <TouchableOpacity
          style={styles.bookCashBtn}
          onPress={() => setBookingState('form')}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.bookCashText} type="smallBold">
            Book Cash Flight (Duffel API Checkout)
          </ThemedText>
        </TouchableOpacity>
      )}

      {bookingState === 'form' && (
        <View>
          <PassengerForm onSubmit={handlePassengerSubmit} />
          <Pressable
            style={styles.cancelBtn}
            onPress={() => setBookingState('idle')}
          >
            <ThemedText style={styles.cancelText} type="smallBold">
              Cancel Booking
            </ThemedText>
          </Pressable>
        </View>
      )}

      {bookingState === 'booking' && (
        <BlurView intensity={20} tint="dark" style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <ThemedText style={styles.loadingText} type="smallBold">
            Processing Flight Booking via Duffel...
          </ThemedText>
        </BlurView>
      )}

      {bookingState === 'confirmed' && (
        <BlurView intensity={25} tint="dark" style={styles.confirmationCard}>
          <ThemedText style={styles.confirmedTitle} type="title">
            Booking Confirmed!
          </ThemedText>
          <View style={styles.divider} />
          
          <View style={styles.confirmRow}>
            <ThemedText style={styles.confirmLabel}>PNR Reference:</ThemedText>
            <ThemedText style={styles.confirmVal} type="code">
              {bookingDetails?.bookingReference}
            </ThemedText>
          </View>

          <View style={styles.confirmRow}>
            <ThemedText style={styles.confirmLabel}>Passenger:</ThemedText>
            <ThemedText style={styles.confirmVal} type="smallBold">
              {passengerData?.firstName} {passengerData?.lastName}
            </ThemedText>
          </View>

          <View style={styles.confirmRow}>
            <ThemedText style={styles.confirmLabel}>Ticket Status:</ThemedText>
            <ThemedText style={[styles.confirmVal, { color: '#10B981' }]}>
              {bookingDetails?.status?.toUpperCase()}
            </ThemedText>
          </View>

          <Pressable
            style={styles.resetBtn}
            onPress={() => setBookingState('idle')}
          >
            <ThemedText style={styles.resetBtnText} type="smallBold">
              Book Another Flight
            </ThemedText>
          </Pressable>
        </BlurView>
      )}
    </View>
  );

  return (
    <ImageBackground 
      source={require('../../assets/images/dark_luxury_bg.png')} 
      style={styles.container}
      resizeMode="cover"
      imageStyle={{ width: '100%', height: '100%', opacity: 0.35 }}
    >
      <LinearGradient
        colors={['rgba(9, 10, 15, 0.75)', 'rgba(9, 10, 15, 0.95)']}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={styles.safeArea} edges={Platform.OS === 'web' ? ['left', 'right'] : ['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText style={styles.subTitle} type="code">
              THE INDIAN POINTS ARRAY
            </ThemedText>
            <ThemedText style={styles.mainTitle} type="title">
              Point Arbitrage
            </ThemedText>
          </View>

          {/* Luxury Switch Selector */}
          <BlurView intensity={20} tint="dark" style={styles.modeSelector}>
            <Pressable
              onPress={() => setActiveMode('hotel')}
              style={[styles.modeButton, activeMode === 'hotel' && styles.modeButtonActive]}>
              <ThemedText
                style={activeMode === 'hotel' ? styles.modeButtonTextActive : styles.modeButtonText}
                type="smallBold">
                Hotel Arbitrage
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={() => setActiveMode('flight')}
              style={[styles.modeButton, activeMode === 'flight' && styles.modeButtonActive]}>
              <ThemedText
                style={activeMode === 'flight' ? styles.modeButtonTextActive : styles.modeButtonText}
                type="smallBold">
                London & Europe Solver
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

              {isDesktop ? (
                <View style={styles.gridContainer}>
                  <View style={styles.gridLeftColumn}>
                    {cabinSelectionSection}
                    {transferBridgeSection}
                  </View>
                  <View style={styles.gridRightColumn}>
                    {bankTransferOptionsSection}
                    {actionPlanSection}
                    {cashBookingSection}
                  </View>
                </View>
              ) : (
                <View style={{ gap: Spacing.four }}>
                  {cabinSelectionSection}
                  {transferBridgeSection}
                  {bankTransferOptionsSection}
                  {actionPlanSection}
                  {cashBookingSection}
                </View>
              )}
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
    backgroundColor: '#090A0F',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    width: '100%',
  },
  gridContainer: {
    flexDirection: 'row',
    gap: Spacing.six,
    width: '100%',
  },
  gridLeftColumn: {
    flex: 1.1,
    gap: Spacing.five,
  },
  gridRightColumn: {
    flex: 0.9,
    gap: Spacing.five,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.six,
  },
  header: {
    marginBottom: Spacing.four,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.12)',
    paddingBottom: Spacing.four,
  },
  subTitle: {
    fontSize: 10,
    letterSpacing: 3,
    color: '#9CA3AF',
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '900',
    marginTop: Spacing.one,
    color: '#F3F4F6'
  },
  modeSelector: {
    flexDirection: 'row',
    borderRadius: Spacing.three,
    padding: Spacing.one,
    marginBottom: Spacing.five,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.12)',
    overflow: 'hidden',
    backgroundColor: 'rgba(20, 22, 31, 0.75)',
  },
  modeButton: {
    flex: 1,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    borderRadius: Spacing.two,
  },
  modeButtonActive: {
    backgroundColor: '#D4AF37',
  },
  modeButtonText: {
    color: '#9CA3AF',
  },
  modeButtonTextActive: {
    color: '#090A0F',
  },
  flightSolverContainer: {
    gap: Spacing.four,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F3F4F6',
    marginBottom: Spacing.two
  },
  flightCard: {
    borderRadius: Spacing.three,
    padding: Spacing.five,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.12)',
    overflow: 'hidden',
    backgroundColor: 'rgba(20, 22, 31, 0.75)',
  },
  inputLabel: {
    fontSize: 10,
    letterSpacing: 2,
    color: '#9CA3AF',
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
    borderColor: 'rgba(212, 175, 55, 0.12)',
    backgroundColor: 'rgba(20, 22, 31, 0.75)',
  },
  cabinTabActive: {
    borderColor: '#D4AF37',
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
  },
  cabinText: {
    color: '#9CA3AF',
    fontSize: 11,
  },
  cabinTextActive: {
    color: '#D4AF37',
    fontSize: 11,
  },
  targetLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: Spacing.one,
  },
  pathwayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F3F4F6',
    marginTop: Spacing.two
  },
  pathwayRow: {
    borderRadius: Spacing.three,
    padding: Spacing.five,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.12)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(20, 22, 31, 0.75)',
  },
  pathwayLeft: {
    flex: 1,
    gap: Spacing.one,
  },
  notesText: {
    color: '#D4AF37',
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
    borderColor: 'rgba(212, 175, 55, 0.12)',
    marginTop: Spacing.two,
    gap: Spacing.four,
    overflow: 'hidden',
    backgroundColor: 'rgba(20, 22, 31, 0.75)',
  },
  strategyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F3F4F6',
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
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderColor: 'rgba(212, 175, 55, 0.6)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  strategyNumText: {
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: 'bold',
  },
  strategyTextCol: {
    flex: 1,
  },
  strategyHeading: {
    color: '#F3F4F6',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: Spacing.half,
  },
  strategyDesc: {
    color: '#9CA3AF',
    fontSize: 12,
    lineHeight: 18,
  },
  bookingContainer: {
    marginTop: Spacing.four,
    gap: Spacing.three,
  },
  bookCashBtn: {
    backgroundColor: '#14161F',
    minHeight: 52,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D4AF37',
    shadowColor: '#14161F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  bookCashText: {
    color: '#D4AF37',
    fontSize: 15,
    fontWeight: '700',
  },
  cancelBtn: {
    minHeight: 48,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  cancelText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingCard: {
    borderRadius: Spacing.three,
    padding: Spacing.six,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    overflow: 'hidden',
    backgroundColor: 'rgba(20, 22, 31, 0.75)',
  },
  loadingText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  confirmationCard: {
    borderRadius: Spacing.three,
    padding: Spacing.six,
    overflow: 'hidden',
    backgroundColor: '#14161F',
    borderWidth: 1,
    borderColor: '#D4AF37',
    gap: Spacing.three,
  },
  confirmedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#D4AF37',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: Spacing.one,
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.one,
  },
  confirmLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
  confirmVal: {
    color: '#F3F4F6',
    fontSize: 15,
  },
  resetBtn: {
    backgroundColor: '#14161F',
    minHeight: 48,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D4AF37',
    marginTop: Spacing.three,
  },
  resetBtnText: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
  },
});
