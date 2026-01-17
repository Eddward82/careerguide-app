import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

interface MondayCheckinModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (completion: 'all' | 'some' | 'none') => void;
}

export default function MondayCheckinModal({
  visible,
  onClose,
  onSubmit,
}: MondayCheckinModalProps) {
  const [selectedOption, setSelectedOption] = useState<'all' | 'some' | 'none' | null>(null);

  const handleSubmit = () => {
    if (selectedOption) {
      onSubmit(selectedOption);
      setSelectedOption(null);
    }
  };

  const options = [
    {
      value: 'all' as const,
      icon: 'checkmark-done-circle',
      title: 'Completed All',
      description: 'I finished all my tasks from last week!',
      color: '#7ED8B4', // Mint Green
      bgColor: '#E3F9F4',
    },
    {
      value: 'some' as const,
      icon: 'checkbox',
      title: 'Completed Some',
      description: 'I made progress on some of my tasks',
      color: '#4A90E2', // Sky Blue
      bgColor: '#F0F7FF',
    },
    {
      value: 'none' as const,
      icon: 'close-circle',
      title: "Didn't Complete",
      description: 'I need to adjust my approach',
      color: '#FF9800',
      bgColor: '#FFF3E0',
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="calendar" size={32} color="#4A90E2" />
            </View>
            <Text style={styles.title}>Monday Check-In! 📅</Text>
            <Text style={styles.subtitle}>
              How did you do on last week's tasks?
            </Text>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionCard,
                  selectedOption === option.value && styles.optionCardSelected,
                  { borderColor: option.color },
                ]}
                onPress={() => setSelectedOption(option.value)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.optionIconContainer,
                    { backgroundColor: option.bgColor },
                  ]}
                >
                  <Ionicons name={option.icon as any} size={28} color={option.color} />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
                <View
                  style={[
                    styles.radioButton,
                    selectedOption === option.value && [
                      styles.radioButtonSelected,
                      { backgroundColor: option.color },
                    ],
                  ]}
                >
                  {selectedOption === option.value && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                !selectedOption && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!selectedOption}
              activeOpacity={0.8}
            >
              <Text style={styles.submitButtonText}>Submit Check-In</Text>
              <Ionicons name="arrow-forward" size={20} color={Colors.white} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.skipButtonText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A2332',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.mediumGray,
    textAlign: 'center',
    lineHeight: 22,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    backgroundColor: Colors.white,
    borderWidth: 2,
  },
  optionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A2332',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    color: Colors.mediumGray,
    lineHeight: 18,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  radioButtonSelected: {
    borderWidth: 0,
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.white,
  },
  buttonsContainer: {
    gap: 12,
  },
  submitButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.lightGray,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    marginRight: 8,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.mediumGray,
  },
});
