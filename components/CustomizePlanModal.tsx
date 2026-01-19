import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { CareerGoal } from '@/types';
import * as Haptics from 'expo-haptics';

interface CustomizePlanModalProps {
  visible: boolean;
  onClose: () => void;
  careerGoal: CareerGoal;
  onSubmit: (customizationData: Record<string, string>) => void;
}

interface Question {
  id: string;
  label: string;
  placeholder: string;
  icon: string;
}

export default function CustomizePlanModal({
  visible,
  onClose,
  careerGoal,
  onSubmit,
}: CustomizePlanModalProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);

  // Get goal-specific questions
  const getQuestionsForGoal = (): Question[] => {
    switch (careerGoal) {
      case 'Freelance/Startup Path':
        return [
          {
            id: 'niche',
            label: 'What is your specific freelance niche or service offering?',
            placeholder: 'e.g., Web Design, Consulting, Video Editing',
            icon: 'compass',
          },
          {
            id: 'targetClients',
            label: 'Who are your ideal target clients?',
            placeholder: 'e.g., Startups, Small Businesses, Tech Companies',
            icon: 'people',
          },
          {
            id: 'pricingModel',
            label: 'What is your preferred pricing model?',
            placeholder: 'e.g., Hourly, Project-Based, Retainer',
            icon: 'cash',
          },
        ];

      case 'Salary Negotiation & Promotion':
        return [
          {
            id: 'industry',
            label: 'What industry do you work in?',
            placeholder: 'e.g., Technology, Finance, Healthcare',
            icon: 'briefcase',
          },
          {
            id: 'organizationLevel',
            label: 'What is your current organizational level?',
            placeholder: 'e.g., Manager, Senior Manager, Director',
            icon: 'stats-chart',
          },
          {
            id: 'targetIncrease',
            label: 'What is your target salary increase percentage?',
            placeholder: 'e.g., 20%, 30%, 40%',
            icon: 'trending-up',
          },
        ];

      case 'Switching to Tech':
        return [
          {
            id: 'background',
            label: 'What is your current professional background?',
            placeholder: 'e.g., Finance, Marketing, Healthcare',
            icon: 'business',
          },
          {
            id: 'targetRole',
            label: 'What specific tech role are you aiming for?',
            placeholder: 'e.g., Data Science, Frontend Developer, Product Manager',
            icon: 'code-slash',
          },
          {
            id: 'codingExperience',
            label: 'What is your current coding experience level?',
            placeholder: 'e.g., None, Beginner, Intermediate',
            icon: 'laptop',
          },
        ];

      case 'Moving to Management':
        return [
          {
            id: 'currentLevel',
            label: 'What is your current role level?',
            placeholder: 'e.g., Senior Engineer, Lead Designer, Principal',
            icon: 'person',
          },
          {
            id: 'managementType',
            label: 'What type of management role are you targeting?',
            placeholder: 'e.g., Engineering Manager, Design Lead, Director',
            icon: 'people-circle',
          },
          {
            id: 'teamSize',
            label: 'What team size are you comfortable managing?',
            placeholder: 'e.g., 3-5, 5-10, 10+',
            icon: 'git-network',
          },
        ];

      case 'Career Pivot':
        return [
          {
            id: 'currentField',
            label: 'What is your current field or industry?',
            placeholder: 'e.g., Accounting, Law, Education',
            icon: 'briefcase-outline',
          },
          {
            id: 'targetField',
            label: 'What field are you pivoting to?',
            placeholder: 'e.g., UX Design, Product Management, Data Analytics',
            icon: 'swap-horizontal',
          },
          {
            id: 'transferableSkills',
            label: 'What are your strongest transferable skills?',
            placeholder: 'e.g., Communication, Problem Solving, Leadership',
            icon: 'sparkles',
          },
        ];

      default:
        return [
          {
            id: 'primaryGoal',
            label: 'What is your primary professional goal?',
            placeholder: 'Describe your main objective',
            icon: 'flag',
          },
          {
            id: 'currentChallenge',
            label: 'What is your biggest current challenge?',
            placeholder: 'What obstacle are you facing?',
            icon: 'alert-circle',
          },
          {
            id: 'idealOutcome',
            label: 'What does success look like for you?',
            placeholder: 'Describe your ideal outcome',
            icon: 'trophy',
          },
        ];
    }
  };

  const questions = getQuestionsForGoal();
  const currentQuestion = questions[currentStep];
  const isLastStep = currentStep === questions.length - 1;

  const handleNext = () => {
    if (!answers[currentQuestion.id]?.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (isLastStep) {
      handleSubmit();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSubmit(answers);
    // Reset state
    setAnswers({});
    setCurrentStep(0);
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAnswers({});
    setCurrentStep(0);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={Colors.navy} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Customize Your Plan</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          {questions.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index === currentStep && styles.progressDotActive,
                index < currentStep && styles.progressDotCompleted,
              ]}
            />
          ))}
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Question Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name={currentQuestion.icon as any} size={40} color="#4A90E2" />
            </View>
          </View>

          {/* Question Text */}
          <Text style={styles.questionLabel}>{currentQuestion.label}</Text>
          <Text style={styles.questionHint}>
            Step {currentStep + 1} of {questions.length}
          </Text>

          {/* Input Field */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={currentQuestion.placeholder}
              placeholderTextColor={Colors.mediumGray}
              value={answers[currentQuestion.id] || ''}
              onChangeText={(text) =>
                setAnswers({ ...answers, [currentQuestion.id]: text })
              }
              multiline
              autoFocus
              returnKeyType={isLastStep ? 'done' : 'next'}
              onSubmitEditing={handleNext}
            />
          </View>

          {/* Example Text */}
          <View style={styles.exampleContainer}>
            <Ionicons name="bulb-outline" size={16} color="#FFB020" />
            <Text style={styles.exampleText}>
              Be specific! The more detail you provide, the better your personalized plan will be.
            </Text>
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          {currentStep > 0 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={20} color="#4A90E2" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.nextButton,
              !answers[currentQuestion.id]?.trim() && styles.nextButtonDisabled,
            ]}
            onPress={handleNext}
            activeOpacity={0.8}
            disabled={!answers[currentQuestion.id]?.trim()}
          >
            <Text style={styles.nextButtonText}>
              {isLastStep ? 'Generate My Plan' : 'Next'}
            </Text>
            <Ionicons
              name={isLastStep ? 'checkmark-circle' : 'arrow-forward'}
              size={20}
              color={Colors.white}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A2332',
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E8EAED',
  },
  progressDotActive: {
    backgroundColor: '#4A90E2',
    width: 32,
    borderRadius: 5,
  },
  progressDotCompleted: {
    backgroundColor: '#7ED8B4',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionLabel: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A2332',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 32,
  },
  questionHint: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.mediumGray,
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    fontSize: 16,
    color: '#1A2332',
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 2,
    borderColor: '#4A90E2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  exampleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    padding: 16,
    borderRadius: 12,
    gap: 10,
  },
  exampleText: {
    flex: 1,
    fontSize: 13,
    color: '#1A2332',
    lineHeight: 18,
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    gap: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    flex: 1,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    flex: 2,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonDisabled: {
    backgroundColor: Colors.mediumGray,
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
});
