import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Share,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';

interface ShareJourneyCardProps {
  name: string;
  streak: number;
  targetGoal: string;
  sessionsCount: number;
}

export default function ShareJourneyCard({
  name,
  streak,
  targetGoal,
  sessionsCount,
}: ShareJourneyCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsSharing(true);

      // Animate button press
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      const message = `🚀 I'm ${name}, and I'm on a ${streak}-day career transition streak!

I'm actively working toward ${targetGoal} with PathForward - an AI-powered career coach that's helping me take actionable steps every day.

📊 Progress so far:
• ${streak} days of consistent action
• ${sessionsCount} personalized coaching sessions
• Clear roadmap to my dream career

Ready to level up your career too? Join me on this journey! 💪

#CareerTransition #CareerGrowth #PathForward`;

      const result = await Share.share(
        {
          message: message,
          ...(Platform.OS === 'ios' && {
            url: 'https://pathforward.app', // Placeholder URL
          }),
        },
        {
          dialogTitle: 'Share Your Career Journey',
          ...(Platform.OS === 'android' && {
            subject: `${name}'s Career Transition Journey`,
          }),
        }
      );

      setIsSharing(false);

      if (result.action === Share.sharedAction) {
        // Successfully shared
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          '🎉 Shared Successfully!',
          'Your journey has been shared! Keep inspiring others.',
          [{ text: 'Awesome!', style: 'default' }]
        );
      }
    } catch (error) {
      setIsSharing(false);
      console.error('Error sharing:', error);
      Alert.alert(
        'Sharing Failed',
        'Unable to share at this time. Please try again.',
        [{ text: 'OK', style: 'cancel' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Progress Card - What they'll share */}
      <LinearGradient
        colors={['#4A90E2', '#7ED8B4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.progressCard}
      >
        {/* Decorative elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />

        <View style={styles.cardContent}>
          {/* Main message */}
          <View style={styles.messageContainer}>
            <Ionicons name="rocket" size={32} color={Colors.white} />
            <Text style={styles.mainMessage}>
              I&apos;m <Text style={styles.nameBold}>{name}</Text>, and I&apos;m on a{' '}
              <Text style={styles.streakBold}>{streak}-day</Text> streak!
            </Text>
          </View>

          {/* Career mission */}
          <View style={styles.missionContainer}>
            <View style={styles.missionDivider} />
            <Text style={styles.missionText}>
              Transitioning to{'\n'}
              <Text style={styles.goalHighlight}>{targetGoal}</Text>
            </Text>
            <View style={styles.missionDivider} />
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{sessionsCount}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
          </View>

          {/* Branding */}
          <View style={styles.brandingContainer}>
            <Text style={styles.brandingText}>Powered by</Text>
            <Text style={styles.brandingName}>Careerguide 🚀</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Share Button */}
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShare}
          disabled={isSharing}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#4A90E2', '#5BA3EF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shareButtonGradient}
          >
            <Ionicons
              name={isSharing ? 'hourglass' : 'share-social'}
              size={24}
              color={Colors.white}
            />
            <Text style={styles.shareButtonText}>
              {isSharing ? 'Sharing...' : 'Share My Journey'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Inspire others by sharing your progress on LinkedIn, Instagram, or with friends!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  progressCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -40,
    right: -40,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    bottom: -20,
    left: -20,
  },
  cardContent: {
    position: 'relative',
    zIndex: 1,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  mainMessage: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: Colors.white,
    lineHeight: 28,
  },
  nameBold: {
    fontWeight: '800',
    fontSize: 22,
  },
  streakBold: {
    fontWeight: '800',
    fontSize: 22,
    textDecorationLine: 'underline',
  },
  missionContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  missionDivider: {
    width: 60,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginVertical: 12,
  },
  missionText: {
    fontSize: 16,
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 24,
  },
  goalHighlight: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.white,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    marginVertical: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  brandingContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  brandingText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  brandingName: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 1,
  },
  shareButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  shareButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 12,
  },
  shareButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.mediumGray,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});
