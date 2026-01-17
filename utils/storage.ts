import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  UserProfile,
  CoachingSession,
  CareerGoal,
  TransitionTimeline,
  TransitionDriver,
  Badge,
  BadgeType,
  WeeklyChallenge
} from '@/types';
import { supabase } from '@/lib/supabase';
import { syncProfileToCloud, syncSessionToCloud } from '@/utils/supabaseSync';

const STORAGE_KEYS = {
  USER_PROFILE: '@careerguide_user_profile',
  SESSIONS: '@careerguide_sessions',
};

/**
 * Get current authenticated user ID for cloud sync
 */
const getCurrentUserId = async (): Promise<string | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id ?? null;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};

// Generate unique referral code
const generateReferralCode = (): string => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

// Initialize badges
const initializeBadges = (): Badge[] => {
  return [
    {
      type: 'first_win',
      name: 'First Win',
      description: 'Completed your first coaching session',
      isUnlocked: false,
    },
    {
      type: 'week_warrior',
      name: 'Week Warrior',
      description: 'Maintained a 7-day streak',
      isUnlocked: false,
    },
    {
      type: 'career_launcher',
      name: 'Career Launcher',
      description: 'Maintained a 30-day streak',
      isUnlocked: false,
    },
    {
      type: 'insight_collector',
      name: 'Insight Collector',
      description: 'Completed 10 coaching sessions',
      isUnlocked: false,
    },
    {
      type: 'challenge_master',
      name: 'Challenge Master',
      description: 'Completed 5 weekly challenges',
      isUnlocked: false,
    },
  ];
};

// Generate weekly challenge
const generateWeeklyChallenge = (): WeeklyChallenge => {
  const challenges = [
    'Network with 3 people in your target field',
    'Update your LinkedIn profile with new skills',
    'Complete one online course module',
    'Attend a virtual industry meetup or webinar',
    'Practice one technical interview question daily',
    'Read 3 articles about your target industry',
    'Reach out to a mentor or career coach',
    'Revise your resume with new achievements',
    'Schedule 2 informational interviews',
    'Complete a side project or portfolio piece',
  ];

  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + daysToMonday);
  monday.setHours(0, 0, 0, 0);

  return {
    id: monday.toISOString(),
    text: challenges[Math.floor(Math.random() * challenges.length)],
    weekStartDate: monday.toISOString(),
    isCompleted: false,
  };
};

// Default user profile
const defaultProfile: UserProfile = {
  name: '',
  careerGoal: 'Switching to Tech',
  currentRole: '',
  yearsExperience: 0,
  transitionTimeline: '3-6m',
  currentStreak: 0,
  lastActivityDate: '',
  hasCompletedOnboarding: false,
  sessions: [],
  badges: initializeBadges(),
  weeklyChallenge: null,
  weeklyChallengeBonusStreak: 0,
  referralCode: generateReferralCode(),
  darkMode: false,
};

// Get user profile
export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (data) {
      const profile = JSON.parse(data);
      // Ensure all new fields exist (for existing users)
      if (!profile.badges) profile.badges = initializeBadges();
      if (!profile.referralCode) profile.referralCode = generateReferralCode();
      if (profile.darkMode === undefined) profile.darkMode = false;
      if (!profile.name) profile.name = '';
      if (!profile.currentRole) profile.currentRole = '';
      if (!profile.yearsExperience) profile.yearsExperience = 0;
      if (!profile.transitionTimeline) profile.transitionTimeline = '3-6m';
      if (!profile.weeklyChallengeBonusStreak) profile.weeklyChallengeBonusStreak = 0;

      // Check if weekly challenge needs refresh
      if (profile.weeklyChallenge) {
        const challengeDate = new Date(profile.weeklyChallenge.weekStartDate);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - challengeDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff >= 7) {
          profile.weeklyChallenge = generateWeeklyChallenge();
        }
      } else {
        profile.weeklyChallenge = generateWeeklyChallenge();
      }

      await saveUserProfile(profile);
      return profile;
    }
    return defaultProfile;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return defaultProfile;
  }
};

// Save user profile
export const saveUserProfile = async (profile: UserProfile): Promise<void> => {
  try {
    // Save locally first
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));

    // Sync to cloud if user is authenticated
    const userId = await getCurrentUserId();
    if (userId) {
      await syncProfileToCloud(userId, profile);
    }
  } catch (error) {
    console.error('Error saving user profile:', error);
  }
};

// Complete onboarding
export const completeOnboarding = async (
  name: string,
  careerGoal: CareerGoal,
  currentRole: string,
  yearsExperience: number,
  transitionTimeline: TransitionTimeline,
  transitionDriver?: TransitionDriver,
  planStartDate?: string,
  planName?: string
): Promise<void> => {
  try {
    const profile = await getUserProfile();
    profile.name = name;
    profile.careerGoal = careerGoal;
    profile.currentRole = currentRole;
    profile.yearsExperience = yearsExperience;
    profile.transitionTimeline = transitionTimeline;
    profile.transitionDriver = transitionDriver;
    profile.planStartDate = planStartDate;
    profile.planName = planName;
    profile.hasCompletedOnboarding = true;
    await saveUserProfile(profile);
  } catch (error) {
    console.error('Error completing onboarding:', error);
  }
};

