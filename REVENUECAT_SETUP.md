# RevenueCat Setup Guide for Careerguide

This guide will help you configure RevenueCat for the Careerguide subscription system.

## Overview

Careerguide uses RevenueCat to manage in-app subscriptions with the following features:

- **Free Tier**: 5 lifetime AI roadmap customizations
- **Pro Tier**: Unlimited customizations, priority AI, advanced resources, cloud sync

## Prerequisites

1. A RevenueCat account ([sign up here](https://www.revenuecat.com))
2. Access to the RevenueCat dashboard

## Step 1: Create RevenueCat Project

1. Log in to [RevenueCat Dashboard](https://app.revenuecat.com)
2. Click **"Create New Project"**
3. Name your project: `Careerguide` (or your preferred name)
4. Click **"Create"**

## Step 2: Create Test Store App

RevenueCat's Test Store allows full development without App Store Connect or Google Play Console.

1. In your project, click **"Apps"** in the sidebar
2. Click **"+ New App"**
3. Select **"Test Store"** as the platform
4. Name your app: `Careerguide Test`
5. Click **"Add App"**

## Step 3: Get API Keys

1. In your app settings, go to **"API Keys"**
2. Find the **"Public SDK Key"** for the Sandbox environment
3. Copy this key - you'll need it for the next step

## Step 4: Configure .env File

Add your RevenueCat API key to the `.env` file:

```bash
EXPO_PUBLIC_REVENUECAT_API_KEY=your_public_sdk_key_here
```

Replace `your_public_sdk_key_here` with the Public SDK Key from Step 3.

## Step 5: Create Products

Create two subscription products for monthly and annual plans:

### Monthly Subscription

1. Go to **"Products"** in the sidebar
2. Click **"+ New"**
3. Fill in the details:
   - **Store Identifier**: `pro_monthly`
   - **Display Name**: `Pro Monthly`
   - **Type**: `Subscription`
   - **Title**: `Pro Monthly Subscription`
   - **Duration**: `P1M` (1 month)
4. Click **"Add"**
5. Set pricing by clicking **"+ Add Price"**:
   - Price: `9.99` USD
   - Currency: `USD`
   - (Add more currencies as needed)

### Annual Subscription

1. Click **"+ New"** again
2. Fill in the details:
   - **Store Identifier**: `pro_annual`
   - **Display Name**: `Pro Annual`
   - **Type**: `Subscription`
   - **Title**: `Pro Annual Subscription`
   - **Duration**: `P1Y` (1 year)
3. Click **"Add"**
4. Set pricing:
   - Price: `99.99` USD
   - Currency: `USD`
   - (Add more currencies as needed)

## Step 6: Create Entitlement

Entitlements define what features users get with a subscription.

1. Go to **"Entitlements"** in the sidebar
2. Click **"+ New"**
3. Fill in:
   - **Identifier**: `pro`
   - **Display Name**: `Pro Access`
4. Click **"Add"**
5. Attach products:
   - Click on the `pro` entitlement
   - Click **"Attach Products"**
   - Select both `pro_monthly` and `pro_annual`
   - Click **"Save"**

## Step 7: Create Offering

Offerings group products for display in your app.

1. Go to **"Offerings"** in the sidebar
2. Click **"+ New"**
3. Fill in:
   - **Identifier**: `default`
   - **Display Name**: `Default Offering`
4. Click **"Add"**
5. Make it current:
   - Click **"Make Current"** on the `default` offering

## Step 8: Create Packages

Packages define how products are presented in the app.

### Monthly Package

1. Click on the `default` offering
2. Click **"+ New Package"**
3. Fill in:
   - **Identifier**: `$rc_monthly`
   - **Display Name**: `Monthly`
4. Attach product:
   - Click **"Attach Product"**
   - Select `pro_monthly`
   - Eligibility: `All`
   - Click **"Save"**

### Annual Package

1. Click **"+ New Package"** again
2. Fill in:
   - **Identifier**: `$rc_annual`
   - **Display Name**: `Annual`
3. Attach product:
   - Click **"Attach Product"**
   - Select `pro_annual`
   - Eligibility: `All`
   - Click **"Save"**

## Step 9: Test the Integration

### Testing Subscriptions

With the Test Store, you can test purchases directly in your app:

1. Build and run your app in development
2. Navigate to the Pro Upgrade screen
3. Select a subscription plan
4. Complete the test purchase
5. Verify that features unlock correctly

### Testing Subscription Status

In the RevenueCat dashboard:

1. Go to **"Customers"**
2. Search for your test user (by app user ID)
3. View their subscription status and entitlements
4. You can also grant/revoke test entitlements here

### Testing Restore Purchases

1. Complete a test purchase
2. Uninstall and reinstall the app
3. Go to Profile → Subscription & Usage
4. Tap **"Restore Purchases"**
5. Verify your Pro status is restored

## Step 10: Production Setup

When you're ready to go live:

### iOS (App Store)

1. Create your app in App Store Connect
2. Configure in-app purchases in App Store Connect
3. Add an iOS app in RevenueCat
4. Link it to your App Store Connect app
5. Update your products to point to App Store product IDs

### Android (Google Play)

1. Create your app in Google Play Console
2. Configure in-app products in Google Play Console
3. Add an Android app in RevenueCat
4. Link it to your Google Play app
5. Update your products to point to Google Play product IDs

## Monitoring & Analytics

RevenueCat provides powerful analytics:

1. **Dashboard Overview**: See revenue, active subscriptions, and churn
2. **Charts**: Visualize revenue over time, trial conversions, etc.
3. **Customers**: View individual customer subscription histories
4. **Webhooks**: Set up webhooks for subscription events (optional)

## Troubleshooting

### "No offerings available" error

- Verify that your offering is marked as **"Current"**
- Check that packages are properly attached to products
- Ensure products have entitlements attached

### "Invalid API key" error

- Double-check the API key in your `.env` file
- Make sure you're using the **Public SDK Key**, not the Secret Key
- Verify the key is for the correct environment (Sandbox for testing)

### Purchases not restoring

- Ensure RevenueCat.logIn() is called with a consistent user ID
- Check that the same user ID is used across app installations
- Verify internet connectivity

## Support

- **RevenueCat Docs**: https://docs.revenuecat.com
- **RevenueCat Support**: https://www.revenuecat.com/support
- **Community**: https://community.revenuecat.com

## Security Best Practices

1. **Never commit API keys** to version control (they're in `.env` which should be in `.gitignore`)
2. **Use the Public SDK Key** in the app, never the Secret Key
3. **Enable fraud prevention** in RevenueCat settings
4. **Monitor for suspicious activity** in the dashboard

---

## Quick Reference

### Product IDs
- Monthly: `pro_monthly`
- Annual: `pro_annual`

### Entitlement ID
- Pro Access: `pro`

### Offering ID
- Default: `default`

### Package IDs
- Monthly: `$rc_monthly`
- Annual: `$rc_annual`

### Environment Variable
```bash
EXPO_PUBLIC_REVENUECAT_API_KEY=your_public_sdk_key_here
```

---

**Ready to test!** After completing these steps, restart your Expo development server and test the subscription flow in your app.
