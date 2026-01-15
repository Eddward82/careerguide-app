export type CareerGoal =
  | 'Switching to Tech'
  | 'Moving to Management'
  | 'Resume Refresh'
  | 'Career Pivot'
  | 'Skill Development';

export type TransitionTimeline = '1-3m' | '3-6m' | '6-12m' | '12m+';

export type BadgeType =
  | 'week_warrior'    // 7-day streak
  | 'career_launcher' // 30-day streak
  | 'insight_collector' // 10 coaching sessions
  | 'first_win'       // First coaching session
  | 'challenge_master'; // 5 weekly challenges completed

export interface Badge {
  type: BadgeType;
  name: string;
  description: string;
  unlockedAt?: string;
  isUnlocked: boolean;
}

export interface WeeklyChallenge {
  id: string;
  text: string;
  weekStartDate: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface CoachingSession {
  id: string;
  date: string;
  challenge: string;
  actionPlan: string[];
  createdAt: number;
  progressLog?: string;
}

export interface UserProfile {
  // Onboarding info
  name: string;
  careerGoal: CareerGoal;
  currentRole: string;
  yearsExperience: number;
  transitionTimeline: TransitionTimeline;

  // Progress tracking
  currentStreak: number;
  lastActivityDate: string;
  hasCompletedOnboarding: boolean;
  sessions: CoachingSession[];

  // Engagement features
  badges: Badge[];
  weeklyChallenge: WeeklyChallenge | null;
  weeklyChallengeBonusStreak: number;
  referralCode: string;

  // Settings
  darkMode: boolean;
  accountabilityTime?: string; // e.g., "Monday-18:00"
}

export interface DailyProgress {
  date: string;
  sessionId: string;
  note: string;
}

export interface SuccessStory {
  id: string;
  name: string;
  fromRole: string;
  toRole: string;
  duration: string;
  quote: string;
  milestones: string[];
  avatar: string;
}

export interface Resource {
  id: string;
  title: string;
  category: 'LinkedIn Articles' | 'Top Courses' | 'Networking Groups';
  url: string;
  description: string;
  relevantTo: CareerGoal[];
}
