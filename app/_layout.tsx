import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '@/contexts/AuthContext';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/signup" />
        <Stack.Screen name="auth/forgot-password" />
        <Stack.Screen
          name="coaching"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom'
          }}
        />
        <Stack.Screen
          name="action-plan"
          options={{
            animation: 'slide_from_right'
          }}
        />
        <Stack.Screen
          name="session-detail"
          options={{
            animation: 'slide_from_right'
          }}
        />
        <Stack.Screen
          name="pro-upgrade"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom'
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
