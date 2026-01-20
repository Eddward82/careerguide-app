import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { successStories } from '@/data/mockData';
import { getUserProfile } from '@/utils/storage';
import { CareerGoal } from '@/types';

export default function StoriesScreen() {
  const [careerGoal, setCareerGoal] = useState<CareerGoal | null>(null);

  useEffect(() => {
    loadCareerGoal();
  }, []);

  const loadCareerGoal = async () => {
    const profile = await getUserProfile();
    setCareerGoal(profile.careerGoal);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Success Stories</Text>
        <Text style={styles.headerSubtitle}>
          Real transitions, real results
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {successStories.map((story) => (
          <View key={story.id} style={styles.storyCard}>
            <View style={styles.storyHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarEmoji}>{story.avatar}</Text>
              </View>
              <View style={styles.storyHeaderText}>
                <Text style={styles.storyName}>{story.name}</Text>
                <View style={styles.transitionBadge}>
                  <Text style={styles.transitionText}>
                    {story.fromRole} → {story.toRole}
                  </Text>
                </View>
              </View>
              <View style={styles.durationBadge}>
                <Ionicons name="time" size={16} color={Colors.success} />
                <Text style={styles.durationText}>{story.duration}</Text>
              </View>
            </View>

            <Text style={styles.quote}>&quot;{story.quote}&quot;</Text>

            <View style={styles.milestones}>
              <Text style={styles.milestonesTitle}>Key Milestones</Text>
              {story.milestones.map((milestone, index) => (
                <View key={index} style={styles.milestone}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={Colors.success}
                  />
                  <Text style={styles.milestoneText}>{milestone}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.ctaCard}>
          <Text style={styles.ctaTitle}>Ready to write your success story?</Text>
          <Text style={styles.ctaSubtitle}>
            Join thousands of professionals making successful career transitions with AI-powered guidance.
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => Linking.openURL('https://pathforward.app/join')}
          >
            <Text style={styles.ctaButtonText}>Start Your Journey</Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.white} />
          </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.navy,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.mediumGray,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  storyCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarEmoji: {
    fontSize: 28,
  },
  storyHeaderText: {
    flex: 1,
  },
  storyName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.navy,
    marginBottom: 4,
  },
  transitionBadge: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  transitionText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.success,
    marginLeft: 4,
  },
  quote: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.navy,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  milestones: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
  },
  milestonesTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.navy,
    marginBottom: 12,
  },
  milestone: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  milestoneText: {
    fontSize: 14,
    color: Colors.navy,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  ctaCard: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 24,
    marginTop: 8,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
    lineHeight: 20,
    marginBottom: 20,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
  },
  ctaButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});
