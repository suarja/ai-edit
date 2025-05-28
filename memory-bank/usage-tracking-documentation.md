# Usage Tracking System Documentation

## Overview

The usage tracking system allows us to monitor and limit video generation usage for TestFlight beta users without requiring payment integration yet. It's designed to be easily extensible for future paid subscription features while providing immediate control over API usage.

## Database Schema

### Tables

#### `user_usage`

Tracks each user's video generation usage and limits.

| Column           | Type      | Description                                  |
| ---------------- | --------- | -------------------------------------------- |
| id               | UUID      | Primary key                                  |
| user_id          | UUID      | Foreign key to auth.users                    |
| videos_generated | INTEGER   | Number of videos generated in current period |
| videos_limit     | INTEGER   | Maximum number of videos allowed in period   |
| last_reset_date  | TIMESTAMP | When usage was last reset                    |
| next_reset_date  | TIMESTAMP | When usage will next reset                   |
| created_at       | TIMESTAMP | Record creation timestamp                    |
| updated_at       | TIMESTAMP | Record update timestamp                      |

#### `user_roles`

Stores user roles for permission management.

| Column     | Type      | Description               |
| ---------- | --------- | ------------------------- |
| id         | UUID      | Primary key               |
| user_id    | UUID      | Foreign key to auth.users |
| role       | TEXT      | Role name (e.g., 'admin') |
| created_at | TIMESTAMP | Record creation timestamp |

### Database Triggers

#### `handle_new_user()`

- Triggered after a new user is created in auth.users
- Automatically creates a user_usage record for new users
- Default limit: 5 videos per month

#### `reset_user_usage()`

- Triggered before updates to user_usage records
- Automatically resets usage counters when next_reset_date is reached
- Sets new reset date 30 days in the future

### Row Level Security (RLS) Policies

#### On `user_usage`:

- `user_usage_select_policy`: Users can only view their own usage
- `user_usage_update_policy`: Users can only update their own usage
- `admin_user_usage_policy`: Admins can view and modify all usage data

#### On `user_roles`:

- `bootstrap_admin_policy`: Allows initial admin creation
- `admin_user_roles_policy`: Only admins can manage roles
- `user_roles_select_policy`: Users can view their own roles

## Implementation Details

### Core Components

1. **Database Migration**:

   - `supabase/migrations/20250824170000_fixed_user_usage_setup.sql`
   - Creates tables, triggers, and policies
   - Makes the first user an admin
   - Backfills usage records for existing users

2. **Admin Utility**:

   - `supabase/functions/make-admin-by-email.sql`
   - Function to promote any user to admin by email

3. **Usage Dashboard Component**:

   - `components/UsageDashboard.tsx`
   - Displays usage statistics to users
   - Shows admin badge for admin users
   - Creates usage records if missing

4. **API Integration**:
   - `app/api/videos/generate+api.ts`
   - Checks usage limits before generating videos
   - Increments usage counter after successful generation

## Usage Flow

1. **User Registration**:

   - New user created in auth.users
   - Trigger automatically creates usage record
   - Default limit of 5 videos/month applied

2. **Video Generation**:

   - API checks if user has reached limit
   - If under limit, video generation proceeds
   - Usage counter incremented after successful generation

3. **Usage Reset**:
   - Automatic monthly reset via database trigger
   - Reset date calculated as 30 days from last reset

## Admin Operations

### Promoting an Admin

To make a user an admin, run:

```sql
SELECT make_admin_by_email('user@example.com');
```

### Adjusting User Limits

To change a user's video generation limit:

```sql
UPDATE user_usage
SET videos_limit = 10
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user@example.com');
```

### Resetting a User's Usage

To reset a specific user's usage counter:

```sql
UPDATE user_usage
SET videos_generated = 0,
    last_reset_date = now(),
    next_reset_date = now() + INTERVAL '30 days'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user@example.com');
```

## Future Enhancements

1. **Subscription Integration**:

   - Connect usage limits to subscription tiers
   - Automatic limit adjustment based on subscription level

2. **Admin Dashboard**:

   - UI for managing user limits
   - Usage analytics and reporting

3. **Flexible Reset Periods**:
   - Support for different reset periods (weekly, quarterly)
   - Custom limits for special users or events

## Troubleshooting

### Missing Usage Records

If a user doesn't have a usage record:

1. The UsageDashboard component will create one automatically
2. Alternatively, run this SQL:

```sql
INSERT INTO user_usage (user_id, videos_generated, videos_limit)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'user@example.com'),
  0,
  5
);
```

### Admin Access Issues

If admin policies aren't working:

1. Verify the user has an admin role:

```sql
SELECT * FROM user_roles
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@example.com');
```

2. If missing, create the role:

```sql
SELECT make_admin_by_email('admin@example.com');
```
