import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, TextInput, Pressable, ImageBackground, Platform, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { PremiumSlider } from '@/components/PremiumSlider';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import Head from 'expo-router/head';
import { 
  cardInsights, 
  multiDipStrategies, 
  checkAtlasEligibility, 
  MCCCheckResult 
} from '@/data/cardInsights';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import Animated, { FadeInDown, FadeIn, SlideInRight } from 'react-native-reanimated';

const insightBanners: Record<string, any> = {
  'axis_atlas': require('../../assets/images/intel_devaluation_banner.png'),
  'indusind_avios': require('../../assets/images/singapore_biz_deal_1779184247834.png'),
  'hsbc_premier': require('../../assets/images/luxury_travel_bg_1779183265686.png'),
  'amex_travel': require('../../assets/images/hacks_taj_banner.png'),
};

/**
 * @feature FT-107_InsightsScreen
 */
export default function InsightsScreen() {
  const [activeTab, setActiveTab] = useState<'facts' | 'dips'>('facts');
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  // Atlas MCC Checker state
  const [mccSearch, setMccSearch] = useState<string>('BharatNXT');
  const [checkerResult, setCheckerResult] = useState<MCCCheckResult>(checkAtlasEligibility('BharatNXT'));

  // Double/Triple Dips Calculator state
  const [campaignSpend, setCampaignSpend] = useState<number>(50000);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('infinia_smartbuy_marriott');

  const handleMccCheck = (val: string) => {
    setMccSearch(val);
    setCheckerResult(checkAtlasEligibility(val));
  };

  const selectedStrategy = multiDipStrategies.find(s => s.id === selectedStrategyId) || multiDipStrategies[0];
  const calculatorOutput = selectedStrategy.calculateReturn(campaignSpend);

  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  const mccCheckerSection = (
    <Animated.View entering={FadeInDown.delay(400).springify()}>
      <BlurView intensity={20} tint="dark" style={styles.checkerCard}>
        <View style={{ marginBottom: Spacing.four }}>
          <ThemedText style={styles.checkerTitle} type="subtitle">
            Interactive Axis Atlas MCC Checker
          </ThemedText>
          <ThemedText style={styles.checkerDesc}>
            Enter a merchant name or payment gateway (e.g. &quot;BharatNXT&quot;, &quot;Renting&quot;, &quot;Taj Hotel&quot;) to verify if it qualifies for Edge Miles.
          </ThemedText>
        </View>
        
        <TextInput
          style={styles.checkerInput}
          value={mccSearch}
          onChangeText={handleMccCheck}
          placeholder="Enter merchant or processor name..."
          placeholderTextColor="rgba(255, 255, 255, 0.45)"
        />

        <View style={[
          styles.resultBox,
          checkerResult.isEligible ? styles.eligibleBox : styles.excludedBox
        ]}>
          <View style={styles.resultHeader}>
            <ThemedText style={[
              styles.resultBadge,
              checkerResult.isEligible ? styles.eligibleBadgeText : styles.excludedBadgeText
            ]} type="code">
              {checkerResult.isEligible ? `ELIGIBLE (${checkerResult.rewardMultiplier}X Edge Miles)` : 'EXCLUDED (0X Edge Miles)'}
            </ThemedText>
          </View>
          <ThemedText style={styles.resultText}>
            {checkerResult.reason}
          </ThemedText>
        </View>
      </BlurView>
    </Animated.View>
  );

  const cardFactsListSection = (
    <View style={{ gap: Spacing.four }}>
      <Animated.View entering={FadeInDown.delay(500).springify()}>
        <ThemedText style={styles.sectionHeading} type="subtitle">
          Interesting Premium Card Facts
        </ThemedText>
      </Animated.View>
      
      {cardInsights.map((insight, idx) => {
        const bannerSource = insightBanners[insight.cardId];

        return (
          <Animated.View key={insight.cardId} entering={SlideInRight.delay(600 + idx * 100).springify()}>
            <BlurView intensity={20} tint="dark" style={styles.factCard}>
              {bannerSource && (
                <Image 
                  source={bannerSource} 
                  style={styles.cardBanner} 
                  resizeMode="cover"
                />
              )}
              <View style={styles.factHeader}>
                <ThemedText style={styles.factIcon}>{insight.icon}</ThemedText>
                <View style={styles.factTitleCol}>
                  <ThemedText style={styles.factCardCategory} type="code">
                    {insight.category}
                  </ThemedText>
                  <ThemedText style={styles.factCardTitle} type="smallBold">
                    {insight.title}
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={styles.factDesc}>
                {insight.description}
              </ThemedText>
              <View style={styles.bulletList}>
                {insight.bulletPoints.map((bp, i) => (
                  <View key={i} style={styles.bulletItem}>
                    <ThemedText style={styles.bulletDot}>•</ThemedText>
                    <ThemedText style={styles.bulletText}>{bp}</ThemedText>
                  </View>
                ))}
              </View>
            </BlurView>
          </Animated.View>
        );
      })}
    </View>
  );

  const roiCalculatorSection = (
    <Animated.View entering={FadeInDown.delay(400).springify()}>
      <BlurView intensity={20} tint="dark" style={styles.calculatorCard}>
        <ThemedText style={styles.calcTitle} type="subtitle">
          Double/Triple Dip ROI Calculator
        </ThemedText>
        <ThemedText style={styles.calcDesc}>
          Select a dip strategy below and adjust your expected campaign/stay spend using the slider to calculate your Net ROI %.
        </ThemedText>

        <View style={styles.chipContainer}>
          {multiDipStrategies.map((s) => {
            const isSelected = selectedStrategyId === s.id;
            return (
              <Pressable 
                key={s.id} 
                onPress={() => setSelectedStrategyId(s.id)}
                style={[styles.chipButton, isSelected && styles.activeChipButton]}
              >
                <ThemedText style={[styles.chipLabel, isSelected && styles.activeChipLabel]} type="smallBold">
                  {s.type === 'triple' ? 'TRIPLE' : 'DOUBLE'} : {s.cardName.split(' ')[0]}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.sliderCol}>
          <PremiumSlider
            label="Slide Campaign Spend"
            value={campaignSpend}
            min={5000}
            max={200000}
            step={5000}
            onChange={setCampaignSpend}
            accentColor="#F59E0B"
            valueSuffix=" INR"
          />
        </View>

        <View style={styles.roiPanel}>
          <View style={styles.roiCol}>
            <ThemedText style={styles.roiLabel} type="code">NET VAL VALUE BACK</ThemedText>
            <ThemedText style={styles.roiValue} type="subtitle">₹{calculatorOutput.valueBackINR.toLocaleString()}</ThemedText>
          </View>
          <View style={styles.roiColRight}>
            <ThemedText style={styles.roiLabelRight} type="code">ACCELERATED RETURN</ThemedText>
            <ThemedText style={styles.roiPercent}>
              {calculatorOutput.roi.toFixed(1)}% ROI
            </ThemedText>
          </View>
        </View>
        
        <ThemedText style={styles.roiTextDetail}>
          *Estimated return factors in points worth (₹1/Marriott, ₹0.40/Amex) plus surcharge exclusions and milestone rewards.
        </ThemedText>
      </BlurView>
    </Animated.View>
  );

  const strategyFlowSection = (
    <View style={{ gap: Spacing.four }}>
      <Animated.View entering={FadeInDown.delay(500).springify()}>
        <ThemedText style={styles.sectionHeading} type="subtitle">
          Strategy Blueprint: {selectedStrategy.name}
        </ThemedText>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(600).springify()}>
        <BlurView intensity={20} tint="dark" style={styles.flowCard}>
          <ThemedText style={styles.flowDesc}>
            {selectedStrategy.description}
          </ThemedText>
          
          <View style={styles.stepMap}>
            {selectedStrategy.steps.map((step, idx) => (
              <View key={idx} style={styles.stepMapRow}>
                <View style={styles.stepMapBubble}>
                  <ThemedText style={styles.stepMapNum}>{idx + 1}</ThemedText>
                </View>
                <View style={styles.stepMapContent}>
                  <ThemedText style={styles.stepMapText}>
                    {step}
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>
        </BlurView>
      </Animated.View>
    </View>
  );

  return (
    <ImageBackground 
      source={require('../../assets/images/dark_luxury_bg.png')} 
      style={styles.container}
      resizeMode="cover"
      imageStyle={{ width: '100%', height: '100%', opacity: 0.35 }}
    >
      <Head>
        <title>Double/Triple Dip Calculator & Atlas Checker | The Indian Points Array</title>
        <meta name="description" content="Calculate extreme ROI with double and triple dips on HDFC SmartBuy and Marriott. Check live Axis Atlas MCC exclusions like BharatNXT." />
        <meta property="og:title" content="Double/Triple Dip Calculator & Atlas Checker | The Indian Points Array" />
        <meta property="og:description" content="Calculate extreme ROI with double and triple dips on HDFC SmartBuy and Marriott. Check live Axis Atlas MCC exclusions like BharatNXT." />
      </Head>

      <Animated.View entering={FadeIn.duration(1500)} style={StyleSheet.absoluteFillObject}>
        <LinearGradient
          colors={['rgba(9, 10, 15, 0.75)', 'rgba(9, 10, 15, 0.95)']}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>

      <SafeAreaView style={styles.safeArea} edges={Platform.OS === 'web' ? ['left', 'right'] : ['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.header}>
            <View>
              <ThemedText style={styles.subTitle} type="code">
                THE INDIAN POINTS ARRAY HACKS
              </ThemedText>
              <ThemedText style={styles.mainTitle} type="title">
                Insights & Multi-Dips
              </ThemedText>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <BlurView intensity={25} tint="dark" style={styles.tabContainer}>
              <Pressable 
                onPress={() => setActiveTab('facts')} 
                style={[styles.tabButton, activeTab === 'facts' && styles.activeTabButton]}
              >
                <ThemedText style={[styles.tabLabel, activeTab === 'facts' && styles.activeTabLabel]} type="smallBold">
                  CARD FACTS & EXCLUSIONS
                </ThemedText>
              </Pressable>
              <Pressable 
                onPress={() => setActiveTab('dips')} 
                style={[styles.tabButton, activeTab === 'dips' && styles.activeTabButton]}
              >
                <ThemedText style={[styles.tabLabel, activeTab === 'dips' && styles.activeTabLabel]} type="smallBold">
                  DOUBLE & TRIPLE DIPS
                </ThemedText>
              </Pressable>
            </BlurView>
          </Animated.View>

          {activeTab === 'facts' && (
            <View style={styles.sectionContainer}>
              {isDesktop ? (
                <View style={styles.gridContainer}>
                  <View style={styles.gridLeftColumn}>
                    {mccCheckerSection}
                  </View>
                  <View style={styles.gridRightColumn}>
                    {cardFactsListSection}
                  </View>
                </View>
              ) : (
                <View style={{ gap: Spacing.five }}>
                  {mccCheckerSection}
                  {cardFactsListSection}
                </View>
              )}
            </View>
          )}

          {activeTab === 'dips' && (
            <View style={styles.sectionContainer}>
              <View style={{ position: 'relative' }}>
                {isDesktop ? (
                  <View style={styles.gridContainer}>
                    <View style={styles.gridLeftColumn}>
                      {roiCalculatorSection}
                    </View>
                    <View style={styles.gridRightColumn}>
                      {strategyFlowSection}
                    </View>
                  </View>
                ) : (
                  <View style={{ gap: Spacing.five }}>
                    {roiCalculatorSection}
                    {strategyFlowSection}
                  </View>
                )}

                {!isSubscribed && (
                  <View style={[StyleSheet.absoluteFillObject, { zIndex: 10, borderRadius: Spacing.three, overflow: 'hidden' }]}>
                    <BlurView intensity={60} tint="dark" style={[StyleSheet.absoluteFillObject, { justifyContent: 'center', alignItems: 'center', padding: Spacing.five }]}>
                      <View style={styles.paywallBox}>
                        <ThemedText style={{ fontSize: 24, fontWeight: 'bold', color: '#D4AF37', textAlign: 'center', marginBottom: Spacing.two }}>PRO</ThemedText>
                        <ThemedText style={styles.paywallTitle}>Unlock The Indian Points Array Pro</ThemedText>
                        <ThemedText style={styles.paywallDesc}>
                          Get full access to our proprietary Double & Triple Dip calculators, exact routing blueprints, and private arbitrage groups.
                        </ThemedText>
                        <Pressable style={styles.subscribeBtn} onPress={() => setIsSubscribed(true)}>
                          <ThemedText style={styles.subscribeBtnText}>Subscribe ₹4,999 / year</ThemedText>
                        </Pressable>
                        <ThemedText style={{ fontSize: 10, color: '#6B7280', textAlign: 'center', marginTop: Spacing.three }}>Cancel anytime. Tax deductible for businesses.</ThemedText>
                      </View>
                    </BlurView>
                  </View>
                )}
              </View>
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
    minHeight: Platform.OS === 'web' ? '100vh' : '100%',
    width: '100%',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.five,
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
    fontSize: 32,
    fontWeight: '900',
    marginTop: Spacing.one,
    color: '#F3F4F6'
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: Spacing.three,
    padding: Spacing.one,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.12)',
    marginBottom: Spacing.five,
    overflow: 'hidden',
    backgroundColor: 'rgba(20, 22, 31, 0.75)',
  },
  tabButton: {
    flex: 1,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    borderRadius: Spacing.two,
  },
  activeTabButton: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
  },
  tabLabel: {
    color: '#9CA3AF',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  activeTabLabel: {
    color: '#D4AF37',
  },
  sectionContainer: {
    gap: Spacing.five,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F3F4F6',
    marginBottom: Spacing.one
  },
  checkerCard: {
    borderRadius: Spacing.three,
    padding: Spacing.five,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.12)',
    overflow: 'hidden',
    backgroundColor: 'rgba(20, 22, 31, 0.75)',
  },
  checkerTitle: {
    fontSize: 18,
    color: '#F3F4F6',
    fontWeight: 'bold',
    marginBottom: Spacing.one
  },
  checkerDesc: {
    color: '#9CA3AF',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: Spacing.four,
  },
  checkerInput: {
    backgroundColor: 'rgba(20, 22, 31, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.15)',
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.four,
    height: 48,
    color: '#F3F4F6',
    fontSize: 14,
    marginBottom: Spacing.four,
  },
  resultBox: {
    borderRadius: Spacing.two,
    padding: Spacing.four,
    borderWidth: 1,
  },
  eligibleBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  excludedBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  resultHeader: {
    marginBottom: Spacing.two,
  },
  resultBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  eligibleBadgeText: {
    color: '#34D399',
  },
  excludedBadgeText: {
    color: '#FCA5A5',
  },
  resultText: {
    color: '#9CA3AF',
    fontSize: 12,
    lineHeight: 18,
  },
  factCard: {
    borderRadius: Spacing.three,
    padding: Spacing.five,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.12)',
    overflow: 'hidden',
    backgroundColor: 'rgba(20, 22, 31, 0.75)',
  },
  factHeader: {
    flexDirection: 'row',
    gap: Spacing.three,
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  factIcon: {
    fontSize: 24,
  },
  factTitleCol: {
    flex: 1,
  },
  factCardCategory: {
    fontSize: 9,
    color: '#FBBF24',
    letterSpacing: 1.5,
  },
  factCardTitle: {
    color: '#F3F4F6',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: Spacing.half,
  },
  factDesc: {
    color: '#9CA3AF',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: Spacing.three,
  },
  bulletList: {
    gap: Spacing.two,
  },
  bulletItem: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'flex-start',
  },
  bulletDot: {
    color: '#FBBF24',
    fontSize: 12,
    marginTop: -2,
  },
  bulletText: {
    color: '#9CA3AF',
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  calculatorCard: {
    borderRadius: Spacing.three,
    padding: Spacing.five,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.12)',
    overflow: 'hidden',
    backgroundColor: 'rgba(20, 22, 31, 0.75)',
  },
  calcTitle: {
    fontSize: 18,
    color: '#F3F4F6',
    fontWeight: 'bold',
    marginBottom: Spacing.one
  },
  calcDesc: {
    color: '#9CA3AF',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: Spacing.four,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.four,
    flexWrap: 'wrap',
  },
  chipButton: {
    backgroundColor: 'rgba(20, 22, 31, 0.75)',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.12)',
  },
  activeChipButton: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  chipLabel: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  activeChipLabel: {
    color: '#090A0F',
    fontWeight: 'bold',
  },
  sliderCol: {
    marginBottom: Spacing.four,
  },
  roiPanel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(20, 22, 31, 0.75)',
    borderRadius: Spacing.two,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.12)',
    marginBottom: Spacing.three,
  },
  roiCol: {
    flex: 1,
  },
  roiColRight: {
    alignItems: 'flex-end',
  },
  roiLabel: {
    fontSize: 9,
    color: '#9CA3AF',
    letterSpacing: 1,
  },
  roiLabelRight: {
    fontSize: 9,
    color: '#9CA3AF',
    letterSpacing: 1,
    textAlign: 'right',
  },
  roiValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F3F4F6',
    marginTop: Spacing.half,
  },
  roiPercent: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#34D399',
    marginTop: Spacing.half,
  },
  roiTextDetail: {
    color: '#9CA3AF',
    fontSize: 9,
    lineHeight: 14,
  },
  flowCard: {
    borderRadius: Spacing.three,
    padding: Spacing.five,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.12)',
    overflow: 'hidden',
    backgroundColor: 'rgba(20, 22, 31, 0.75)',
  },
  flowDesc: {
    color: '#9CA3AF',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: Spacing.four,
  },
  stepMap: {
    gap: Spacing.three,
  },
  stepMapRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    alignItems: 'center',
    backgroundColor: 'rgba(20, 22, 31, 0.75)',
    borderRadius: Spacing.two,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.12)',
  },
  stepMapBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepMapNum: {
    color: '#D4AF37',
    fontSize: 13,
    fontWeight: 'bold',
  },
  stepMapContent: {
    flex: 1,
  },
  stepMapText: {
    color: '#9CA3AF',
    fontSize: 12,
    lineHeight: 18,
  },
  cardBanner: {
    width: '100%',
    height: 140,
    borderRadius: 10,
    marginBottom: Spacing.four,
  },
  paywallBox: {
    backgroundColor: '#14161F',
    borderRadius: Spacing.three,
    padding: Spacing.six,
    borderWidth: 1,
    borderColor: '#D4AF37',
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  paywallTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4AF37',
    textAlign: 'center',
    marginBottom: Spacing.two,
  },
  paywallDesc: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.five,
  },
  subscribeBtn: {
    backgroundColor: '#D4AF37',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.six,
    borderRadius: Spacing.two,
    width: '100%',
    alignItems: 'center',
  },
  subscribeBtnText: {
    color: '#090A0F',
    fontSize: 14,
    fontWeight: 'bold',
  }
});
