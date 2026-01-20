import Purchases, { PurchasesPackage, CustomerInfo } from 'react-native-purchases';
import { Platform } from 'react-native';
import { getUserProfile, saveUserProfile } from './storage';
import { TransitionTimeline } from '@/types';

// RevenueCat Configuration
const REVENUECAT_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || '';
const PRO_ENTITLEMENT_ID = 'pro';

/**
 * Initialize RevenueCat SDK
 * Should be called once when the app starts
 */
export const initializeRevenueCat = async (): Promise<boolean> => {
  try {
    if (!REVENUECAT_API_KEY) {
      console.warn('⚠️ RevenueCat API key not configured');
      return false;
    }

    await Purchases.configure({
      apiKey: REVENUECAT_API_KEY,
    });

    console.log('✅ RevenueCat initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ RevenueCat initialization failed:', error);
    return false;
  }
};

/**
 * Log in a user to RevenueCat
 * Links purchases to a specific user ID
 */
export const loginRevenueCatUser = async (userId: string): Promise<void> => {
  try {
    const { customerInfo } = await Purchases.logIn(userId);
    console.log('✅ RevenueCat user logged in:', userId);

    // Update subscription status based on entitlements
    await syncSubscriptionStatus(customerInfo);
  } catch (error) {
    console.error('❌ RevenueCat login failed:', error);
  }
};

/**
 * Log out the current RevenueCat user
 */
export const logoutRevenueCatUser = async (): Promise<void> => {
  try {
    await Purchases.logOut();
    console.log('✅ RevenueCat user logged out');
  } catch (error) {
    console.error('❌ RevenueCat logout failed:', error);
  }
};

/**
 * Get current customer info and check subscription status
 */
export const getSubscriptionStatus = async (): Promise<{
  isPro: boolean;
  customerInfo: CustomerInfo | null;
}> => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const isPro = Boolean(customerInfo.entitlements.active[PRO_ENTITLEMENT_ID]);

    return { isPro, customerInfo };
  } catch (error) {
    console.error('❌ Failed to get subscription status:', error);

    // Fallback to cached status from user profile
    const profile = await getUserProfile();
    return {
      isPro: profile.subscriptionStatus === 'pro',
      customerInfo: null,
    };
  }
};

/**
 * Fetch available offerings (subscription packages)
 */
export const getOfferings = async (): Promise<PurchasesPackage[]> => {
  try {
    const offerings = await Purchases.getOfferings();

    if (offerings.current && offerings.current.availablePackages.length > 0) {
      return offerings.current.availablePackages;
    }

    console.warn('⚠️ No offerings available');
    return [];
  } catch (error) {
    console.error('❌ Failed to fetch offerings:', error);
    return [];
  }
};

/**
 * Purchase a subscription package
 */
export const purchasePackage = async (
  pkg: PurchasesPackage
): Promise<{ success: boolean; isPro: boolean }> => {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const isPro = Boolean(customerInfo.entitlements.active[PRO_ENTITLEMENT_ID]);

    // Sync subscription status to local storage
    await syncSubscriptionStatus(customerInfo);

    return { success: true, isPro };
  } catch (error: any) {
    if (error.userCancelled) {
      console.log('ℹ️ User cancelled purchase');
      return { success: false, isPro: false };
    }

    console.error('❌ Purchase failed:', error);
    return { success: false, isPro: false };
  }
};

/**
 * Restore previous purchases
 */
export const restorePurchases = async (): Promise<{ success: boolean; isPro: boolean }> => {
  try {
    const customerInfo = await Purchases.restorePurchases();
    const isPro = Boolean(customerInfo.entitlements.active[PRO_ENTITLEMENT_ID]);

    // Sync subscription status to local storage
    await syncSubscriptionStatus(customerInfo);

    return { success: true, isPro };
  } catch (error) {
    console.error('❌ Restore purchases failed:', error);
    return { success: false, isPro: false };
  }
};

/**
 * Sync RevenueCat subscription status to local user profile
 * This provides offline resilience
 */
const syncSubscriptionStatus = async (customerInfo: CustomerInfo): Promise<void> => {
  try {
    const profile = await getUserProfile();
    const isPro = Boolean(customerInfo.entitlements.active[PRO_ENTITLEMENT_ID]);

    const updatedProfile = {
      ...profile,
      subscriptionStatus: isPro ? ('pro' as const) : ('free' as const),
    };

    // If user upgrades to Pro, remove the customization limit
    if (isPro && profile.subscriptionStatus === 'free') {
      updatedProfile.customizationLimit = Infinity;
      console.log('✅ User upgraded to Pro - unlimited customizations enabled');
    }

    await saveUserProfile(updatedProfile);
  } catch (error) {
    console.error('❌ Failed to sync subscription status:', error);
  }
};

/**
 * Check if user can perform a customization
 * Returns true if user has remaining customizations OR is a Pro user
 */
export const canCustomize = async (): Promise<{
  allowed: boolean;
  remaining: number;
  isPro: boolean;
}> => {
  try {
    const profile = await getUserProfile();
    const { isPro } = await getSubscriptionStatus();

    // Pro users have unlimited customizations
    if (isPro || profile.subscriptionStatus === 'pro') {
      return {
        allowed: true,
        remaining: Infinity,
        isPro: true,
      };
    }

    // Free users have a limit
    const remaining = profile.customizationLimit - profile.customizationsUsedTotal;

    return {
      allowed: remaining > 0,
      remaining: Math.max(0, remaining),
      isPro: false,
    };
  } catch (error) {
    console.error('❌ Failed to check customization eligibility:', error);
    return {
      allowed: false,
      remaining: 0,
      isPro: false,
    };
  }
};

/**
 * Record a customization event
 * Increments the usage counter and logs the event
 */
export const recordCustomization = async (
  fromTimeline: TransitionTimeline,
  toTimeline: TransitionTimeline
): Promise<boolean> => {
  try {
    const profile = await getUserProfile();
    const { isPro } = await getSubscriptionStatus();

    // Pro users don't need to track usage
    if (isPro || profile.subscriptionStatus === 'pro') {
      console.log('✅ Pro user customization - no limit tracking');
      return true;
    }

    // Check if user has remaining customizations
    const remaining = profile.customizationLimit - profile.customizationsUsedTotal;
    if (remaining <= 0) {
      console.warn('⚠️ Customization limit reached');
      return false;
    }

    // Create customization log entry
    const log = {
      id: `custom_${Date.now()}`,
      timestamp: new Date().toISOString(),
      fromTimeline,
      toTimeline,
      userId: profile.revenueCatUserId || 'anonymous',
    };

    // Update profile with new usage count and log
    const updatedProfile = {
      ...profile,
      customizationsUsedTotal: profile.customizationsUsedTotal + 1,
      customizationLogs: [...(profile.customizationLogs || []), log],
    };
    await saveUserProfile(updatedProfile);

    console.log(`✅ Customization recorded (${profile.customizationsUsedTotal + 1}/${profile.customizationLimit})`);
    return true;
  } catch (error) {
    console.error('❌ Failed to record customization:', error);
    return false;
  }
};

/**
 * Get a user-friendly message about remaining customizations
 */
export const getCustomizationMessage = async (): Promise<string> => {
  const { allowed, remaining, isPro } = await canCustomize();

  if (isPro) {
    return 'Unlimited customizations available';
  }

  if (remaining === 1) {
    return 'You have 1 customization left';
  }

  if (remaining > 1) {
    return `You have ${remaining} customizations left`;
  }

  return 'Upgrade to PathForward Pro for unlimited customizations';
};