// Update career goal (legacy support)
export const updateCareerGoal = async (goal: CareerGoal): Promise<void> => {
  try {
    const profile = await getUserProfile();
    profile.careerGoal = goal;
    profile.hasCompletedOnboarding = true;
    await saveUserProfile(profile);
  } catch (error) {
    console.error('Error updating career goal:', error);
  }
};

// Add coaching session
export const addCoachingSession = async (session: CoachingSession): Promise<void> => {
  try {
    const profile = await getUserProfile();
    profile.sessions = [session, ...profile.sessions];

    // Check for badge unlocks
    await checkAndUnlockBadges(profile);

    await saveUserProfile(profile);

    // Sync session to cloud if user is authenticated
    const userId = await getCurrentUserId();
    if (userId) {
      await syncSessionToCloud(userId, session);
    }
  } catch (error) {
    console.error('Error adding coaching session:', error);
  }
};

// Update streak
export const updateStreak = async (): Promise<number> => {
  try {
    const profile = await getUserProfile();
    const today = new Date().toDateString();
    const lastActivity = new Date(profile.lastActivityDate).toDateString();

    if (lastActivity === today) {
      return profile.currentStreak;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if (lastActivity === yesterdayStr) {
      profile.currentStreak += 1;
    } else if (lastActivity !== today) {
      profile.currentStreak = 1;
    }

    profile.lastActivityDate = new Date().toISOString();

    // Check for badge unlocks
    await checkAndUnlockBadges(profile);

    await saveUserProfile(profile);
    return profile.currentStreak;
  } catch (error) {
    console.error('Error updating streak:', error);
    return 0;
  }
};

// Complete weekly challenge
export const completeWeeklyChallenge = async (): Promise<void> => {
  try {
    const profile = await getUserProfile();
    if (profile.weeklyChallenge && !profile.weeklyChallenge.isCompleted) {
      profile.weeklyChallenge.isCompleted = true;
      profile.weeklyChallenge.completedAt = new Date().toISOString();
      profile.weeklyChallengeBonusStreak += 1;
      profile.currentStreak += 1; // Bonus streak point

      // Check for badge unlocks
      await checkAndUnlockBadges(profile);

      await saveUserProfile(profile);
    }
  } catch (error) {
    console.error('Error completing weekly challenge:', error);
  }
};

// Check and unlock badges
const checkAndUnlockBadges = async (profile: UserProfile): Promise<Badge[]> => {
  const newlyUnlocked: Badge[] = [];

  profile.badges.forEach((badge) => {
    if (!badge.isUnlocked) {
      let shouldUnlock = false;

      switch (badge.type) {
        case 'first_win':
          shouldUnlock = profile.sessions.length >= 1;
          break;
        case 'week_warrior':
          shouldUnlock = profile.currentStreak >= 7;
          break;
        case 'career_launcher':
          shouldUnlock = profile.currentStreak >= 30;
          break;
        case 'insight_collector':
          shouldUnlock = profile.sessions.length >= 10;
          break;
        case 'challenge_master':
          shouldUnlock = profile.weeklyChallengeBonusStreak >= 5;
          break;
      }

      if (shouldUnlock) {
        badge.isUnlocked = true;
        badge.unlockedAt = new Date().toISOString();
        newlyUnlocked.push(badge);
      }
    }
  });

  return newlyUnlocked;
};

// Get newly unlocked badges
export const getNewlyUnlockedBadges = async (): Promise<Badge[]> => {
  const profile = await getUserProfile();
  return await checkAndUnlockBadges(profile);
};

// Add progress log to session
export const addProgressLog = async (sessionId: string, note: string): Promise<void> => {
  try {
    const profile = await getUserProfile();
    const sessionIndex = profile.sessions.findIndex(s => s.id === sessionId);

    if (sessionIndex !== -1) {
      profile.sessions[sessionIndex].progressLog = note;
      await saveUserProfile(profile);

      // Sync updated session to cloud if user is authenticated
      const userId = await getCurrentUserId();
      if (userId) {
        await syncSessionToCloud(userId, profile.sessions[sessionIndex]);
      }
    }
  } catch (error) {
    console.error('Error adding progress log:', error);
  }
};

// Get all sessions
export const getAllSessions = async (): Promise<CoachingSession[]> => {
  try {
    const profile = await getUserProfile();
    return profile.sessions;
  } catch (error) {
    console.error('Error getting sessions:', error);
    return [];
  }
};

// Toggle dark mode
export const toggleDarkMode = async (): Promise<boolean> => {
  try {
    const profile = await getUserProfile();
    profile.darkMode = !profile.darkMode;
    await saveUserProfile(profile);
    return profile.darkMode;
  } catch (error) {
    console.error('Error toggling dark mode:', error);
    return false;
  }
};

// Clear all data (for testing)
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};
