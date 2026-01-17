import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { RoadmapPlan, getCurrentWeekInPhase, getPhaseCompletionPercentage, isPhaseCompleted } from '@/utils/roadmap';
import { refineRoadmapWithAI } from '@/utils/newellAi';
import { getUserProfile } from '@/utils/storage';
import * as Haptics from 'expo-haptics';
import { getFocusAreasForGoal, getIconForGoal } from '@/utils/focusAreas';
import { UserProfile } from '@/types';

interface EnhancedRoadmapModalProps {
  visible: boolean;
  onClose: () => void;
  roadmapPlan: RoadmapPlan;
  currentDay?: number;
  onTaskToggle?: (phaseNumber: number, taskId: string) => void;
  onAdjustTimeline?: () => void;
  onRoadmapRefined?: (refinedPlan: RoadmapPlan) => void;
}

export default function EnhancedRoadmapModal({
  visible,
  onClose,
  roadmapPlan,
  currentDay = 1,
  onTaskToggle,
  onAdjustTimeline,
  onRoadmapRefined,
}: EnhancedRoadmapModalProps) {
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set([1]));
  const [isRefining, setIsRefining] = useState(false);
  const [refinedPhases, setRefinedPhases] = useState<Map<number, string[]>>(new Map());
  const [pulseAnim] = useState(new Animated.Value(1));
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Load user profile on mount
  React.useEffect(() => {
    const loadProfile = async () => {
      const profile = await getUserProfile();
      setUserProfile(profile);
    };
    loadProfile();
  }, []);

  const getPhaseStatus = (phaseIndex: number): 'completed' | 'current' | 'upcoming' => {
    const phase = roadmapPlan.phases[phaseIndex];

    // Check if all tasks are completed
    if (isPhaseCompleted(phase)) {
      return 'completed';
    }

    const daysPerPhase = roadmapPlan.totalDays / roadmapPlan.phases.length;
    const currentPhaseIndex = Math.floor(currentDay / daysPerPhase);

    if (phaseIndex === currentPhaseIndex) return 'current';
    if (phaseIndex < currentPhaseIndex) return 'completed';
    return 'upcoming';
  };

  const togglePhase = (phaseNumber: number) => {
    setExpandedPhases(prev => {
      const newSet = new Set(prev);
      if (newSet.has(phaseNumber)) {
        newSet.delete(phaseNumber);
      } else {
        newSet.add(phaseNumber);
      }
      return newSet;
    });
  };

  // Pulse animation for Refine with AI button
  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const handleRefineWithAI = async () => {
    try {
      setIsRefining(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const profile = await getUserProfile();

      // Refine all phases
      const newRefinedPhases = new Map<number, string[]>();

      for (const phase of roadmapPlan.phases) {
        const refinedObjectives = await refineRoadmapWithAI(
          {
            name: profile.name,
            currentRole: profile.currentRole,
            careerGoal: profile.careerGoal,
            yearsExperience: profile.yearsExperience,
            focusAreas: profile.focusAreas,
          },
          phase
        );
        newRefinedPhases.set(phase.number, refinedObjectives);
      }

      setRefinedPhases(newRefinedPhases);

      // Notify parent component if callback is provided
      if (onRoadmapRefined) {
        const refinedPlan: RoadmapPlan = {
          ...roadmapPlan,
          phases: roadmapPlan.phases.map(phase => ({
            ...phase,
            objectives: newRefinedPhases.get(phase.number) || phase.objectives,
          })),
        };
        onRoadmapRefined(refinedPlan);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error refining roadmap:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsRefining(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          icon: 'checkmark-circle',
          text: '✅ COMPLETED',
          color: '#7ED8B4', // Mint Green
          bgColor: '#E3F9F4',
        };
      case 'current':
        return {
          icon: 'play-circle',
          text: '🔄 IN PROGRESS',
          color: '#4A90E2', // Sky Blue
          bgColor: '#F0F7FF',
        };
      case 'upcoming':
        return {
          icon: 'time-outline',
          text: '⏳ UPCOMING',
          color: Colors.mediumGray,
          bgColor: Colors.lightGray,
        };
      default:
        return {
          icon: 'ellipse-outline',
          text: 'UNKNOWN',
          color: Colors.mediumGray,
          bgColor: Colors.lightGray,
        };
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
            <Ionicons
              name={userProfile ? (getIconForGoal(userProfile.careerGoal) as any) : 'map'}
              size={28}
              color="#4A90E2"
            />
            <View style={styles.headerText}>
              <Text style={styles.title}>{roadmapPlan.name}</Text>
              <Text style={styles.subtitle}>
                {roadmapPlan.phases.length} phase roadmap to your goal
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={Colors.navy} />
          </TouchableOpacity>
        </View>

        {/* Focus Badges Section */}
        {userProfile && userProfile.focusAreas && userProfile.focusAreas.length > 0 && (
          <View style={styles.focusBadgesContainer}>
            <Text style={styles.focusBadgesTitle}>Your Focus Areas:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.focusBadgesScroll}
            >
              {userProfile.focusAreas.map((areaId) => {
                const focusOption = getFocusAreasForGoal(userProfile.careerGoal).find(
                  (opt) => opt.id === areaId
                );
                if (!focusOption) return null;
                return (
                  <View key={areaId} style={styles.focusBadge}>
                    <Ionicons name={focusOption.icon as any} size={16} color={Colors.primary} />
                    <Text style={styles.focusBadgeText}>{focusOption.label}</Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Adjust Timeline Button */}
        {onAdjustTimeline && (
          <TouchableOpacity style={styles.adjustButton} onPress={onAdjustTimeline}>
            <Ionicons name="settings-outline" size={20} color="#4A90E2" />
            <Text style={styles.adjustButtonText}>Adjust Timeline</Text>
          </TouchableOpacity>
        )}

        {/* Refine with AI Button */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={styles.refineButton}
            onPress={handleRefineWithAI}
            disabled={isRefining}
            activeOpacity={0.8}
          >
            {isRefining ? (
              <>
                <ActivityIndicator size="small" color={Colors.white} />
                <Text style={styles.refineButtonText}>✨ Personalizing...</Text>
              </>
            ) : (
              <>
                <Ionicons name="sparkles" size={20} color={Colors.white} />
                <Text style={styles.refineButtonText}>Refine with AI</Text>
                <Ionicons name="sparkles" size={20} color={Colors.white} />
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Phases List - Vertical Timeline */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.phasesContainer}>
            {roadmapPlan.phases.map((phase, index) => {
              const status = getPhaseStatus(index);
              const badge = getStatusBadge(status);
              const isExpanded = expandedPhases.has(phase.number);
              const completion = getPhaseCompletionPercentage(phase);
              const currentWeek = status === 'current' ? getCurrentWeekInPhase(currentDay, phase, roadmapPlan) : null;
              const displayObjectives = refinedPhases.get(phase.number) || phase.objectives;
              const isRefined = refinedPhases.has(phase.number);

              return (
                <View key={phase.number} style={styles.phaseWrapper}>
                  {/* Phase Card */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => togglePhase(phase.number)}
                  >
                    <View
                      style={[
                        styles.phaseCard,
                        status === 'current' && styles.phaseCardCurrent,
                        isExpanded && styles.phaseCardExpanded,
                      ]}
                    >
                      {/* Phase Header */}
                      <View style={styles.phaseHeader}>
                        <View style={styles.phaseHeaderLeft}>
                          <View style={[styles.phaseNumber, { backgroundColor: badge.bgColor }]}>
                            <Text style={[styles.phaseNumberText, { color: badge.color }]}>
                              {phase.number}
                            </Text>
                          </View>
                          <View style={styles.phaseHeaderTextContainer}>
                            <Text style={styles.phaseTitle}>{phase.title}</Text>
                            <Text style={styles.phaseWeeks}>{phase.weeks}</Text>
                          </View>
                        </View>
                        <Ionicons
                          name={isExpanded ? 'chevron-up' : 'chevron-down'}
                          size={24}
                          color={Colors.mediumGray}
                        />
                      </View>

                      {/* Status Badge */}
                      <View style={[styles.statusBadge, { backgroundColor: badge.bgColor }]}>
                        <Text style={[styles.statusBadgeText, { color: badge.color }]}>
                          {badge.text}
                        </Text>
                        {status === 'current' && (
                          <View style={styles.pulseIndicator} />
                        )}
                      </View>

                      {/* Progress Bar for Current/In Progress Phase */}
                      {status === 'current' && (
                        <View style={styles.progressSection}>
                          <View style={styles.progressBarBackground}>
                            <View
                              style={[
                                styles.progressBarFill,
                                { width: `${completion}%` },
                              ]}
                            />
                          </View>
                          <Text style={styles.progressText}>{completion}% Complete</Text>
                        </View>
                      )}

                      {/* Current Week Indicator */}
                      {status === 'current' && currentWeek && (
                        <View style={styles.currentWeekBadge}>
                          <Ionicons name="calendar" size={16} color="#4A90E2" />
                          <Text style={styles.currentWeekText}>
                            You&apos;re in Week {currentWeek}
                          </Text>
                        </View>
                      )}

                      {/* Expanded Content */}
                      {isExpanded && (
                        <View style={styles.expandedContent}>
                          {isRefined && (
                            <View style={styles.refinedBadge}>
                              <Ionicons name="sparkles" size={16} color="#FFD700" />
                              <Text style={styles.refinedBadgeText}>AI-Personalized</Text>
                            </View>
                          )}
                          <Text style={styles.phaseDescription}>{phase.description}</Text>

                          {/* Objectives */}
                          <View style={styles.objectivesSection}>
                            <Text style={styles.objectivesSectionTitle}>Objectives:</Text>
                            {displayObjectives.map((objective, idx) => (
                              <View key={idx} style={styles.objectiveRow}>
                                <Ionicons name="checkmark-circle-outline" size={18} color={Colors.primary} />
                                <Text style={styles.objectiveText}>{objective}</Text>
                              </View>
                            ))}
                          </View>

                          {/* Tasks */}
                          <View style={styles.tasksSection}>
                            <Text style={styles.tasksSectionTitle}>Tasks:</Text>
                            {phase.tasks.map((task) => (
                              <TouchableOpacity
                                key={task.id}
                                style={styles.taskRow}
                                onPress={() => onTaskToggle?.(phase.number, task.id)}
                                activeOpacity={0.7}
                              >
                                <View
                                  style={[
                                    styles.checkbox,
                                    task.isCompleted && styles.checkboxChecked,
                                  ]}
                                >
                                  {task.isCompleted && (
                                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                                  )}
                                </View>
                                <Text
                                  style={[
                                    styles.taskText,
                                    task.isCompleted && styles.taskTextCompleted,
                                  ]}
                                >
                                  {task.text}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>

                          {/* Motivational Message */}
                          <View style={styles.motivationalSection}>
                            <Text style={styles.motivationalMessage}>
                              {phase.motivationalMessage}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Connector Line */}
                  {index < roadmapPlan.phases.length - 1 && (
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
              name="rocket"
              size={24}
              color="#4A90E2"
              style={styles.footerIcon}
            />
            <Text style={styles.footerText}>
              Stay consistent with your daily actions. Each completed task brings you closer to your career goals!
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
    backgroundColor: '#F8F9FA', // Off-White
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
    color: '#1A2332', // Deep Navy
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
  adjustButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginVertical: 16,
  },
  adjustButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
    marginLeft: 8,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  phaseCardCurrent: {
    borderLeftColor: '#4A90E2',
    backgroundColor: '#FAFCFF',
  },
  phaseCardExpanded: {
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  phaseHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  phaseNumber: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  phaseNumberText: {
    fontSize: 18,
    fontWeight: '700',
  },
  phaseHeaderTextContainer: {
    flex: 1,
  },
  phaseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A2332',
    marginBottom: 4,
  },
  phaseWeeks: {
    fontSize: 13,
    color: Colors.mediumGray,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pulseIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4A90E2',
    marginLeft: 8,
    opacity: 0.7,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E8EAED',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: Colors.mediumGray,
    fontWeight: '600',
    textAlign: 'right',
  },
  currentWeekBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  currentWeekText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A90E2',
    marginLeft: 6,
  },
  expandedContent: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  phaseDescription: {
    fontSize: 14,
    color: Colors.mediumGray,
    lineHeight: 20,
    marginBottom: 16,
  },
  tasksSection: {
    marginBottom: 16,
  },
  tasksSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A2332',
    marginBottom: 12,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#4A90E2',
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#7ED8B4',
    borderColor: '#7ED8B4',
  },
  taskText: {
    flex: 1,
    fontSize: 14,
    color: '#1A2332',
    lineHeight: 20,
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.mediumGray,
  },
  motivationalSection: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD54F',
  },
  motivationalMessage: {
    fontSize: 14,
    color: '#1A2332',
    lineHeight: 20,
    fontStyle: 'italic',
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
    backgroundColor: '#F0F7FF',
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
    color: '#1A2332',
    lineHeight: 20,
    fontWeight: '500',
  },
  refineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    marginHorizontal: 24,
    marginVertical: 12,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
    gap: 8,
  },
  refineButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  refinedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFF8DC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
    gap: 6,
  },
  refinedBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DAA520',
    letterSpacing: 0.5,
  },
  objectivesSection: {
    marginBottom: 16,
  },
  objectivesSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A2332',
    marginBottom: 12,
  },
  objectiveRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 8,
  },
  objectiveText: {
    flex: 1,
    fontSize: 14,
    color: '#1A2332',
    lineHeight: 20,
  },
  focusBadgesContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  focusBadgesTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.mediumGray,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  focusBadgesScroll: {
    gap: 8,
  },
  focusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  focusBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
});
