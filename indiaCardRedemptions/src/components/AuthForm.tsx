import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { Image } from 'expo-image';
import { AuthContext } from '../context/AuthContext';

interface AuthFormProps {
  onSuccess?: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const { login, register, authenticateBiometrics } = useContext(AuthContext);
  const [isLoginState, setIsLoginState] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState(false);

  const validateEmail = (inputEmail: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(inputEmail);
  };

  const handleSubmit = async () => {
    setError(null);
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (!isLoginState && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoadingState(true);
    try {
      let success = false;
      if (isLoginState) {
        success = await login(email, password);
      } else {
        success = await register(email, password);
      }

      if (success) {
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError('Authentication failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoadingState(false);
    }
  };

  const handleBiometrics = async () => {
    setError(null);
    setLoadingState(true);
    try {
      const success = await authenticateBiometrics();
      if (success && onSuccess) {
        onSuccess();
      } else if (!success) {
        setError('Biometric authentication failed or was cancelled.');
      }
    } catch (err) {
      setError('Biometrics error occurred.');
    } finally {
      setLoadingState(false);
    }
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.logoContainer} testID="login-logo-container">
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </View>
      <Text style={styles.headerTitle}>
        {isLoginState ? 'WELCOME BACK' : 'CREATE ACCOUNT'}
      </Text>
      <Text style={styles.subtitle}>
        {isLoginState ? 'Sign in to access your rewards' : 'Start optimization of your card values'}
      </Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter email"
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter password"
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />
      </View>

      {!isLoginState && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Confirm password"
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>
      )}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loadingState}>
        {loadingState ? (
          <ActivityIndicator color="#0f172a" />
        ) : (
          <Text style={styles.submitButtonText}>
            {isLoginState ? 'LOGIN' : 'REGISTER'}
          </Text>
        )}
      </TouchableOpacity>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR SECURE ACCESS</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity
        testID="biometric-auth-button"
        style={styles.biometricButton}
        onPress={handleBiometrics}
        disabled={loadingState}
      >
        {/* Draw fingerprint biometric icon */}
        <View style={styles.fingerprintIconContainer}>
          <View style={styles.fingerprintArcOuter} />
          <View style={styles.fingerprintArcInner} />
          <View style={styles.fingerprintDot} />
        </View>
        <Text style={styles.biometricText}>BIOMETRIC QUICK-LOGIN</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          setIsLoginState(!isLoginState);
          setError(null);
        }}
        style={styles.toggleContainer}
      >
        <Text style={styles.toggleText}>
          {isLoginState ? 'Need an account? Register' : 'Already have an account? Login'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 18,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#D4AF37',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#cbd5e1',
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  submitButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonText: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: 'bold',
    marginHorizontal: 12,
    letterSpacing: 1,
  },
  biometricButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  biometricText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 10,
    letterSpacing: 1,
  },
  fingerprintIconContainer: {
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fingerprintArcOuter: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    borderBottomColor: 'transparent',
  },
  fingerprintArcInner: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    borderTopColor: 'transparent',
  },
  fingerprintDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#D4AF37',
  },
  toggleContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  toggleText: {
    color: '#D4AF37',
    fontSize: 13,
    fontWeight: '500',
  },
});

export default AuthForm;
