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
    <View style={styles.container} pointerEvents="none">
      <BlurView intensity={40} tint="dark" style={styles.banner}>
        <ThemedText style={styles.bannerText} type="code">
          [OFFLINE] YOU ARE OFFLINE - Using Local Rewards Cache
        </ThemedText>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 70, // position it just below the static header
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  banner: {
    paddingVertical: 8,
    paddingHorizontal: Spacing.four,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(9, 10, 15, 0.9)',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  bannerText: {
    color: '#D4AF37',
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: 'bold',
  },
});
