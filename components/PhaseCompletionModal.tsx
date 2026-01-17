import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { RoadmapPhase } from '@/utils/roadmap';

interface PhaseCompletionModalProps {
  visible: boolean;
  onClose: () => void;
  completedPhase: RoadmapPhase;
  nextPhase?: RoadmapPhase;
  totalPhases: number;
  completedPhasesCount: number;
}

const { width, height } = Dimensions.get('window');

export default function PhaseCompletionModal({
  visible,
  onClose,
  completedPhase,
  nextPhase,
  totalPhases,
  completedPhasesCount,
}: PhaseCompletionModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const confettiAnims = useRef(
    Array.from({ length: 20 }, () => ({
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(1),
    }))
  ).current;

  useEffect(() => {
    if (visible) {
      // Haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Main content animation
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

      // Confetti animation
      confettiAnims.forEach((anim, index) => {
        const delay = index * 50;
        const endY = height * 0.8 + Math.random() * 200;
        const endX = (Math.random() - 0.5) * width * 0.8;

        Animated.parallel([
          Animated.timing(anim.translateY, {
            toValue: endY,
            duration: 2000,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateX, {
            toValue: endX,
            duration: 2000,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(anim.rotate, {
            toValue: Math.random() * 720,
            duration: 2000,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(anim.opacity, {
            toValue: 0,
            duration: 2000,
            delay,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      // Reset animations
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      confettiAnims.forEach((anim) => {
        anim.translateY.setValue(0);
        anim.translateX.setValue(0);
        anim.rotate.setValue(0);
        anim.opacity.setValue(1);
      });
    }
  }, [visible]);

  const progressPercentage = Math.round((completedPhasesCount / totalPhases) * 100);

  const confettiColors = ['#7ED8B4', '#4A90E2', '#FFD54F', '#FF9800', '#E91E63'];

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Confetti */}
        {confettiAnims.map((anim, index) => {
          const color = confettiColors[index % confettiColors.length];
          return (
            <Animated.View
              key={index}
              style={[
                styles.confetti,
                {
                  backgroundColor: color,
                  transform: [
                    { translateY: anim.translateY },
                    { translateX: anim.translateX },
                    {
                      rotate: anim.rotate.interpolate({
                        inputRange: [0, 360],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                  ],
                  opacity: anim.opacity,
                  left: width / 2 + (Math.random() - 0.5) * 100,
                  top: -20,
                },
              ]}
            />
          );
        })}

        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          <LinearGradient
            colors={['#4A90E2', '#7ED8B4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            {/* Success Icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="trophy" size={64} color="#FFD700" />
            </View>

            {/* Title */}
            <Text style={styles.title}>Phase Completed! 🎉</Text>
            <Text style={styles.subtitle}>
              You crushed Phase {completedPhase.number}: {completedPhase.title}
            </Text>

            {/* Progress Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{completedPhasesCount}</Text>
                <Text style={styles.statLabel}>of {totalPhases}</Text>
                <Text style={styles.statLabelSmall}>Phases Complete</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.statCard}>
                <Text style={styles.statValue}>{progressPercentage}%</Text>
                <Text style={styles.statLabel}>Complete</Text>
                <Text style={styles.statLabelSmall}>Overall Progress</Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    { width: `${progressPercentage}%` },
                  ]}
                />
              </View>
            </View>

            {/* Next Phase Preview */}
            {nextPhase && (
              <View style={styles.nextPhaseContainer}>
                <Text style={styles.nextPhaseLabel}>Up Next:</Text>
                <Text style={styles.nextPhaseTitle}>
                  Phase {nextPhase.number}: {nextPhase.title}
                </Text>
                <Text style={styles.nextPhaseDescription}>{nextPhase.description}</Text>
              </View>
            )}

            {/* Motivational Message */}
            <View style={styles.motivationalContainer}>
              <Text style={styles.motivationalText}>
                {completedPhase.motivationalMessage}
              </Text>
            </View>

            {/* Continue Button */}
            <TouchableOpacity
              style={styles.continueButton}
              onPress={onClose}
              activeOpacity={0.9}
            >
              <Text style={styles.continueButtonText}>Continue Journey</Text>
              <Ionicons name="arrow-forward" size={24} color="#4A90E2" />
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  modalContainer: {
    width: width * 0.9,
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  gradient: {
    padding: 32,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    width: '100%',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  statLabelSmall: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 20,
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: 24,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.white,
    borderRadius: 6,
  },
  nextPhaseContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    width: '100%',
  },
  nextPhaseLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  nextPhaseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 8,
  },
  nextPhaseDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  motivationalContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: Colors.white,
  },
  motivationalText: {
    fontSize: 14,
    color: Colors.white,
    lineHeight: 20,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A90E2',
    marginRight: 8,
  },
});
