# Supabase Database Schema for Subscription System

This document outlines the database schema needed to support the subscription and paywall system in Careerguide.

## Overview

The subscription system tracks user subscription status, customization usage, and customization history. All subscription data is stored locally in AsyncStorage and synced to Supabase when the user is authenticated.

## User Profile Updates

The `profiles` table in Supabase should be updated to include the following subscription-related fields:

### New Columns for `profiles` Table

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'pro'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS customizations_used_total INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS customization_limit INTEGER DEFAULT 5;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS revenuecat_user_id TEXT;
```

### Column Descriptions

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `subscription_status` | TEXT | 'free' | User's current subscription tier ('free' or 'pro') |
| `customizations_used_total` | INTEGER | 0 | Lifetime count of AI roadmap customizations used |
| `customization_limit` | INTEGER | 5 | Maximum customizations allowed (5 for free, unlimited for pro) |
| `revenuecat_user_id` | TEXT | NULL | RevenueCat user ID for cross-platform subscription management |

## New Table: `customization_logs`

Create a new table to track all roadmap customization events for analytics and security.

```sql
CREATE TABLE IF NOT EXISTS customization_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  from_timeline TEXT NOT NULL,
  to_timeline TEXT NOT NULL,
  customization_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX idx_customization_logs_user_id ON customization_logs(user_id);
CREATE INDEX idx_customization_logs_timestamp ON customization_logs(timestamp);
```

### Table Schema

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Unique identifier for the log entry |
| `user_id` | UUID | Foreign key to profiles table |
| `timestamp` | TIMESTAMPTZ | When the customization occurred |
| `from_timeline` | TEXT | Original transition timeline (e.g., '3-6m') |
| `to_timeline` | TEXT | New transition timeline after customization |
| `customization_data` | JSONB | Additional customization parameters (optional) |
| `created_at` | TIMESTAMPTZ | Record creation timestamp |

## Row Level Security (RLS) Policies

### Profiles Table Updates

```sql
-- Allow users to read their own subscription status
CREATE POLICY "Users can view own subscription data"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own subscription data
CREATE POLICY "Users can update own subscription data"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

### Customization Logs Table

```sql
-- Enable RLS
ALTER TABLE customization_logs ENABLE ROW LEVEL SECURITY;

-- Users can insert their own customization logs
CREATE POLICY "Users can insert own customization logs"
  ON customization_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own customization logs
CREATE POLICY "Users can view own customization logs"
  ON customization_logs FOR SELECT
  USING (auth.uid() = user_id);
```

## Synchronization

The app uses a local-first approach with cloud sync:

1. **Local Storage** (AsyncStorage): Primary data store for subscription status and usage
2. **Supabase**: Backup and cross-device sync when user is authenticated

### Sync Flow

1. On app start: Load from local storage
2. On user sign-in: Sync local data to Supabase
3. On customization: Update local storage, then sync to Supabase (if authenticated)
4. On RevenueCat purchase: Update both local and Supabase immediately

## Offline Resilience

The app maintains offline functionality by:

- Caching subscription status locally
- Falling back to local storage when Supabase is unavailable
- Syncing changes when connection is restored

## Migration Notes

For existing users upgrading to this version:

1. Default values are automatically applied for new fields
2. `subscription_status` defaults to 'free'
3. `customizations_used_total` defaults to 0
4. `customization_limit` defaults to 5
5. No data loss occurs - existing profile data is preserved

## Analytics Queries

### Track customization usage by user

```sql
SELECT
  p.email,
  p.subscription_status,
  COUNT(cl.id) as total_customizations,
  MAX(cl.timestamp) as last_customization
FROM profiles p
LEFT JOIN customization_logs cl ON p.id = cl.user_id
GROUP BY p.id, p.email, p.subscription_status
ORDER BY total_customizations DESC;
```

### Find users approaching their limit

```sql
SELECT
  email,
  customizations_used_total,
  customization_limit,
  (customization_limit - customizations_used_total) as remaining
FROM profiles
WHERE subscription_status = 'free'
  AND (customization_limit - customizations_used_total) <= 1
ORDER BY remaining ASC;
```

### Revenue opportunity analysis

```sql
SELECT
  COUNT(*) as users_at_limit,
  ROUND(AVG(customizations_used_total), 2) as avg_customizations
FROM profiles
WHERE subscription_status = 'free'
  AND customizations_used_total >= customization_limit;
```
