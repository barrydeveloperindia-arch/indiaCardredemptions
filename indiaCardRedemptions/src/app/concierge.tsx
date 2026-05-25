import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, TextInput, Pressable, ImageBackground, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import Head from 'expo-router/head';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn, SlideInRight } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { parseTravelScenario } from '@/utils/aiHandler';

export default function ConciergeScreen() {
  const [name, setName] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [destination, setDestination] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const analysis = destination.trim().length > 5 ? parseTravelScenario(destination, {
    amex_platinum: 120000,
    axis_m4b: 56000,
  }) : null;

  return (
    <ImageBackground 
      source={require('../../assets/images/dark_luxury_bg.png')} 
      style={styles.container}
      resizeMode="cover"
      imageStyle={{ width: '100%', height: '100%', opacity: 0.35 }}
    >
      <Head>
        <title>Concierge & Executive Strategy | The Points Array</title>
      </Head>

      <Animated.View entering={FadeIn.duration(1500)} style={StyleSheet.absoluteFillObject}>
        <LinearGradient
          colors={['rgba(9, 10, 15, 0.75)', 'rgba(9, 10, 15, 0.95)']}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Branding */}
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.header}>
            <View>
              <ThemedText style={styles.subTitle} type="code">
                THE POINTS ARRAY BLACK
              </ThemedText>
              <ThemedText style={styles.mainTitle} type="title">
                Executive Concierge
              </ThemedText>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <ThemedText style={styles.pageDescription}>
              Hand your points over to our Redemption Architects. We handle complex routing, airline waitlists, and ticket issuance so you can focus on the journey.
            </ThemedText>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(350).springify()}>
            <Image 
              source={require('../../assets/images/concierge_service_banner.png')}
              style={styles.heroBanner}
              resizeMode="cover"
            />
          </Animated.View>

          {/* Pricing Tier */}
          <Animated.View entering={FadeInDown.delay(400).springify()}>
            <BlurView intensity={30} tint="dark" style={styles.pricingCard}>
              <LinearGradient colors={['rgba(212, 175, 55, 0.2)', 'rgba(180, 133, 9, 0.05)']} style={StyleSheet.absoluteFillObject} />
              <ThemedText style={styles.pricingBadge} type="code">FLAT FEE</ThemedText>
              <View style={styles.pricingRow}>
                <ThemedText style={styles.priceText}>₹15,000</ThemedText>
                <ThemedText style={styles.priceSubtext}>/ ticket booked</ThemedText>
              </View>
              <ThemedText style={styles.pricingDesc}>
                Pay only when your ticket is successfully ticketed. No upfront costs for routing research.
              </ThemedText>
            </BlurView>
          </Animated.View>

          {/* Inquiry Form */}
          <Animated.View entering={FadeInDown.delay(500).springify()}>
            <BlurView intensity={20} tint="dark" style={styles.formCard}>
              <ThemedText style={styles.formTitle} type="subtitle">
                Request a Strategy Blueprint
              </ThemedText>

              {submitted ? (
                <View style={styles.successBox}>
                  <ThemedText style={{ color: '#34D399', fontSize: 40, textAlign: 'center', marginBottom: Spacing.two }}>✓</ThemedText>
                  <ThemedText style={{ color: '#1A1E26', fontSize: 16, textAlign: 'center', fontWeight: 'bold' }}>Request Received.</ThemedText>
                  <ThemedText style={{ color: '#4B5563', fontSize: 12, textAlign: 'center', marginTop: Spacing.one }}>
                    An architect will contact you within 4 hours.
                  </ThemedText>
                </View>
              ) : (
                <>
                  <View style={styles.inputGroup}>
                    <ThemedText style={styles.inputLabel} type="code">YOUR NAME</ThemedText>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Rahul Sharma"
                      placeholderTextColor="rgba(255, 255, 255, 0.45)"
                      value={name}
                      onChangeText={setName}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <ThemedText style={styles.inputLabel} type="code">APPROX. PORTFOLIO BALANCE</ThemedText>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. 400,000 HDFC + 200,000 Amex"
                      placeholderTextColor="rgba(255, 255, 255, 0.45)"
                      value={portfolio}
                      onChangeText={setPortfolio}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <ThemedText style={styles.inputLabel} type="code">DREAM DESTINATION & DATES</ThemedText>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="e.g. 2 adults to London in Business Class, late November."
                      placeholderTextColor="rgba(255, 255, 255, 0.45)"
                      multiline
                      numberOfLines={4}
                      value={destination}
                      onChangeText={setDestination}
                    />
                  </View>

                  {analysis && (
                    <View style={styles.scorecardContainer}>
                      <ThemedText style={styles.scorecardTitle} type="code">
                        STRATEGY BLUEPRINT PREVIEW
                      </ThemedText>
                      
                      <View style={styles.scorecardRow}>
                        <ThemedText style={styles.scorecardLabel}>Feasibility:</ThemedText>
                        <View style={[
                          styles.badge, 
                          analysis.feasibilityScore === 'HIGH' ? styles.badgeHigh : 
                          analysis.feasibilityScore === 'MEDIUM' ? styles.badgeMedium : 
                          styles.badgeLow
                        ]}>
                          <ThemedText style={styles.badgeText}>
                            {analysis.feasibilityScore}
                          </ThemedText>
                        </View>
                      </View>

                      <View style={styles.scorecardRow}>
                        <ThemedText style={styles.scorecardLabel}>Passengers:</ThemedText>
                        <ThemedText style={styles.scorecardValue}>
                          {analysis.passengers.adults} Adults, {analysis.passengers.children} Kids
                        </ThemedText>
                      </View>

                      <View style={styles.scorecardRow}>
                        <ThemedText style={styles.scorecardLabel}>Identified Routes:</ThemedText>
                        <ThemedText style={styles.scorecardValue}>
                          {analysis.routes.map(r => `${r.origin} -> ${r.destination}`).join(' | ')}
                        </ThemedText>
                      </View>

                      <View style={styles.scorecardRow}>
                        <ThemedText style={styles.scorecardLabel}>Est. Points Required:</ThemedText>
                        <ThemedText style={styles.scorecardValue}>
                          {analysis.pointsRequiredEstimate.toLocaleString()} pts ({analysis.recommendedProgram})
                        </ThemedText>
                      </View>

                      <View style={styles.scorecardRow}>
                        <ThemedText style={styles.scorecardLabel}>Est. Cash Savings:</ThemedText>
                        <ThemedText style={styles.savingsValue}>
                          ₹{analysis.savingsEstimate.toLocaleString()}
                        </ThemedText>
                      </View>
                    </View>
                  )}

                  <Pressable style={styles.submitBtn} onPress={() => setSubmitted(true)}>
                    <ThemedText style={styles.submitBtnText}>
                      {analysis 
                        ? `Initialize Request (₹${analysis.conciergePremiumFee.toLocaleString()} Fee)` 
                        : 'Initialize Request'}
                    </ThemedText>
                  </Pressable>
                </>
              )}
            </BlurView>
          </Animated.View>

          {/* Value Props */}
          <View style={styles.valuePropsGrid}>
            <Animated.View entering={SlideInRight.delay(600).springify()} style={styles.valueProp}>
              <ThemedText style={styles.vpIcon}>🧭</ThemedText>
              <ThemedText style={styles.vpTitle} type="smallBold">Complex Routing</ThemedText>
              <ThemedText style={styles.vpDesc}>We find &quot;sweet spots&quot; that generic search engines miss.</ThemedText>
            </Animated.View>
            <Animated.View entering={SlideInRight.delay(700).springify()} style={styles.valueProp}>
              <ThemedText style={styles.vpIcon}>📞</ThemedText>
              <ThemedText style={styles.vpTitle} type="smallBold">Call Center Bypass</ThemedText>
              <ThemedText style={styles.vpDesc}>We sit on hold with airlines so you don&apos;t have to.</ThemedText>
            </Animated.View>
          </View>

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
    minHeight: Platform.OS === 'web' ? '100vh' : '100%',
    width: '100%',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  subTitle: {
    fontSize: 10,
    letterSpacing: 3,
    color: '#FBBF24',
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '900',
    marginTop: Spacing.one,
    color: '#F3F4F6'
  },
  pageDescription: {
    color: '#9CA3AF',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.five
  },
  pricingCard: {
    borderRadius: Spacing.three,
    padding: Spacing.five,
    borderWidth: 1,
    borderColor: '#D4AF37',
    overflow: 'hidden',
    backgroundColor: 'rgba(20, 22, 31, 0.75)',
    marginBottom: Spacing.five,
  },
  pricingBadge: {
    color: '#D4AF37',
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: Spacing.two,
  },
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.two,
  },
  priceText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#F3F4F6',
  },
  priceSubtext: {
    color: '#9CA3AF',
    marginLeft: Spacing.two,
    fontSize: 14,
  },
  pricingDesc: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  formCard: {
    borderRadius: Spacing.three,
    padding: Spacing.five,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.12)',
    overflow: 'hidden',
    backgroundColor: 'rgba(20, 22, 31, 0.75)',
    marginBottom: Spacing.five,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F3F4F6',
    marginBottom: Spacing.four,
  },
  inputGroup: {
    marginBottom: Spacing.four,
  },
  inputLabel: {
    fontSize: 9,
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: Spacing.two,
  },
  input: {
    backgroundColor: 'rgba(20, 22, 31, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.15)',
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    color: '#F3F4F6',
    fontSize: 14,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: '#D4AF37',
    borderRadius: Spacing.two,
    paddingVertical: Spacing.four,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  submitBtnText: {
    color: '#090A0F',
    fontWeight: 'bold',
    fontSize: 15,
  },
  successBox: {
    padding: Spacing.five,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  valuePropsGrid: {
    flexDirection: 'row',
    gap: Spacing.four,
  },
  valueProp: {
    flex: 1,
    padding: Spacing.four,
    backgroundColor: 'rgba(20, 22, 31, 0.75)',
    borderRadius: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.12)',
  },
  vpIcon: {
    fontSize: 24,
    marginBottom: Spacing.two,
  },
  vpTitle: {
    color: '#F3F4F6',
    marginBottom: Spacing.one,
  },
  vpDesc: {
    color: '#9CA3AF',
    fontSize: 11,
    lineHeight: 16,
  },
  heroBanner: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginBottom: Spacing.five,
  },
  scorecardContainer: {
    backgroundColor: 'rgba(9, 10, 15, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    borderRadius: Spacing.two,
    padding: Spacing.four,
    marginBottom: Spacing.four,
  },
  scorecardTitle: {
    fontSize: 9,
    color: '#D4AF37',
    letterSpacing: 2,
    fontWeight: 'bold',
    marginBottom: Spacing.three,
  },
  scorecardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  scorecardLabel: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  scorecardValue: {
    color: '#F3F4F6',
    fontSize: 12,
    fontWeight: '600',
  },
  savingsValue: {
    color: '#34D399',
    fontSize: 13,
    fontWeight: 'bold',
  },
  badge: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 99,
  },
  badgeHigh: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
  },
  badgeMedium: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
  },
  badgeLow: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#F3F4F6',
  }
});
