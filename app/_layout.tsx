import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
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
    </Stack>
  );
}
