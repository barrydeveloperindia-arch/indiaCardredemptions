import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, TextInput, TouchableOpacity, Alert, Platform, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';

/**
 * @feature FT-108_ConciergeBooking
 */
export default function ConsultationScreen() {
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!name || !destination) {
      if (Platform.OS === 'web') {
        window.alert('Please fill out all fields.');
      } else {
        Alert.alert('Error', 'Please fill out all fields.');
      }
      return;
    }
    setSubmitted(true);
  };

  return (
    <ImageBackground 
      source={require('../../assets/images/dark_luxury_bg.png')} 
      style={styles.container}
      resizeMode="cover"
      imageStyle={{ width: '100%', height: '100%', opacity: 0.35 }}
    >
      <LinearGradient
        colors={['rgba(9, 10, 15, 0.75)', 'rgba(9, 10, 15, 0.95)']}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={styles.safeArea} edges={Platform.OS === 'web' ? ['left', 'right'] : ['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <ThemedText style={styles.subTitle} type="code">
                AWARD CONCIERGE
              </ThemedText>
              <ThemedText style={styles.mainTitle} type="title">
                Book a 1-on-1 Strategy Session
              </ThemedText>
            </View>
          </View>

          <ThemedText style={styles.pageDescription}>
            Stop guessing if you are getting the best value. Let our experts audit your credit card portfolio and find the optimal flight routings for your next vacation.
          </ThemedText>

          {/* Banner image */}
          <Image 
            source={require('../../assets/images/hacks_taj_banner.png')}
            style={styles.heroBanner}
            resizeMode="cover"
          />

          {submitted ? (
            <BlurView intensity={20} tint="dark" style={styles.successBox}>
              <ThemedText style={styles.successTitle} type="subtitle">Request Received!</ThemedText>
              <ThemedText style={styles.successText}>
                Our concierge team will reach out to {name} shortly to coordinate your strategy session for {destination}.
              </ThemedText>
            </BlurView>
          ) : (
            <BlurView intensity={20} tint="dark" style={styles.formCard}>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label} type="code">FULL NAME</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="Your Name"
                  placeholderTextColor="#6B7280"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.label} type="code">TRAVEL GOAL</ThemedText>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Destination / Goal (e.g. Honeymoon to Maldives)"
                  placeholderTextColor="#6B7280"
                  value={destination}
                  onChangeText={setDestination}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <ThemedText style={styles.submitButtonText}>Submit Request</ThemedText>
              </TouchableOpacity>
            </BlurView>
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
    marginBottom: Spacing.three,
  },
  subTitle: {
    fontSize: 10,
    letterSpacing: 3,
    color: '#D4AF37',
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '900',
    marginTop: Spacing.one,
    color: '#F3F4F6',
  },
  pageDescription: {
    color: '#9CA3AF',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.five,
  },
  formCard: {
    borderRadius: Spacing.three,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.12)',
    overflow: 'hidden',
  },
  inputGroup: {
    marginBottom: Spacing.four,
  },
  label: {
    fontSize: 10,
    color: '#9CA3AF',
    marginBottom: Spacing.two,
  },
  input: {
    backgroundColor: 'rgba(20, 22, 31, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.15)',
    borderRadius: Spacing.two,
    padding: Spacing.three,
    color: '#F3F4F6',
    fontSize: 14,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#D4AF37',
    padding: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  submitButtonText: {
    color: '#090A0F',
    fontWeight: 'bold',
    fontSize: 14,
  },
  successBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: Spacing.three,
    padding: Spacing.four,
    overflow: 'hidden',
  },
  successTitle: {
    color: '#34D399',
    fontWeight: 'bold',
    marginBottom: Spacing.two,
  },
  successText: {
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 20,
  },
  heroBanner: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginBottom: Spacing.five,
  }
});
