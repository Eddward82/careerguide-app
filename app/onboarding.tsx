import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
  TextInput,
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { CareerGoal, TransitionTimeline, TransitionDriver, CoachingSession } from '@/types';
import { completeOnboarding, clearAllData, addCoachingSession } from '@/utils/storage';
import { generateInitialPlan } from '@/utils/newellAi';

const { width } = Dimensions.get('window');

const careerGoals: CareerGoal[] = [
  'Switching to Tech',
  'Moving to Management',
  'Resume Refresh',
  'Career Pivot',
  'Skill Development',
];

const timelines: { value: TransitionTimeline; label: string }[] = [
  { value: '1-3m', label: '1-3 months' },
  { value: '3-6m', label: '3-6 months' },
  { value: '6-12m', label: '6-12 months' },
  { value: '12m+', label: '12+ months' },
];

const transitionDrivers: TransitionDriver[] = [
  'Escape',
  'Better Pay',
  'Career Growth',
  'Passion',
  'Work-Life Balance',
  'Personal Development',
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Form data
  const [name, setName] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<CareerGoal | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<TransitionDriver | null>(null);
  const [currentRole, setCurrentRole] = useState('');
  const [yearsExperience, setYearsExperience] = useState(2);
  const [selectedTimeline, setSelectedTimeline] = useState<TransitionTimeline>('3-6m');
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  const totalSteps = 5;

  // Ensure onboarding always starts at Step 1 (index 0)
  useEffect(() => {
    // Reset to first step on mount
    setCurrentStep(0);
    scrollX.setValue(0);
    console.log('Onboarding initialized at Step 1');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNext = () => {
    // Haptic feedback for button press
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Dismiss keyboard if open
    Keyboard.dismiss();

    if (currentStep < totalSteps - 1) {
      Animated.timing(scrollX, {
        toValue: -(currentStep + 1) * width,
        duration: 300,
        useNativeDriver: true,
      }).start();
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Keyboard.dismiss();

    if (currentStep > 0) {
      Animated.timing(scrollX, {
        toValue: -(currentStep - 1) * width,
        duration: 300,
        useNativeDriver: true,
      }).start();
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!name || !selectedGoal || !currentRole) return;

    setIsLoading(true);

    try {
      // Generate personalized initial plan using Newell AI
      const timelineLabel = timelines.find(t => t.value === selectedTimeline)?.label || '3-6 months';
      const actionPlan = await generateInitialPlan(
        name,
        currentRole,
        selectedGoal,
        yearsExperience,
        timelineLabel,
        selectedDriver || undefined
      );

      // Complete onboarding first
      await completeOnboarding(
        name,
        selectedGoal,
        currentRole,
        yearsExperience,
        selectedTimeline,
        selectedDriver || undefined
      );

      // Create and save the initial coaching session
      const initialSession: CoachingSession = {
        id: `initial-${Date.now()}`,
        date: new Date().toISOString(),
        challenge: `Starting your journey from ${currentRole} to ${selectedGoal}`,
        actionPlan: actionPlan,
        createdAt: Date.now(),
      };

      await addCoachingSession(initialSession);

      setIsLoading(false);
      setShowWelcome(true);

      // Navigate to main app after showing welcome
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 3000);
    } catch (error) {
      console.error('Error during onboarding completion:', error);
      // Even if AI generation fails, complete onboarding
      await completeOnboarding(
        name,
        selectedGoal,
        currentRole,
        yearsExperience,
        selectedTimeline
      );
      setIsLoading(false);
      router.replace('/(tabs)');
    }
  };

  const handleEmergencyReset = async () => {
    try {
      console.log('🔄 Emergency reset triggered');
      await clearAllData();
      console.log('✅ Data cleared, resetting to step 1');

      // Reset all state
      setCurrentStep(0);
      setName('');
      setSelectedGoal(null);
      setSelectedDriver(null);
      setCurrentRole('');
      setYearsExperience(2);
      setSelectedTimeline('3-6m');
      setIsLoading(false);
      setShowWelcome(false);

      // Reset animation
      Animated.timing(scrollX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      console.error('❌ Emergency reset failed:', err);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return selectedGoal !== null;
      case 1:
        return selectedDriver !== null;
      case 2:
        return name.trim().length > 0;
      case 3:
        return currentRole.trim().length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Emergency Reset Button */}
        <TouchableOpacity
          style={styles.emergencyResetButton}
          onPress={handleEmergencyReset}
        >
          <Ionicons name="refresh" size={20} color={Colors.mediumGray} />
        </TouchableOpacity>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingTitle}>Preparing Your Plan...</Text>
          <Text style={styles.loadingSubtitle}>
            Creating your personalized 30-day career transition roadmap
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (showWelcome) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Emergency Reset Button */}
        <TouchableOpacity
          style={styles.emergencyResetButton}
          onPress={handleEmergencyReset}
        >
          <Ionicons name="refresh" size={20} color={Colors.mediumGray} />
        </TouchableOpacity>

        <View style={styles.welcomeContainer}>
          <View style={styles.welcomeIconContainer}>
            <Ionicons name="checkmark-circle" size={80} color={Colors.success} />
          </View>
          <Text style={styles.welcomeTitle}>Welcome, {name}! 🎉</Text>
          <Text style={styles.welcomeSubtitle}>
            Your 30-day career transition plan from{' '}
            <Text style={styles.welcomeHighlight}>{currentRole}</Text> to{' '}
            <Text style={styles.welcomeHighlight}>{selectedGoal}</Text> is ready!
          </Text>
          <Text style={styles.welcomeNote}>Let&apos;s begin your journey...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Bar - Fixed at top */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentStep + 1) / totalSteps) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          Step {currentStep + 1} of {totalSteps}
        </Text>
      </View>

      {/* Content with KeyboardAvoiding */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <Animated.View
          style={[
            styles.contentContainer,
            { transform: [{ translateX: scrollX }] },
          ]}
        >
        {/* Step 1: Career Goal */}
        <View style={[styles.step, { width }]}>
          <ScrollView contentContainerStyle={styles.stepScroll}>
            <Text style={styles.title}>What&apos;s your primary career goal?</Text>
            <Text style={styles.subtitle}>Select one to get started</Text>

            <View style={styles.optionsContainer}>
              {careerGoals.map((goal) => (
                <TouchableOpacity
                  key={goal}
                  style={[
                    styles.optionCard,
                    selectedGoal === goal && styles.optionCardSelected,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedGoal(goal);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionContent}>
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
                        styles.optionText,
                        selectedGoal === goal && styles.optionTextSelected,
                      ]}
                    >
                      {goal}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Step 2: Transition Driver */}
        <View style={[styles.step, { width }]}>
          <ScrollView contentContainerStyle={styles.stepScroll}>
            <Text style={styles.title}>What&apos;s driving this transition?</Text>
            <Text style={styles.subtitle}>Understanding your motivation helps us guide you better</Text>

            <View style={styles.optionsContainer}>
              {transitionDrivers.map((driver) => (
                <TouchableOpacity
                  key={driver}
                  style={[
                    styles.optionCard,
                    selectedDriver === driver && styles.optionCardSelected,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedDriver(driver);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionContent}>
                    <View
                      style={[
                        styles.radioButton,
                        selectedDriver === driver && styles.radioButtonSelected,
                      ]}
                    >
                      {selectedDriver === driver && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.optionText,
                        selectedDriver === driver && styles.optionTextSelected,
                      ]}
                    >
                      {driver}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Step 3: Name */}
        <View style={[styles.step, { width }]}>
          <ScrollView
            contentContainerStyle={styles.stepScrollInline}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>What&apos;s your name?</Text>
            <Text style={styles.subtitle}>
              Let&apos;s personalize your experience
            </Text>

            <View style={styles.inputCard}>
              <TextInput
                style={styles.input}
                placeholder="Enter your first name"
                placeholderTextColor={Colors.mediumGray}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoFocus={currentStep === 2}
                returnKeyType="done"
                onSubmitEditing={() => {
                  if (name.trim().length > 0) {
                    handleNext();
                  }
                }}
                blurOnSubmit={false}
              />
            </View>

            {/* Visual hint when input is empty */}
            {name.trim().length === 0 && (
              <Text style={styles.hint}>
                👆 Enter your name to continue
              </Text>
            )}

            {/* INLINE NAVIGATION BUTTONS - ALWAYS VISIBLE */}
            <View style={styles.inlineButtonContainer}>
              {currentStep > 0 && (
                <TouchableOpacity
                  style={styles.inlineBackButton}
                  onPress={handleBack}
                >
                  <Ionicons name="arrow-back" size={24} color={Colors.navy} />
                </TouchableOpacity>
              )}

              <Animated.View
                style={[
                  styles.inlineNextButtonContainer,
                  currentStep === 0 && styles.nextButtonFull,
                  { transform: [{ scale: buttonScale }] },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.inlineNextButton,
                    name.trim().length === 0 && styles.inlineNextButtonDisabled,
                  ]}
                  onPress={handleNext}
                  disabled={name.trim().length === 0}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.nextButtonText,
                      name.trim().length === 0 && styles.nextButtonTextDisabled,
                    ]}
                  >
                    Continue
                  </Text>
                  {name.trim().length > 0 && (
                    <Ionicons
                      name="arrow-forward"
                      size={20}
                      color={Colors.white}
                      style={styles.buttonIcon}
                    />
                  )}
                </TouchableOpacity>
              </Animated.View>
            </View>
          </ScrollView>
        </View>

        {/* Step 3: Current Role & Experience */}
        <View style={[styles.step, { width }]}>
          <ScrollView
            contentContainerStyle={styles.stepScrollInline}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>Tell us about your background</Text>
            <Text style={styles.subtitle}>This helps us personalize your advice</Text>

            <View style={styles.inputCard}>
              <Text style={styles.label}>What&apos;s your current role?</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Marketing Manager"
                placeholderTextColor={Colors.mediumGray}
                value={currentRole}
                onChangeText={setCurrentRole}
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
              />
            </View>

            <View style={styles.sliderCard}>
              <Text style={styles.label}>Years of experience?</Text>
              <View style={styles.sliderValueContainer}>
                <Text style={styles.sliderValue}>{yearsExperience} years</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={20}
                step={1}
                value={yearsExperience}
                onValueChange={(value) => {
                  setYearsExperience(Math.round(value));
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                onSlidingComplete={(value) => {
                  setYearsExperience(Math.round(value));
                }}
                minimumTrackTintColor={Colors.primary}
                maximumTrackTintColor={Colors.lightGray}
                thumbTintColor={Colors.primary}
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabelText}>0</Text>
                <Text style={styles.sliderLabelText}>20+</Text>
              </View>
            </View>

            {/* INLINE NAVIGATION BUTTONS */}
            <View style={styles.inlineButtonContainer}>
              <TouchableOpacity
                style={styles.inlineBackButton}
                onPress={handleBack}
              >
                <Ionicons name="arrow-back" size={24} color={Colors.navy} />
              </TouchableOpacity>

              <Animated.View
                style={[
                  styles.inlineNextButtonContainer,
                  { transform: [{ scale: buttonScale }] },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.inlineNextButton,
                    currentRole.trim().length === 0 && styles.inlineNextButtonDisabled,
                  ]}
                  onPress={handleNext}
                  disabled={currentRole.trim().length === 0}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.nextButtonText,
                      currentRole.trim().length === 0 && styles.nextButtonTextDisabled,
                    ]}
                  >
                    Continue
                  </Text>
                  {currentRole.trim().length > 0 && (
                    <Ionicons
                      name="arrow-forward"
                      size={20}
                      color={Colors.white}
                      style={styles.buttonIcon}
                    />
                  )}
                </TouchableOpacity>
              </Animated.View>
            </View>
          </ScrollView>
        </View>

        {/* Step 4: Timeline */}
        <View style={[styles.step, { width }]}>
          <ScrollView
            contentContainerStyle={styles.stepScrollInline}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>What&apos;s your transition timeline?</Text>
            <Text style={styles.subtitle}>
              How soon are you looking to make this change?
            </Text>

            <View style={styles.optionsContainer}>
              {timelines.map((timeline) => (
                <TouchableOpacity
                  key={timeline.value}
                  style={[
                    styles.optionCard,
                    selectedTimeline === timeline.value && styles.optionCardSelected,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedTimeline(timeline.value);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionContent}>
                    <View
                      style={[
                        styles.radioButton,
                        selectedTimeline === timeline.value &&
                          styles.radioButtonSelected,
                      ]}
                    >
                      {selectedTimeline === timeline.value && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.optionText,
                        selectedTimeline === timeline.value &&
                          styles.optionTextSelected,
                      ]}
                    >
                      {timeline.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Visual confirmation of selection */}
            {selectedTimeline && (
              <Text style={styles.selectionConfirm}>
                ✓ {timelines.find(t => t.value === selectedTimeline)?.label} selected
              </Text>
            )}

            {/* INLINE NAVIGATION BUTTONS - ALWAYS VISIBLE */}
            <View style={styles.inlineButtonContainer}>
              <TouchableOpacity
                style={styles.inlineBackButton}
                onPress={handleBack}
              >
                <Ionicons name="arrow-back" size={24} color={Colors.navy} />
              </TouchableOpacity>

              <Animated.View
                style={[
                  styles.inlineNextButtonContainer,
                  { transform: [{ scale: buttonScale }] },
                ]}
              >
                <TouchableOpacity
                  style={styles.inlineNextButton}
                  onPress={handleNext}
                  activeOpacity={0.8}
                >
                  <Text style={styles.nextButtonText}>
                    Create My Plan
                  </Text>
                  <Ionicons
                    name="rocket"
                    size={20}
                    color={Colors.white}
                    style={styles.buttonIcon}
                  />
                </TouchableOpacity>
              </Animated.View>
            </View>
          </ScrollView>
        </View>
        </Animated.View>

        {/* Navigation Buttons - Only show for steps 0 and 1 (Career Goal and Transition Driver - steps without inline buttons) */}
        {(currentStep === 0 || currentStep === 1) && (
          <View
            style={[
              styles.navigationContainer,
              { paddingBottom: Math.max(insets.bottom, 20) + 24 },
            ]}
          >
            {currentStep > 0 && (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Ionicons name="arrow-back" size={24} color={Colors.navy} />
              </TouchableOpacity>
            )}

            <Animated.View
              style={[
                styles.nextButtonContainer,
                currentStep === 0 && styles.nextButtonFull,
                { transform: [{ scale: buttonScale }] },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.nextButton,
                  !canProceed() && styles.nextButtonDisabled,
                ]}
                onPress={handleNext}
                disabled={!canProceed()}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.nextButtonText,
                    !canProceed() && styles.nextButtonTextDisabled,
                  ]}
                >
                  {currentStep === totalSteps - 1 ? 'Get Started' : 'Continue'}
                </Text>
                {canProceed() && (
                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color={Colors.white}
                    style={styles.buttonIcon}
                  />
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  progressBarContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.lightGray,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: Colors.mediumGray,
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  step: {
    paddingHorizontal: 24,
  },
  stepScroll: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  stepScrollWithButton: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  stepScrollInline: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  stepContent: {
    flex: 1,
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
    marginBottom: 32,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
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
  optionCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F7FF',
  },
  optionContent: {
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
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.navy,
    flex: 1,
  },
  optionTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  inputCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.navy,
    marginBottom: 12,
  },
  input: {
    fontSize: 16,
    color: Colors.navy,
    minHeight: 40,
  },
  hint: {
    fontSize: 14,
    color: Colors.mediumGray,
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
  selectionConfirm: {
    fontSize: 14,
    color: Colors.success,
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '600',
  },
  sliderCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sliderValueContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  sliderValue: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.primary,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sliderLabelText: {
    fontSize: 12,
    color: Colors.mediumGray,
  },
  navigationContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 24,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  backButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  nextButtonContainer: {
    flex: 1,
  },
  nextButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 28,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  nextButtonFull: {
    flex: 1,
    marginLeft: 0,
  },
  nextButtonDisabled: {
    backgroundColor: Colors.lightGray,
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  nextButtonTextDisabled: {
    color: Colors.mediumGray,
  },
  buttonIcon: {
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.navy,
    marginTop: 24,
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 14,
    color: Colors.mediumGray,
    textAlign: 'center',
    lineHeight: 20,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  welcomeIconContainer: {
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.navy,
    marginBottom: 16,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: Colors.navy,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  welcomeHighlight: {
    fontWeight: '700',
    color: Colors.primary,
  },
  welcomeNote: {
    fontSize: 14,
    color: Colors.mediumGray,
    fontStyle: 'italic',
  },
  // Inline button styles for steps with keyboard input
  inlineButtonContainer: {
    flexDirection: 'row',
    marginTop: 32,
    gap: 12,
  },
  inlineBackButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inlineNextButtonContainer: {
    flex: 1,
  },
  inlineNextButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 28,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  inlineNextButtonDisabled: {
    backgroundColor: Colors.lightGray,
    shadowOpacity: 0,
    elevation: 0,
  },
  emergencyResetButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1000,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
