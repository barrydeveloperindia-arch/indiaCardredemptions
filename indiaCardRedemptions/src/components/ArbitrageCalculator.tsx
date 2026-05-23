import React, { useState, useRef } from 'react';
import { StyleSheet, View, TextInput, Pressable, ScrollView, ActivityIndicator, TouchableOpacity, Linking, Alert } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { PremiumSlider } from './PremiumSlider';
import { Spacing } from '@/constants/theme';
import { calculateYield } from '@/utils/arbitrageCalculator';
import { getOptimalTransferPathway, getTaxWarning } from '@/utils/loyaltyMatrixEngine';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { HotelGuestForm } from './HotelGuestForm';
import { createHotelBooking } from '../utils/travelApi';
import { getBankTransferUrl, getPartnerSearchUrl, copyToClipboard } from '@/utils/bridgeHelper';

interface ArbitrageCalculatorProps {
  walletBalances: { [cardId: string]: number };
}

export function ArbitrageCalculator({ walletBalances }: ArbitrageCalculatorProps) {
  const [cashPrice, setCashPrice] = useState<string>('35000');
  const [pointPrice, setPointPrice] = useState<string>('15000');
  const [partner, setPartner] = useState<string>('marriott_bonvoy');
  const [showMath, setShowMath] = useState<boolean>(false);

  // Hotel Booking UI States
  const [bookingState, setBookingState] = useState<'idle' | 'form' | 'booking' | 'confirmed'>('idle');
  const [guestData, setGuestData] = useState<any>(null);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  const handleGuestSubmit = async (data: any) => {
    setGuestData(data);
    setBookingState('booking');
    // Simulate booking with test token
    const booking = await createHotelBooking(partner, data, 'test_hotel_token_123');
    if (booking) {
      setBookingDetails(booking);
      setBookingState('confirmed');
    } else {
      setBookingState('idle');
    }
  };

  const scrollRef = useRef<ScrollView>(null);

  const presets = [
    {
      label: '🏨 Fairmont Jaipur (Accor)',
      cash: '25000',
      pts: '12500',
      partner: 'accor',
      image: require('../../assets/images/fairmont_jaipur_deal_1779184231669.png'),
    },
    {
      label: '🏨 Westin Rishikesh',
      cash: '42000',
      pts: '35000',
      partner: 'marriott_bonvoy',
      image: require('../../assets/images/luxury_resort_pool_1779184214418.png'),
    },
    {
      label: '✈️ Singapore Biz',
      cash: '50000',
      pts: '18000',
      partner: 'krisflyer',
      image: require('../../assets/images/singapore_biz_deal_1779184247834.png'),
    },
  ];

  const applyPreset = (pr: typeof presets[0]) => {
    setCashPrice(pr.cash);
    setPointPrice(pr.pts);
    setPartner(pr.partner);
  };

  const partners = [
    { id: 'marriott_bonvoy', name: 'Marriott Bonvoy' },
    { id: 'accor', name: 'Accor Live Limitless' },
    { id: 'krisflyer', name: 'Singapore KrisFlyer' },
    { id: 'aeroplan', name: 'Air Canada Aeroplan' },
    { id: 'qatar_avios', name: 'Qatar Airways Avios' },
  ];

  const numericCash = Number(cashPrice) || 0;
  const numericPoints = Number(pointPrice) || 0;

  const scrollLeft = () => {
    scrollRef.current?.scrollTo({ x: 0, animated: true });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollTo({ x: 250, animated: true });
  };

  const baselineYield = calculateYield(numericCash, numericPoints, 1.0);

  let yieldBadgeColor = '#EF4444'; // Red
  let yieldBadgeText = 'AVOID (Pay Cash)';
  let yieldText = `₹${baselineYield.toFixed(2)}`;

  if (baselineYield >= 1.0) {
    yieldBadgeColor = '#10B981'; // Green
    yieldBadgeText = 'ELITE ARBITRAGE (Transfer points!)';
  } else if (baselineYield >= 0.5) {
    yieldBadgeColor = '#F59E0B'; // Amber
    yieldBadgeText = 'GOOD VALUE (Proceed)';
  }

  const pathways = getOptimalTransferPathway(partner, numericPoints, walletBalances);
  const taxWarning = getTaxWarning(partner);

  return (
    <View style={styles.container}>
      <ThemedText style={styles.sectionTitle} type="title">
        Arbitrage Yield Analyzer
      </ThemedText>
      <BlurView intensity={20} tint="dark" style={styles.inputCard}>
        {/* Quick Deal Presets */}
        <ThemedText style={styles.inputLabel} type="code">
          QUICK DEAL SIMULATORS (TAP TO TEST FLOW)
        </ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.presetScroll}
          contentContainerStyle={styles.presetScrollContent}>
          {presets.map((pr, idx) => (
            <Pressable key={idx} onPress={() => applyPreset(pr)} style={styles.presetCard}>
              <Image source={pr.image} style={styles.presetCardImage} />
              <LinearGradient
                colors={['transparent', '#090A0F']}
                style={styles.presetOverlay}
              />
              <View style={styles.presetCardContent}>
                <ThemedText style={styles.presetLabel} type="smallBold">
                  {pr.label}
                </ThemedText>
                <ThemedText style={styles.presetSub}>
                  ₹{(Number(pr.cash)/1000).toFixed(0)}k vs {(Number(pr.pts)/1000).toFixed(1)}k pts
                </ThemedText>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.formRow}>
          <View style={styles.formCol}>
            <ThemedText style={styles.inputLabel} type="code">
              HOTEL CASH PRICE (INR)
            </ThemedText>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={cashPrice}
              onChangeText={setCashPrice}
              placeholderTextColor="rgba(255, 255, 255, 0.45)"
            />
            <PremiumSlider
              label="Slide Cash Price"
              value={numericCash}
              min={1000}
              max={200000}
              step={1000}
              onChange={(val) => setCashPrice(val.toString())}
              accentColor="#10B981"
              valueSuffix=" INR"
            />
          </View>

          <View style={styles.formCol}>
            <ThemedText style={styles.inputLabel} type="code">
              POINTS REQUIRED
            </ThemedText>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={pointPrice}
              onChangeText={setPointPrice}
              placeholderTextColor="rgba(255, 255, 255, 0.45)"
            />
            <PremiumSlider
              label="Slide Points Required"
              value={numericPoints}
              min={1000}
              max={150000}
              step={1000}
              onChange={(val) => setPointPrice(val.toString())}
              accentColor="#10B981"
              valueSuffix=" pts"
            />
          </View>
        </View>

        <ThemedText style={styles.inputLabel} type="code">
          REDEEMING PROGRAM
        </ThemedText>
        <View style={styles.scrollWrapper}>
          <Pressable onPress={scrollLeft} style={styles.chevronButton}>
            <ThemedText style={styles.chevronText}>‹</ThemedText>
          </Pressable>

          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.partnerScroll}
            contentContainerStyle={styles.partnerScrollContent}>
            {partners.map((p) => {
              const isSelected = partner === p.id;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => setPartner(p.id)}
                  style={[
                    styles.partnerTab,
                    {
                      backgroundColor: isSelected ? '#D4AF37' : 'transparent',
                      borderColor: isSelected ? '#D4AF37' : 'rgba(212, 175, 55, 0.2)',
                    },
                  ]}>
                  <ThemedText
                    style={{ color: isSelected ? '#090A0F' : '#9CA3AF' }}
                    type="smallBold">
                    {p.name}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>

          <Pressable onPress={scrollRight} style={styles.chevronButton}>
            <ThemedText style={styles.chevronText}>›</ThemedText>
          </Pressable>
        </View>
      </BlurView>

      {/* Yield visualizer panel */}
      {numericPoints > 0 && (
        <BlurView intensity={30} tint="dark" style={[styles.yieldPanel, { borderColor: yieldBadgeColor }]}>
          <View style={styles.yieldHeader}>
            <View>
              <ThemedText style={styles.yieldSub} type="code">
                YIELD (RUPEE PER POINT)
              </ThemedText>
              <ThemedText style={[styles.yieldValue, { color: yieldBadgeColor }]} type="title">
                {yieldText}
              </ThemedText>
            </View>
            <View style={[styles.yieldStatusBadge, { backgroundColor: yieldBadgeColor }]}>
              <ThemedText style={styles.yieldStatusText} type="smallBold">
                {yieldBadgeText}
              </ThemedText>
            </View>
          </View>
        </BlurView>
      )}

      {/* Dynamic Surcharge warning */}
      {taxWarning.warning && (
        <BlurView intensity={20} style={styles.warningContainer}>
          <ThemedText style={styles.warningText} type="code">
            ⚠️ TAX ALERT: {taxWarning.message}
          </ThemedText>
        </BlurView>
      )}

      {/* Math Info Panel */}
      <Pressable onPress={() => setShowMath(!showMath)} style={styles.mathPanelHeader}>
        <ThemedText style={styles.mathTitle} type="smallBold">
          {showMath ? '👇 Hide Arbitrage Logic Math' : '📖 How is Yield & Arbitrage calculated?'}
        </ThemedText>
      </Pressable>

      {showMath && (
        <BlurView intensity={10} tint="dark" style={styles.mathPanelBody}>
          <ThemedText style={styles.mathText}>
            • **Rupee per Point (RpP) Yield Formula**:
            {"\n"}  `Yield (RpP) = Hotel Cash Price (INR) / Points Required`
            {"\n\n"}
            • **What makes a transfer &quot;ELITE&quot;?**
            {"\n"}  If the calculated RpP exceeds **₹1.0**, you are getting maximum value. You should transfer bank points and book the reward stay immediately!
            {"\n"}
            • **What makes it &quot;GOOD&quot;?**
            {"\n"}  Yields between **₹0.5 and ₹0.9** represent solid redemptions (e.g. baseline Marriott/Hilton).
            {"\n"}
            • **When should you &quot;AVOID&quot;?**
            {"\n"}  If the RpP is **less than ₹0.5**, transferring points is a loss. You are better off paying cash and keeping your credit card points!
          </ThemedText>
        </BlurView>
      )}

      {/* Optimal transfer pathways */}
      <ThemedText style={styles.pathwayTitle} type="subtitle">
        Optimal Card Transfers
      </ThemedText>
      {pathways.length === 0 ? (
        <BlurView intensity={20} tint="dark" style={styles.emptyCard}>
          <ThemedText style={{ color: '#9CA3AF' }} type="code">
            No transfer pathways exist from your active wallet cards to this program.
          </ThemedText>
        </BlurView>
      ) : (
        pathways.map((path) => (
          <BlurView
            intensity={20}
            tint="dark"
            key={path.cardId}
            style={[
              styles.pathwayRow,
              {
                borderColor: path.isFeasible ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239,68,68,0.4)',
              },
            ]}>
            <View style={styles.pathwayLeft}>
              <ThemedText style={{ color: '#F3F4F6' }} type="subtitle">
                {path.cardName}
              </ThemedText>
              <ThemedText style={{ color: '#9CA3AF' }} type="code">
                Ratio: {(path.ratio * 10).toFixed(0)}:10 | Points Required: {path.pointsRequired.toLocaleString()}
              </ThemedText>
              {path.notes && (
                <ThemedText style={styles.notesText} type="code">
                  {path.notes}
                </ThemedText>
              )}
              
              <View style={styles.bridgeActionsRow}>
                <TouchableOpacity
                  style={styles.bridgeBtn}
                  onPress={async () => {
                    const copied = await copyToClipboard(path.pointsRequired.toString());
                    if (copied) {
                      Alert.alert('Copied', `Copied ${path.pointsRequired.toLocaleString()} points to clipboard!`);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <ThemedText style={styles.bridgeBtnText} type="smallBold">
                    📋 Copy Points
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.bridgeBtn}
                  onPress={async () => {
                    const url = getBankTransferUrl(path.cardId);
                    await Linking.openURL(url);
                  }}
                  activeOpacity={0.7}
                >
                  <ThemedText style={styles.bridgeBtnText} type="smallBold">
                    🌐 Open Bank
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.bridgeBtn}
                  onPress={async () => {
                    const url = getPartnerSearchUrl(partner);
                    await Linking.openURL(url);
                  }}
                  activeOpacity={0.7}
                >
                  <ThemedText style={styles.bridgeBtnText} type="smallBold">
                    🔍 Search Rewards
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            <View
              style={[
                styles.feasibilityBadge,
                { backgroundColor: path.isFeasible ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)' },
              ]}>
              <ThemedText
                style={{ color: path.isFeasible ? '#34D399' : '#F87171' }}
                type="smallBold">
                {path.isFeasible ? 'Feasible' : 'Incomplete'}
              </ThemedText>
            </View>
          </BlurView>
        ))
      )}

      {/* Hotel Booking Integration */}
      <View style={styles.bookingContainer}>
        {bookingState === 'idle' && (
          <TouchableOpacity
            style={styles.bookCashBtn}
            onPress={() => setBookingState('form')}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.bookCashText} type="smallBold">
              🏨 Book Luxury Stay (Cash & Points Arbitrage)
            </ThemedText>
          </TouchableOpacity>
        )}

        {bookingState === 'form' && (
          <View>
            <HotelGuestForm onSubmit={handleGuestSubmit} />
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
              Securing Hotel Arbitrage Reservation...
            </ThemedText>
          </BlurView>
        )}

        {bookingState === 'confirmed' && (
          <BlurView intensity={25} tint="dark" style={styles.confirmationCard}>
            <ThemedText style={styles.confirmedTitle} type="title">
              Stay Confirmed! 🎉
            </ThemedText>
            <View style={styles.divider} />
            
            <View style={styles.confirmRow}>
              <ThemedText style={styles.confirmLabel}>Hotel Program:</ThemedText>
              <ThemedText style={styles.confirmVal} type="smallBold">
                {partners.find(p => p.id === partner)?.name || partner}
              </ThemedText>
            </View>

            <View style={styles.confirmRow}>
              <ThemedText style={styles.confirmLabel}>Booking Reference:</ThemedText>
              <ThemedText style={styles.confirmVal} type="code">
                {bookingDetails?.bookingReference}
              </ThemedText>
            </View>

            <View style={styles.confirmRow}>
              <ThemedText style={styles.confirmLabel}>Primary Guest:</ThemedText>
              <ThemedText style={styles.confirmVal} type="smallBold">
                {guestData?.firstName} {guestData?.lastName}
              </ThemedText>
            </View>

            <View style={styles.confirmRow}>
              <ThemedText style={styles.confirmLabel}>Stay Dates:</ThemedText>
              <ThemedText style={styles.confirmVal} type="code">
                {guestData?.checkInDate} to {guestData?.checkOutDate}
              </ThemedText>
            </View>

            <View style={styles.confirmRow}>
              <ThemedText style={styles.confirmLabel}>Reservation Status:</ThemedText>
              <ThemedText style={[styles.confirmVal, { color: '#10B981' }]}>
                {bookingDetails?.status?.toUpperCase()}
              </ThemedText>
            </View>

            <Pressable
              style={styles.resetBtn}
              onPress={() => setBookingState('idle')}
            >
              <ThemedText style={styles.resetBtnText} type="smallBold">
                Book Another Stay
              </ThemedText>
            </Pressable>
          </BlurView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.two,
  },
  inputCard: {
    borderRadius: Spacing.three,
    padding: Spacing.five,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.12)',
    marginBottom: Spacing.four,
    overflow: 'hidden',
  },
  formRow: {
    flexDirection: 'row',
    gap: Spacing.four,
    marginBottom: Spacing.five,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F3F4F6',
    marginBottom: Spacing.three,
  },
  formCol: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 10,
    letterSpacing: 2,
    color: '#9CA3AF',
    marginBottom: Spacing.two,
  },
  textInput: {
    height: 52,
    backgroundColor: 'rgba(20, 22, 31, 0.75)',
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    color: '#F3F4F6',
    fontSize: 18,
    fontWeight: 'bold',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.12)',
  },
  partnerScroll: {
    flexDirection: 'row',
    marginTop: Spacing.one,
  },
  partnerTab: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.four,
    borderWidth: 1,
    marginRight: Spacing.two,
  },
  yieldPanel: {
    borderRadius: Spacing.three,
    padding: Spacing.five,
    borderWidth: 1,
    marginBottom: Spacing.five,
    overflow: 'hidden',
    backgroundColor: 'rgba(20, 22, 31, 0.75)',
  },
  yieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  yieldSub: {
    fontSize: 10,
    letterSpacing: 2,
    color: '#9CA3AF',
  },
  yieldValue: {
    fontSize: 38,
    fontWeight: '900',
    marginTop: Spacing.one,
    color: '#F3F4F6'
  },
  yieldStatusBadge: {
    borderRadius: Spacing.four,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  yieldStatusText: {
    color: '#1A1E26',
    fontSize: 11,
    fontWeight: 'bold',
  },
  warningContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderWidth: 1,
    borderRadius: Spacing.two,
    padding: Spacing.four,
    marginBottom: Spacing.five,
    overflow: 'hidden',
  },
  warningText: {
    color: '#FCA5A5',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pathwayTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: Spacing.three,
    marginTop: Spacing.two,
    color: '#F3F4F6'
  },
  emptyCard: {
    borderRadius: Spacing.two,
    padding: Spacing.five,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.12)',
    overflow: 'hidden',
  },
  pathwayRow: {
    borderRadius: Spacing.three,
    padding: Spacing.five,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
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
  scrollWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    position: 'relative',
  },
  chevronButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.45)',
  },
  chevronText: {
    color: '#1A1E26',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: -4,
  },
  partnerScrollContent: {
    paddingRight: Spacing.six,
  },
  presetScroll: {
    flexDirection: 'row',
    marginBottom: Spacing.five,
  },
  presetScrollContent: {
    gap: Spacing.three,
  },
  presetCard: {
    width: 220,
    height: 130,
    borderRadius: Spacing.three,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    position: 'relative',
  },
  presetCardImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  presetOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  presetCardContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: Spacing.four,
  },
  presetLabel: {
    color: '#1A1E26',
    fontSize: 13,
    fontWeight: 'bold'
  },
  presetSub: {
    color: '#1F2937',
    fontSize: 10,
    marginTop: 2
  },
  mathPanelHeader: {
    backgroundColor: 'rgba(0,0,0,0.08)',
    padding: Spacing.three,
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.12)',
    marginBottom: Spacing.two,
  },
  mathTitle: {
    color: '#9CA3AF',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  mathPanelBody: {
    padding: Spacing.five,
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.12)',
    marginBottom: Spacing.five,
    overflow: 'hidden',
  },
  mathText: {
    color: '#9CA3AF',
    fontSize: 12,
    lineHeight: 20,
  },
  bookingContainer: {
    marginTop: Spacing.four,
    gap: Spacing.three,
  },
  bookCashBtn: {
    backgroundColor: '#14161F',
    height: 52,
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
    height: 48,
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
    height: 48,
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
  bridgeActionsRow: {
    flexDirection: 'row',
    marginTop: Spacing.two,
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  bridgeBtn: {
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: 6,
  },
  bridgeBtnText: {
    color: '#D4AF37',
    fontSize: 9,
    fontWeight: '600',
  },
});
