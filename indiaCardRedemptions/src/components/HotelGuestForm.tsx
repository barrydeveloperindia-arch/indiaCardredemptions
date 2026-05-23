import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

interface HotelGuestFormProps {
  onSubmit: (data: {
    firstName: string;
    lastName: string;
    email: string;
    checkInDate: string;
    checkOutDate: string;
  }) => void;
}

export const HotelGuestForm: React.FC<HotelGuestFormProps> = ({ onSubmit }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [checkInDate, setCheckInDate] = useState('2026-12-01');
  const [checkOutDate, setCheckOutDate] = useState('2026-12-05');
  const [error, setError] = useState('');

  const handlePress = () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !checkInDate.trim() || !checkOutDate.trim()) {
      setError('All guest checkout fields are required.');
      return;
    }
    
    // Quick validation of YYYY-MM-DD format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(checkInDate) || !dateRegex.test(checkOutDate)) {
      setError('Dates must be in YYYY-MM-DD format.');
      return;
    }

    setError('');
    onSubmit({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      checkInDate: checkInDate.trim(),
      checkOutDate: checkOutDate.trim(),
    });
  };

  return (
    <View style={styles.card}>
      <Text style={styles.header}>Hotel Guest Checkout Details</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>First Name</Text>
        <TextInput
          style={styles.input}
          placeholder="First Name (e.g. John)"
          placeholderTextColor="#A0A0A0"
          value={firstName}
          onChangeText={setFirstName}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Last Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Last Name (e.g. Doe)"
          placeholderTextColor="#A0A0A0"
          value={lastName}
          onChangeText={setLastName}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor="#A0A0A0"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Check-in Date (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#A0A0A0"
          value={checkInDate}
          onChangeText={setCheckInDate}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Check-out Date (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#A0A0A0"
          value={checkOutDate}
          onChangeText={setCheckOutDate}
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity style={styles.submitBtn} onPress={handlePress}>
        <Text style={styles.btnText}>Confirm Hotel Reservation</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#1A2E40',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E6EAEF',
    marginVertical: 12,
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0A1C2A',
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B6B88',
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D2D9E1',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#0A1C2A',
    backgroundColor: '#F8FAFC',
  },
  submitBtn: {
    backgroundColor: '#D4AF37', // Gold metallic primary
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
});
