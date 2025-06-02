/**
 * Feature Flags Configuration
 *
 * This file contains feature flags used throughout the application.
 * It helps control which features are enabled in different environments.
 */

interface FeatureFlags {
  // Onboarding
  enableSubscriptionScreens: boolean;
  enableUsageLimits: boolean;
  disableAutoProgress: boolean;

  // Other feature flags can be added here
}

// Default configuration for development
const devFeatures: FeatureFlags = {
  enableSubscriptionScreens: true,
  enableUsageLimits: false,
  disableAutoProgress: true,
};

// Configuration for TestFlight beta
const testFlightFeatures: FeatureFlags = {
  enableSubscriptionScreens: false,
  enableUsageLimits: true,
  disableAutoProgress: true, // Disable auto-progression in TestFlight to give users time to review
};

// Configuration for production
const productionFeatures: FeatureFlags = {
  enableSubscriptionScreens: true,
  enableUsageLimits: true,
  disableAutoProgress: true,
};

// Determine which environment we're in
const isTestFlight = process.env.EXPO_PUBLIC_IS_TESTFLIGHT === 'true';
const isProduction = process.env.EXPO_PUBLIC_ENVIRONMENT === 'production';

// Select the appropriate feature set
// export const features: FeatureFlags = isProduction
//   ? productionFeatures
//   : isTestFlight
//   ? testFlightFeatures
//   : devFeatures;
export const features: FeatureFlags = isProduction
  ? productionFeatures
  : isTestFlight
  ? testFlightFeatures
  : devFeatures;

// Helper function to check if TestFlight build
export const isTestFlightBuild = (): boolean => {
  return process.env.EXPO_PUBLIC_IS_TESTFLIGHT === 'true';
};
