export type CareerGoal =
  | 'Switching to Tech'
  | 'Moving to Management'
  | 'Resume Refresh'
  | 'Career Pivot'
  | 'Skill Development';

export interface CoachingSession {
  id: string;
  date: string;
  challenge: string;
  actionPlan: string[];
  createdAt: number;
  progressLog?: string;
}

export interface UserProfile {
  careerGoal: CareerGoal;
  currentStreak: number;
  lastActivityDate: string;
  hasCompletedOnboarding: boolean;
  sessions: CoachingSession[];
}

export interface DailyProgress {
  date: string;
  sessionId: string;
  note: string;
}
