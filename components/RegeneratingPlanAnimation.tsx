import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

interface RegeneratingPlanAnimationProps {
  visible: boolean;
}

export default function RegeneratingPlanAnimation({ visible }: RegeneratingPlanAnimationProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Scale animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();

      // Pulse animation
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );

      // Rotation animation
      const rotateAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      );

      pulseAnimation.start();
      rotateAnimation.start();

      return () => {
        pulseAnimation.stop();
        rotateAnimation.stop();
      };
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
    }
  }, [visible, pulseAnim, rotateAnim, fadeAnim, scaleAnim]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.content,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Pulsing Brain Icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="bulb" size={60} color="#4A90E2" />
            </View>
          </Animated.View>

          {/* Rotating Mapping Lines */}
          <Animated.View
            style={[
              styles.rotatingCircle,
              {
                transform: [{ rotate: rotation }],
              },
            ]}
          >
            <View style={styles.orbitDot1} />
            <View style={styles.orbitDot2} />
            <View style={styles.orbitDot3} />
          </Animated.View>

          {/* Text Content */}
          <View style={styles.textContainer}>
            <Text style={styles.mainText}>Regenerating your plan...</Text>
            <Text style={styles.subText}>
              Analyzing your responses and crafting a hyper-personalized roadmap
            </Text>
          </View>

          {/* Loading Steps */}
          <View style={styles.stepsContainer}>
            <LoadingStep icon="analytics" text="Analyzing your goals" />
            <LoadingStep icon="construct" text="Building custom phases" delay={500} />
            <LoadingStep icon="sparkles" text="Personalizing tasks" delay={1000} />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

interface LoadingStepProps {
  icon: string;
  text: string;
  delay?: number;
}

function LoadingStep({ icon, text, delay = 0 }: LoadingStepProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.6,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();

      // Loop fade in and out
      const loopAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0.6,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      loopAnimation.start();
    }, delay);
  }, [fadeAnim, delay]);

  return (
    <Animated.View style={[styles.stepRow, { opacity: fadeAnim }]}>
      <Ionicons name={icon as any} size={18} color="#7ED8B4" />
      <Text style={styles.stepText}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 40,
    position: 'relative',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(74, 144, 226, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(74, 144, 226, 0.3)',
  },
  rotatingCircle: {
    position: 'absolute',
    top: 20,
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orbitDot1: {
    position: 'absolute',
    top: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#7ED8B4',
  },
  orbitDot2: {
    position: 'absolute',
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4A90E2',
  },
  orbitDot3: {
    position: 'absolute',
    left: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFB020',
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  mainText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 12,
    textAlign: 'center',
  },
  subText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  stepsContainer: {
    gap: 16,
    alignItems: 'flex-start',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
  },
});
