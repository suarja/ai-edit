/**
 * Environment Variable Management
 *
 * Provides safe access to environment variables with fallbacks and validation.
 * Prevents app crashes due to missing environment variables in production.
 */

interface EnvConfig {
  // Supabase
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;

  // Feature flags
  IS_TESTFLIGHT: boolean;
  ENVIRONMENT: 'development' | 'preview' | 'production';

  // API endpoints
  SERVER_URL: string;

  // External APIs (optional in some environments)
  OPENAI_API_KEY?: string;
  ELEVENLABS_API_KEY?: string;
  CREATOMATE_API_KEY?: string;

  // AWS (optional)
  AWS_REGION?: string;
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
}

/**
 * Get environment variable with optional fallback
 */
export const getEnvVar = (key: string, fallback?: string): string => {
  const value = process.env[key];

  if (!value) {
    if (fallback !== undefined) {
      return fallback;
    }

    if (__DEV__) {
      console.warn(`Missing environment variable: ${key}`);
    }

    return '';
  }

  return value;
};

/**
 * Get required environment variable - throws error if missing
 */
export const getRequiredEnvVar = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    const error = `Required environment variable missing: ${key}`;

    if (__DEV__) {
      console.error(error);
      throw new Error(error);
    } else {
      // In production, log error but don't crash
      console.error(error);
      return '';
    }
  }

  return value;
};

/**
 * Get boolean environment variable
 */
export const getBooleanEnvVar = (
  key: string,
  defaultValue: boolean = false
): boolean => {
  const value = process.env[key];

  if (!value) {
    return defaultValue;
  }

  return value.toLowerCase() === 'true';
};

/**
 * Validate critical environment variables on app startup
 */
export const validateEnvironment = (): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  const requiredVars = [
    'EXPO_PUBLIC_SUPABASE_URL',
    'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  ];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Safe environment configuration
 */
export const env: EnvConfig = {
  // Required variables
  SUPABASE_URL: getRequiredEnvVar('EXPO_PUBLIC_SUPABASE_URL'),
  SUPABASE_ANON_KEY: getRequiredEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY'),

  // Feature flags with defaults
  IS_TESTFLIGHT: getBooleanEnvVar('EXPO_PUBLIC_IS_TESTFLIGHT', false),
  ENVIRONMENT: getEnvVar('EXPO_PUBLIC_ENVIRONMENT', 'development') as any,

  // Server URL with fallback
  SERVER_URL: getEnvVar(
    'EXPO_PUBLIC_SERVER_URL',
    'https://your-production-url.com'
  ),

  // Optional API keys
  OPENAI_API_KEY: getEnvVar('OPENAI_API_KEY'),
  ELEVENLABS_API_KEY: getEnvVar('EXPO_PUBLIC_ELEVENLABS_API_KEY'),
  CREATOMATE_API_KEY: getEnvVar('CREATOMATE_API_KEY'),

  // AWS configuration
  AWS_REGION: getEnvVar('AWS_REGION', 'us-east-1'),
  AWS_ACCESS_KEY_ID: getEnvVar('AWS_ACCESS_KEY_ID'),
  AWS_SECRET_ACCESS_KEY: getEnvVar('AWS_SECRET_ACCESS_KEY'),
};

/**
 * Log environment status (only in development)
 */
export const logEnvironmentStatus = (): void => {
  if (!__DEV__) {
    return;
  }

  console.log('🌍 Environment Status:');
  console.log(`- Environment: ${env.ENVIRONMENT}`);
  console.log(`- TestFlight: ${env.IS_TESTFLIGHT}`);
  console.log(`- Supabase URL: ${env.SUPABASE_URL ? '✅ Set' : '❌ Missing'}`);
  console.log(
    `- Supabase Anon Key: ${env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}`
  );
  console.log(`- Server URL: ${env.SERVER_URL}`);

  // Validate environment
  const validation = validateEnvironment();
  if (!validation.isValid) {
    console.error('❌ Environment validation failed:');
    validation.errors.forEach((error) => console.error(`  - ${error}`));
  } else {
    console.log('✅ Environment validation passed');
  }
};
