import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { CareerGoal } from '@/types';
import { updateCareerGoal } from '@/utils/storage';

const careerGoals: CareerGoal[] = [
  'Switching to Tech',
  'Moving to Management',
  'Resume Refresh',
  'Career Pivot',
  'Skill Development',
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [selectedGoal, setSelectedGoal] = useState<CareerGoal | null>(null);
  const [scaleAnim] = useState(new Animated.Value(1));

  const handleGoalSelect = (goal: CareerGoal) => {
    setSelectedGoal(goal);

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
  };

  const handleContinue = async () => {
    if (selectedGoal) {
      await updateCareerGoal(selectedGoal);
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Welcome to Careerguide</Text>
          <Text style={styles.subtitle}>
            Your AI-powered career transition coach
          </Text>

          <View style={styles.questionContainer}>
            <Text style={styles.question}>What&apos;s your primary career goal?</Text>
            <Text style={styles.hint}>Select one to get started</Text>
          </View>

          <View style={styles.goalsContainer}>
            {careerGoals.map((goal) => (
              <TouchableOpacity
                key={goal}
                style={[
                  styles.goalCard,
                  selectedGoal === goal && styles.goalCardSelected,
                ]}
                onPress={() => handleGoalSelect(goal)}
                activeOpacity={0.7}
              >
                <View style={styles.goalCardContent}>
                  <View
                    style={[
                      styles.radioButton,
                      selectedGoal === goal && styles.radioButtonSelected,
                    ]}
                  >
                    {selectedGoal === goal && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.goalText,
                      selectedGoal === goal && styles.goalTextSelected,
                    ]}
                  >
                    {goal}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {selectedGoal && (
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity
                style={styles.continueButton}
                onPress={handleContinue}
                activeOpacity={0.8}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
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
    marginBottom: 48,
  },
  questionContainer: {
    marginBottom: 24,
  },
  question: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.navy,
    marginBottom: 8,
  },
  hint: {
    fontSize: 14,
    color: Colors.mediumGray,
  },
  goalsContainer: {
    gap: 12,
    marginBottom: 32,
  },
  goalCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.lightGray,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  goalCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F7FF',
  },
  goalCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.lightGray,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: Colors.primary,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  goalText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.navy,
    flex: 1,
  },
  goalTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  continueButton: {
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
  continueButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
});
