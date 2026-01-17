import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { TransitionTimeline } from '@/types';

interface TimelineAdjustmentModalProps {
  visible: boolean;
  onClose: () => void;
  currentTimeline: TransitionTimeline;
  onAdjust: (newTimeline: TransitionTimeline) => void;
}

export default function TimelineAdjustmentModal({
  visible,
  onClose,
  currentTimeline,
  onAdjust,
}: TimelineAdjustmentModalProps) {
  const [selectedTimeline, setSelectedTimeline] = useState<TransitionTimeline>(currentTimeline);

  const timelineOptions = [
    {
      value: '1-3m' as const,
      title: '90-Day Career Sprint',
      subtitle: '1-3 months',
      description: '3 high-intensity phases for rapid transition',
      phases: 3,
      icon: 'flash',
      color: '#FF9800',
      recommended: false,
    },
    {
      value: '3-6m' as const,
      title: '180-Day Roadmap',
      subtitle: '3-6 months',
      description: '6 balanced phases for steady progress',
      phases: 6,
      icon: 'trending-up',
      color: '#4A90E2',
      recommended: true,
    },
    {
      value: '6-12m' as const,
      title: '365-Day Mastery Plan',
      subtitle: '6-12 months',
      description: '8 deep-learning phases for expertise building',
      phases: 8,
      icon: 'school',
      color: '#7ED8B4',
      recommended: false,
    },
    {
      value: '12m+' as const,
      title: 'Long-term Growth',
      subtitle: '12+ months',
      description: '10 sustainable phases for strategic positioning',
      phases: 10,
      icon: 'trophy',
      color: '#9C27B0',
      recommended: false,
    },
  ];

  const handleConfirm = () => {
    onAdjust(selectedTimeline);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Ionicons name="settings" size={28} color="#4A90E2" />
            <View style={styles.headerText}>
              <Text style={styles.title}>Adjust Your Timeline</Text>
              <Text style={styles.subtitle}>
                Choose a pace that fits your goals
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={Colors.navy} />
          </TouchableOpacity>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={20} color="#4A90E2" />
          <Text style={styles.infoBannerText}>
            Your progress will be preserved. The timeline will adjust to your new pace.
          </Text>
        </View>

        {/* Timeline Options */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {timelineOptions.map((option) => {
            const isSelected = selectedTimeline === option.value;
            const isCurrent = currentTimeline === option.value;

            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected,
                  isCurrent && styles.optionCardCurrent,
                ]}
                onPress={() => setSelectedTimeline(option.value)}
                activeOpacity={0.7}
              >
                {/* Icon */}
                <View
                  style={[
                    styles.optionIconContainer,
                    { backgroundColor: option.color + '20' },
                  ]}
                >
                  <Ionicons name={option.icon as any} size={32} color={option.color} />
                </View>

                {/* Content */}
                <View style={styles.optionContent}>
                  <View style={styles.optionTitleRow}>
                    <Text style={styles.optionTitle}>{option.title}</Text>
                    {option.recommended && (
                      <View style={styles.recommendedBadge}>
                        <Text style={styles.recommendedText}>Recommended</Text>
                      </View>
                    )}
                    {isCurrent && (
                      <View style={styles.currentBadge}>
                        <Text style={styles.currentText}>Current</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>

                  {/* Phases Indicator */}
                  <View style={styles.phasesIndicator}>
                    <Ionicons name="layers" size={16} color={option.color} />
                    <Text style={[styles.phasesText, { color: option.color }]}>
                      {option.phases} Phases
                    </Text>
                  </View>
                </View>

                {/* Selection Radio */}
                <View
                  style={[
                    styles.radioButton,
                    isSelected && [
                      styles.radioButtonSelected,
                      { backgroundColor: option.color },
                    ],
                  ]}
                >
                  {isSelected && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Confirm Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.confirmButton,
              selectedTimeline === currentTimeline && styles.confirmButtonDisabled,
            ]}
            onPress={handleConfirm}
            disabled={selectedTimeline === currentTimeline}
            activeOpacity={0.8}
          >
            <Text style={styles.confirmButtonText}>
              {selectedTimeline === currentTimeline
                ? 'Already On This Timeline'
                : 'Confirm New Timeline'}
            </Text>
            {selectedTimeline !== currentTimeline && (
              <Ionicons name="checkmark-circle" size={24} color={Colors.white} />
            )}
          </TouchableOpacity>
        </View>
      </View>
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
    paddingBottom: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A2332',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.mediumGray,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    padding: 16,
    marginHorizontal: 24,
    marginTop: 20,
    borderRadius: 12,
  },
  infoBannerText: {
    fontSize: 13,
    color: '#4A90E2',
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  optionCardSelected: {
    borderColor: '#4A90E2',
    backgroundColor: '#FAFCFF',
  },
  optionCardCurrent: {
    borderColor: '#7ED8B4',
  },
  optionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A2332',
    marginRight: 8,
  },
  recommendedBadge: {
    backgroundColor: '#7ED8B4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  currentBadge: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  currentText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
    marginBottom: 6,
  },
  optionDescription: {
    fontSize: 13,
    color: Colors.mediumGray,
    lineHeight: 18,
    marginBottom: 10,
  },
  phasesIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phasesText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  radioButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
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
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.white,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  confirmButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 16,
    paddingVertical: 18,
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
  confirmButtonDisabled: {
    backgroundColor: Colors.lightGray,
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    marginRight: 8,
  },
});
