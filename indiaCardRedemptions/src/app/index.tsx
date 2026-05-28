import React, { useState, useEffect, useContext } from 'react';
import { ScrollView, StyleSheet, View, TextInput, ImageBackground, Platform, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { ThemedText } from '@/components/ThemedText';
import { WalletCard } from '@/components/WalletCard';
import AffiliateEngine from '@/components/AffiliateEngine';
import { useWallet } from '@/context/WalletContext';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { calculateAxisAtlasProgress, calculateAmexTravelProgress, calculateAxisMagnusBurgundyProgress } from '@/utils/milestoneTracker';
import { getOptimalTransferPathway } from '@/utils/loyaltyMatrixEngine';
import Head from 'expo-router/head';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
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
          <ThemedText style={{ fontSize: 11, letterSpacing: 2, color: '#374151', fontWeight: 'bold' }} numberOfLines={1} maxFontSizeMultiplier={1.25}>{bank}</ThemedText>
          <ThemedText style={{ fontSize: 14, color: 'rgba(0,0,0,0.3)', fontStyle: 'italic' }} numberOfLines={1} maxFontSizeMultiplier={1.25}>)))</ThemedText>
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
            <ThemedText style={{ color: '#4B5563', fontSize: 12, letterSpacing: 2, marginBottom: Spacing.half }} numberOfLines={1} maxFontSizeMultiplier={1.25}>•••• •••• •••• {lastFour}</ThemedText>
            <ThemedText style={{ fontSize: 15, fontWeight: 'bold', color: '#1A1E26' }} numberOfLines={1} maxFontSizeMultiplier={1.25}>{name}</ThemedText>
          </View>
          
          {network === 'MASTERCARD' && (
            <View style={{ flexDirection: 'row' }}>
              <View style={[styles.networkCircle, { backgroundColor: '#EB001B', zIndex: 2 }]} />
              <View style={[styles.networkCircle, { backgroundColor: '#F79E1B', marginLeft: -10, zIndex: 1 }]} />
            </View>
          )}
          {network === 'VISA' && (
            <ThemedText style={{ fontSize: 18, fontWeight: '900', fontStyle: 'italic', color: '#1A1E26' }} numberOfLines={1} maxFontSizeMultiplier={1.25}>VISA</ThemedText>
          )}
          {network === 'AMEX' && (
            <View style={{ backgroundColor: '#374151', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 2 }}>
              <ThemedText style={{ fontSize: 12, fontWeight: 'bold', color: '#1A1E26' }} numberOfLines={1} maxFontSizeMultiplier={1.25}>AMEX</ThemedText>
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

const SEARCH_DESTINATIONS = [
  {
    name: 'London & Europe',
    keywords: ['london', 'europe', 'paris', 'swiss', 'lufthansa', 'france', 'germany', 'uk', 'heathrow', 'cdg'],
    partner: 'aeroplan',
    partnerName: 'Air Canada Aeroplan',
    requiredMiles: 60000,
    description: 'Fly to London or Europe in Business Class (Swiss / Lufthansa).'
  },
  {
    name: 'Singapore & Bali',
    keywords: ['singapore', 'bali', 'se_asia', 'thailand', 'bangkok', 'hanoi', 'vietnam', 'malaysia', 'indonesia'],
    partner: 'krisflyer',
    partnerName: 'Singapore Airlines KrisFlyer',
    requiredMiles: 35000,
    description: 'Best availability for Singapore Airlines Business Class.'
  },
  {
    name: 'Maldives Overwater Resort',
    keywords: ['maldives', 'hotel', 'resort', 'marriott', 'bonvoy', 'hilton', 'vacation', 'beach'],
    partner: 'marriott_bonvoy',
    partnerName: 'Marriott Bonvoy',
    requiredMiles: 40000,
    description: 'Redeem points for premium stays at Marriott resorts.'
  },
  {
    name: 'Qatar Qsuite (USA / Doha)',
    keywords: ['qatar', 'doha', 'usa', 'america', 'new york', 'qsuite', 'boston', 'chicago'],
    partner: 'qatar_avios',
    partnerName: 'Qatar Airways Privilege Club',
    requiredMiles: 70000,
    description: "Fly in the world's best Business Class (Qsuite) via Doha."
  }
];

export default function HomeScreen() {
  const { cards, updateBalance, updateSpend, walletBalances } = useWallet();
  const { logout } = useContext(AuthContext);
  const [selectedCardId, setSelectedCardId] = useState<string>('axis_m4b');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchFocused, setSearchFocused] = useState(false);

  const filteredDeals = CURATED_ARBITRAGE.filter(deal => 
    searchQuery === '' || 
    deal.destination.toLowerCase().includes(searchQuery.toLowerCase()) || 
    deal.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const matchedDestinations = searchQuery.trim() === '' ? [] : SEARCH_DESTINATIONS.filter(dest =>
    dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dest.keywords.some(keyword => searchQuery.toLowerCase().includes(keyword) || keyword.includes(searchQuery.toLowerCase()))
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
        if (prog.nextTarget > 0) return { title: 'Axis AEP Milestone', progress: prog.progressPercent, image: require('../../assets/images/singapore_biz_deal_1779184247834.png'), color: '#D4AF37' };
      } else if (c.cardId === 'amex_platinum') {
        const prog = calculateAmexTravelProgress(c.spend);
        if (prog.nextTarget > 0) return { title: 'Taj e-Gift Voucher', progress: prog.progressPercent, image: require('../../assets/images/luxury_resort_pool_1779184214418.png'), color: '#D4AF37' };
      }
      return null;
    }).filter(Boolean) as { title: string, progress: number, image: any, color: string }[];

    if (milestones.length === 0) return null;

    return (
      <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.milestoneVisualsRow}>
        {milestones.map((m, idx) => (
          <Animated.View entering={SlideInRight.delay(600 + idx * 100).springify()} key={idx} style={styles.milestoneVisualCard}>
            <Image source={m.image} style={StyleSheet.absoluteFillObject} />
            <LinearGradient colors={['transparent', '#090A0F']} style={StyleSheet.absoluteFillObject} />
            <View style={styles.milestoneVisualContent}>
              <ThemedText style={{ color: '#F3F4F6', fontWeight: 'bold', fontSize: 13,  marginBottom: Spacing.half }}>{m.title}</ThemedText>
              <View style={styles.milestoneVisualTrack}>
                <View style={[styles.milestoneVisualFill, { width: `${m.progress}%`, backgroundColor: '#D4AF37' }]} />
              </View>
              <ThemedText style={{ color: '#D4AF37', fontSize: 10, fontWeight: 'bold', marginTop: 4 }}>{m.progress.toFixed(0)}% ACHIEVED</ThemedText>
            </View>
          </Animated.View>
        ))}
      </Animated.View>
    );
  };

  return (
    <ImageBackground 
      source={require('../../assets/images/dark_luxury_bg.png')} 
      style={styles.container}
      resizeMode="cover"
      imageStyle={{ width: '100%', height: '100%', opacity: 0.35 }}
    >
      <Head>
        <title>The Indian Points Array | Hotel & Flight Arbitrage Solver</title>
      </Head>
      
      <Animated.View entering={FadeIn.duration(1500)} style={StyleSheet.absoluteFillObject}>
        <LinearGradient
          colors={['rgba(9, 10, 15, 0.75)', 'rgba(9, 10, 15, 0.95)']}
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
            <BlurView intensity={30} tint="dark" style={[styles.searchContainer, searchFocused && { borderColor: '#D4AF37', shadowColor: '#D4AF37', shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 }]}>
              <ThemedText style={styles.searchIcon}>🔍</ThemedText>
              <TextInput
                style={[styles.searchInput, { outlineStyle: 'none' } as any]}
                placeholder='Search "London", "Maldives"...'
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </BlurView>
          </Animated.View>

          {/* Dynamic Search Results */}
          {searchQuery.trim() !== '' && (
            <Animated.View entering={FadeInDown.delay(100).springify()}>
              <ThemedText style={styles.sectionLabel} type="subtitle">Optimal Route Results</ThemedText>
              {matchedDestinations.length === 0 ? (
                <View style={styles.noResultsBox}>
                  <ThemedText style={{ color: '#4B5563', fontSize: 13, textAlign: 'center' }}>
                    No exact flight path matches in our automated database. Contact Concierge for offline custom routing.
                  </ThemedText>
                </View>
              ) : (
                matchedDestinations.map(dest => {
                  const pathways = getOptimalTransferPathway(dest.partner, dest.requiredMiles, walletBalances);
                  return (
                    <View key={dest.partner} style={styles.searchResultCard}>
                      <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFillObject} />
                      <LinearGradient colors={['rgba(255, 255, 255, 0.75)', 'rgba(255, 255, 255, 0.45)']} style={StyleSheet.absoluteFillObject} />
                      
                      <View style={{ padding: Spacing.four }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <ThemedText style={{ fontSize: 16, fontWeight: 'bold', color: '#1A1E26' }}>{dest.name}</ThemedText>
                          <View style={styles.partnerBadge}>
                            <ThemedText style={styles.partnerBadgeText}>{dest.partnerName}</ThemedText>
                          </View>
                        </View>
                        <ThemedText style={{ fontSize: 12, color: '#4B5563', marginTop: Spacing.one }}>{dest.description}</ThemedText>
                        
                        <View style={styles.divider} />
                        
                        <ThemedText style={{ fontSize: 11, fontWeight: 'bold', color: '#F59E0B', marginBottom: Spacing.two }}>OPTIMAL WALLET ROUTING</ThemedText>
                        
                        {pathways.length === 0 ? (
                          <ThemedText style={{ fontSize: 12, color: '#DC2626' }}>No card in your wallet supports this transfer partner.</ThemedText>
                        ) : (
                          pathways.map((path, idx) => (
                            <View key={path.cardId} style={[styles.pathwayRow, idx > 0 && { marginTop: Spacing.two }]}>
                              <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                                  <ThemedText style={{ fontSize: 13, fontWeight: 'bold', color: '#1A1E26' }}>{path.cardName}</ThemedText>
                                  {path.notes && (
                                    <View style={styles.noteBadge}>
                                      <ThemedText style={styles.noteBadgeText}>{path.notes}</ThemedText>
                                    </View>
                                  )}
                                </View>
                                <ThemedText style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>Ratio: {path.ratio.toFixed(1)}:1 | Requires: {path.pointsRequired.toLocaleString()} pts</ThemedText>
                              </View>
                              
                              <View style={[styles.statusBadge, { backgroundColor: path.isFeasible ? '#D1FAE5' : '#FEE2E2' }]}>
                                <ThemedText style={[styles.statusBadgeText, { color: path.isFeasible ? '#065F46' : '#991B1B' }]}>
                                  {path.isFeasible ? '✓ FEASIBLE' : '✗ INSUFFICIENT'}
                                </ThemedText>
                              </View>
                            </View>
                          ))
                        )}
                      </View>
                    </View>
                  );
                })
              )}
            </Animated.View>
          )}

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
              <Pressable style={styles.vipBanner} testID="vip-banner">
                <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFillObject} />
                <LinearGradient colors={['#1C1E24', '#0B0C10']} style={StyleSheet.absoluteFillObject} />
                <View style={{ padding: Spacing.five }}>
                  <ThemedText style={{ color: '#D4AF37', fontSize: 10, letterSpacing: 2, fontWeight: 'bold' }}>EXECUTIVE SERVICE</ThemedText>
                  <ThemedText style={{ color: '#F3F4F6', fontSize: 20, fontWeight: 'bold', marginTop: Spacing.two }}>Too Many Points, Too Little Time?</ThemedText>
                  <ThemedText style={{ color: '#9CA3AF', fontSize: 13, marginTop: Spacing.two, lineHeight: 18 }}>
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

          {/* Logout Option at the bottom */}
          <Animated.View entering={FadeInDown.delay(1200).springify()} style={{ marginTop: Spacing.eight, alignItems: 'center', marginBottom: Spacing.four }}>
            <Pressable onPress={logout} style={styles.logoutButtonBottom} testID="logout-button">
              <ThemedText style={styles.logoutTextBottom}>LOGOUT OF ACCOUNT</ThemedText>
            </Pressable>
          </Animated.View>
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
    padding: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.six,
  },
  dashboardHeaderCard: {
    borderRadius: Spacing.four,
    padding: Spacing.five,
    overflow: 'hidden',
    backgroundColor: 'rgba(20, 22, 31, 0.75)',
    marginBottom: Spacing.five,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.15)',
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
    color: '#9CA3AF',
  },
  mainTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#F3F4F6'
  },
  ringChartPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  portfolioDistributionBar: {
    height: 8,
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
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
    borderColor: 'rgba(255, 255, 255, 0.08)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  emvChip: {
    width: 34,
    height: 26,
    backgroundColor: '#E5C07B',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    position: 'relative',
    marginTop: Spacing.two,
  },
  emvLineTop: { position: 'absolute', top: 6, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.08)' },
  emvLineBottom: { position: 'absolute', bottom: 6, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.08)' },
  emvLineLeft: { position: 'absolute', top: 0, bottom: 0, left: 10, width: 1, backgroundColor: 'rgba(255, 255, 255, 0.08)' },
  emvLineRight: { position: 'absolute', top: 0, bottom: 0, right: 10, width: 1, backgroundColor: 'rgba(255, 255, 255, 0.08)' },
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
    borderColor: 'rgba(212, 175, 55, 0.4)',
    marginBottom: Spacing.five,
    backgroundColor: 'rgba(20, 22, 31, 0.75)',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
  },
  vipButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    marginTop: Spacing.four,
    alignItems: 'center',
  },
  vipButtonText: {
    color: '#090A0F',
    fontWeight: 'bold',
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.four,
    backgroundColor: 'rgba(20, 22, 31, 0.75)',
    marginBottom: Spacing.five,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.15)',
  },
  searchIcon: {
    fontSize: 20,
    marginRight: Spacing.three,
  },
  searchInput: {
    flex: 1,
    fontSize: 18,
    color: '#F3F4F6',
    fontWeight: '500',
  },
  heroHeader: {
    marginBottom: Spacing.four,
    marginTop: Spacing.two,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#F3F4F6',
    textAlign: 'left',
  },
  logoutButtonBottom: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(20, 22, 31, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutTextBottom: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'rgba(243, 244, 246, 0.6)',
    letterSpacing: 2,
  },
  newsTicker: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    backgroundColor: 'rgba(20, 22, 31, 0.75)',
    marginBottom: Spacing.five,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.15)',
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
    color: '#9CA3AF',
    fontSize: 12,
    flex: 1,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F3F4F6',
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
    borderColor: 'rgba(212, 175, 55, 0.12)',
  },
  milestoneVisualContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: Spacing.three,
  },
  milestoneVisualTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
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
    color: '#1A1E26',
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
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
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
  searchResultCard: {
    borderRadius: Spacing.three,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    marginBottom: Spacing.five,
    backgroundColor: 'rgba(255,255,255,0.7)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  partnerBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: 4,
  },
  partnerBadgeText: {
    color: '#B45309',
    fontSize: 9,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginVertical: Spacing.three,
  },
  pathwayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.4)',
    padding: Spacing.three,
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  noteBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 3,
    marginLeft: 6,
  },
  noteBadgeText: {
    color: '#92400E',
    fontSize: 8,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: 4,
    minWidth: 85,
    alignItems: 'center',
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
});

