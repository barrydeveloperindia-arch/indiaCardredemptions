import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

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
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
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

          {submitted ? (
            <View style={styles.successBox}>
              <ThemedText style={styles.successTitle} type="subtitle">Request Received!</ThemedText>
              <ThemedText style={styles.successText}>
                Our concierge team will reach out to {name} shortly to coordinate your strategy session for {destination}.
              </ThemedText>
            </View>
          ) : (
            <View style={styles.formCard}>
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
                  style={styles.input}
                  placeholder="Destination / Goal (e.g. Honeymoon to Maldives)"
                  placeholderTextColor="#6B7280"
                  value={destination}
                  onChangeText={setDestination}
                  multiline
                />
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <ThemedText style={styles.submitButtonText}>Submit Request</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
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
    color: '#D97706',
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '900',
    marginTop: Spacing.one,
  },
  pageDescription: {
    color: '#6B7280',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.five,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Spacing.three,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  inputGroup: {
    marginBottom: Spacing.four,
  },
  label: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: Spacing.two,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: Spacing.two,
    padding: Spacing.three,
    color: '#111827',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#D97706',
    padding: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  submitButtonText: {
    color: '#111827',
    fontWeight: 'bold',
    fontSize: 14,
  },
  successBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: Spacing.three,
    padding: Spacing.four,
  },
  successTitle: {
    color: '#10B981',
    fontWeight: 'bold',
    marginBottom: Spacing.two,
  },
  successText: {
    color: '#374151',
    fontSize: 14,
    lineHeight: 20,
  }
});
