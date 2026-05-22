import React from 'react';
import { View, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { ThemedText } from './ThemedText';
import { Spacing } from '@/constants/theme';

import { BlurView } from 'expo-blur';

interface AffiliateEngineProps {
  recommendedCard: string;
}

export default function AffiliateEngine({ recommendedCard }: AffiliateEngineProps) {
  const handleApply = () => {
    const url = 'https://example.com/affiliate-link';
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url);
    }
  };

  return (
    <BlurView intensity={20} tint="dark" style={styles.container}>
      <View style={styles.content}>
        <ThemedText style={styles.subtitle} type="code">
          OPTIMIZATION ANALYSIS
        </ThemedText>
        <ThemedText style={styles.title} type="subtitle">
          Missing Out On Points?
        </ThemedText>
        <ThemedText style={styles.description}>
          Based on your high travel spending, you could be earning 3X more rewards by using the {recommendedCard}.
        </ThemedText>
      </View>
      <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
        <ThemedText style={styles.applyText}>Apply Now</ThemedText>
      </TouchableOpacity>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Spacing.three,
    padding: Spacing.five,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    flexDirection: 'column',
    gap: Spacing.four,
    marginVertical: Spacing.four,
    overflow: 'hidden',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  content: {
    flex: 1,
  },
  subtitle: {
    color: '#10B981',
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: Spacing.two,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: Spacing.one,
  },
  description: {
    color: '#9CA3AF',
    fontSize: 12,
    lineHeight: 18,
  },
  applyButton: {
    backgroundColor: '#10B981',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.two,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  applyText: {
    color: '#F3F4F6',
    fontWeight: 'bold',
    fontSize: 13,
  }
});
