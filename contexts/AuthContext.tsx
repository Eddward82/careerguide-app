import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { migrateLocalDataToCloud, fetchCloudData } from '@/utils/supabaseSync';
import { saveUserProfile, getUserProfile } from '@/utils/storage';
import { initializeRevenueCat, loginRevenueCatUser, logoutRevenueCatUser } from '@/utils/revenueCat';
import { UserProfile } from '@/types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize RevenueCat
    initializeRevenueCat().then((success) => {
      if (success) {
        console.log('✅ RevenueCat initialized');
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // If there's an existing session, log in to RevenueCat
      if (session?.user) {
        loginRevenueCatUser(session.user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // If user just signed in, migrate local data to cloud and log in to RevenueCat
      if (session?.user && _event === 'SIGNED_IN') {
        await handleUserSignIn(session.user.id);
        await loginRevenueCatUser(session.user.id);
      }

      // If user signed out, log out from RevenueCat
      if (_event === 'SIGNED_OUT') {
        await logoutRevenueCatUser();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Handle user sign-in: Migrate local data or fetch cloud data
   */
  const handleUserSignIn = async (userId: string) => {
    try {
      const localProfile = await getUserProfile();

      // If user has local data, migrate it to cloud
      if (localProfile && localProfile.name) {
        console.log('🔄 Migrating local data to cloud...');
        const migrationSuccess = await migrateLocalDataToCloud(userId);

        if (migrationSuccess) {
          console.log('✅ Migration successful!');
        } else {
          console.warn('⚠️ Migration had some issues, but continuing...');
        }
      } else {
        // If no local data, fetch from cloud
        console.log('📥 Fetching cloud data...');
        const cloudData = await fetchCloudData(userId);

        if (cloudData?.profile) {
          // Convert cloud profile to local format
          const localProfile: UserProfile = {
            name: cloudData.profile.name,
            currentRole: cloudData.profile.current_role,
            careerGoal: cloudData.profile.career_goal,
            yearsExperience: cloudData.profile.years_experience,
            transitionTimeline: cloudData.profile.timeline,
            currentStreak: cloudData.profile.current_streak,
            longestStreak: cloudData.profile.longest_streak || 0,
            lastActivityDate: cloudData.profile.last_active_date || new Date().toISOString(),
            hasCompletedOnboarding: true,
            sessions: [], // Will be loaded separately
            badges: [],
            weeklyChallenge: null,
            weeklyChallengeBonusStreak: 0,
            referralCode: '',
            darkMode: false,
            // Subscription fields
            subscriptionStatus: cloudData.profile.subscription_status || 'free',
            customizationsUsedTotal: cloudData.profile.customizations_used_total || 0,
            customizationLimit: cloudData.profile.customization_limit || 5,
            customizationLogs: [],
            revenueCatUserId: cloudData.profile.revenuecat_user_id,
          };

          await saveUserProfile(localProfile);
          console.log('✅ Cloud data synced to local storage');
        }
      }
    } catch (error) {
      console.error('❌ Error in handleUserSignIn:', error);
    }
  };

  /**
   * Sign up new user
   */
  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  /**
   * Sign in existing user
   */
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  /**
   * Sign out user
   */
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  /**
   * Send password reset email
   */
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'fastshot://reset-password',
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const value = {
    session,
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
