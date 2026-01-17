import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { RoadmapPlan } from '@/utils/roadmap';

interface RoadmapModalProps {
  visible: boolean;
  onClose: () => void;
  roadmapPlan: RoadmapPlan;
  currentDay?: number;
}

export default function RoadmapModal({
  visible,
  onClose,
  roadmapPlan,
  currentDay = 1,
}: RoadmapModalProps) {
  const getPhaseStatus = (phaseIndex: number): 'completed' | 'current' | 'upcoming' => {
    const daysPerPhase = roadmapPlan.totalDays / roadmapPlan.phases.length;
    const currentPhaseIndex = Math.floor(currentDay / daysPerPhase);

    if (phaseIndex < currentPhaseIndex) return 'completed';
    if (phaseIndex === currentPhaseIndex) return 'current';
    return 'upcoming';
  };

  const getPhaseIcon = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'current':
        return 'play-circle';
      case 'upcoming':
        return 'ellipse-outline';
      default:
        return 'ellipse-outline';
    }
  };

  const getPhaseColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return '#7ED8B4'; // Mint Green
      case 'current':
        return '#4A90E2'; // Sky Blue
      case 'upcoming':
        return Colors.lightGray;
      default:
        return Colors.lightGray;
    }
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
            <Ionicons name="map" size={28} color={Colors.primary} />
            <View style={styles.headerText}>
              <Text style={styles.title}>{roadmapPlan.name}</Text>
              <Text style={styles.subtitle}>
                {roadmapPlan.totalDays}-day journey to your goal
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={Colors.navy} />
          </TouchableOpacity>
        </View>

        {/* Strategy Badge */}
        <View style={styles.strategyBadge}>
          <Ionicons
            name="rocket"
            size={16}
            color={Colors.primary}
            style={styles.strategyIcon}
          />
          <Text style={styles.strategyText}>
            {roadmapPlan.strategy.charAt(0).toUpperCase() + roadmapPlan.strategy.slice(1)}{' '}
            Strategy
          </Text>
        </View>

        {/* Phases List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.phasesContainer}>
            {roadmapPlan.phases.map((phase, index) => {
              const status = getPhaseStatus(index);
              const isLast = index === roadmapPlan.phases.length - 1;

              return (
                <View key={phase.number} style={styles.phaseWrapper}>
                  {/* Phase Card */}
                  <View
                    style={[
                      styles.phaseCard,
                      status === 'current' && styles.phaseCardCurrent,
                    ]}
                  >
                    <View style={styles.phaseHeader}>
                      <View
                        style={[
                          styles.phaseIconContainer,
                          { backgroundColor: getPhaseColor(status) + '20' },
                        ]}
                      >
                        <Ionicons
                          name={getPhaseIcon(status) as any}
                          size={24}
                          color={getPhaseColor(status)}
                        />
                      </View>
                      <View style={styles.phaseHeaderText}>
                        <Text style={styles.phaseNumber}>Phase {phase.number}</Text>
                        <Text style={styles.phaseWeeks}>{phase.weeks}</Text>
                      </View>
                      {status === 'completed' && (
                        <View style={styles.completedBadge}>
                          <Text style={styles.completedBadgeText}>Completed</Text>
                        </View>
                      )}
                      {status === 'current' && (
                        <View style={styles.currentBadge}>
                          <Text style={styles.currentBadgeText}>In Progress</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.phaseTitle}>{phase.title}</Text>
                    <Text style={styles.phaseDescription}>{phase.description}</Text>
                  </View>

                  {/* Connector Line */}
                  {!isLast && (
                    <View style={styles.connectorContainer}>
                      <View
                        style={[
                          styles.connectorLine,
                          {
                            backgroundColor:
                              status === 'completed' ? '#7ED8B4' : Colors.lightGray,
                          },
                        ]}
                      />
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Footer Message */}
          <View style={styles.footer}>
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={Colors.success}
              style={styles.footerIcon}
            />
            <Text style={styles.footerText}>
              Stay consistent with your daily actions, and you&apos;ll reach your goal in{' '}
              {roadmapPlan.totalDays} days!
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    color: Colors.navy,
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
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  strategyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginVertical: 20,
  },
  strategyIcon: {
    marginRight: 6,
  },
  strategyText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  phasesContainer: {
    marginTop: 8,
  },
  phaseWrapper: {
    marginBottom: 8,
  },
  phaseCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.lightGray,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  phaseCardCurrent: {
    borderLeftColor: '#4A90E2', // Sky Blue
    backgroundColor: '#FAFCFF',
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  phaseIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  phaseHeaderText: {
    flex: 1,
  },
  phaseNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.navy,
    marginBottom: 2,
  },
  phaseWeeks: {
    fontSize: 12,
    color: Colors.mediumGray,
    fontWeight: '600',
  },
  completedBadge: {
    backgroundColor: '#E3F9F4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  completedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7ED8B4', // Mint Green
  },
  currentBadge: {
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  currentBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A90E2', // Sky Blue
  },
  phaseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.navy,
    marginBottom: 8,
  },
  phaseDescription: {
    fontSize: 14,
    color: Colors.mediumGray,
    lineHeight: 20,
  },
  connectorContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  connectorLine: {
    width: 3,
    height: 32,
    borderRadius: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 20,
    borderRadius: 16,
    marginTop: 24,
  },
  footerIcon: {
    marginRight: 12,
  },
  footerText: {
    flex: 1,
    fontSize: 14,
    color: Colors.navy,
    lineHeight: 20,
    fontWeight: '500',
  },
});
