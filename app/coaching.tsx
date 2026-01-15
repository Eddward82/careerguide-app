import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useTextGeneration } from '@fastshot/ai';
import { addCoachingSession, getUserProfile } from '@/utils/storage';
import { CoachingSession } from '@/types';

export default function CoachingScreen() {
  const router = useRouter();
  const [challenge, setChallenge] = useState('');
  const { generateText, isLoading } = useTextGeneration();
  const [pulseAnim] = useState(new Animated.Value(1));

  React.useEffect(() => {
    if (isLoading) {
      // Pulse animation while loading
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isLoading]);

  const handleAskCoach = async () => {
    if (!challenge.trim()) return;

    try {
      const profile = await getUserProfile();

      // Build hyper-personalized prompt
      const experienceContext = profile.yearsExperience > 0
        ? `with ${profile.yearsExperience} years of experience`
        : 'starting their career';

      const roleContext = profile.currentRole
        ? `currently working as a ${profile.currentRole}`
        : 'a professional';

      const prompt = `You are an expert career coach. Help ${roleContext} ${experienceContext} who wants to ${profile.careerGoal}.

They are facing this challenge: "${challenge}"

Based on their background as a ${profile.currentRole || 'professional'}, provide 3-5 specific, actionable steps they can take this week. Focus on:
- Leveraging their existing skills and experience
- Concrete actions they can start immediately
- Time-bound activities (specify when to do it)
- Clear outcomes they'll achieve

Format your response as a numbered list with clear, concise bullet points. Each step should be one sentence. Do not include any introductory text, just the numbered action steps.`;

      const response = await generateText(prompt);

      if (response) {
        // Parse the response into action steps
        const steps = response
          .split('\n')
          .filter((line) => line.trim().match(/^\d+\./))
          .map((line) => line.replace(/^\d+\.\s*/, '').trim());

        // Create new coaching session
        const session: CoachingSession = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          challenge: challenge,
          actionPlan: steps.length > 0 ? steps : [response],
          createdAt: Date.now(),
        };

        await addCoachingSession(session);

        // Navigate to action plan screen
        router.push({
          pathname: '/action-plan',
          params: { sessionId: session.id },
        });
      }
    } catch (error) {
      console.error('Error generating coaching:', error);
      alert('Failed to generate coaching. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.navy} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Careerguide</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          {!isLoading ? (
            <>
              <Text style={styles.title}>Current Challenge</Text>
              <Text style={styles.subtitle}>
                What&apos;s blocking your progress right now?
              </Text>

              <View style={styles.inputCard}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., I'm overwhelmed by technical interview prep..."
                  placeholderTextColor={Colors.mediumGray}
                  multiline
                  numberOfLines={6}
                  value={challenge}
                  onChangeText={setChallenge}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  !challenge.trim() && styles.submitButtonDisabled,
                ]}
                onPress={handleAskCoach}
                disabled={!challenge.trim()}
                activeOpacity={0.8}
              >
                <Text style={styles.submitButtonText}>Ask Newell Coach</Text>
              </TouchableOpacity>

              <Text style={styles.footer}>Powered by built-in Newell AI.</Text>
            </>
          ) : (
            <View style={styles.loadingContainer}>
              <Animated.View
                style={[
                  styles.loadingIconContainer,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <Ionicons name="bulb" size={48} color={Colors.primary} />
              </Animated.View>
              <ActivityIndicator
                size="large"
                color={Colors.primary}
                style={styles.spinner}
              />
              <Text style={styles.loadingTitle}>Generating Your Action Plan</Text>
              <Text style={styles.loadingSubtitle}>
                Our AI coach is analyzing your challenge and creating personalized
                steps...
              </Text>
            </View>
          )}
        </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.navy,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.navy,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.mediumGray,
    marginBottom: 24,
  },
  inputCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    minHeight: 160,
  },
  input: {
    fontSize: 16,
    color: Colors.navy,
    lineHeight: 24,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.lightGray,
    shadowOpacity: 0,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
    color: Colors.mediumGray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  spinner: {
    marginBottom: 24,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.navy,
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 14,
    color: Colors.mediumGray,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
});
