import { tokenCache } from '@clerk/clerk-expo/token-cache';

// Clerk configuration for Expo app
export const clerkConfig = {
  publishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || '',
  tokenCache,
};

// Validate Clerk configuration
export function validateClerkConfig() {
  const isValid = !!clerkConfig.publishableKey;

  if (!isValid) {
    console.error('❌ Clerk configuration invalid:');
    if (!clerkConfig.publishableKey) {
      console.error('  - Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY');
    }
  } else {
    console.log('✅ Clerk configuration valid');
  }

  return { isValid, config: clerkConfig };
}

// Development helper
if (__DEV__) {
  validateClerkConfig();
}
