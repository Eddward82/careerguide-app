import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Animated,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, motivationalQuotes } from '@/constants/Colors';
import {
  getUserProfile,
  completeWeeklyChallenge,
  getRoadmapTasksCompleted,
  updateRoadmapTaskCompletion,
  shouldShowMondayCheckin,
  saveMondayCheckin,
  shouldShowPhaseCompletion,
  markPhaseCompleted,
  adjustTimeline,
} from '@/utils/storage';
import { UserProfile } from '@/types';
import { getCommunityStats } from '@/data/mockData';
import {
  getRoadmapPlan,
  calculateCurrentDay,
  getProgressMessage,
  getCurrentPhase,
  isPhaseCompleted,
} from '@/utils/roadmap';
import EnhancedRoadmapModal from '@/components/EnhancedRoadmapModal';
import MondayCheckinModal from '@/components/MondayCheckinModal';
import PhaseCompletionModal from '@/components/PhaseCompletionModal';
import TimelineAdjustmentModal from '@/components/TimelineAdjustmentModal';

export default function HomeScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentQuote, setCurrentQuote] = useState(motivationalQuotes[0]);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [communityStats, setCommunityStats] = useState(getCommunityStats());
  const [showRoadmapModal, setShowRoadmapModal] = useState(false);
  const [showMondayCheckin, setShowMondayCheckin] = useState(false);
  const [showPhaseCompletion, setShowPhaseCompletion] = useState(false);
  const [completedPhase, setCompletedPhase] = useState<any>(null);
  const [showTimelineAdjustment, setShowTimelineAdjustment] = useState(false);
  const [roadmapPlan, setRoadmapPlan] = useState<any>(null);

  useEffect(() => {
    loadProfile();
    selectRandomQuote();

    // Update community stats every 30 seconds
    const interval = setInterval(() => {
      setCommunityStats(getCommunityStats());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Pulse animation for the Get New Coaching button
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [pulseAnim]);

  const loadProfile = async () => {
    const userProfile = await getUserProfile();
    setProfile(userProfile);

    // Check Monday checkin
    if (userProfile && userProfile.hasCompletedOnboarding) {
      const shouldShow = await shouldShowMondayCheckin();
      if (shouldShow) {
        setTimeout(() => setShowMondayCheckin(true), 1000);
      }

      // Load roadmap plan with task completion states
      if (userProfile.transitionTimeline) {
        const plan = getRoadmapPlan(userProfile.transitionTimeline, userProfile.careerGoal);
        const tasksCompleted = await getRoadmapTasksCompleted();

        // Update task completion states in the plan
        const updatedPlan = {
          ...plan,
          phases: plan.phases.map(phase => ({
            ...phase,
            tasks: phase.tasks.map(task => ({
              ...task,
              isCompleted: tasksCompleted[task.id] || false,
            })),
          })),
        };

        setRoadmapPlan(updatedPlan);

        // Check for phase completion
        if (userProfile.planStartDate) {
          const currentDay = calculateCurrentDay(userProfile.planStartDate);
          const currentPhase = getCurrentPhase(currentDay, updatedPlan);

          // Check if current phase is completed
          if (isPhaseCompleted(currentPhase)) {
            const shouldShowCelebration = await shouldShowPhaseCompletion(
              currentPhase.number,
              plan.name
            );

            if (shouldShowCelebration) {
              setCompletedPhase(currentPhase);
              setTimeout(() => setShowPhaseCompletion(true), 2000);
            }
          }
        }
      }
    }

    // Enhanced debug logging for milestone card visibility
    if (userProfile) {
      const initialSession = userProfile.sessions?.find(s => s.id.startsWith('initial-'));
      const mostRecentSession = userProfile.sessions?.[0];

      console.log('📊 Dashboard Profile State:', {
        hasProfile: true,
        sessionsCount: userProfile.sessions?.length || 0,
        allSessionIds: userProfile.sessions?.map(s => ({ id: s.id, hasActionPlan: !!s.actionPlan })) || [],
        hasInitialSession: !!initialSession,
        initialSessionId: initialSession?.id,
        initialSessionHasActionPlan: !!initialSession?.actionPlan,
        mostRecentSessionId: mostRecentSession?.id,
        mostRecentHasActionPlan: !!mostRecentSession?.actionPlan,
        planName: userProfile.planName,
        transitionTimeline: userProfile.transitionTimeline,
      });
    } else {
      console.log('📊 Dashboard Profile State: No profile loaded');
    }
  };

  const selectRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    setCurrentQuote(motivationalQuotes[randomIndex]);
  };

  const handleCompleteChallenge = async () => {
    await completeWeeklyChallenge();
    await loadProfile();
    Alert.alert(
      '🎉 Challenge Completed!',
      'Great work! You earned a bonus streak point. Keep it up!',
      [{ text: 'Awesome!' }]
    );
  };

  const handleMondayCheckin = async (completion: 'all' | 'some' | 'none') => {
    await saveMondayCheckin(completion);
    setShowMondayCheckin(false);

    let message = '';
    if (completion === 'all') {
      message = '🎉 Amazing work! Keep this momentum going!';
    } else if (completion === 'some') {
      message = '👍 Progress is progress! Every step counts.';
    } else {
      message = '💪 That\'s okay! Let\'s adjust your approach and keep moving forward.';
    }

    Alert.alert('Check-In Recorded', message, [{ text: 'Thanks!' }]);
    await loadProfile();
  };

  const handleTaskToggle = async (phaseNumber: number, taskId: string) => {
    if (!roadmapPlan) return;

    // Find the task and toggle it
    const updatedPlan = {
      ...roadmapPlan,
      phases: roadmapPlan.phases.map((phase: any) =>
        phase.number === phaseNumber
          ? {
              ...phase,
              tasks: phase.tasks.map((task: any) =>
                task.id === taskId
                  ? { ...task, isCompleted: !task.isCompleted }
                  : task
              ),
            }
          : phase
      ),
    };

    setRoadmapPlan(updatedPlan);

    // Save to storage
    const phase = updatedPlan.phases.find((p: any) => p.number === phaseNumber);
    const task = phase.tasks.find((t: any) => t.id === taskId);
    await updateRoadmapTaskCompletion(taskId, task.isCompleted);

    // Check if phase is now completed
    if (isPhaseCompleted(phase)) {
      await markPhaseCompleted(phaseNumber, roadmapPlan.name);
      const shouldShowCelebration = await shouldShowPhaseCompletion(
        phaseNumber,
        roadmapPlan.name
      );

      if (shouldShowCelebration) {
        setCompletedPhase(phase);
        setShowRoadmapModal(false);
        setTimeout(() => setShowPhaseCompletion(true), 500);
      }
    }
  };

  const handleTimelineAdjustment = async (newTimeline: any) => {
    await adjustTimeline(newTimeline);
    setShowTimelineAdjustment(false);
    Alert.alert(
      'Timeline Updated! 🎯',
      'Your roadmap has been adjusted to your new timeline. Your progress is preserved.',
      [{ text: 'Great!' }]
    );
    await loadProfile();
  };

  const handlePhaseCompletionClose = () => {
    setShowPhaseCompletion(false);
    setCompletedPhase(null);
  };

  const hasAnySessions = profile && profile.sessions.length > 0;

  // Robust milestone detection: show initial session if exists, otherwise show most recent
  const initialSession = profile?.sessions.find(s => s.id.startsWith('initial-'));
  const mostRecentSession = profile?.sessions?.[0];

  // Always show milestone card if user has any session with actionPlan
  const milestoneSession = initialSession || mostRecentSession;
  const showMilestoneCard = hasAnySessions && milestoneSession && milestoneSession.actionPlan && milestoneSession.actionPlan.length > 0;
  const isInitialMilestone = !!initialSession;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>Careerguide</Text>
            {profile?.name && (
              <Text style={styles.greeting}>Hi, {profile.name}! 👋</Text>
            )}
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color={Colors.navy} />
          </TouchableOpacity>
        </View>

        {/* Dynamic Roadmap Progress Card */}
        {profile?.planName && profile?.planStartDate && profile?.transitionTimeline && (
          <View style={styles.roadmapCard}>
            <View style={styles.roadmapHeader}>
              <View style={styles.roadmapIconContainer}>
                <Ionicons name="map" size={24} color={Colors.primary} />
              </View>
              <View style={styles.roadmapHeaderText}>
                <Text style={styles.roadmapPlanName}>{profile.planName}</Text>
                <Text style={styles.roadmapSubtitle}>
                  Day {calculateCurrentDay(profile.planStartDate)} of{' '}
                  {getRoadmapPlan(profile.transitionTimeline, profile.careerGoal).totalDays}
                </Text>
              </View>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.min(
                        (calculateCurrentDay(profile.planStartDate) /
                          getRoadmapPlan(profile.transitionTimeline, profile.careerGoal).totalDays) *
                          100,
                        100
                      )}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressPercentage}>
                {Math.min(
                  Math.round(
                    (calculateCurrentDay(profile.planStartDate) /
                      getRoadmapPlan(profile.transitionTimeline, profile.careerGoal).totalDays) *
                      100
                  ),
                  100
                )}
                % Complete
              </Text>
            </View>
          </View>
        )}

        {/* Weekly Challenge Card */}
        {profile?.weeklyChallenge && (
          <View style={styles.challengeCard}>
            <View style={styles.challengeHeader}>
              <View style={styles.challengeIcon}>
                <Ionicons name="trophy" size={24} color={Colors.warning} />
              </View>
              <View style={styles.challengeHeaderText}>
                <Text style={styles.challengeTitle}>Weekly Challenge</Text>
                <Text style={styles.challengeSubtitle}>Earn bonus streak!</Text>
              </View>
              {profile.weeklyChallenge.isCompleted && (
                <View style={styles.completedBadge}>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                </View>
              )}
            </View>
            <Text style={styles.challengeText}>
              {profile.weeklyChallenge.text}
            </Text>
            {!profile.weeklyChallenge.isCompleted ? (
              <TouchableOpacity
                style={styles.challengeButton}
                onPress={handleCompleteChallenge}
              >
                <Text style={styles.challengeButtonText}>Mark Complete</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.completedMessage}>
                <Text style={styles.completedMessageText}>
                  ✨ Completed! New challenge next Monday.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Community Stats Card */}
        <View style={styles.communityCard}>
          <View style={styles.communityHeader}>
            <Ionicons name="people" size={24} color={Colors.primary} />
            <Text style={styles.communityTitle}>Community Impact</Text>
          </View>
          <View style={styles.communityStats}>
            <View style={styles.communityStat}>
              <Text style={styles.communityStatValue}>
                {communityStats.transitions.toLocaleString()}
              </Text>
              <Text style={styles.communityStatLabel}>
                transitions started this month
              </Text>
            </View>
            <View style={styles.communityStatDivider} />
            <View style={styles.communityStat}>
              <Text style={styles.communityStatValue}>{communityStats.stickRate}%</Text>
              <Text style={styles.communityStatLabel}>stick with their goals</Text>
            </View>
          </View>
        </View>

        {/* Welcome Card with Initial Plan or Regular Content */}
        {!hasAnySessions ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="rocket" size={64} color={Colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>Start Your Journey Today</Text>
            <Text style={styles.emptySubtitle}>
              Get personalized AI coaching tailored to your career goals. Log your first
              win!
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/coaching')}
            >
              <Ionicons name="add" size={24} color={Colors.white} />
              <Text style={styles.emptyButtonText}>Get Your First Coaching</Text>
            </TouchableOpacity>
          </View>
        ) : showMilestoneCard && milestoneSession && profile ? (
          // Show milestone card whenever user has actionable steps
          <>
            {/* Personalized Welcome Header - only show for initial milestone */}
            {isInitialMilestone && (
              <View style={styles.welcomeHeader}>
                <Text style={styles.welcomeTitle}>
                  Welcome, {profile.name}! 🎉
                </Text>
                <Text style={styles.welcomeSubtitle}>
                  We&apos;re starting your journey from{' '}
                  <Text style={styles.welcomeHighlight}>{profile.currentRole}</Text> to{' '}
                  <Text style={styles.welcomeHighlight}>{profile.careerGoal}</Text>.
                </Text>
              </View>
            )}

            {/* Milestone Card - Dynamic title based on whether it's initial or current */}
            <View style={styles.milestoneCard}>
              <View style={styles.milestoneHeader}>
                <View style={styles.milestoneIconContainer}>
                  <Ionicons name="flag" size={24} color={Colors.primary} />
                </View>
                <View style={styles.milestoneHeaderText}>
                  <Text style={styles.milestoneTitle}>
                    {isInitialMilestone ? 'Your First Milestone' : 'Current Milestone'}
                  </Text>
                  <Text style={styles.milestoneSubtitle}>
                    AI-curated action plan for you
                  </Text>
                </View>
              </View>

              <View style={styles.milestoneContent}>
                {milestoneSession.actionPlan.map((step, index) => (
                  <View key={index} style={styles.milestoneStep}>
                    <View style={styles.milestoneStepNumber}>
                      <Text style={styles.milestoneStepNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.milestoneStepText}>{step}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.milestoneButton}
                onPress={() => setShowRoadmapModal(true)}
              >
                <Text style={styles.milestoneButtonText}>View Full Roadmap</Text>
                <Ionicons name="arrow-forward" size={18} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Get New Coaching Button */}
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                style={styles.coachingButton}
                onPress={() => router.push('/coaching')}
                activeOpacity={0.8}
              >
                <View style={styles.coachingButtonContent}>
                  <Ionicons name="add" size={28} color={Colors.white} />
                  <Text style={styles.coachingButtonText}>Get New Coaching</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>

            {/* Quick Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{profile?.sessions.length || 0}</Text>
                <Text style={styles.statLabel}>Sessions</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{profile?.currentStreak || 0}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {profile?.sessions.filter((s) => s.progressLog).length || 0}
                </Text>
                <Text style={styles.statLabel}>Logged</Text>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Daily Motivation Card */}
            <View style={styles.quoteCard}>
              <Text style={styles.quoteText}>{currentQuote.text}</Text>
              <Text style={styles.quoteAuthor}>– {currentQuote.author}</Text>
            </View>

            {/* Streak Tracker Card */}
            <View style={styles.streakCard}>
              <View style={styles.streakIconContainer}>
                <Text style={styles.streakIcon}>🔥</Text>
              </View>
              <View style={styles.streakContent}>
                <Text style={styles.streakTitle}>
                  {profile?.currentStreak || 0} Day Streak!
                </Text>
                {profile?.planName && profile?.planStartDate && profile?.transitionTimeline ? (
                  <Text style={styles.streakSubtitle}>
                    {getProgressMessage(
                      calculateCurrentDay(profile.planStartDate),
                      getRoadmapPlan(profile.transitionTimeline).totalDays,
                      profile.planName
                    )}
                  </Text>
                ) : (
                  <Text style={styles.streakSubtitle}>Keep the momentum going.</Text>
                )}
              </View>
            </View>

            {/* Get New Coaching Button */}
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                style={styles.coachingButton}
                onPress={() => router.push('/coaching')}
                activeOpacity={0.8}
              >
                <View style={styles.coachingButtonContent}>
                  <Ionicons name="add" size={28} color={Colors.white} />
                  <Text style={styles.coachingButtonText}>Get New Coaching</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>

            {/* Quick Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{profile?.sessions.length || 0}</Text>
                <Text style={styles.statLabel}>Sessions</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{profile?.currentStreak || 0}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {profile?.sessions.filter((s) => s.progressLog).length || 0}
                </Text>
                <Text style={styles.statLabel}>Logged</Text>
              </View>
            </View>

            {/* Career Goal Display */}
            {profile?.careerGoal && (
              <View style={styles.goalCard}>
                <Text style={styles.goalLabel}>Your Current Goal</Text>
                <Text style={styles.goalText}>{profile.careerGoal}</Text>
                {profile.currentRole && (
                  <Text style={styles.goalSubtext}>
                    From: {profile.currentRole}
                  </Text>
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Enhanced Roadmap Modal */}
      {profile?.transitionTimeline && roadmapPlan && (
        <EnhancedRoadmapModal
          visible={showRoadmapModal}
          onClose={() => setShowRoadmapModal(false)}
          roadmapPlan={roadmapPlan}
          currentDay={
            profile.planStartDate ? calculateCurrentDay(profile.planStartDate) : 1
          }
          onTaskToggle={handleTaskToggle}
          onAdjustTimeline={() => {
            setShowRoadmapModal(false);
            setTimeout(() => setShowTimelineAdjustment(true), 300);
          }}
        />
      )}

      {/* Monday Check-in Modal */}
      <MondayCheckinModal
        visible={showMondayCheckin}
        onClose={() => setShowMondayCheckin(false)}
        onSubmit={handleMondayCheckin}
      />

      {/* Phase Completion Modal */}
      {completedPhase && roadmapPlan && (
        <PhaseCompletionModal
          visible={showPhaseCompletion}
          onClose={handlePhaseCompletionClose}
          completedPhase={completedPhase}
          nextPhase={roadmapPlan.phases[completedPhase.number]}
          totalPhases={roadmapPlan.phases.length}
          completedPhasesCount={completedPhase.number}
        />
      )}

      {/* Timeline Adjustment Modal */}
      {profile?.transitionTimeline && (
        <TimelineAdjustmentModal
          visible={showTimelineAdjustment}
          onClose={() => setShowTimelineAdjustment(false)}
          currentTimeline={profile.transitionTimeline}
          onAdjust={handleTimelineAdjustment}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.navy,
  },
  greeting: {
    fontSize: 14,
    color: Colors.mediumGray,
    marginTop: 4,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  roadmapCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2', // Sky Blue
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  roadmapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  roadmapIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F7FF', // Light blue
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  roadmapHeaderText: {
    flex: 1,
  },
  roadmapPlanName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.navy,
    marginBottom: 4,
  },
  roadmapSubtitle: {
    fontSize: 14,
    color: '#4A90E2', // Sky Blue
    fontWeight: '600',
  },
  progressBarContainer: {
    marginTop: 4,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: Colors.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4A90E2', // Sky Blue
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 12,
    color: Colors.mediumGray,
    textAlign: 'right',
    fontWeight: '600',
  },
  challengeCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  challengeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF8E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  challengeHeaderText: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.navy,
  },
  challengeSubtitle: {
    fontSize: 12,
    color: Colors.mediumGray,
  },
  completedBadge: {
    marginLeft: 8,
  },
  challengeText: {
    fontSize: 14,
    color: Colors.navy,
    lineHeight: 20,
    marginBottom: 16,
  },
  challengeButton: {
    backgroundColor: Colors.warning,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  challengeButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  completedMessage: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 12,
  },
  completedMessageText: {
    color: Colors.success,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  communityCard: {
    backgroundColor: '#F0F7FF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  communityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  communityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginLeft: 8,
  },
  communityStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  communityStat: {
    flex: 1,
  },
  communityStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  communityStatLabel: {
    fontSize: 12,
    color: Colors.navy,
    lineHeight: 16,
  },
  communityStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.primary,
    opacity: 0.2,
    marginHorizontal: 16,
  },
  emptyState: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.navy,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.mediumGray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  emptyButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  quoteCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quoteText: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.navy,
    marginBottom: 12,
  },
  quoteAuthor: {
    fontSize: 14,
    color: Colors.mediumGray,
    fontStyle: 'italic',
  },
  streakCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  streakIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  streakIcon: {
    fontSize: 32,
  },
  streakContent: {
    flex: 1,
  },
  streakTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.navy,
    marginBottom: 4,
  },
  streakSubtitle: {
    fontSize: 14,
    color: Colors.mediumGray,
  },
  coachingButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  coachingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachingButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.mediumGray,
    fontWeight: '500',
  },
  goalCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  goalLabel: {
    fontSize: 12,
    color: Colors.mediumGray,
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  goalText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.navy,
  },
  goalSubtext: {
    fontSize: 14,
    color: Colors.mediumGray,
    marginTop: 4,
  },
  welcomeHeader: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.navy,
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: Colors.navy,
    lineHeight: 24,
  },
  welcomeHighlight: {
    fontWeight: '700',
    color: Colors.primary,
  },
  milestoneCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#50E3C2', // Mint Green accent
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  milestoneIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F9F4', // Light mint green
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  milestoneHeaderText: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.navy,
    marginBottom: 4,
  },
  milestoneSubtitle: {
    fontSize: 14,
    color: Colors.mediumGray,
  },
  milestoneContent: {
    marginBottom: 20,
  },
  milestoneStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  milestoneStepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  milestoneStepNumberText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  milestoneStepText: {
    flex: 1,
    fontSize: 15,
    color: Colors.navy,
    lineHeight: 22,
  },
  milestoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F7FF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  milestoneButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});
