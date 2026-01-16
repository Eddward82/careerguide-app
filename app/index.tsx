import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { getUserProfile } from '@/utils/storage';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/Colors';
import * as SplashScreen from 'expo-splash-screen';

export default function Index() {
  const { user, loading: authLoading } = useAuth();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      checkOnboardingStatus();
    }
  }, [authLoading, user]);

  const checkOnboardingStatus = async () => {
    try {
      const profile = await getUserProfile();
      setHasCompletedOnboarding(profile.hasCompletedOnboarding);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    } finally {
      setCheckingOnboarding(false);
      await SplashScreen.hideAsync();
    }
  };

  // Show loading while checking auth or onboarding
  if (authLoading || checkingOnboarding) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // If not authenticated, redirect to signup (first-time users)
  if (!user) {
    return <Redirect href="/auth/signup" />;
  }

  // If authenticated but hasn't completed onboarding, go to onboarding
  if (!hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  // If authenticated and completed onboarding, go to tabs
  return <Redirect href="/(tabs)" />;
}
