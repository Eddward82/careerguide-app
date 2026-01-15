import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, CoachingSession, CareerGoal } from '@/types';

const STORAGE_KEYS = {
  USER_PROFILE: '@careerguide_user_profile',
  SESSIONS: '@careerguide_sessions',
};

// Default user profile
const defaultProfile: UserProfile = {
  careerGoal: 'Switching to Tech',
  currentStreak: 0,
  lastActivityDate: '',
  hasCompletedOnboarding: false,
  sessions: [],
};

// Get user profile
export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (data) {
      return JSON.parse(data);
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
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (error) {
    console.error('Error saving user profile:', error);
  }
};

// Update career goal
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
    await saveUserProfile(profile);
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
      // Already logged today, return current streak
      return profile.currentStreak;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if (lastActivity === yesterdayStr) {
      // Continue streak
      profile.currentStreak += 1;
    } else if (lastActivity !== today) {
      // Reset streak
      profile.currentStreak = 1;
    }

    profile.lastActivityDate = new Date().toISOString();
    await saveUserProfile(profile);
    return profile.currentStreak;
  } catch (error) {
    console.error('Error updating streak:', error);
    return 0;
  }
};

// Add progress log to session
export const addProgressLog = async (sessionId: string, note: string): Promise<void> => {
  try {
    const profile = await getUserProfile();
    const sessionIndex = profile.sessions.findIndex(s => s.id === sessionId);

    if (sessionIndex !== -1) {
      profile.sessions[sessionIndex].progressLog = note;
      await saveUserProfile(profile);
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

// Clear all data (for testing)
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};
