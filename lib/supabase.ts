import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import Constants from 'expo-constants';

/**
 * Get Supabase environment variables with proper fallbacks
 */
function getSupabaseConfig() {
  // Try multiple sources for environment variables
  const supabaseUrl =
    Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL ||
    process.env.EXPO_PUBLIC_SUPABASE_URL ||
    '';

  const supabaseAnonKey =
    Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    '';

  // Validate required configuration
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('⚠️  SUPABASE CONFIGURATION ERROR');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('');
    console.error('Missing required Supabase environment variables:');
    if (!supabaseUrl) {
      console.error('  ❌ EXPO_PUBLIC_SUPABASE_URL is not set');
    }
    if (!supabaseAnonKey) {
      console.error('  ❌ EXPO_PUBLIC_SUPABASE_ANON_KEY is not set');
    }
    console.error('');
    console.error('Please ensure these variables are configured in:');
    console.error('  1. Your .env file');
    console.error('  2. app.json extra section');
    console.error('  3. Environment variables interface');
    console.error('');
    console.error('The app will continue in offline mode.');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('');

    // Return dummy values to prevent crashes
    return {
      url: 'https://placeholder.supabase.co',
      key: 'placeholder-key',
      isConfigured: false,
    };
  }

  return {
    url: supabaseUrl,
    key: supabaseAnonKey,
    isConfigured: true,
  };
}

// Get configuration
const config = getSupabaseConfig();

// Create Supabase client
export const supabase = createClient(config.url, config.key, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Export configuration status for other modules to check
export const isSupabaseConfigured = config.isConfigured;

// Log initialization status
if (config.isConfigured) {
  console.log('✅ Supabase client initialized successfully');
} else {
  console.warn('⚠️  Supabase client running in offline mode');
}

// Handle app state changes for auth token refresh
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
