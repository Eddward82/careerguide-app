import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserProfile } from './storage';

// Notification settings keys
const WEEKLY_REMINDER_KEY = '@weeklyReminderEnabled';
const DAILY_NUDGE_KEY = '@dailyNudgeEnabled';
const FIRST_RESOURCE_VISIT_KEY = '@firstResourceVisit';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Career Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4A90E2',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Schedule weekly career reminder (Monday 9 AM)
 */
export async function scheduleWeeklyReminder(): Promise<string | null> {
  try {
    const profile = await getUserProfile();
    if (!profile) return null;

    // Get the most recent coaching session for current challenge
    const latestSession = profile.sessions[profile.sessions.length - 1];
    const currentChallenge = latestSession?.challenge || 'career transition';

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Hi ${profile.name}! 🚀`,
        body: `Don't forget your ${currentChallenge} focus this week! Your ${profile.currentStreak}-day streak is waiting for you. 🔥`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        weekday: 2, // Monday (1 = Sunday, 2 = Monday, etc.)
        hour: 9,
        minute: 0,
        repeats: true,
      },
    });

    console.log('✅ Weekly reminder scheduled:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('Error scheduling weekly reminder:', error);
    return null;
  }
}

/**
 * Schedule daily check-in nudge (7 PM)
 */
export async function scheduleDailyNudge(): Promise<string | null> {
  try {
    const profile = await getUserProfile();
    if (!profile) return null;

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `${profile.name}, quick check-in! 💪`,
        body: `Take 2 minutes to log your progress today. Every small win counts!`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.DEFAULT,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour: 19, // 7 PM
        minute: 0,
        repeats: true,
      },
    });

    console.log('✅ Daily nudge scheduled:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('Error scheduling daily nudge:', error);
    return null;
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('✅ All notifications cancelled');
  } catch (error) {
    console.error('Error cancelling notifications:', error);
  }
}

/**
 * Get weekly reminder enabled state
 */
export async function getWeeklyReminderEnabled(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(WEEKLY_REMINDER_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error getting weekly reminder state:', error);
    return false;
  }
}

/**
 * Set weekly reminder enabled state
 */
export async function setWeeklyReminderEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(WEEKLY_REMINDER_KEY, enabled.toString());

    if (enabled) {
      // Cancel existing and reschedule
      await Notifications.cancelAllScheduledNotificationsAsync();
      await scheduleWeeklyReminder();

      // Re-enable daily nudge if it was enabled
      const dailyEnabled = await getDailyNudgeEnabled();
      if (dailyEnabled) {
        await scheduleDailyNudge();
      }
    } else {
      // Only cancel weekly notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Re-enable daily nudge if it was enabled
      const dailyEnabled = await getDailyNudgeEnabled();
      if (dailyEnabled) {
        await scheduleDailyNudge();
      }
    }
  } catch (error) {
    console.error('Error setting weekly reminder state:', error);
  }
}

/**
 * Get daily nudge enabled state
 */
export async function getDailyNudgeEnabled(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(DAILY_NUDGE_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error getting daily nudge state:', error);
    return false;
  }
}

/**
 * Set daily nudge enabled state
 */
export async function setDailyNudgeEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(DAILY_NUDGE_KEY, enabled.toString());

    if (enabled) {
      // Cancel existing and reschedule
      await Notifications.cancelAllScheduledNotificationsAsync();
      await scheduleDailyNudge();

      // Re-enable weekly reminder if it was enabled
      const weeklyEnabled = await getWeeklyReminderEnabled();
      if (weeklyEnabled) {
        await scheduleWeeklyReminder();
      }
    } else {
      // Only cancel daily notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Re-enable weekly reminder if it was enabled
      const weeklyEnabled = await getWeeklyReminderEnabled();
      if (weeklyEnabled) {
        await scheduleWeeklyReminder();
      }
    }
  } catch (error) {
    console.error('Error setting daily nudge state:', error);
  }
}

/**
 * Initialize notifications on app start
 */
export async function initializeNotifications(): Promise<void> {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log('⚠️ Notification permissions not granted');
      return;
    }

    // Check if notifications are enabled and schedule them
    const weeklyEnabled = await getWeeklyReminderEnabled();
    const dailyEnabled = await getDailyNudgeEnabled();

    if (weeklyEnabled) {
      await scheduleWeeklyReminder();
    }

    if (dailyEnabled) {
      await scheduleDailyNudge();
    }

    console.log('✅ Notifications initialized');
  } catch (error) {
    console.error('Error initializing notifications:', error);
  }
}

/**
 * Check if this is the user's first visit to Resources tab
 */
export async function isFirstResourceVisit(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(FIRST_RESOURCE_VISIT_KEY);
    return value !== 'visited';
  } catch (error) {
    console.error('Error checking first resource visit:', error);
    return true;
  }
}

/**
 * Mark Resources tab as visited
 */
export async function markResourceVisited(): Promise<void> {
  try {
    await AsyncStorage.setItem(FIRST_RESOURCE_VISIT_KEY, 'visited');
  } catch (error) {
    console.error('Error marking resource visited:', error);
  }
}

// ==================== ACCOUNTABILITY PARTNER ====================

const ACCOUNTABILITY_TIME_KEY = '@accountabilityTime';

export interface AccountabilityTime {
  day: number; // 1 = Monday, 2 = Tuesday, ... 7 = Sunday
  hour: number;
  minute: number;
}

/**
 * Get accountability partner check-in time
 */
export async function getAccountabilityTime(): Promise<AccountabilityTime | null> {
  try {
    const value = await AsyncStorage.getItem(ACCOUNTABILITY_TIME_KEY);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Error getting accountability time:', error);
    return null;
  }
}

/**
 * Set accountability partner check-in time and schedule notification
 */
export async function setAccountabilityTime(time: AccountabilityTime): Promise<void> {
  try {
    await AsyncStorage.setItem(ACCOUNTABILITY_TIME_KEY, JSON.stringify(time));

    // Request permissions first
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log('⚠️ Notification permissions not granted');
      return;
    }

    // Cancel any existing accountability notifications
    const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of allNotifications) {
      if (notification.content.title?.includes('Weekly Check-in')) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }

    // Schedule new accountability notification
    const profile = await getUserProfile();
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `${profile.name}, it's Weekly Check-in Time! 📋`,
        body: 'Take a moment to reflect on your progress and set goals for the week ahead.',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        weekday: time.day,
        hour: time.hour,
        minute: time.minute,
        repeats: true,
      },
    });

    console.log('✅ Accountability check-in scheduled:', notificationId);
  } catch (error) {
    console.error('Error setting accountability time:', error);
  }
}

/**
 * Clear accountability partner check-in
 */
export async function clearAccountabilityTime(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ACCOUNTABILITY_TIME_KEY);

    // Cancel accountability notifications
    const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of allNotifications) {
      if (notification.content.title?.includes('Weekly Check-in')) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }

    console.log('✅ Accountability check-in cleared');
  } catch (error) {
    console.error('Error clearing accountability time:', error);
  }
}
