import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { BlurView } from 'expo-blur';
import { Spacing } from '@/constants/theme';
import { getNetworkState } from '@/utils/network';

/**
 * Animated/floating banner that informs users when they lose internet connection.
 * Uses local network helper to check active connection status.
 */
export function OfflineBanner() {
  const [isConnected, setIsConnected] = useState<boolean>(true);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    const checkConnection = async () => {
      const state = await getNetworkState();
      setIsConnected(state.isConnected);
      timer = setTimeout(checkConnection, 3000);
    };

    checkConnection();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (isConnected) {
    return null;
  }

  return (
    <View style={styles.container}>
      <BlurView intensity={30} tint="dark" style={styles.banner}>
        <ThemedText style={styles.bannerText} type="smallBold">
          ⚠️ YOU ARE OFFLINE - Using Local Rewards Cache
        </ThemedText>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: Spacing.four,
    right: Spacing.four,
    zIndex: 9999,
  },
  banner: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  bannerText: {
    color: '#FBBF24',
    fontSize: 12,
    letterSpacing: 1,
  },
});
