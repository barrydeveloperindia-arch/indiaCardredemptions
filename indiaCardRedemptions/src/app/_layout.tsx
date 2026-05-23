import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import React, { useContext } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/AnimatedIcon';
import AppTabs from '@/components/AppTabs';
import { WalletProvider } from '@/context/WalletContext';
import { AuthProvider, AuthContext } from '../context/AuthContext';
import AuthForm from '../components/AuthForm';
import { OfflineBanner } from '@/components/OfflineBanner';

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

function AppContent() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <View style={styles.authContainer} />;
  }

  if (!user) {
    return (
      <View style={styles.authContainer}>
        <View style={styles.formWrapper}>
          <AuthForm />
        </View>
      </View>
    );
  }

  return <AppTabs />;
}

export default function TabLayout() {
  return (
    <AuthProvider>
      <WalletProvider>
        <ThemeProvider value={CustomTheme}>
          <StatusBar style="light" />
          <OfflineBanner />
          <AnimatedSplashOverlay />
          <AppContent />
        </ThemeProvider>
      </WalletProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  authContainer: {
    flex: 1,
    backgroundColor: '#090A0F',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  formWrapper: {
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
});
