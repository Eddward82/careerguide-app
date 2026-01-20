import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Alert,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { getAllSessions, getUserProfile } from '@/utils/storage';
import { CoachingSession, UserProfile } from '@/types';
import ShareJourneyCard from '@/components/ShareJourneyCard';

export default function HistoryScreen() {
  const router = useRouter();
  const [sessions, setSessions] = useState<CoachingSession[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSessions();
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const userProfile = await getUserProfile();
    setProfile(userProfile);
  };

  const loadSessions = async () => {
    setRefreshing(true);
    const allSessions = await getAllSessions();
    setSessions(allSessions);
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const handleExportPDF = async () => {
    try {
      const profile = await getUserProfile();

      // Create a text summary of the journey
      let summary = `PATHFORWARD COACHING JOURNEY\n`;
      summary += `Career Goal: ${profile.careerGoal}\n`;
      summary += `Current Streak: ${profile.currentStreak} days\n`;
      summary += `Total Sessions: ${sessions.length}\n\n`;
      summary += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

      sessions.forEach((session, index) => {
        summary += `SESSION ${index + 1}\n`;
        summary += `Date: ${new Date(session.date).toLocaleDateString()}\n\n`;
        summary += `Challenge:\n${session.challenge}\n\n`;
        summary += `Action Plan:\n`;
        session.actionPlan.forEach((step, i) => {
          summary += `${i + 1}. ${step}\n`;
        });
        if (session.progressLog) {
          summary += `\nProgress Logged:\n${session.progressLog}\n`;
        }
        summary += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      });

      // Share the summary (simulates PDF export)
      await Share.share({
        message: summary,
        title: 'My PathForward Journey',
      });
    } catch (error) {
      console.error('Error exporting:', error);
      Alert.alert('Export Failed', 'Could not export your journey summary.');
    }
  };

  const handleSessionPress = (session: CoachingSession) => {
    router.push({
      pathname: '/session-detail',
      params: { sessionId: session.id },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Journey</Text>
        <TouchableOpacity
          style={styles.exportButton}
          onPress={handleExportPDF}
        >
          <Ionicons name="document-text-outline" size={20} color={Colors.primary} />
          <Text style={styles.exportButtonText}>Export PDF</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <View>
            {refreshing && <Text>Loading...</Text>}
          </View>
        }
      >
        {/* Share Journey Card - Only show when user has progress */}
        {profile && sessions.length > 0 && (
          <View style={styles.shareSection}>
            <ShareJourneyCard
              name={profile.name}
              streak={profile.currentStreak}
              targetGoal={profile.careerGoal}
              sessionsCount={sessions.length}
            />
          </View>
        )}

        {sessions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={64} color={Colors.lightGray} />
            <Text style={styles.emptyTitle}>Your Journey Starts Here</Text>
            <Text style={styles.emptySubtitle}>
              Your action plan sessions will appear here as you progress through your roadmap.
            </Text>
          </View>
        ) : (
          <View style={styles.timelineContainer}>
            {sessions.map((session, index) => (
              <TouchableOpacity
                key={session.id}
                style={styles.timelineItem}
                onPress={() => handleSessionPress(session)}
                activeOpacity={0.7}
              >
                <View style={styles.timelineMarker}>
                  <View
                    style={[
                      styles.timelineDot,
                      index === 0 && styles.timelineDotRecent,
                    ]}
                  />
                  {index !== sessions.length - 1 && (
                    <View style={styles.timelineLine} />
                  )}
                </View>

                <View style={styles.sessionCard}>
                  <View style={styles.sessionHeader}>
                    <Text style={styles.sessionDate}>
                      {formatDate(session.date)}
                    </Text>
                    {session.progressLog && (
                      <View style={styles.loggedBadge}>
                        <Ionicons
                          name="checkmark-circle"
                          size={16}
                          color={Colors.success}
                        />
                        <Text style={styles.loggedBadgeText}>Logged</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.sessionChallenge} numberOfLines={2}>
                    {session.challenge}
                  </Text>

                  <Text style={styles.sessionSteps}>
                    {session.actionPlan.length} action steps
                  </Text>

                  <View style={styles.sessionFooter}>
                    <Text style={styles.tapToView}>Tap to view details</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={Colors.mediumGray}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.noteContainer}>
          <Ionicons name="information-circle" size={20} color={Colors.primary} />
          <Text style={styles.noteText}>
            Coaching history builds emotional connection and tracks your growth
            over time.
          </Text>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.navy,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  exportButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  shareSection: {
    marginBottom: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.navy,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.mediumGray,
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  startButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  timelineContainer: {
    paddingVertical: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timelineMarker: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    marginTop: 8,
  },
  timelineDotRecent: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.success,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.lightGray,
    marginTop: 4,
  },
  sessionCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionDate: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.mediumGray,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  loggedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  loggedBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.success,
    marginLeft: 4,
  },
  sessionChallenge: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.navy,
    marginBottom: 8,
    lineHeight: 20,
  },
  sessionSteps: {
    fontSize: 12,
    color: Colors.mediumGray,
    marginBottom: 8,
  },
  sessionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tapToView: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F7FF',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  noteText: {
    fontSize: 12,
    color: Colors.primary,
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
});
