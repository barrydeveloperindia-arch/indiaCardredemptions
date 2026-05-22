import React from 'react';
import { ScrollView, StyleSheet, View, ImageBackground, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import Head from 'expo-router/head';
import { useWallet } from '@/context/WalletContext';
import { 
  pointSales, 
  calculateCostPerPoint, 
  getWalletRecommendation 
} from '@/data/pointSales';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn, SlideInRight } from 'react-native-reanimated';

export default function DealsScreen() {
  const { walletBalances } = useWallet();

  return (
    <ImageBackground 
      source={require('../../assets/images/minimalist_white_luxury_bg.png')} 
      style={styles.container}
      resizeMode="cover"
      imageStyle={{ width: '100%', height: '100%', opacity: 0.7 }}
    >
      <Head>
        <title>Live Point Sales Tracker | The Points Array</title>
        <meta name="description" content="A dynamic ledger of live airline and hotel point sales with automatic wallet cross-referencing." />
        <meta property="og:title" content="Live Point Sales Tracker | The Points Array" />
        <meta property="og:description" content="A dynamic ledger of live airline and hotel point sales with automatic wallet cross-referencing." />
      </Head>

      <Animated.View entering={FadeIn.duration(1500)} style={StyleSheet.absoluteFillObject}>
        <LinearGradient
          colors={['rgba(255,255,255,0.7)', 'rgba(255,255,255,1)']}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Branding */}
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.header}>
            <View>
              <ThemedText style={styles.subTitle} type="code">
                LIVE POINTS SALES TRACKER
              </ThemedText>
              <ThemedText style={styles.mainTitle} type="title">
                Active Buy Deals
              </ThemedText>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <ThemedText style={styles.pageDescription}>
              A dynamic ledger of live airline and hotel point sales. Our engine automatically cross-references these offers with your active credit card portfolio to calculate true arbitrage value.
            </ThemedText>
          </Animated.View>

          <View style={styles.listContainer}>
            {pointSales.map((sale, idx) => {
              const costData = calculateCostPerPoint(sale);
              const recommendation = getWalletRecommendation(sale, walletBalances);

              return (
                <Animated.View key={sale.id} entering={SlideInRight.delay(400 + idx * 100).springify()}>
                  <BlurView intensity={20} tint="light" style={styles.dealCard}>
                    <View style={styles.dealHeader}>
                      <ThemedText style={styles.partnerName} type="subtitle">
                        {sale.partner}
                      </ThemedText>
                      <View style={styles.bonusBadge}>
                        <ThemedText style={styles.bonusText} type="code">
                          {sale.bonusPercentage}% BONUS
                        </ThemedText>
                      </View>
                    </View>

                    <ThemedText style={styles.description}>
                      {sale.description}
                    </ThemedText>

                    {/* Math Stats Box */}
                    <BlurView intensity={30} tint="light" style={styles.mathGrid}>
                      <View style={styles.mathCol}>
                        <ThemedText style={styles.mathLabel} type="code">YIELD</ThemedText>
                        <ThemedText style={styles.mathValue}>
                          {costData.totalPoints.toLocaleString()} pts
                        </ThemedText>
                      </View>
                      <View style={styles.mathColCenter}>
                        <ThemedText style={styles.mathLabel} type="code">TOTAL COST</ThemedText>
                        <ThemedText style={styles.mathValue}>
                          ₹{costData.totalInrCost.toLocaleString()}
                        </ThemedText>
                      </View>
                      <View style={styles.mathColRight}>
                        <ThemedText style={styles.mathLabelRight} type="code">BUY RATE</ThemedText>
                        <ThemedText style={styles.mathHighlight}>
                          ₹{costData.inrCostPerPoint.toFixed(2)} per pt
                        </ThemedText>
                      </View>
                    </BlurView>

                    {/* Wallet Intelligence Recommendation */}
                    <View style={[
                      styles.recommendationBox,
                      recommendation.shouldBuy ? styles.recBuyBox : styles.recSkipBox
                    ]}>
                      <ThemedText style={[
                        styles.recBadge,
                        recommendation.shouldBuy ? styles.recBuyText : styles.recSkipText
                      ]} type="code">
                        {recommendation.shouldBuy ? '✅ RECOMMENDATION: ACQUIRE' : '🛑 RECOMMENDATION: SKIP'}
                      </ThemedText>
                      <ThemedText style={styles.recReason}>
                        {recommendation.reason}
                      </ThemedText>
                    </View>
                    
                    <ThemedText style={styles.expiryText} type="code">
                      Sale Expiry: {sale.endDate}
                    </ThemedText>
                  </BlurView>
                </Animated.View>
              );
            })}
          </View>
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
    color: '#4B5563',
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '900',
    marginTop: Spacing.one,
    color: '#111827'
  },
  pageDescription: {
    color: '#4B5563',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.five
  },
  listContainer: {
    gap: Spacing.five,
  },
  dealCard: {
    borderRadius: Spacing.three,
    padding: Spacing.five,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  dealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  partnerName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827'
  },
  bonusBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: Spacing.one,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.5)',
  },
  bonusText: {
    color: '#FBBF24',
    fontSize: 9,
    fontWeight: 'bold',
  },
  description: {
    color: '#4B5563',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.four,
  },
  mathGrid: {
    flexDirection: 'row',
    borderRadius: Spacing.two,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    marginBottom: Spacing.four,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  mathCol: {
    flex: 1,
  },
  mathColCenter: {
    flex: 1,
    alignItems: 'center',
  },
  mathColRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  mathLabel: {
    fontSize: 9,
    color: '#6B7280',
    letterSpacing: 1,
    marginBottom: 4,
  },
  mathLabelRight: {
    fontSize: 9,
    color: '#6B7280',
    letterSpacing: 1,
    marginBottom: 4,
    textAlign: 'right',
  },
  mathValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  mathHighlight: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34D399',
  },
  recommendationBox: {
    borderRadius: Spacing.two,
    padding: Spacing.three,
    borderWidth: 1,
    marginBottom: Spacing.three,
  },
  recBuyBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  recSkipBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  recBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: Spacing.one,
  },
  recBuyText: {
    color: '#34D399',
  },
  recSkipText: {
    color: '#FCA5A5',
  },
  recReason: {
    color: '#374151',
    fontSize: 12,
    lineHeight: 18,
  },
  expiryText: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'right',
  }
});
