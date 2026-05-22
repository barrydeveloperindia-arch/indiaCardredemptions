import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import React from 'react';
import { StatusBar } from 'expo-status-bar';

import { AnimatedSplashOverlay } from '@/components/AnimatedIcon';
import AppTabs from '@/components/AppTabs';
import { WalletProvider } from '@/context/WalletContext';

const CustomTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#090A0F',
    card: '#14161F',
    text: '#F3F4F6',
    border: 'rgba(255, 255, 255, 0.1)',
    primary: '#D4AF37', // Gold accent color
  },
};

export default function TabLayout() {
  return (
    <WalletProvider>
      <ThemeProvider value={CustomTheme}>
        <StatusBar style="light" />
        <AnimatedSplashOverlay />
        <AppTabs />
      </ThemeProvider>
    </WalletProvider>
  );
}
