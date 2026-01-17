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
import { resources } from '@/data/mockData';
import { getUserProfile } from '@/utils/storage';
import { CareerGoal, Resource, UserProfile } from '@/types';
import AIRecommendedBadge from '@/components/AIRecommendedBadge';
import SmartMatchWelcome from '@/components/SmartMatchWelcome';
import { isFirstResourceVisit, markResourceVisited } from '@/utils/notifications';
import { getRoadmapPlan, calculateCurrentDay, getCurrentPhase } from '@/utils/roadmap';

const categoryColors = {
  'LinkedIn Articles': '#0077B5',
  'Top Courses': '#FF6F00',
  'Networking Groups': '#7B1FA2',
};

const categoryIcons = {
  'LinkedIn Articles': 'newspaper' as const,
  'Top Courses': 'school' as const,
  'Networking Groups': 'people' as const,
};

export default function ResourcesScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [careerGoal, setCareerGoal] = useState<CareerGoal | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showWelcome, setShowWelcome] = useState(false);
  const [currentPhaseNumber, setCurrentPhaseNumber] = useState<number>(1);

  useEffect(() => {
    loadProfileAndCheckFirstVisit();
  }, []);

  const loadProfileAndCheckFirstVisit = async () => {
    const userProfile = await getUserProfile();
    setProfile(userProfile);
    setCareerGoal(userProfile.careerGoal);

    // Get current phase for resource gating
    if (userProfile.transitionTimeline && userProfile.planStartDate) {
      try {
        const plan = getRoadmapPlan(userProfile.transitionTimeline);
        const currentDay = calculateCurrentDay(userProfile.planStartDate);
        const currentPhase = getCurrentPhase(currentDay, plan);
        setCurrentPhaseNumber(currentPhase.number);
      } catch (error) {
        console.error('Error getting current phase:', error);
      }
    }

    // Check if this is first visit to Resources
    const isFirst = await isFirstResourceVisit();
    setShowWelcome(isFirst);
  };

  // Helper function to determine if a resource is unlocked based on phase
  const isResourceUnlocked = (resourceId: string): boolean => {
    // Define phase gating rules
    const phaseGating: Record<string, number> = {
      // Phase 1: Basic resources (Resume, LinkedIn basics)
      'l3': 1, // Resume article
      'l1': 1, // Tech roadmap article
      'c2': 1, // CS50 course

      // Phase 2-3: Intermediate resources (Courses, Networking)
      'l2': 2, // Management article
      'c1': 2, // Google PM Certificate
      'c3': 2, // Web Dev Bootcamp
      'n1': 2, // Tech meetups

      // Phase 4+: Advanced resources (Interview prep, Advanced networking)
      'l4': 4, // Salary negotiation
      'c4': 4, // Interview prep
      'n2': 4, // Product managers group
      'n3': 4, // Women in Tech
    };

    const requiredPhase = phaseGating[resourceId];

    // If resource is not gated, it's always unlocked
    if (!requiredPhase) {
      return true;
    }

    // Check if user has reached the required phase
    return currentPhaseNumber >= requiredPhase;
  };

  const handleDismissWelcome = async () => {
    setShowWelcome(false);
    await markResourceVisited();
  };

  const categories = ['all', 'LinkedIn Articles', 'Top Courses', 'Networking Groups'];

  const filteredResources = resources
    .filter((resource) => {
      if (selectedCategory === 'all') {
        return true;
      }
      return resource.category === selectedCategory;
    })
    .sort((a, b) => {
      // Sort AI-recommended resources to the top
      const aRecommended = careerGoal && a.relevantTo.includes(careerGoal);
      const bRecommended = careerGoal && b.relevantTo.includes(careerGoal);

      if (aRecommended && !bRecommended) return -1;
      if (!aRecommended && bRecommended) return 1;
      return 0;
    });

  const handleOpenResource = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Resources</Text>
        <Text style={styles.headerSubtitle}>
          Curated for your career transition
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Smart Match Welcome Card */}
        {showWelcome && profile && (
          <SmartMatchWelcome
            currentRole={profile.currentRole}
            targetGoal={profile.careerGoal}
            onDismiss={handleDismissWelcome}
          />
        )}

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category && styles.categoryChipTextActive,
                ]}
              >
                {category === 'all' ? 'All' : category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Resources List */}
        {filteredResources.map((resource) => {
          const isUnlocked = isResourceUnlocked(resource.id);

          return (
            <TouchableOpacity
              key={resource.id}
              style={[styles.resourceCard, !isUnlocked && styles.resourceCardLocked]}
              onPress={() => isUnlocked && handleOpenResource(resource.url)}
              activeOpacity={isUnlocked ? 0.7 : 1}
              disabled={!isUnlocked}
            >
              <View
                style={[
                  styles.resourceIcon,
                  {
                    backgroundColor: isUnlocked
                      ? categoryColors[resource.category] + '20'
                      : Colors.lightGray,
                  },
                ]}
              >
                <Ionicons
                  name={isUnlocked ? categoryIcons[resource.category] : 'lock-closed'}
                  size={24}
                  color={
                    isUnlocked ? categoryColors[resource.category] : Colors.mediumGray
                  }
                />
              </View>

              <View style={styles.resourceContent}>
                <View style={styles.resourceHeader}>
                  {!isUnlocked && (
                    <View style={styles.lockedBadge}>
                      <Ionicons name="lock-closed" size={12} color={Colors.white} />
                      <Text style={styles.lockedBadgeText}>
                        Unlocks in Phase {/* You can calculate required phase here */}
                      </Text>
                    </View>
                  )}
                  {isUnlocked && (
                    <>
                      <View
                        style={[
                          styles.categoryBadge,
                          { backgroundColor: categoryColors[resource.category] },
                        ]}
                      >
                        <Text style={styles.categoryBadgeText}>{resource.category}</Text>
                      </View>
                      {careerGoal && resource.relevantTo.includes(careerGoal) && (
                        <AIRecommendedBadge goal={careerGoal} />
                      )}
                    </>
                  )}
                </View>

                <Text
                  style={[
                    styles.resourceTitle,
                    !isUnlocked && styles.resourceTitleLocked,
                  ]}
                >
                  {resource.title}
                </Text>
                <Text
                  style={[
                    styles.resourceDescription,
                    !isUnlocked && styles.resourceDescriptionLocked,
                  ]}
                >
                  {isUnlocked
                    ? resource.description
                    : 'Complete more phases to unlock this premium resource'}
                </Text>

                <View style={styles.resourceFooter}>
                  {isUnlocked ? (
                    <>
                      <Text style={styles.resourceLink}>Open resource</Text>
                      <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
                    </>
                  ) : (
                    <>
                      <Text style={styles.resourceLinkLocked}>Locked</Text>
                      <Ionicons name="lock-closed" size={16} color={Colors.mediumGray} />
                    </>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {filteredResources.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={48} color={Colors.mediumGray} />
            <Text style={styles.emptyText}>No resources found</Text>
          </View>
        )}
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
    paddingBottom: 100,
  },
  categoryScroll: {
    marginTop: 16,
  },
  categoryContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 8,
  },
  categoryChip: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.navy,
  },
  categoryChipTextActive: {
    color: Colors.white,
  },
  resourceCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  resourceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resourceContent: {
    flex: 1,
  },
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.white,
  },
  resourceTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.navy,
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 13,
    color: Colors.mediumGray,
    lineHeight: 18,
    marginBottom: 8,
  },
  resourceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resourceLink: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    marginRight: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.mediumGray,
    marginTop: 16,
  },
  resourceCardLocked: {
    opacity: 0.6,
    backgroundColor: '#F8F9FA',
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.mediumGray,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  lockedBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.white,
    marginLeft: 4,
  },
  resourceTitleLocked: {
    color: Colors.mediumGray,
  },
  resourceDescriptionLocked: {
    fontStyle: 'italic',
  },
  resourceLinkLocked: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.mediumGray,
    marginRight: 4,
  },
});
