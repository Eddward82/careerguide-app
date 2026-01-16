import { supabase } from '@/lib/supabase';
import { getUserProfile, getAllSessions } from './storage';
import { UserProfile, CoachingSession } from '@/types';

/**
 * CRITICAL: Local-to-Cloud Migration
 * This function migrates all existing AsyncStorage data to Supabase
 * Called automatically when user first authenticates
 */
export async function migrateLocalDataToCloud(userId: string): Promise<boolean> {
  try {
    console.log('🔄 Starting local-to-cloud migration...');

    // 1. Get all local data
    const localProfile = await getUserProfile();
    const localSessions = await getAllSessions();

    if (!localProfile) {
      console.log('⚠️ No local profile found, skipping migration');
      return true;
    }

    // 2. Migrate user profile
    console.log('📤 Migrating profile data...');
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId,
      name: localProfile.name,
      current_role: localProfile.currentRole,
      career_goal: localProfile.careerGoal,
      years_experience: localProfile.yearsExperience,
      timeline: localProfile.transitionTimeline,
      current_streak: localProfile.currentStreak,
      longest_streak: localProfile.longestStreak || localProfile.currentStreak,
      last_active_date: new Date().toISOString(),
    });

    if (profileError) {
      console.error('❌ Profile migration failed:', profileError);
      throw profileError;
    }

    // 3. Migrate coaching sessions
    if (localSessions.length > 0) {
      console.log(`📤 Migrating ${localSessions.length} coaching sessions...`);

      const sessionsToMigrate = localSessions.map((session) => ({
        id: session.id,
        user_id: userId,
        date: session.date,
        challenge: session.challenge,
        action_plan: session.actionPlan,
        progress_log: session.progressLog || null,
        created_at: new Date(session.createdAt).toISOString(),
      }));

      const { error: sessionsError } = await supabase
        .from('coaching_sessions')
        .upsert(sessionsToMigrate);

      if (sessionsError) {
        console.error('❌ Sessions migration failed:', sessionsError);
        throw sessionsError;
      }
    }

    // 4. Migrate badges (if user has unlocked any)
    // Badges are typically unlocked based on sessions/streaks, so we'll check
    console.log('📤 Checking for badges to migrate...');
    await migrateBadges(userId, localProfile, localSessions);

    console.log('✅ Migration completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return false;
  }
}

/**
 * Migrate badges based on user's achievements
 */
async function migrateBadges(
  userId: string,
  profile: UserProfile,
  sessions: CoachingSession[]
): Promise<void> {
  const badges = [];

  // First Session Badge
  if (sessions.length >= 1) {
    badges.push({
      id: 'first-session',
      user_id: userId,
      badge_type: 'firstSession',
      title: 'First Step',
      description: 'Completed your first coaching session',
      icon: 'rocket',
      unlocked_at: sessions[0].date,
    });
  }

  // Week Streak Badge
  if (profile.currentStreak >= 7 || (profile.longestStreak && profile.longestStreak >= 7)) {
    badges.push({
      id: 'week-streak',
      user_id: userId,
      badge_type: 'weekStreak',
      title: 'Week Warrior',
      description: 'Maintained a 7-day streak',
      icon: 'flame',
      unlocked_at: new Date().toISOString(),
    });
  }

  // Progress Logger Badge
  const sessionsWithProgress = sessions.filter((s) => s.progressLog);
  if (sessionsWithProgress.length >= 1) {
    badges.push({
      id: 'first-progress',
      user_id: userId,
      badge_type: 'firstProgress',
      title: 'Progress Tracker',
      description: 'Logged your first progress update',
      icon: 'checkmark-circle',
      unlocked_at: sessionsWithProgress[0].date,
    });
  }

  // Insert badges if any exist
  if (badges.length > 0) {
    const { error } = await supabase.from('badges').upsert(badges);
    if (error) {
      console.error('⚠️ Badge migration error:', error);
    } else {
      console.log(`✅ Migrated ${badges.length} badges`);
    }
  }
}

/**
 * Sync profile data to cloud
 */
export async function syncProfileToCloud(
  userId: string,
  profile: Partial<UserProfile>
): Promise<boolean> {
  try {
    const updateData: any = {};

    if (profile.name) updateData.name = profile.name;
    if (profile.currentRole) updateData.current_role = profile.currentRole;
    if (profile.careerGoal) updateData.career_goal = profile.careerGoal;
    if (profile.yearsExperience !== undefined)
      updateData.years_experience = profile.yearsExperience;
    if (profile.transitionTimeline) updateData.timeline = profile.transitionTimeline;
    if (profile.currentStreak !== undefined)
      updateData.current_streak = profile.currentStreak;
    if (profile.longestStreak !== undefined)
      updateData.longest_streak = profile.longestStreak;

    updateData.last_active_date = new Date().toISOString();

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      console.error('❌ Profile sync failed:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Profile sync error:', error);
    return false;
  }
}

/**
 * Sync coaching session to cloud
 */
export async function syncSessionToCloud(
  userId: string,
  session: CoachingSession
): Promise<boolean> {
  try {
    const { error } = await supabase.from('coaching_sessions').upsert({
      id: session.id,
      user_id: userId,
      date: session.date,
      challenge: session.challenge,
      action_plan: session.actionPlan,
      progress_log: session.progressLog || null,
      created_at: new Date(session.createdAt).toISOString(),
    });

    if (error) {
      console.error('❌ Session sync failed:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Session sync error:', error);
    return false;
  }
}

/**
 * Sync badge unlock to cloud
 */
export async function syncBadgeToCloud(
  userId: string,
  badgeData: {
    id: string;
    type: string;
    title: string;
    description: string;
    icon: string;
  }
): Promise<boolean> {
  try {
    const { error } = await supabase.from('badges').upsert({
      id: badgeData.id,
      user_id: userId,
      badge_type: badgeData.type,
      title: badgeData.title,
      description: badgeData.description,
      icon: badgeData.icon,
      unlocked_at: new Date().toISOString(),
    });

    if (error) {
      console.error('❌ Badge sync failed:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Badge sync error:', error);
    return false;
  }
}

/**
 * Fetch user data from cloud
 */
export async function fetchCloudData(userId: string) {
  try {
    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    // Fetch sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('coaching_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (sessionsError) throw sessionsError;

    // Fetch badges
    const { data: badges, error: badgesError } = await supabase
      .from('badges')
      .select('*')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });

    if (badgesError) throw badgesError;

    return { profile, sessions: sessions || [], badges: badges || [] };
  } catch (error) {
    console.error('❌ Failed to fetch cloud data:', error);
    return null;
  }
}
