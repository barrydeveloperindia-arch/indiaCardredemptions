import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, TextInput, Image, ImageBackground, Platform, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { WalletCard } from '@/components/WalletCard';
import AffiliateEngine from '@/components/AffiliateEngine';
import { useWallet } from '@/context/WalletContext';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { calculateAxisAtlasProgress, calculateAmexTravelProgress, calculateAxisMagnusBurgundyProgress } from '@/utils/milestoneTracker';
import Head from 'expo-router/head';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn, SlideInRight, useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, withSequence, withDelay } from 'react-native-reanimated';

const CURATED_ARBITRAGE = [
  {
    id: '1',
    destination: 'Jaipur',
    title: 'Fairmont Jaipur Palace',
    yield: '🔥 ₹2.00 YIELD / PT',
    desc: 'Save ₹40,000 instantly using Accor points.',
    image: require('../../assets/images/fairmont_jaipur_deal_1779184231669.png'),
    strategy: 'Use Axis Atlas points for 2:1 transfer to Accor. High value for domestic luxury.'
  },
  {
    id: '2',
    destination: 'Singapore',
    title: 'Singapore Airlines Suites',
    yield: '💎 ₹4.50 YIELD / PT',
    desc: 'Fly First Class for 50,000 KrisFlyer miles.',
    image: require('../../assets/images/singapore_biz_deal_1779184247834.png'),
    strategy: 'Transfer HSBC Premier points directly to KrisFlyer (1:1). Perfect for ultra-long haul.'
  },
  {
    id: '3',
    destination: 'Maldives',
    title: 'St. Regis Maldives',
    yield: '🏝️ ₹3.10 YIELD / PT',
    desc: 'Overwater Villa using Marriott Bonvoy points.',
    image: require('../../assets/images/luxury_resort_pool_1779184214418.png'),
    strategy: 'Transfer Amex Platinum points to Marriott Bonvoy during the 30% bonus window.'
  }
];

