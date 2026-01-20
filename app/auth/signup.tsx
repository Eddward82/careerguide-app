import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/Colors';
import Toast from '@/components/Toast';

export default function SignupScreen() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('error');

  const shakeAnimation = useRef(new Animated.Value(0)).current;

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'error') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const handleSignup = async () => {
    // Validation
    if (!email || !password || !confirmPassword) {
      showToast('Please fill in all fields', 'error');
      triggerErrorShake('Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      showToast('Please enter a valid email address', 'error');
      triggerErrorShake('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      triggerErrorShake('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      triggerErrorShake('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    const { error: authError } = await signUp(email, password);

    if (authError) {
      setLoading(false);
      const errorMsg = authError.message.includes('already registered')
        ? 'This email is already registered'
        : authError.message;
      showToast(errorMsg, 'error');
      triggerErrorShake(errorMsg);
    } else {
      setLoading(false);
      setSuccess(true);
      showToast('Account created! Setting up your profile...', 'success');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Show success message for 2 seconds, then redirect to onboarding
      setTimeout(() => {
        router.replace('/onboarding');
      }, 2000);
    }
  };

  const triggerErrorShake = (errorMessage: string) => {
    setError(errorMessage);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  if (success) {
    return (
      <SafeAreaView style={styles.container}>
        <Toast
          message={toastMessage}
          type={toastType}
          visible={toastVisible}
          onHide={() => setToastVisible(false)}
        />
        <View style={styles.successContainer}>
          <LinearGradient
            colors={['#4A90E2', '#7ED8B4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.successIconGradient}
          >
            <Ionicons name="checkmark-circle" size={60} color={Colors.white} />
          </LinearGradient>
          <Text style={styles.successTitle}>Account Created!</Text>
          <Text style={styles.successMessage}>
            Welcome to PathForward. Let&apos;s set up your profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Toast
        message={toastMessage}
        type={toastType}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <LinearGradient
              colors={['#4A90E2', '#7ED8B4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.logoGradient}
            >
              <Ionicons name="rocket" size={32} color={Colors.white} />
            </LinearGradient>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Start your career transformation journey
            </Text>
          </View>

          {/* Error Message */}
          {error ? (
            <Animated.View
              style={[
                styles.errorContainer,
                { transform: [{ translateX: shakeAnimation }] },
              ]}
            >
              <Ionicons name="alert-circle" size={20} color="#E53935" />
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          ) : null}

          {/* Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={Colors.mediumGray}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={Colors.mediumGray}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={Colors.mediumGray}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="At least 6 characters"
                  placeholderTextColor={Colors.mediumGray}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setError('');
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => {
                    setShowPassword(!showPassword);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  disabled={loading}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={Colors.mediumGray}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={Colors.mediumGray}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Re-enter your password"
                  placeholderTextColor={Colors.mediumGray}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setError('');
                  }}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => {
                    setShowConfirmPassword(!showConfirmPassword);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  disabled={loading}
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? 'eye-off-outline' : 'eye-outline'
                    }
                    size={20}
                    color={Colors.mediumGray}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Password Requirements */}
            <View style={styles.requirementsContainer}>
              <Text style={styles.requirementsText}>
                Password must be at least 6 characters
              </Text>
            </View>

            {/* Signup Button */}
            <TouchableOpacity
              style={[
                styles.signupButton,
                loading && styles.signupButtonDisabled,
              ]}
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  loading ? ['#BDBDBD', '#9E9E9E'] : ['#4A90E2', '#357ABD']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.signupGradient}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.signupButtonText}>Create Account</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/auth/login');
              }}
              disabled={loading}
            >
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.navy,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.mediumGray,
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#E53935',
    fontWeight: '500',
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.navy,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginLeft: 16,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 16,
    color: Colors.navy,
    paddingHorizontal: 12,
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    padding: 8,
  },
  requirementsContainer: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  requirementsText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },
  signupButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  signupButtonDisabled: {
    opacity: 0.7,
  },
  signupGradient: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 15,
    color: Colors.mediumGray,
  },
  loginLink: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  successIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.navy,
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: Colors.mediumGray,
    textAlign: 'center',
    lineHeight: 24,
  },
});
