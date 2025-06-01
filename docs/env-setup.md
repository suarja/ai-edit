# Environment Variable Management

This document outlines how environment variables are handled in the AI Edit app, including best practices, troubleshooting, and setup instructions.

## Environment Variables Used

The app uses the following key environment variables:

### Required Variables

- `EXPO_PUBLIC_SUPABASE_URL`: URL for the Supabase project
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Anonymous key for Supabase API access

### Optional Variables

- `EXPO_PUBLIC_IS_TESTFLIGHT`: Flag indicating TestFlight environment
- `EXPO_PUBLIC_ENVIRONMENT`: Environment name (development, preview, production)
- `EXPO_PUBLIC_SERVER_URL`: Base URL for API server
- `EXPO_PUBLIC_ELEVENLABS_API_KEY`: Key for ElevenLabs voice API

## Safe to Commit vs. Keep Private

### Safe to Commit

- `EXPO_PUBLIC_*` variables in eas.json - These are public keys meant for client-side use
- Default values in lib/config/env.ts - These are fallbacks for public variables
- TypeScript definitions in types/env.d.ts
- Documentation with placeholder examples

### Keep Private (Never Commit)

- `.env` and `.env.local` files - These should always be in .gitignore
- Private API keys for server-side services (OpenAI, AWS, etc.)
- Admin keys or secret keys that provide privileged access
- Production database credentials

Note: While Supabase anonymous keys are technically safe to commit (they're designed for public client use), it's still best practice to manage them through environment variables rather than hardcoding them.

## Setup Instructions

### Local Development

1. Create a `.env` file in the project root with required variables:

   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   EXPO_PUBLIC_ENVIRONMENT=development
   ```

2. For local builds with environment variables, use the `set-env.sh` script:
   ```bash
   ./set-env.sh eas build --profile development --platform ios --local
   ```

### EAS Build Configuration

Environment variables are defined in `eas.json` for each build profile:

```json
{
  "build": {
    "development": {
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "your-supabase-url",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-supabase-key",
        "EXPO_PUBLIC_ENVIRONMENT": "development"
      },
      "channel": "development"
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "your-supabase-url",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-supabase-key",
        "EXPO_PUBLIC_ENVIRONMENT": "production"
      },
      "channel": "production"
    }
  }
}
```

### EAS Dashboard Setup

For more secure management of environment variables:

1. Go to Expo Dashboard > Your Project > Settings > Environment Variables
2. Add variables for each environment (development, preview, production)
3. Use `eas env:pull --environment [env]` to pull variables locally

## Fallback Mechanism

The app includes a fallback mechanism for critical variables in `lib/config/env.ts` to prevent crashes in production. However, these should be used as a last resort, and proper environment variable setup is preferred.

## Common Issues and Solutions

### Missing Environment Variables in EAS Builds

If environment variables are missing in EAS builds:

1. Verify variables are correctly defined in `eas.json`
2. Ensure you've set the environment for the build profile:
   ```json
   "production": {
     "environment": "production"
   }
   ```
3. Set up environment variables in the EAS Dashboard
4. Use `eas env:pull` to sync variables locally

### Verifying Environment Variables

Use the `logEnvironmentStatus()` function in development to check which variables are loaded.

## Security Considerations

- Never commit `.env` files to version control
- Use the EAS Dashboard for sensitive variables instead of hardcoding them
- For local development, use `.env.local` (added to `.gitignore`)
- Use a service like Bitwarden or 1Password to store and share environment values securely

## Best Practices

1. Always include fallback values for non-sensitive variables
2. Use the TypeScript definitions in `types/env.d.ts` for type safety
3. Add environment validation on app startup
4. Show user-friendly error messages for missing configuration
5. Test across all environments before releasing

## Reference Documentation

- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [EAS Environment Variables](https://docs.expo.dev/build-reference/variables/)
- [Supabase Environment Variables](https://supabase.com/docs/guides/auth/env-variables)
