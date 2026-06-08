import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, ImageBackground, Platform, useWindowDimensions, Pressable, Linking } from 'react-native';
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

const LOCAL_FALLBACK_POSTS = [
  {
    title: "Hyatt Fast Track: Unlock Hyatt Globalist status with just 20 nights",
    link: "https://www.instagram.com/p/DZd9n7BTL26/",
    description: "Unlock Hyatt Globalist status with just 20 nights (usually 60) plus a 1-year status match to Hyatt Explorist — tag a friend who needs this. Hyatt’s 20-night fast track is back! ✈️ #creditcards #creditcard #pointsandmiles #worldofhyatt #hyatt",
    pubDate: "Mon, 08 Jun 2026 06:30:00 GMT"
  },
  {
    title: "1-on-1 Travel Strategy Sessions: Maximize your credit card points",
    link: "https://www.instagram.com/p/DZbv-DTTZk0/",
    description: "Stop wasting your points and miles! 🛑 If you have over 2 lakh credit card points but no clue how to use them for business class flights or luxury hotels, we can help. ✈️🏨 In our 1-on-1 strategy sessions, we will build a custom travel plan for you, showing you exactly where to transfer your points for maximum value. Stop guessing and start traveling smart. Link in bio to apply! 🔗",
    pubDate: "Mon, 08 Jun 2026 01:30:00 GMT"
  },
  {
    title: "Free Hotel Nights: 5 Indian Credit Cards that offer free stays annually",
    link: "https://www.instagram.com/p/DZbPqTSRc8p/",
    description: "5 Indian Credit Cards that get you FREE hotel nights every year. 🏨 Send this to anyone who loves free hotel stays! ✈️ #creditcards #creditcard #pointsandmiles #luxurytravel #travelhacks",
    pubDate: "Sun, 07 Jun 2026 19:30:00 GMT"
  },
  {
    title: "Amex Platinum Travel: Is the Platinum Travel Card worth the ₹5,000 fee?",
    link: "https://www.instagram.com/p/DZY2tMHRg5m/",
    description: "Is American Express Platinum Travel Card worth the ₹5,000 fee? 🤔 Send this to someone who wants a free holiday! ✈️ #amex #americanexpress #creditcards #pointsandmiles #luxurytravel",
    pubDate: "Sun, 07 Jun 2026 14:30:00 GMT"
  },
  {
    title: "Emirates Skywards Miles Promo: Miles worth double till August 31",
    link: "https://www.instagram.com/p/DZRYfD_zf0b/",
    description: "Your Emirates Skywards miles are worth double till Aug 31! 😮 Send this to anyone who loves Emirates! ✈️ #emirates #skywards #pointsandmiles #creditcards #luxurytravel",
    pubDate: "Sun, 07 Jun 2026 10:30:00 GMT"
  }
];

/**
 * @feature FT-106_IntelScreen
 */
