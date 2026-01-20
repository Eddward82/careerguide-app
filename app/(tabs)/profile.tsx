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
  Switch,
  Modal,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/Colors';
import { getUserProfile, clearAllData, isDemoModeEnabled, setDemoMode } from '@/utils/storage';
import { UserProfile } from '@/types';
import ShareJourneyCard from '@/components/ShareJourneyCard';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/contexts/AuthContext';
import { restorePurchases, canCustomize } from '@/utils/revenueCat';
import {
  getWeeklyReminderEnabled,
  setWeeklyReminderEnabled,
  getDailyNudgeEnabled,
  setDailyNudgeEnabled,
  requestNotificationPermissions,
  getAccountabilityTime,
  setAccountabilityTime,
  clearAccountabilityTime,
  AccountabilityTime,
} from '@/utils/notifications';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [weeklyReminderEnabled, setWeeklyReminderState] = useState(false);
  const [dailyNudgeEnabled, setDailyNudgeState] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  const [demoModeEnabled, setDemoModeEnabled] = useState(false);
  const [showAccountabilityModal, setShowAccountabilityModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(2); // Monday
  const [selectedHour, setSelectedHour] = useState(18); // 6 PM
  const [accountabilityTime, setAccountabilityTimeState] = useState<AccountabilityTime | null>(null);
  const [customizationsRemaining, setCustomizationsRemaining] = useState(5);
  const [isPro, setIsPro] = useState(false);
  const [isRestoringPurchases, setIsRestoringPurchases] = useState(false);

  useEffect(() => {
    loadProfile();
    loadNotificationSettings();
    loadDemoMode();
    loadAccountabilityTime();
    loadSubscriptionStatus();
  }, []);

  const loadProfile = async () => {
    const userProfile = await getUserProfile();
    setProfile(userProfile);
  };

  const loadNotificationSettings = async () => {
    const weeklyEnabled = await getWeeklyReminderEnabled();
    const dailyEnabled = await getDailyNudgeEnabled();
    setWeeklyReminderState(weeklyEnabled);
    setDailyNudgeState(dailyEnabled);
  };

  const loadDemoMode = async () => {
    const isDemoEnabled = await isDemoModeEnabled();
    setDemoModeEnabled(isDemoEnabled);
  };

  const loadAccountabilityTime = async () => {
    const time = await getAccountabilityTime();
    setAccountabilityTimeState(time);
    if (time) {
      setSelectedDay(time.day);
      setSelectedHour(time.hour);
    }
  };

  const loadSubscriptionStatus = async () => {
    try {
      const { allowed, remaining, isPro: isProUser } = await canCustomize();
      setCustomizationsRemaining(remaining);
      setIsPro(isProUser);
    } catch (error) {
      console.error('Failed to load subscription status:', error);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      setIsRestoringPurchases(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const result = await restorePurchases();

      if (result.success) {
        if (result.isPro) {
          Alert.alert(
            '✅ Purchases Restored',
            'Your Pro subscription has been restored successfully!',
            [{ text: 'OK' }]
          );
          await loadSubscriptionStatus();
          await loadProfile();
        } else {
          Alert.alert(
            'No Purchases Found',
            'We couldn\'t find any previous purchases to restore.',
            [{ text: 'OK' }]
          );
        }
      } else {
        Alert.alert(
          'Restore Failed',
          'Unable to restore purchases. Please try again later.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Restore purchases failed:', error);
      Alert.alert(
        'Error',
        'An error occurred while restoring purchases.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsRestoringPurchases(false);
    }
  };

  const handleWeeklyReminderToggle = async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (value) {
      // Request permissions first
      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to receive career reminders.',
          [{ text: 'OK', style: 'default' }]
        );
        return;
      }
    }

    setWeeklyReminderState(value);
    await setWeeklyReminderEnabled(value);

    if (value) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleDailyNudgeToggle = async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (value) {
      // Request permissions first
      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to receive daily reminders.',
          [{ text: 'OK', style: 'default' }]
        );
        return;
      }
    }

    setDailyNudgeState(value);
    await setDailyNudgeEnabled(value);

    if (value) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleDemoModeToggle = async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Alert.alert(
      value ? 'Enable Demo Mode' : 'Disable Demo Mode',
      value
        ? 'This will populate your app with sample data (14-day streak, 10 sessions, unlocked badges) for demo purposes. Your real data will be safely backed up.'
        : 'This will restore your real data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: value ? 'Enable' : 'Disable',
          onPress: async () => {
            await setDemoMode(value);
            setDemoModeEnabled(value);
            await loadProfile(); // Reload to show demo data
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const handleSaveAccountabilityTime = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const time: AccountabilityTime = {
      day: selectedDay,
      hour: selectedHour,
      minute: 0,
    };

    await setAccountabilityTime(time);
    setAccountabilityTimeState(time);
    setShowAccountabilityModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleClearAccountabilityTime = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Alert.alert('Clear Accountability Partner', 'Remove your weekly check-in reminder?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await clearAccountabilityTime();
          setAccountabilityTimeState(null);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  };

  const getDayName = (day: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day - 1] || 'Monday';
  };

  const formatHour = (hour: number): string => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const handleSignOut = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? Your data is safely backed up to the cloud.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/auth/login');
          },
        },
      ]
    );
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
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Profile</Text>

            {/* Cloud Sync Indicator */}
            {user && (
              <View style={styles.cloudSyncBadge}>
                <Ionicons
                  name={
                    cloudSyncStatus === 'synced' ? 'cloud-done' :
                    cloudSyncStatus === 'syncing' ? 'cloud-upload' :
                    'cloud-offline'
                  }
                  size={16}
                  color={
                    cloudSyncStatus === 'synced' ? Colors.success :
                    cloudSyncStatus === 'syncing' ? Colors.primary :
                    Colors.mediumGray
                  }
                />
                <Text style={[
                  styles.cloudSyncText,
                  { color: cloudSyncStatus === 'synced' ? Colors.success : Colors.mediumGray }
                ]}>
                  {cloudSyncStatus === 'synced' ? 'Synced' :
                   cloudSyncStatus === 'syncing' ? 'Syncing...' :
                   'Offline'}
                </Text>
              </View>
            )}
          </View>

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

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Settings</Text>

          <View style={styles.notificationCard}>
            <View style={styles.notificationItem}>
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Ionicons name="calendar" size={22} color={Colors.primary} />
                  <Text style={styles.notificationTitle}>Weekly Career Sprint</Text>
                </View>
                <Text style={styles.notificationSubtitle}>
                  Get a motivating reminder every Monday at 9 AM to focus on your career goals
                </Text>
              </View>
              <Switch
                value={weeklyReminderEnabled}
                onValueChange={handleWeeklyReminderToggle}
                trackColor={{ false: Colors.lightGray, true: Colors.primary + '80' }}
                thumbColor={weeklyReminderEnabled ? Colors.primary : Colors.mediumGray}
                ios_backgroundColor={Colors.lightGray}
              />
            </View>

            <View style={styles.notificationDivider} />

            <View style={styles.notificationItem}>
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Ionicons name="alarm" size={22} color={Colors.success} />
                  <Text style={styles.notificationTitle}>Daily Progress Nudge</Text>
                </View>
                <Text style={styles.notificationSubtitle}>
                  A gentle reminder at 7 PM to log your daily wins and keep your streak alive
                </Text>
              </View>
              <Switch
                value={dailyNudgeEnabled}
                onValueChange={handleDailyNudgeToggle}
                trackColor={{ false: Colors.lightGray, true: Colors.success + '80' }}
                thumbColor={dailyNudgeEnabled ? Colors.success : Colors.mediumGray}
                ios_backgroundColor={Colors.lightGray}
              />
            </View>

            <View style={styles.notificationDivider} />

            {/* Accountability Partner */}
            <View style={styles.notificationItem}>
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Ionicons name="people" size={22} color={Colors.warning} />
                  <Text style={styles.notificationTitle}>Accountability Partner</Text>
                </View>
                <Text style={styles.notificationSubtitle}>
                  {accountabilityTime
                    ? `Weekly check-in every ${getDayName(accountabilityTime.day)} at ${formatHour(accountabilityTime.hour)}`
                    : 'Set a specific day and time for your weekly accountability check-in'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowAccountabilityModal(true)}
                style={styles.configureButton}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={accountabilityTime ? 'create-outline' : 'add-circle'}
                  size={24}
                  color={Colors.warning}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Demo Mode */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Presentation Mode</Text>
          <View style={styles.notificationCard}>
            <View style={styles.notificationItem}>
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Ionicons name="rocket" size={22} color={Colors.info} />
                  <Text style={styles.notificationTitle}>Demo Mode</Text>
                </View>
                <Text style={styles.notificationSubtitle}>
                  Populate the app with sample data (14-day streak, 10 sessions, unlocked badges) for
                  hackathon presentations
                </Text>
              </View>
              <Switch
                value={demoModeEnabled}
                onValueChange={handleDemoModeToggle}
                trackColor={{ false: Colors.lightGray, true: Colors.info + '80' }}
                thumbColor={demoModeEnabled ? Colors.info : Colors.mediumGray}
                ios_backgroundColor={Colors.lightGray}
              />
            </View>
          </View>
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

        {/* Subscription & Usage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription & Usage</Text>
          <View style={styles.subscriptionCard}>
            {/* Subscription Status */}
            <View style={styles.subscriptionHeader}>
              <View style={styles.subscriptionBadge}>
                {isPro ? (
                  <>
                    <Ionicons name="star" size={20} color="#FFD700" />
                    <Text style={styles.subscriptionBadgeTextPro}>Pro</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="person" size={20} color={Colors.mediumGray} />
                    <Text style={styles.subscriptionBadgeTextFree}>Free</Text>
                  </>
                )}
              </View>
            </View>

            {/* Usage Stats */}
            <View style={styles.usageContainer}>
              {isPro ? (
                <View style={styles.usageRow}>
                  <Ionicons name="infinite" size={24} color="#4A90E2" />
                  <View style={styles.usageContent}>
                    <Text style={styles.usageTitle}>Pro Status: Active</Text>
                    <Text style={styles.usageSubtitle}>
                      Unlimited roadmap customizations
                    </Text>
                  </View>
                </View>
              ) : (
                <>
                  <View style={styles.usageRow}>
                    <Ionicons name="flash" size={24} color={Colors.primary} />
                    <View style={styles.usageContent}>
                      <Text style={styles.usageTitle}>Customizations Available</Text>
                      <Text style={styles.usageSubtitle}>
                        {customizationsRemaining} of 5 lifetime customizations remaining
                      </Text>
                    </View>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarBackground}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${((5 - customizationsRemaining) / 5) * 100}%`,
                            backgroundColor:
                              customizationsRemaining <= 1 ? '#FF6B6B' : '#4A90E2',
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {5 - customizationsRemaining}/5 used
                    </Text>
                  </View>
                </>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.subscriptionActions}>
              {!isPro && (
                <TouchableOpacity
                  style={styles.upgradeButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push('/pro-upgrade');
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="star" size={20} color={Colors.white} />
                  <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
                  <Ionicons name="arrow-forward" size={18} color={Colors.white} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.restoreButton}
                onPress={handleRestorePurchases}
                disabled={isRestoringPurchases}
                activeOpacity={0.7}
              >
                {isRestoringPurchases ? (
                  <Text style={styles.restoreButtonText}>Restoring...</Text>
                ) : (
                  <>
                    <Ionicons name="refresh" size={18} color="#4A90E2" />
                    <Text style={styles.restoreButtonText}>Restore Purchases</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Account Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.infoCard}>
            {user && (
              <>
                <View style={styles.infoRow}>
                  <Ionicons name="mail" size={20} color={Colors.mediumGray} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>{user.email}</Text>
                  </View>
                </View>
                <View style={styles.infoDivider} />
              </>
            )}
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

          {/* Sign Out Button */}
          {user && (
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleSignOut}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={20} color={Colors.error} />
              <Text style={styles.signOutButtonText}>Sign Out</Text>
            </TouchableOpacity>
          )}
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

      {/* Accountability Partner Modal */}
      <Modal visible={showAccountabilityModal} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setShowAccountabilityModal(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set Check-in Time</Text>
              <TouchableOpacity onPress={() => setShowAccountabilityModal(false)}>
                <Ionicons name="close" size={24} color={Colors.navy} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              Choose a day and time for your weekly accountability check-in
            </Text>

            {/* Day Picker */}
            <Text style={styles.pickerLabel}>Day of Week</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayPicker}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayButton,
                    selectedDay === index + 2 ? styles.dayButtonSelected : null,
                  ]}
                  onPress={() => {
                    setSelectedDay(index + 2);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dayButtonText,
                      selectedDay === index + 2 ? styles.dayButtonTextSelected : null,
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Hour Picker */}
            <Text style={styles.pickerLabel}>Time</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hourPicker}>
              {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                <TouchableOpacity
                  key={hour}
                  style={[
                    styles.hourButton,
                    selectedHour === hour ? styles.hourButtonSelected : null,
                  ]}
                  onPress={() => {
                    setSelectedHour(hour);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.hourButtonText,
                      selectedHour === hour ? styles.hourButtonTextSelected : null,
                    ]}
                  >
                    {formatHour(hour)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              {accountabilityTime && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={handleClearAccountabilityTime}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={20} color={Colors.error} />
                  <Text style={styles.clearButtonText}>Remove</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveAccountabilityTime}
                activeOpacity={0.7}
              >
                <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
                <Text style={styles.saveButtonText}>Save Check-in</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.navy,
  },
  cloudSyncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  cloudSyncText: {
    fontSize: 12,
    fontWeight: '600',
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
  subscriptionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  subscriptionHeader: {
    marginBottom: 16,
  },
  subscriptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F7FF',
    gap: 8,
  },
  subscriptionBadgeTextPro: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFD700',
  },
  subscriptionBadgeTextFree: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.mediumGray,
  },
  usageContainer: {
    marginBottom: 20,
  },
  usageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  usageContent: {
    flex: 1,
    marginLeft: 12,
  },
  usageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.navy,
    marginBottom: 4,
  },
  usageSubtitle: {
    fontSize: 14,
    color: Colors.mediumGray,
    lineHeight: 20,
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: Colors.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: Colors.mediumGray,
    textAlign: 'right',
  },
  subscriptionActions: {
    gap: 10,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F7FF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  restoreButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
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
  infoDivider: {
    height: 1,
    backgroundColor: Colors.lightGray,
    marginVertical: 12,
  },
  signOutButton: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: Colors.error,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 8,
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.error,
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
  notificationCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  notificationContent: {
    flex: 1,
    marginRight: 16,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.navy,
    marginLeft: 10,
  },
  notificationSubtitle: {
    fontSize: 13,
    color: Colors.mediumGray,
    lineHeight: 19,
    paddingLeft: 32,
  },
  notificationDivider: {
    height: 1,
    backgroundColor: Colors.lightGray,
    marginVertical: 16,
  },
  configureButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.navy,
  },
  modalDescription: {
    fontSize: 14,
    color: Colors.mediumGray,
    marginBottom: 24,
    lineHeight: 20,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.navy,
    marginBottom: 12,
  },
  dayPicker: {
    marginBottom: 24,
  },
  dayButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.lightGray,
    marginRight: 8,
  },
  dayButtonSelected: {
    backgroundColor: Colors.primary,
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.mediumGray,
  },
  dayButtonTextSelected: {
    color: Colors.white,
  },
  hourPicker: {
    marginBottom: 24,
  },
  hourButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.lightGray,
    marginRight: 8,
  },
  hourButtonSelected: {
    backgroundColor: Colors.success,
  },
  hourButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.mediumGray,
  },
  hourButtonTextSelected: {
    color: Colors.white,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.error,
    gap: 8,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.error,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
});
