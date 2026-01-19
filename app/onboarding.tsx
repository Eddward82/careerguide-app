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
import { CareerGoal, TransitionTimeline, TransitionDriver, CoachingSession, FocusArea } from '@/types';
import { completeOnboarding, clearAllData, addCoachingSession } from '@/utils/storage';
import { generateInitialPlan } from '@/utils/newellAi';
import { getRoadmapPlan } from '@/utils/roadmap';
import { getFocusAreasForGoal } from '@/utils/focusAreas';

const { width } = Dimensions.get('window');

const careerGoals: CareerGoal[] = [
  'Switching to Tech',
  'Moving to Management',
  'Resume Refresh',
  'Career Pivot',
  'Skill Development',
  'Freelance/Startup Path',
  'Salary Negotiation & Promotion',
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

// Dynamic target role options based on career goal
const getTargetRoleOptions = (goal: CareerGoal | null): string[] => {
  if (!goal) return [];

  switch (goal) {
    case 'Switching to Tech':
      return ['Frontend Developer', 'Backend Developer', 'Data Scientist', 'Product Manager', 'DevOps Engineer', 'QA Engineer', 'Other'];
    case 'Moving to Management':
      return ['Engineering Manager', 'Product Manager', 'Sales Manager', 'Marketing Manager', 'Operations Manager', 'Other'];
    case 'Freelance/Startup Path':
      return ['Web Design', 'Copywriting', 'Consulting', 'Marketing', 'Development', 'Design', 'Other'];
    case 'Salary Negotiation & Promotion':
      return ['Tech', 'Finance', 'Marketing', 'Sales', 'Operations', 'Healthcare', 'Other'];
    case 'Career Pivot':
    case 'Skill Development':
    case 'Resume Refresh':
      return []; // These will use text input
    default:
      return [];
  }
};

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Form data
  const [name, setName] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<CareerGoal | null>(null);
  const [targetRole, setTargetRole] = useState(''); // NEW: Target role/industry
  const [selectedDriver, setSelectedDriver] = useState<TransitionDriver | null>(null);
  const [currentRole, setCurrentRole] = useState('');
  const [yearsExperience, setYearsExperience] = useState(2);
  const [selectedTimeline, setSelectedTimeline] = useState<TransitionTimeline>('3-6m');
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<FocusArea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [planName, setPlanName] = useState('');

  const totalSteps = 7; // Updated from 6 to 7

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
      // Get the dynamic roadmap plan based on goal and timeline (WITH TARGET ROLE - HYPER-PRECISION)
      const roadmapPlan = getRoadmapPlan(selectedTimeline, selectedGoal, targetRole);
      const planStartDate = new Date().toISOString();

      // Generate personalized initial plan using Newell AI
      const timelineLabel = timelines.find(t => t.value === selectedTimeline)?.label || '3-6 months';
      const actionPlan = await generateInitialPlan(
        name,
        currentRole,
        selectedGoal,
        yearsExperience,
        timelineLabel,
        selectedDriver || undefined,
        roadmapPlan,
        selectedFocusAreas,
        targetRole
      );

      // Complete onboarding first
      await completeOnboarding(
        name,
        selectedGoal,
        currentRole,
        yearsExperience,
        selectedTimeline,
        selectedDriver || undefined,
        planStartDate,
        roadmapPlan.name,
        selectedFocusAreas,
        targetRole
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
      setPlanName(roadmapPlan.name);
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
        return targetRole.trim().length > 0; // NEW: Target role step
      case 2:
        return selectedDriver !== null;
      case 3:
        return name.trim().length > 0;
      case 4:
        return currentRole.trim().length > 0;
      case 5:
        return true;
      case 6:
        return selectedFocusAreas.length > 0;
      default:
        return false;
    }
  };

  const toggleFocusArea = (areaId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedFocusAreas(prev => {
      if (prev.includes(areaId)) {
        return prev.filter(id => id !== areaId);
      } else {
        return [...prev, areaId];
      }
    });
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
            Creating your personalized {getRoadmapPlan(selectedTimeline, selectedGoal || undefined, targetRole).name}
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
            Your <Text style={styles.welcomeHighlight}>{planName}</Text> is ready!
          </Text>
          <Text style={styles.welcomeNote}>
            Transitioning from {currentRole} to {selectedGoal}
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

        {/* Step 2: Target Role/Industry (NEW - HYPER-PRECISION) */}
        <View style={[styles.step, { width }]}>
          <ScrollView contentContainerStyle={styles.stepScroll}>
            <Text style={styles.title}>
              {selectedGoal === 'Switching to Tech' && "What's your target tech role?"}
              {selectedGoal === 'Moving to Management' && "Which management path interests you?"}
              {selectedGoal === 'Freelance/Startup Path' && "What's your freelance niche?"}
              {selectedGoal === 'Salary Negotiation & Promotion' && "What industry are you in?"}
              {(selectedGoal === 'Career Pivot' || selectedGoal === 'Skill Development' || selectedGoal === 'Resume Refresh') && "What's your target role or industry?"}
            </Text>
            <Text style={styles.subtitle}>
              This helps us give you industry-specific advice
            </Text>

            {/* Show cards for specific career goals */}
            {getTargetRoleOptions(selectedGoal).length > 0 ? (
              <View style={styles.optionsContainer}>
                {getTargetRoleOptions(selectedGoal).map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.optionCard,
                      targetRole === role && styles.optionCardSelected,
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setTargetRole(role);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionContent}>
                      <View
                        style={[
                          styles.radioButton,
                          targetRole === role && styles.radioButtonSelected,
                        ]}
                      >
                        {targetRole === role && (
                          <View style={styles.radioButtonInner} />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.optionText,
                          targetRole === role && styles.optionTextSelected,
                        ]}
                      >
                        {role}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              /* Show text input for Career Pivot, Skill Development, Resume Refresh */
              <View style={styles.inputCard}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Marketing Manager, Healthcare, Finance"
                  placeholderTextColor={Colors.mediumGray}
                  value={targetRole}
                  onChangeText={setTargetRole}
                  autoCapitalize="words"
                  autoFocus={currentStep === 1}
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    if (targetRole.trim().length > 0) {
                      handleNext();
                    }
                  }}
                  blurOnSubmit={false}
                />
              </View>
            )}

            {/* Visual confirmation */}
            {targetRole.trim().length > 0 && (
              <Text style={styles.selectionConfirm}>
                ✓ {targetRole} selected
              </Text>
            )}
          </ScrollView>
        </View>

        {/* Step 3: Transition Driver */}
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

        {/* Step 4: Name */}
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
                autoFocus={currentStep === 3}
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
                  <Ionicons name="arrow-back" size={20} color={Colors.navy} />
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
                      size={18}
                      color={Colors.white}
                      style={styles.buttonIcon}
                    />
                  )}
                </TouchableOpacity>
              </Animated.View>
            </View>
          </ScrollView>
        </View>

        {/* Step 5: Current Role & Experience */}
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
                <Ionicons name="arrow-back" size={20} color={Colors.navy} />
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
                      size={18}
                      color={Colors.white}
                      style={styles.buttonIcon}
                    />
                  )}
                </TouchableOpacity>
              </Animated.View>
            </View>
          </ScrollView>
        </View>

        {/* Step 6: Timeline */}
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
                <Ionicons name="arrow-back" size={20} color={Colors.navy} />
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
                    Continue
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color={Colors.white}
                    style={styles.buttonIcon}
                  />
                </TouchableOpacity>
              </Animated.View>
            </View>
          </ScrollView>
        </View>

        {/* Step 7: Focus Areas */}
        <View style={[styles.step, { width }]}>
          <ScrollView
            contentContainerStyle={styles.stepScrollInline}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>What are your primary focus areas?</Text>
            <Text style={styles.subtitle}>
              Select the areas you want to prioritize (choose at least one)
            </Text>

            <View style={styles.focusAreasContainer}>
              {selectedGoal && getFocusAreasForGoal(selectedGoal).map((area) => (
                <TouchableOpacity
                  key={area.id}
                  style={[
                    styles.focusAreaCard,
                    selectedFocusAreas.includes(area.id) && styles.focusAreaCardSelected,
                  ]}
                  onPress={() => toggleFocusArea(area.id)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.focusAreaIcon,
                    selectedFocusAreas.includes(area.id) && styles.focusAreaIconSelected,
                  ]}>
                    <Ionicons
                      name={area.icon as any}
                      size={20}
                      color={selectedFocusAreas.includes(area.id) ? Colors.white : Colors.primary}
                    />
                  </View>
                  <Text
                    style={[
                      styles.focusAreaText,
                      selectedFocusAreas.includes(area.id) && styles.focusAreaTextSelected,
                    ]}
                  >
                    {area.label}
                  </Text>
                  {selectedFocusAreas.includes(area.id) && (
                    <View style={styles.focusAreaCheckmark}>
                      <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Visual confirmation of selection */}
            {selectedFocusAreas.length > 0 && (
              <Text style={styles.selectionConfirm}>
                ✓ {selectedFocusAreas.length} area{selectedFocusAreas.length > 1 ? 's' : ''} selected
              </Text>
            )}

            {/* INLINE NAVIGATION BUTTONS */}
            <View style={styles.inlineButtonContainer}>
              <TouchableOpacity
                style={styles.inlineBackButton}
                onPress={handleBack}
              >
                <Ionicons name="arrow-back" size={20} color={Colors.navy} />
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
                    selectedFocusAreas.length === 0 && styles.inlineNextButtonDisabled,
                  ]}
                  onPress={handleNext}
                  disabled={selectedFocusAreas.length === 0}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.nextButtonText,
                      selectedFocusAreas.length === 0 && styles.nextButtonTextDisabled,
                    ]}
                  >
                    Create My Plan
                  </Text>
                  {selectedFocusAreas.length > 0 && (
                    <Ionicons
                      name="rocket"
                      size={18}
                      color={Colors.white}
                      style={styles.buttonIcon}
                    />
                  )}
                </TouchableOpacity>
              </Animated.View>
            </View>
          </ScrollView>
        </View>
        </Animated.View>

        {/* Navigation Buttons - Only show for steps 0, 1, 2 (Career Goal, Target Role, and Transition Driver - steps without inline buttons) */}
        {(currentStep === 0 || currentStep === 1 || currentStep === 2) && (
          <View
            style={[
              styles.navigationContainer,
              { paddingBottom: Math.max(insets.bottom, 16) + 16 },
            ]}
          >
            {currentStep > 0 && (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Ionicons name="arrow-back" size={20} color={Colors.navy} />
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
                    size={18}
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
    paddingTop: 24,
    paddingBottom: 16,
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
    paddingHorizontal: 20,
  },
  stepScroll: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  stepScrollWithButton: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  stepScrollInline: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  stepContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.navy,
    marginBottom: 6,
    flexShrink: 1,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.mediumGray,
    marginBottom: 20,
    flexShrink: 1,
  },
  optionsContainer: {
    gap: 8,
  },
  optionCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
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
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.lightGray,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: Colors.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.navy,
    flex: 1,
    flexShrink: 1,
  },
  optionTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  inputCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.navy,
    marginBottom: 8,
  },
  input: {
    fontSize: 15,
    color: Colors.navy,
    minHeight: 36,
  },
  hint: {
    fontSize: 13,
    color: Colors.mediumGray,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  selectionConfirm: {
    fontSize: 13,
    color: Colors.success,
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '600',
  },
  sliderCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sliderValueContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  sliderValue: {
    fontSize: 28,
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
    paddingTop: 16,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  backButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
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
    borderRadius: 26,
    height: 52,
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
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonTextDisabled: {
    color: Colors.mediumGray,
  },
  buttonIcon: {
    marginLeft: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.navy,
    marginTop: 20,
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 13,
    color: Colors.mediumGray,
    textAlign: 'center',
    lineHeight: 18,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  welcomeIconContainer: {
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.navy,
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: Colors.navy,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
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
    marginTop: 20,
    gap: 10,
  },
  inlineBackButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
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
    borderRadius: 26,
    height: 52,
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
  focusAreasContainer: {
    gap: 8,
    marginBottom: 12,
  },
  focusAreaCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.lightGray,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  focusAreaCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F7FF',
  },
  focusAreaIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  focusAreaIconSelected: {
    backgroundColor: Colors.primary,
  },
  focusAreaText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.navy,
    flexShrink: 1,
  },
  focusAreaTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  focusAreaCheckmark: {
    marginLeft: 8,
  },
});