export default function IntelScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  const [activeTab, setActiveTab] = useState<'alerts' | 'instagram'>('alerts');
  const [instagramPosts, setInstagramPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'instagram' && instagramPosts.length === 0) {
      let active = true;
      async function fetchInstagram() {
        setLoading(true);
        setError(null);
        try {
          const res = await fetch('http://localhost:3000/api/instagram');
          if (!res.ok) {
            throw new Error('Failed to fetch Instagram feed');
          }
          const data = await res.json();
          if (active && data && Array.isArray(data.posts)) {
            setInstagramPosts(data.posts);
          }
        } catch (err: any) {
          console.warn('Unable to retrieve Instagram feed:', err);
          setError('Could not connect to Instagram feed server. Showing offline/fallback updates.');
        } finally {
          if (active) setLoading(false);
        }
      }
      fetchInstagram();
      return () => {
        active = false;
      };
    }
  }, [activeTab]);

  const handleOpenUrl = (url: string) => {
    Linking.openURL(url).catch((err) => console.error("Failed to open URL:", err));
  };

  return (
    <ImageBackground 
      source={require('../../assets/images/dark_luxury_bg.png')} 
      style={styles.container}
      resizeMode="cover"
      imageStyle={{ width: '100%', height: '100%', opacity: 0.35 }}
    >
      <Head>
        <title>Credit Card News & Intel | The Indian Points Array</title>
        <meta name="description" content="Live updates on credit card devaluations, routing sweet spots, and unannounced changes in the Indian rewards ecosystem." />
        <meta property="og:title" content="Credit Card News & Intel | The Indian Points Array" />
        <meta property="og:description" content="Live updates on credit card devaluations, routing sweet spots, and unannounced changes in the Indian rewards ecosystem." />
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
                THE INDIAN POINTS ARRAY INTEL
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

          {/* Premium Tab Toggles */}
          <Animated.View entering={FadeInDown.delay(350).springify()} style={styles.tabContainer}>
            <Pressable 
              onPress={() => setActiveTab('alerts')} 
              style={[styles.tabButton, activeTab === 'alerts' && styles.tabButtonActive]}
              testID="tab-alerts"
            >
              <ThemedText style={[styles.tabButtonText, activeTab === 'alerts' && styles.tabButtonTextActive]}>
                ECOSYSTEM ALERTS
              </ThemedText>
            </Pressable>
            <Pressable 
              onPress={() => setActiveTab('instagram')} 
              style={[styles.tabButton, activeTab === 'instagram' && styles.tabButtonActive]}
              testID="tab-instagram"
            >
              <ThemedText style={[styles.tabButtonText, activeTab === 'instagram' && styles.tabButtonTextActive]}>
                INSTAGRAM FEED
              </ThemedText>
            </Pressable>
          </Animated.View>

          {activeTab === 'alerts' ? (
            <View style={[styles.listContainer, isDesktop && { flexDirection: 'row', flexWrap: 'wrap' }]}>
              {intelFeed.map((item, idx) => {
                const bannerSource = tagBanners[item.tag];

                return (
                  <Animated.View 
                    entering={FadeInDown.delay(400 + idx * 100).springify()} 
                    key={item.id}
                    style={isDesktop ? { flex: 1, minWidth: 350, maxWidth: 560 } : undefined}
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
                );
              })}
            </View>
          ) : (
            <View style={[styles.listContainer, isDesktop && { flexDirection: 'row', flexWrap: 'wrap' }]}>
              {loading && (
                <View style={styles.centerBox}>
                  <ThemedText style={styles.loadingText}>Fetching latest insights from @thegreatindianmiles...</ThemedText>
                </View>
              )}
              
              {error && (
                <View style={styles.errorBox}>
                  <ThemedText style={styles.errorText}>{error}</ThemedText>
                </View>
              )}
              
              {(!loading ? (instagramPosts.length > 0 ? instagramPosts : LOCAL_FALLBACK_POSTS) : []).map((post, idx) => (
                <Animated.View 
                  entering={FadeInDown.delay(400 + idx * 100).springify()} 
                  key={post.link}
                  style={isDesktop ? { flex: 1, minWidth: 350, maxWidth: 560 } : undefined}
                >
                  <BlurView intensity={20} tint="dark" style={[styles.intelCard, styles.instagramCard]}>
                    <View style={styles.cardHeader}>
                      <View style={styles.instagramBadge}>
                        <ThemedText style={styles.instagramBadgeText} type="code">
                          INSTAGRAM
                        </ThemedText>
                      </View>
                      <ThemedText style={styles.dateText} type="code">
                        {post.pubDate.includes('GMT') 
                          ? new Date(post.pubDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : post.pubDate
                        }
                      </ThemedText>
                    </View>

                    <ThemedText style={styles.itemTitle} type="subtitle">
                      {post.title}
                    </ThemedText>
                    
                    <ThemedText style={styles.itemContent} numberOfLines={5}>
                      {post.description}
                    </ThemedText>

                    <Pressable 
                      style={styles.instagramButton}
                      onPress={() => handleOpenUrl(post.link)}
                    >
                      <ThemedText style={styles.instagramButtonText} type="code">
                        VIEW ON INSTAGRAM
                      </ThemedText>
                    </Pressable>
                  </BlurView>
                </Animated.View>
              ))}
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
  tabContainer: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginBottom: Spacing.five,
  },
  tabButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.15)',
    backgroundColor: 'rgba(20, 22, 31, 0.4)',
  },
  tabButtonActive: {
    borderColor: 'rgba(212, 175, 55, 0.5)',
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
  },
  tabButtonText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#9CA3AF',
    letterSpacing: 1.5,
  },
  tabButtonTextActive: {
    color: '#D4AF37',
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
  instagramCard: {
    borderColor: 'rgba(212, 175, 55, 0.2)',
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
  instagramBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderColor: 'rgba(212, 175, 55, 0.4)',
    borderWidth: 1,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: Spacing.one,
  },
  tagText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  tagTextDeval: { color: '#FCA5A5' },
  tagTextSweetSpot: { color: '#6EE7B7' },
  tagTextNews: { color: '#93C5FD' },
  instagramBadgeText: {
    color: '#D4AF37',
    fontSize: 9,
    fontWeight: 'bold',
  },
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
  },
  instagramButton: {
    marginTop: Spacing.four,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instagramButtonText: {
    color: '#D4AF37',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  centerBox: {
    padding: Spacing.six,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  loadingText: {
    color: '#9CA3AF',
    fontSize: 13,
  },
  errorBox: {
    padding: Spacing.four,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    borderRadius: Spacing.two,
    width: '100%',
    marginBottom: Spacing.four,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});
