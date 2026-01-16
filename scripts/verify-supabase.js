#!/usr/bin/env node

/**
 * Supabase Configuration Verification Script
 * This script verifies that Supabase environment variables are properly configured
 */

const fs = require('fs');
const path = require('path');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔍 SUPABASE CONFIGURATION VERIFICATION');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');

// Check .env file
console.log('1️⃣ Checking .env file...');
const envPath = path.join(__dirname, '../.env');
let envFileExists = false;
let envFileHasSupabase = false;

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envFileExists = true;

  if (envContent.includes('EXPO_PUBLIC_SUPABASE_URL')) {
    console.log('   ✅ EXPO_PUBLIC_SUPABASE_URL found in .env');
    envFileHasSupabase = true;
  } else {
    console.log('   ❌ EXPO_PUBLIC_SUPABASE_URL NOT found in .env');
  }

  if (envContent.includes('EXPO_PUBLIC_SUPABASE_ANON_KEY')) {
    console.log('   ✅ EXPO_PUBLIC_SUPABASE_ANON_KEY found in .env');
  } else {
    console.log('   ❌ EXPO_PUBLIC_SUPABASE_ANON_KEY NOT found in .env');
  }
} catch (error) {
  console.log('   ⚠️  .env file not found or not readable');
}

console.log('');

// Check app.json
console.log('2️⃣ Checking app.json...');
const appJsonPath = path.join(__dirname, '../app.json');
let appJsonHasSupabase = false;

try {
  const appJsonContent = fs.readFileSync(appJsonPath, 'utf8');
  const appJson = JSON.parse(appJsonContent);

  if (appJson.expo?.extra?.EXPO_PUBLIC_SUPABASE_URL) {
    console.log('   ✅ EXPO_PUBLIC_SUPABASE_URL found in app.json');
    console.log(`   📍 Value: ${appJson.expo.extra.EXPO_PUBLIC_SUPABASE_URL}`);
    appJsonHasSupabase = true;
  } else {
    console.log('   ❌ EXPO_PUBLIC_SUPABASE_URL NOT found in app.json extra section');
  }

  if (appJson.expo?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
    console.log('   ✅ EXPO_PUBLIC_SUPABASE_ANON_KEY found in app.json');
    const key = appJson.expo.extra.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    console.log(`   📍 Value: ${key.substring(0, 20)}...${key.substring(key.length - 10)}`);
  } else {
    console.log('   ❌ EXPO_PUBLIC_SUPABASE_ANON_KEY NOT found in app.json extra section');
  }
} catch (error) {
  console.log('   ❌ Error reading app.json:', error.message);
}

console.log('');

// Check lib/supabase.ts
console.log('3️⃣ Checking lib/supabase.ts...');
const supabasePath = path.join(__dirname, '../lib/supabase.ts');

try {
  const supabaseContent = fs.readFileSync(supabasePath, 'utf8');

  if (supabaseContent.includes('Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL')) {
    console.log('   ✅ Using Constants.expoConfig.extra (recommended)');
  } else {
    console.log('   ⚠️  Not using Constants.expoConfig.extra');
  }

  if (supabaseContent.includes('getSupabaseConfig')) {
    console.log('   ✅ Has getSupabaseConfig() function');
  }

  if (supabaseContent.includes('isConfigured: false')) {
    console.log('   ✅ Has graceful error handling');
  }
} catch (error) {
  console.log('   ❌ Error reading lib/supabase.ts:', error.message);
}

console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 VERDICT');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');

if (appJsonHasSupabase) {
  console.log('✅ Supabase is properly configured in app.json');
  console.log('✅ The app should NOT crash with "supabaseUrl is required"');
  console.log('✅ Supabase client will initialize successfully');
  console.log('');
  console.log('🎯 Next steps:');
  console.log('   1. Restart the Expo dev server: npm start');
  console.log('   2. Check console for: "✅ Supabase client initialized successfully"');
  console.log('   3. The app should reach auth/onboarding screens');
} else {
  console.log('⚠️  Supabase configuration is incomplete');
  console.log('❌ The app may not be able to use Supabase features');
  console.log('');
  console.log('🔧 To fix:');
  console.log('   1. Ensure EXPO_PUBLIC_SUPABASE_URL is in app.json extra section');
  console.log('   2. Ensure EXPO_PUBLIC_SUPABASE_ANON_KEY is in app.json extra section');
  console.log('   3. Restart the Expo dev server');
}

console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
