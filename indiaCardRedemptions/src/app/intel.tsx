import React from 'react';
import { ScrollView, StyleSheet, View, ImageBackground, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import Head from 'expo-router/head';
import { intelFeed } from '@/data/intelFeed';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Image } from 'expo-image';

const tagBanners: Record<string, any> = {
  'DEVALUATION': require('../../assets/images/intel_devaluation_banner.png'),
  'SWEET SPOT': require('../../assets/images/singapore_biz_deal_1779184247834.png'),
  'NEWS': require('../../assets/images/fairmont_jaipur_deal_1779184231669.png'),
};

export default function IntelScreen() {
  return (
    <ImageBackground 
      source={require('../../assets/images/dark_luxury_bg.png')} 
      style={styles.container}
      resizeMode="cover"
      imageStyle={{ width: '100%', height: '100%', opacity: 0.35 }}
    >
      <Head>
        <title>Credit Card News & Intel | The Points Array</title>
        <meta name="description" content="Live updates on credit card devaluations, routing sweet spots, and unannounced changes in the Indian rewards ecosystem." />
        <meta property="og:title" content="Credit Card News & Intel | The Points Array" />
        <meta property="og:description" content="Live updates on credit card devaluations, routing sweet spots, and unannounced changes in the Indian rewards ecosystem." />
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
                THE POINTS ARRAY INTEL
              </ThemedText>
              <ThemedText style={styles.mainTitle} type="title">
                The Latest Intelligence
              </ThemedText>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <ThemedText style={styles.pageDescription}>
              Live updates on credit card devaluations, routing sweet spots, and unannounced changes in the Indian rewards ecosystem.
            </ThemedText>
          </Animated.View>

          <View style={styles.listContainer}>
            {intelFeed.map((item, idx) => {
              const bannerSource = tagBanners[item.tag];

              return (
                <Animated.View 
                  entering={FadeInDown.delay(400 + idx * 100).springify()} 
                  key={item.id}
                >
                  <BlurView 
                    intensity={20} 
                    tint="dark" 
                    style={[
                      styles.intelCard,
                      item.tag === 'DEVALUATION' ? styles.intelCardDeval :
                      item.tag === 'SWEET SPOT' ? styles.intelCardSweetSpot : styles.intelCardNews
                    ]}
                  >
                    {bannerSource && (
                      <Image 
                        source={bannerSource} 
                        style={styles.cardBanner} 
                        resizeMode="cover"
                      />
                    )}
                    <View style={styles.cardHeader}>
                    <View style={[
                      styles.tagBadge,
                      item.tag === 'DEVALUATION' ? styles.tagDeval :
                      item.tag === 'SWEET SPOT' ? styles.tagSweetSpot : styles.tagNews
                    ]}>
                      <ThemedText style={[
                        styles.tagText,
                        item.tag === 'DEVALUATION' ? styles.tagTextDeval :
                        item.tag === 'SWEET SPOT' ? styles.tagTextSweetSpot : styles.tagTextNews
                      ]} type="code">
                        {item.tag}
                      </ThemedText>
                    </View>
                    <ThemedText style={styles.dateText} type="code">{item.date}</ThemedText>
                  </View>

                  <ThemedText style={styles.itemTitle} type="subtitle">
                    {item.title}
                  </ThemedText>
                  
                  <ThemedText style={styles.itemContent}>
                    {item.content}
                  </ThemedText>

                  <BlurView intensity={30} tint="dark" style={styles.impactBox}>
                    <ThemedText style={styles.impactLabel} type="code">TACTICAL IMPACT</ThemedText>
                    <ThemedText style={styles.impactText}>{item.impact}</ThemedText>
                  </BlurView>
                </BlurView>
              </Animated.View>
            );})}
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
    minHeight: (Platform.OS === 'web' ? '100vh' : '100%') as any,
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
    color: '#9CA3AF',
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
  listContainer: {
    gap: Spacing.four,
  },
  intelCard: {
    borderRadius: Spacing.three,
    padding: Spacing.five,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.12)',
    overflow: 'hidden',
    backgroundColor: 'rgba(20, 22, 31, 0.75)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  tagBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: Spacing.one,
    borderWidth: 1,
  },
  tagDeval: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  tagSweetSpot: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: 'rgba(16, 185, 129, 0.5)',
  },
  tagNews: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: 'rgba(59, 130, 246, 0.5)',
  },
  tagText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  tagTextDeval: { color: '#FCA5A5' },
  tagTextSweetSpot: { color: '#6EE7B7' },
  tagTextNews: { color: '#93C5FD' },
  dateText: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  itemTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F3F4F6',
    marginBottom: Spacing.two
  },
  itemContent: {
    color: '#9CA3AF',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: Spacing.four,
  },
  impactBox: {
    borderRadius: Spacing.two,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.12)',
    overflow: 'hidden',
    backgroundColor: 'rgba(20, 22, 31, 0.75)',
  },
  impactLabel: {
    fontSize: 10,
    color: '#D4AF37',
    letterSpacing: 1,
    marginBottom: Spacing.one,
    fontWeight: 'bold',
  },
  impactText: {
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
  intelCardDeval: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  intelCardSweetSpot: {
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  intelCardNews: {
    borderColor: 'rgba(212, 175, 55, 0.12)',
  }
});
