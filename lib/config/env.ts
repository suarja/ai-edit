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
  SUPABASE_SERVICE_ROLE_KEY?: string;

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

// Default values for critical configuration
// These are used as fallbacks when environment variables are missing in production
// NOTE: In a real production app, consider using EAS environment variables or a more secure approach
const DEFAULT_CONFIG = {
  SUPABASE_URL: 'https://dmljncjaomvhdichnuxm.supabase.co',
  SUPABASE_ANON_KEY:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtbGpuY2phb212aGRpY2hudXhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxODcyOTgsImV4cCI6MjA2Mzc2MzI5OH0.cnyouJA--VhckmQBbyQQv-PaRoiCeNM-_QJQ2aTwSNo',
  ENVIRONMENT: 'production' as const,
  SERVER_URL: 'https://nodejs-production-a774.up.railway.app',
  IS_TESTFLIGHT: true,
};

/**
 * Get environment variable with optional fallback
 *
 * NOTE: This approach requires callers to use specific environment variable keys directly
 * in the code where this function is used, to ensure Expo's static analysis can properly
 * inline the values.
 */
export const getEnvVar = (key: string, fallback?: string): string => {
  let value: string | undefined = undefined;

  // Handle each possible environment variable explicitly
  // This ensures we use dot notation as required by Expo
  switch (key) {
    case 'EXPO_PUBLIC_SUPABASE_URL':
      value = process.env.EXPO_PUBLIC_SUPABASE_URL;
      break;
    case 'EXPO_PUBLIC_SUPABASE_ANON_KEY':
      value = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      break;
    case 'SUPABASE_SERVICE_ROLE_KEY':
      value = process.env.SUPABASE_SERVICE_ROLE_KEY;
      break;
    case 'EXPO_PUBLIC_IS_TESTFLIGHT':
      value = process.env.EXPO_PUBLIC_IS_TESTFLIGHT;
      break;
    case 'EXPO_PUBLIC_ENVIRONMENT':
      value = process.env.EXPO_PUBLIC_ENVIRONMENT;
      break;
    case 'EXPO_PUBLIC_SERVER_URL':
      value = process.env.EXPO_PUBLIC_SERVER_URL;
      break;
    case 'OPENAI_API_KEY':
      value = process.env.OPENAI_API_KEY;
      break;
    case 'EXPO_PUBLIC_ELEVENLABS_API_KEY':
      value = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;
      break;
    case 'CREATOMATE_API_KEY':
      value = process.env.CREATOMATE_API_KEY;
      break;
    case 'AWS_REGION':
      value = process.env.AWS_REGION;
      break;
    case 'AWS_ACCESS_KEY_ID':
      value = process.env.AWS_ACCESS_KEY_ID;
      break;
    case 'AWS_SECRET_ACCESS_KEY':
      value = process.env.AWS_SECRET_ACCESS_KEY;
      break;
    default:
      console.warn(`Unhandled environment variable key: ${key}`);
  }

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
  let value: string | undefined = undefined;

  // Handle each possible environment variable explicitly
  switch (key) {
    case 'EXPO_PUBLIC_SUPABASE_URL':
      value = process.env.EXPO_PUBLIC_SUPABASE_URL;
      break;
    case 'EXPO_PUBLIC_SUPABASE_ANON_KEY':
      value = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      break;
    case 'SUPABASE_SERVICE_ROLE_KEY':
      value = process.env.SUPABASE_SERVICE_ROLE_KEY;
      break;
    case 'EXPO_PUBLIC_IS_TESTFLIGHT':
      value = process.env.EXPO_PUBLIC_IS_TESTFLIGHT;
      break;
    case 'EXPO_PUBLIC_ENVIRONMENT':
      value = process.env.EXPO_PUBLIC_ENVIRONMENT;
      break;
    case 'EXPO_PUBLIC_SERVER_URL':
      value = process.env.EXPO_PUBLIC_SERVER_URL;
      break;
    case 'OPENAI_API_KEY':
      value = process.env.OPENAI_API_KEY;
      break;
    case 'EXPO_PUBLIC_ELEVENLABS_API_KEY':
      value = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;
      break;
    case 'CREATOMATE_API_KEY':
      value = process.env.CREATOMATE_API_KEY;
      break;
    case 'AWS_REGION':
      value = process.env.AWS_REGION;
      break;
    case 'AWS_ACCESS_KEY_ID':
      value = process.env.AWS_ACCESS_KEY_ID;
      break;
    case 'AWS_SECRET_ACCESS_KEY':
      value = process.env.AWS_SECRET_ACCESS_KEY;
      break;
    default:
      console.warn(`Unhandled environment variable key: ${key}`);
  }

  if (value === undefined) {
    const errorMessage = `Required environment variable missing: ${key}`;
    if (__DEV__) {
      console.error(errorMessage);
      throw new Error(errorMessage);
    } else {
      // In production, log error but don't crash
      console.error(errorMessage);

      // Use fallback values for critical configuration
      if (key === 'EXPO_PUBLIC_SUPABASE_URL') {
        return DEFAULT_CONFIG.SUPABASE_URL;
      } else if (key === 'EXPO_PUBLIC_SUPABASE_ANON_KEY') {
        return DEFAULT_CONFIG.SUPABASE_ANON_KEY;
      }

      // For other variables, use a generic placeholder
      return `missing_${key.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
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
  let value: string | undefined = undefined;

  // Handle each possible environment variable explicitly
  switch (key) {
    case 'EXPO_PUBLIC_IS_TESTFLIGHT':
      value = process.env.EXPO_PUBLIC_IS_TESTFLIGHT;
      break;
    // Add other boolean environment variables as needed
    default:
      console.warn(`Unhandled boolean environment variable key: ${key}`);
  }

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
    // For each variable, we need to check it using dot notation
    let isSet = false;

    if (varName === 'EXPO_PUBLIC_SUPABASE_URL') {
      isSet = !!process.env.EXPO_PUBLIC_SUPABASE_URL;
    } else if (varName === 'EXPO_PUBLIC_SUPABASE_ANON_KEY') {
      isSet = !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    }

    // Don't report errors for variables we have fallbacks for
    if (
      !isSet &&
      varName !== 'EXPO_PUBLIC_SUPABASE_URL' &&
      varName !== 'EXPO_PUBLIC_SUPABASE_ANON_KEY'
    ) {
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
  SUPABASE_SERVICE_ROLE_KEY: getEnvVar('SUPABASE_SERVICE_ROLE_KEY'),

  // Feature flags with defaults
  IS_TESTFLIGHT: getBooleanEnvVar('EXPO_PUBLIC_IS_TESTFLIGHT', false),
  ENVIRONMENT: getEnvVar('EXPO_PUBLIC_ENVIRONMENT', 'development') as any,

  // Server URL with fallback
  SERVER_URL: getEnvVar('EXPO_PUBLIC_SERVER_URL', 'http://localhost:8081'),

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
  // Allow logging in production for debugging TestFlight issues
  const shouldLog = __DEV__ || env.IS_TESTFLIGHT;

  if (shouldLog) {
    console.log('🌍 Environment Status:');
    console.log(`- Environment: ${env.ENVIRONMENT}`);
    console.log(`- TestFlight: ${env.IS_TESTFLIGHT}`);
    console.log(
      `- Supabase URL: ${env.SUPABASE_URL ? '✅ Set' : '❌ Missing'}`
    );
    console.log(
      `- Supabase Anon Key: ${env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}`
    );
    console.log(
      `- Supabase Service Role Key: ${
        env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing'
      }`
    );
    console.log(`- Server URL: ${env.SERVER_URL}`);

    // Show where values are coming from
    if (process.env.EXPO_PUBLIC_SUPABASE_URL) {
      console.log('  Using Supabase URL from environment variables');
    } else {
      console.log('  Using DEFAULT Supabase URL fallback');
    }

    if (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('  Using Supabase Anon Key from environment variables');
    } else {
      console.log('  Using DEFAULT Supabase Anon Key fallback');
    }

    // Validate environment
    const validation = validateEnvironment();
    if (!validation.isValid) {
      console.error('❌ Environment validation failed:');
      validation.errors.forEach((error) => console.error(`  - ${error}`));
    } else {
      console.log('✅ Environment validation passed');
    }
  }
};
