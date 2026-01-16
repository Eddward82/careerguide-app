import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';

interface SmartMatchWelcomeProps {
  currentRole: string;
  targetGoal: string;
  onDismiss: () => void;
}

export default function SmartMatchWelcome({
  currentRole,
  targetGoal,
  onDismiss,
}: SmartMatchWelcomeProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, fadeAnim]);

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      <LinearGradient
        colors={['#F0F7FF', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* AI Sparkle Icon */}
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={['#4A90E2', '#7ED8B4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.iconGradient}
          >
            <Ionicons name="sparkles" size={28} color={Colors.white} />
          </LinearGradient>
        </View>

        {/* Message */}
        <View style={styles.content}>
          <Text style={styles.title}>AI-Powered Smart Match</Text>
          <Text style={styles.message}>
            Based on your profile as a <Text style={styles.highlight}>{currentRole}</Text>{' '}
            moving to <Text style={styles.highlight}>{targetGoal}</Text>, Newell AI has
            curated these top picks for you.
          </Text>
          <Text style={styles.subtext}>
            Look for the{' '}
            <Ionicons name="sparkles" size={12} color={Colors.primary} /> badge on
            resources that best match your journey!
          </Text>
        </View>

        {/* Dismiss Button */}
        <TouchableOpacity style={styles.dismissButton} onPress={handleDismiss}>
          <Text style={styles.dismissButtonText}>Got it!</Text>
          <Ionicons name="checkmark" size={18} color={Colors.primary} />
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 24,
    marginVertical: 16,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#E3F2FD',
  },
  iconContainer: {
    alignSelf: 'flex-start',
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  iconGradient: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.navy,
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    color: Colors.navy,
    lineHeight: 22,
    marginBottom: 12,
  },
  highlight: {
    fontWeight: '700',
    color: Colors.primary,
  },
  subtext: {
    fontSize: 13,
    color: Colors.mediumGray,
    lineHeight: 19,
  },
  dismissButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  dismissButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
});