// Infinite Carousel Component
function CardCarousel() {
  const translateX = useSharedValue(0);
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(-1200, {
        duration: 25000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const RealisticCard = ({ bank, colors, name, network, lastFour }: { bank: string, colors: string[], name: string, network: 'VISA' | 'MASTERCARD' | 'AMEX', lastFour: string }) => (
    <View style={styles.carouselCard}>
      <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFillObject} />
      <LinearGradient colors={colors} style={StyleSheet.absoluteFillObject} start={{x: 0, y: 0}} end={{x: 1, y: 1}} />
      <View style={styles.cardShine} />
      <View style={{ padding: Spacing.four, flex: 1, justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <ThemedText style={{ fontSize: 11, letterSpacing: 2, color: '#374151', fontWeight: 'bold' }}>{bank}</ThemedText>
          <ThemedText style={{ fontSize: 14, color: 'rgba(0,0,0,0.3)', fontStyle: 'italic' }}>)))</ThemedText>
        </View>

        {/* EMV Chip */}
        <View style={styles.emvChip}>
          <View style={styles.emvLineTop} />
          <View style={styles.emvLineBottom} />
          <View style={styles.emvLineLeft} />
          <View style={styles.emvLineRight} />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <View>
            <ThemedText style={{ color: '#4B5563', fontSize: 12, letterSpacing: 2, marginBottom: Spacing.half }}>•••• •••• •••• {lastFour}</ThemedText>
            <ThemedText style={{ fontSize: 15, fontWeight: 'bold', color: '#111827' }}>{name}</ThemedText>
          </View>
          
          {network === 'MASTERCARD' && (
            <View style={{ flexDirection: 'row' }}>
              <View style={[styles.networkCircle, { backgroundColor: '#EB001B', zIndex: 2 }]} />
              <View style={[styles.networkCircle, { backgroundColor: '#F79E1B', marginLeft: -10, zIndex: 1 }]} />
            </View>
          )}
          {network === 'VISA' && (
            <ThemedText style={{ fontSize: 18, fontWeight: '900', fontStyle: 'italic', color: '#111827' }}>VISA</ThemedText>
          )}
          {network === 'AMEX' && (
            <View style={{ backgroundColor: '#D1D5DB', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 2 }}>
              <ThemedText style={{ fontSize: 12, fontWeight: 'bold', color: '#111827' }}>AMEX</ThemedText>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.carouselContainer}>
      <Animated.View style={[styles.carouselTrack, animatedStyle]}>
        <RealisticCard bank="HDFC BANK" name="Infinia Metal" colors={['rgba(243, 244, 246, 0.8)', 'rgba(209, 213, 219, 0.8)']} network="MASTERCARD" lastFour="1033" />
        <RealisticCard bank="AXIS BANK" name="Atlas Miles" colors={['rgba(254, 242, 242, 0.8)', 'rgba(252, 165, 165, 0.8)']} network="VISA" lastFour="4920" />
        <RealisticCard bank="AMEX" name="Platinum Charge" colors={['rgba(243, 244, 246, 0.8)', 'rgba(229, 231, 235, 0.8)']} network="AMEX" lastFour="2019" />
        <RealisticCard bank="HSBC" name="Premier World" colors={['rgba(254, 242, 242, 0.8)', 'rgba(254, 202, 202, 0.8)']} network="MASTERCARD" lastFour="9044" />
        <RealisticCard bank="SBI CARD" name="Cashback" colors={['rgba(239, 246, 255, 0.8)', 'rgba(191, 219, 254, 0.8)']} network="VISA" lastFour="8322" />
        
        {/* Repeat for infinite loop visual */}
        <RealisticCard bank="HDFC BANK" name="Infinia Metal" colors={['rgba(243, 244, 246, 0.8)', 'rgba(209, 213, 219, 0.8)']} network="MASTERCARD" lastFour="1033" />
        <RealisticCard bank="AXIS BANK" name="Atlas Miles" colors={['rgba(254, 242, 242, 0.8)', 'rgba(252, 165, 165, 0.8)']} network="VISA" lastFour="4920" />
        <RealisticCard bank="AMEX" name="Platinum Charge" colors={['rgba(243, 244, 246, 0.8)', 'rgba(229, 231, 235, 0.8)']} network="AMEX" lastFour="2019" />
        <RealisticCard bank="HSBC" name="Premier World" colors={['rgba(254, 242, 242, 0.8)', 'rgba(254, 202, 202, 0.8)']} network="MASTERCARD" lastFour="9044" />
        <RealisticCard bank="SBI CARD" name="Cashback" colors={['rgba(239, 246, 255, 0.8)', 'rgba(191, 219, 254, 0.8)']} network="VISA" lastFour="8322" />
      </Animated.View>
    </View>
  );
}

export default function HomeScreen() {
  const { cards, updateBalance, updateSpend } = useWallet();
  const [selectedCardId, setSelectedCardId] = useState<string>('axis_m4b');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredDeals = CURATED_ARBITRAGE.filter(deal => 
    searchQuery === '' || 
    deal.destination.toLowerCase().includes(searchQuery.toLowerCase()) || 
    deal.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPoints = cards.reduce((acc, c) => acc + c.balance, 0);

  // VIP Trigger Logic: High-Ticket Consultation
  const isVipUser = totalPoints >= 500000;

  // Graphical Portfolio Distribution Logic
  const getPortfolioDistribution = () => {
    if (totalPoints === 0) return [];
    return cards.map(c => {
      let color = '#6B7280'; // default gray
      if (c.cardId === 'axis_m4b') color = '#F472B6'; // pink
      if (c.cardId === 'amex_platinum') color = '#60A5FA'; // blue
      if (c.cardId === 'hsbc_premier') color = '#EF4444'; // red
      if (c.cardId === 'yes_private') color = '#F59E0B'; // gold
      return { width: (c.balance / totalPoints) * 100, color };
    });
  };

  const renderVisualMilestones = () => {
    const milestones = cards.map((c) => {
      if (c.cardId === 'axis_m4b') {
        const prog = calculateAxisMagnusBurgundyProgress(c.spend);
        if (prog.nextTarget > 0) return { title: 'Axis AEP Milestone', progress: prog.progressPercent, image: require('../../assets/images/singapore_biz_deal_1779184247834.png'), color: '#F472B6' };
      } else if (c.cardId === 'amex_platinum') {
        const prog = calculateAmexTravelProgress(c.spend);
        if (prog.nextTarget > 0) return { title: 'Taj e-Gift Voucher', progress: prog.progressPercent, image: require('../../assets/images/luxury_resort_pool_1779184214418.png'), color: '#60A5FA' };
      }
      return null;
    }).filter(Boolean) as { title: string, progress: number, image: any, color: string }[];

    if (milestones.length === 0) return null;

    return (
      <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.milestoneVisualsRow}>
        {milestones.map((m, idx) => (
          <Animated.View entering={SlideInRight.delay(600 + idx * 100).springify()} key={idx} style={styles.milestoneVisualCard}>
            <Image source={m.image} style={StyleSheet.absoluteFillObject} />
            <LinearGradient colors={['transparent', 'rgba(255,255,255,0.9)']} style={StyleSheet.absoluteFillObject} />
            <View style={styles.milestoneVisualContent}>
              <ThemedText style={{ color: '#111827', fontWeight: 'bold', fontSize: 13,  marginBottom: Spacing.half }}>{m.title}</ThemedText>
              <View style={styles.milestoneVisualTrack}>
                <View style={[styles.milestoneVisualFill, { width: `${m.progress}%`, backgroundColor: m.color }]} />
              </View>
              <ThemedText style={{ color: m.color, fontSize: 10, fontWeight: 'bold', marginTop: 4 }}>{m.progress.toFixed(0)}% TO GOAL</ThemedText>
            </View>
          </Animated.View>
        ))}
      </Animated.View>
    );
  };

  return (
    <ImageBackground 
      source={require('../../assets/images/minimalist_white_luxury_bg.png')} 
      style={styles.container}
      resizeMode="cover"
      imageStyle={{ width: '100%', height: '100%', opacity: 0.7 }}
    >
      <Head>
        <title>The Points Array | Hotel & Flight Arbitrage Solver</title>
      </Head>
      
      <Animated.View entering={FadeIn.duration(1500)} style={StyleSheet.absoluteFillObject}>
        <LinearGradient
          colors={['rgba(255,255,255,0.7)', 'rgba(255,255,255,1)']}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Removed Dashboard Header & News Ticker to reduce clutter and focus on the core user problem: Which card to use and where to go. */}

          {/* 1. Travel Search Bar - Hero Section */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <View style={styles.heroHeader}>
              <ThemedText style={styles.heroTitle} type="title">Where will your points take you?</ThemedText>
            </View>
            <BlurView intensity={30} tint="light" style={styles.searchContainer}>
              <ThemedText style={styles.searchIcon}>🔍</ThemedText>
              <TextInput
                style={[styles.searchInput, { outlineStyle: 'none' } as any]}
                placeholder='Search "London", "Maldives"...'
                placeholderTextColor="rgba(0,0,0,0.3)"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </BlurView>
          </Animated.View>

          {/* INFINITE CAROUSEL - Indian CC Ecosystem */}
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <CardCarousel />
          </Animated.View>

          {/* Graphical Milestone Radars */}
          <Animated.View entering={FadeInDown.delay(450).springify()}>
            <ThemedText style={styles.sectionLabel} type="subtitle">Milestone Radar</ThemedText>
          </Animated.View>
          {renderVisualMilestones()}

          {/* VIP HIGH TICKET TRIGGER */}
          {isVipUser && (
            <Animated.View entering={FadeInDown.delay(500).springify()}>
              <Pressable style={styles.vipBanner}>
                <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFillObject} />
                <LinearGradient colors={['rgba(245, 158, 11, 0.4)', 'rgba(180, 83, 9, 0.1)']} style={StyleSheet.absoluteFillObject} />
                <View style={{ padding: Spacing.five }}>
                  <ThemedText style={{ color: '#FDE68A', fontSize: 10, letterSpacing: 2, fontWeight: 'bold' }}>EXECUTIVE SERVICE</ThemedText>
                  <ThemedText style={{ color: '#111827', fontSize: 20, fontWeight: 'bold', marginTop: Spacing.two }}>Too Many Points, Too Little Time?</ThemedText>
                  <ThemedText style={{ color: '#FEF3C7', fontSize: 13, marginTop: Spacing.two, lineHeight: 18 }}>
                    You have over 5 Lakh points. Our Redemption Architects can handle the complex routing and secure your next First Class flight for a flat fee.
                  </ThemedText>
                  <View style={styles.vipButton}>
                    <ThemedText style={styles.vipButtonText}>Book 1-on-1 Session (₹10,000)</ThemedText>
                  </View>
                </View>
              </Pressable>
            </Animated.View>
          )}

          {/* 2. Dynamic Arbitrage Filter - Solves User Problem */}
          <Animated.View entering={FadeInDown.delay(700).springify()}>
            <ThemedText style={styles.sectionLabel} type="subtitle">
              {searchQuery ? `Arbitrage Strategies for "${searchQuery}"` : 'Curated Arbitrage'}
            </ThemedText>
            
            {filteredDeals.length === 0 ? (
              <View style={styles.noResultsBox}>
                <ThemedText style={{ color: '#6B7280', fontSize: 13, textAlign: 'center' }}>
                  No active arbitrage strategies found for this destination. Please contact our Executive Concierge for custom routing.
                </ThemedText>
              </View>
            ) : (
              filteredDeals.map((deal) => (
                <Pressable key={deal.id} style={styles.dealBanner}>
                  <Image source={deal.image} style={styles.dealImage} />
                  <LinearGradient colors={['transparent', 'rgba(255,255,255,0.95)']} style={styles.dealOverlay} />
                  <View style={styles.dealContent}>
                    <View style={styles.dealBadge}>
                      <BlurView intensity={30} style={styles.dealBadgeInner}>
                        <ThemedText style={styles.dealBadgeText} type="code">{deal.yield}</ThemedText>
                      </BlurView>
                    </View>
                    <ThemedText style={styles.dealTitle} type="subtitle">{deal.title}</ThemedText>
                    <ThemedText style={styles.dealDesc}>{deal.desc}</ThemedText>
                    
                    <View style={styles.strategyBox}>
                      <ThemedText style={{ color: '#F59E0B', fontSize: 9, letterSpacing: 1, fontWeight: 'bold', marginBottom: Spacing.one }}>WALLET STRATEGY</ThemedText>
                      <ThemedText style={{ color: '#4B5563', fontSize: 11 }}>{deal.strategy}</ThemedText>
                    </View>
                  </View>
                </Pressable>
              ))
            )}
          </Animated.View>

          {/* Monetization Engine */}
          <Animated.View entering={FadeInDown.delay(800).springify()}>
            <AffiliateEngine recommendedCard="Axis Atlas" />
          </Animated.View>

          {/* Cards List */}
          <Animated.View entering={FadeInDown.delay(900).springify()}>
            <ThemedText style={styles.sectionLabel} type="subtitle">
              Wallet Intelligence
            </ThemedText>
          </Animated.View>
          {cards.map((c, idx) => (
            <Animated.View key={c.cardId} entering={FadeInDown.delay(1000 + idx * 100).springify()}>
              <WalletCard
                cardId={c.cardId}
                balance={c.balance}
                spend={c.spend}
                isSelected={selectedCardId === c.cardId}
                onSelect={() => setSelectedCardId(c.cardId)}
                onUpdateBalance={(val) => updateBalance(c.cardId, val)}
                onUpdateSpend={(val) => updateSpend(c.cardId, val)}
              />
            </Animated.View>
          ))}
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
    padding: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.six,
  },
  dashboardHeaderCard: {
    borderRadius: Spacing.four,
    padding: Spacing.five,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.7)',
    marginBottom: Spacing.five,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
  },
  dashboardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  subTitle: {
    fontSize: 10,
    letterSpacing: 3,
    color: '#4B5563',
  },
  mainTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#111827'
  },
  ringChartPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  portfolioDistributionBar: {
    height: 8,
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginBottom: Spacing.two,
  },
  distributionSegment: {
    height: '100%',
  },
  distributionLabels: {
    flexDirection: 'row',
    gap: Spacing.four,
  },
  carouselContainer: {
    height: 160,
    marginBottom: Spacing.five,
    overflow: 'hidden',
  },
  carouselTrack: {
    flexDirection: 'row',
    gap: Spacing.four,
  },
  carouselCard: {
    width: 240,
    height: 151,
    borderRadius: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  cardShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  emvChip: {
    width: 34,
    height: 26,
    backgroundColor: '#E5C07B',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    overflow: 'hidden',
    position: 'relative',
    marginTop: Spacing.two,
  },
  emvLineTop: { position: 'absolute', top: 6, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.6)' },
  emvLineBottom: { position: 'absolute', bottom: 6, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.6)' },
  emvLineLeft: { position: 'absolute', top: 0, bottom: 0, left: 10, width: 1, backgroundColor: 'rgba(255,255,255,0.6)' },
  emvLineRight: { position: 'absolute', top: 0, bottom: 0, right: 10, width: 1, backgroundColor: 'rgba(255,255,255,0.6)' },
  networkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    opacity: 0.85,
  },
  vipBanner: {
    borderRadius: Spacing.three,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
    marginBottom: Spacing.five,
    backgroundColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  vipButton: {
    backgroundColor: '#111827',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    marginTop: Spacing.four,
    alignItems: 'center',
  },
  vipButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.four,
    backgroundColor: 'rgba(255,255,255,0.9)',
    marginBottom: Spacing.five,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: Spacing.three,
  },
  searchInput: {
    flex: 1,
    fontSize: 18,
    color: '#111827',
    fontWeight: '500',
  },
  heroHeader: {
    marginBottom: Spacing.four,
    marginTop: Spacing.two,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center',
  },
  newsTicker: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    backgroundColor: 'rgba(255,255,255,0.85)',
    marginBottom: Spacing.five,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
  },
  tickerBadge: {
    backgroundColor: '#EF4444',
    color: '#FFFFFF',
    fontSize: 9,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: Spacing.three,
    overflow: 'hidden',
  },
  tickerText: {
    color: '#4B5563',
    fontSize: 12,
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.four,
    height: 52,
    marginBottom: Spacing.five,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: Spacing.three,
  },
  searchInput: {
    flex: 1,
    color: '#111827',
    fontSize: 15,
    height: '100%',
    fontWeight: 'bold',
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: Spacing.three,
    letterSpacing: 0.5
  },
  milestoneVisualsRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginBottom: Spacing.five,
  },
  milestoneVisualCard: {
    flex: 1,
    height: 120,
    borderRadius: Spacing.three,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  milestoneVisualContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: Spacing.three,
  },
  milestoneVisualTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  milestoneVisualFill: {
    height: '100%',
  },
  dealBanner: {
    height: 160,
    borderRadius: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: Spacing.five,
  },
  dealImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  dealOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dealContent: {
    flex: 1,
    padding: Spacing.four,
    justifyContent: 'flex-end',
  },
  dealBadge: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.two,
    borderRadius: Spacing.one,
    overflow: 'hidden',
  },
  dealBadgeInner: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  dealBadgeText: {
    color: '#FCD34D',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  dealTitle: {
    fontSize: 18,
    color: '#111827',
    fontWeight: 'bold',
    marginBottom: Spacing.one
  },
  dealDesc: {
    color: '#1F2937',
    fontSize: 12,
    lineHeight: 16
  },
  noResultsBox: {
    padding: Spacing.five,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: Spacing.three,
    marginBottom: Spacing.five,
    alignItems: 'center',
    justifyContent: 'center',
  },
  strategyBox: {
    marginTop: Spacing.two,
    padding: Spacing.three,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
});
