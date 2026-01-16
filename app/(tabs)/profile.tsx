import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/Colors';
import { getUserProfile, clearAllData } from '@/utils/storage';
import { UserProfile } from '@/types';
import ShareJourneyCard from '@/components/ShareJourneyCard';

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const userProfile = await getUserProfile();
    setProfile(userProfile);
  };

  // DIRECT RESET - NO ALERT
  const handleDirectReset = async () => {
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('🔥 DIRECT RESET BUTTON PRESSED!');
    console.log('═══════════════════════════════════════');

    setIsResetting(true);

    try {
      console.log('📦 Checking storage...');
      const keysBefore = await AsyncStorage.getAllKeys();
      console.log(`   Found ${keysBefore.length} keys`);

      console.log('🗑️  Clearing storage...');
      await clearAllData();

      console.log('🔍 Verifying clear...');
      const keysAfter = await AsyncStorage.getAllKeys();
      console.log(`   Remaining: ${keysAfter.length}`);

      console.log('🔄 Resetting state...');
      setProfile(null);

      console.log('🚀 Navigating to onboarding...');
      router.replace('/onboarding');

      console.log('✅ RESET COMPLETE!');
      console.log('═══════════════════════════════════════');
      console.log('');
    } catch (err) {
      console.error('❌ RESET FAILED:', err);
      setIsResetting(false);
    }
  };

  const handleResetData = () => {
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('🔘 RESET BUTTON PRESSED');
    console.log('═══════════════════════════════════════');

    Alert.alert(
      '⚠️ Reset to First Launch',
      'This will clear ALL data and restart onboarding.\n\nCannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            console.log('❌ User cancelled reset');
            console.log('═══════════════════════════════════════');
            console.log('');
          },
        },
        {
          text: 'RESET NOW',
          style: 'destructive',
          onPress: async () => {
            console.log('');
            console.log('═══════════════════════════════════════');
            console.log('🔄 RESET CONFIRMED - STARTING PROCESS');
            console.log('═══════════════════════════════════════');

            try {
              // Step 1: Show what's in storage before clear
              console.log('');
              console.log('📦 STEP 1: Checking current storage...');
              const keysBefore = await AsyncStorage.getAllKeys();
              console.log(`   Found ${keysBefore.length} keys:`, keysBefore);

              // Step 2: Clear AsyncStorage
              console.log('');
              console.log('🗑️  STEP 2: Clearing AsyncStorage...');
              await clearAllData();
              console.log('   ✅ clearAllData() completed');

              // Step 3: Verify it's actually cleared
              console.log('');
              console.log('🔍 STEP 3: Verifying storage is empty...');
              const keysAfter = await AsyncStorage.getAllKeys();
              console.log(`   Remaining keys: ${keysAfter.length}`);
              if (keysAfter.length === 0) {
                console.log('   ✅ STORAGE IS EMPTY');
              } else {
                console.log('   ⚠️  WARNING: Still has keys:', keysAfter);
              }

              // Step 4: Reset local state
              console.log('');
              console.log('🔄 STEP 4: Resetting local state...');
              setProfile(null);
              console.log('   ✅ Profile state cleared');

              // Step 5: Navigate to onboarding
              console.log('');
              console.log('🚀 STEP 5: Navigating to onboarding...');
              console.log('   Calling router.replace("/onboarding")');
              router.replace('/onboarding');
              console.log('   ✅ Navigation command sent');

              console.log('');
              console.log('═══════════════════════════════════════');
              console.log('✅ RESET COMPLETE!');
              console.log('   → You should now see Step 1: Career Goal');
              console.log('═══════════════════════════════════════');
              console.log('');

            } catch (err) {
              console.log('');
              console.log('═══════════════════════════════════════');
              console.error('❌ RESET FAILED');
              console.error('Error object:', err);
              console.error('Error message:', err instanceof Error ? err.message : 'Unknown error');
              console.error('Error stack:', err instanceof Error ? err.stack : 'No stack trace');
              console.log('═══════════════════════════════════════');
              console.log('');

              Alert.alert(
                '❌ Reset Failed',
                `Error: ${err instanceof Error ? err.message : 'Unknown error'}\n\nCheck the console for details.`,
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  };

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>

          {/* DIRECT Reset Button - NO CONFIRMATION */}
          <TouchableOpacity
            style={[
              styles.quickResetTest,
              isResetting && styles.quickResetTestActive,
            ]}
            onPress={handleDirectReset}
            disabled={isResetting}
            activeOpacity={0.7}
          >
            <Text style={styles.quickResetTestText}>
              {isResetting ? '⏳ RESETTING...' : '🔥 RESET NOW (NO CONFIRM)'}
            </Text>
          </TouchableOpacity>

          {/* Alert-based Reset Button */}
          <TouchableOpacity
            style={styles.alertResetTest}
            onPress={handleResetData}
            activeOpacity={0.7}
          >
            <Text style={styles.alertResetTestText}>⚠️ RESET (With Alert)</Text>
          </TouchableOpacity>

          {/* Touch Test Button */}
          <TouchableOpacity
            style={styles.touchTest}
            onPress={() => {
              console.log('');
              console.log('════════════════════════════════════════════');
              console.log('✅ TOUCH TEST: Button is receiving touches!');
              console.log('════════════════════════════════════════════');
              console.log('');
            }}
            activeOpacity={0.5}
          >
            <Text style={styles.touchTestText}>👆 TOUCH TEST</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile.currentStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile.sessions.length}</Text>
              <Text style={styles.statLabel}>Total Sessions</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {profile.sessions.filter((s) => s.progressLog).length}
              </Text>
              <Text style={styles.statLabel}>Progress Logs</Text>
            </View>
          </View>
        </View>

        {/* Share Journey Card */}
        <View style={styles.shareSection}>
          <ShareJourneyCard
            name={profile.name}
            streak={profile.currentStreak}
            targetGoal={profile.careerGoal}
            sessionsCount={profile.sessions.length}
          />
        </View>

        {/* Career Goal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Career Goal</Text>
          <View style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <Ionicons name="briefcase" size={24} color={Colors.primary} />
              <Text style={styles.goalText}>{profile.careerGoal}</Text>
            </View>
          </View>
        </View>

        {/* Account Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={20} color={Colors.mediumGray} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Member Since</Text>
                <Text style={styles.infoValue}>
                  {new Date().toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <TouchableOpacity style={styles.settingCard} activeOpacity={0.7}>
            <View style={styles.settingContent}>
              <Ionicons name="notifications" size={24} color={Colors.navy} />
              <Text style={styles.settingText}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.mediumGray} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingCard} activeOpacity={0.7}>
            <View style={styles.settingContent}>
              <Ionicons name="help-circle" size={24} color={Colors.navy} />
              <Text style={styles.settingText}>Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.mediumGray} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingCard} activeOpacity={0.7}>
            <View style={styles.settingContent}>
              <Ionicons name="information-circle" size={24} color={Colors.navy} />
              <Text style={styles.settingText}>About</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.mediumGray} />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Developer Options</Text>
          <View style={styles.dangerZone}>
            <View style={styles.dangerZoneHeader}>
              <Ionicons name="warning" size={20} color={Colors.error} />
              <Text style={styles.dangerZoneTitle}>Testing Tools</Text>
            </View>
            <Text style={styles.dangerZoneDescription}>
              Reset the app to test the complete onboarding experience from scratch
            </Text>
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleResetData}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh" size={20} color={Colors.error} />
              <Text style={styles.dangerButtonText}>Reset to First Launch</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footerNote}>
          <Text style={styles.footerText}>
            Careerguide - Your AI-powered career transition coach
          </Text>
          <Text style={styles.footerVersion}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.navy,
  },
  statsCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    margin: 24,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.mediumGray,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.lightGray,
  },
  shareSection: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.navy,
    marginBottom: 12,
  },
  goalCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.navy,
    marginLeft: 12,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoContent: {
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.mediumGray,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.navy,
  },
  settingCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.navy,
    marginLeft: 12,
  },
  dangerZone: {
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  dangerZoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dangerZoneTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.error,
    marginLeft: 8,
  },
  dangerZoneDescription: {
    fontSize: 13,
    color: Colors.mediumGray,
    marginBottom: 16,
    lineHeight: 18,
  },
  dangerButton: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.error,
  },
  dangerButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.error,
    marginLeft: 8,
  },
  footerNote: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 16,
  },
  footerText: {
    fontSize: 12,
    color: Colors.mediumGray,
    textAlign: 'center',
    marginBottom: 4,
  },
  footerVersion: {
    fontSize: 10,
    color: Colors.mediumGray,
  },
  quickResetTest: {
    backgroundColor: '#FF3B3B',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: 'center',
    borderWidth: 3,
    borderColor: '#000',
  },
  quickResetTestActive: {
    backgroundColor: '#FFA500',
    borderColor: '#FF8C00',
  },
  quickResetTestText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  alertResetTest: {
    backgroundColor: '#444',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: '#666',
  },
  alertResetTestText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  touchTest: {
    backgroundColor: '#00AA00',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: '#00FF00',
  },
  touchTestText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
});
