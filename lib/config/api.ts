/**
 * Centralized API Configuration
 *
 * This file manages all API endpoints for the mobile app, allowing easy switching
 * between the legacy EAS functions and the new Node.js server.
 */

export const API_ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  LOCAL_SERVER: 'local_server',
} as const;

export type ApiEnvironment =
  (typeof API_ENVIRONMENTS)[keyof typeof API_ENVIRONMENTS];

// Configuration for different environments
const API_CONFIGS = {
  [API_ENVIRONMENTS.DEVELOPMENT]: {
    // Legacy EAS functions for development
    baseUrl: '', // Relative URLs for Expo Router API routes
    videoGenerate: '/api/videos/generate',
    videoStatus: '/api/videos/status',
    s3Upload: '/api/s3-upload',
    promptsEnhance: '/api/prompts/enhance',
    promptsEnhanceSystem: '/api/prompts/enhance-system',
    promptsGenerateSystem: '/api/prompts/generate-system',
    webhooksCreatomate: '/api/webhooks/creatomate',
    voiceClone: '/api/voice-clone',
    onboarding: '/api/onboarding',

    // Supabase functions (still needed for some features)
    supabase: {
      baseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL!,
      functions: {
        createVoiceClone: '/functions/v1/create-voice-clone',
        processOnboarding: '/functions/v1/process-onboarding',
      },
    },
  },

  [API_ENVIRONMENTS.LOCAL_SERVER]: {
    // New Node.js server running locally
    baseUrl: 'http://localhost:3000',
    videoGenerate: '/api/videos/generate',
    videoStatus: '/api/videos/status',
    s3Upload: '/api/s3-upload',
    promptsEnhance: '/api/prompts/enhance',
    promptsEnhanceSystem: '/api/prompts/enhance-system',
    promptsGenerateSystem: '/api/prompts/generate-system',
    webhooksCreatomate: '/api/webhooks/creatomate',
    voiceClone: '/api/voice-clone',
    onboarding: '/api/onboarding',

    // Supabase functions (still needed for some features)
    supabase: {
      baseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL!,
      functions: {
        createVoiceClone: '/functions/v1/create-voice-clone',
        processOnboarding: '/functions/v1/process-onboarding',
      },
    },
  },

  [API_ENVIRONMENTS.PRODUCTION]: {
    // Production Node.js server
    baseUrl:
      process.env.EXPO_PUBLIC_SERVER_URL ||
      'https://your-production-server.com',
    videoGenerate: '/api/videos/generate',
    videoStatus: '/api/videos/status',
    s3Upload: '/api/s3-upload',
    promptsEnhance: '/api/prompts/enhance',
    promptsEnhanceSystem: '/api/prompts/enhance-system',
    promptsGenerateSystem: '/api/prompts/generate-system',
    webhooksCreatomate: '/api/webhooks/creatomate',
    voiceClone: '/api/voice-clone',
    onboarding: '/api/onboarding',

    // Supabase functions (still needed for some features)
    supabase: {
      baseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL!,
      functions: {
        createVoiceClone: '/functions/v1/create-voice-clone',
        processOnboarding: '/functions/v1/process-onboarding',
      },
    },
  },
};

/**
 * Current API environment - change this to switch between environments
 *
 * Options:
 * - API_ENVIRONMENTS.DEVELOPMENT: Use legacy EAS functions (current)
 * - API_ENVIRONMENTS.LOCAL_SERVER: Use local Node.js server (for testing)
 * - API_ENVIRONMENTS.PRODUCTION: Use production Node.js server
 */
export const CURRENT_API_ENVIRONMENT: ApiEnvironment =
  process.env.NODE_ENV === 'production'
    ? API_ENVIRONMENTS.PRODUCTION
    : API_ENVIRONMENTS.LOCAL_SERVER; // Change this to test different environments

// Get current configuration
const getCurrentConfig = () => API_CONFIGS[CURRENT_API_ENVIRONMENT];

/**
 * API Endpoints - Use these throughout the app instead of hardcoded URLs
 */
export const API_ENDPOINTS = {
  CREATOMATE_RENDER: () => {
    return 'https://api.creatomate.com/v1/renders';
  },

  // Video generation endpoints
  VIDEO_GENERATE: () => {
    const config = getCurrentConfig();
    return config.baseUrl + config.videoGenerate;
  },

  VIDEO_STATUS: (videoId: string) => {
    const config = getCurrentConfig();
    return `${config.baseUrl}${config.videoStatus}/${videoId}`;
  },

  // File upload
  S3_UPLOAD: () => {
    const config = getCurrentConfig();
    return config.baseUrl + config.s3Upload;
  },

  // Prompt enhancement
  PROMPTS_ENHANCE: () => {
    const config = getCurrentConfig();
    return config.baseUrl + config.promptsEnhance;
  },

  PROMPTS_ENHANCE_SYSTEM: () => {
    const config = getCurrentConfig();
    return config.baseUrl + config.promptsEnhanceSystem;
  },

  PROMPTS_GENERATE_SYSTEM: () => {
    const config = getCurrentConfig();
    return config.baseUrl + config.promptsGenerateSystem;
  },

  // Webhooks
  WEBHOOKS_CREATOMATE: () => {
    const config = getCurrentConfig();
    return config.baseUrl + config.webhooksCreatomate;
  },

  // Voice Clone (Node.js server)
  VOICE_CLONE: () => {
    const config = getCurrentConfig();
    return config.baseUrl + config.voiceClone;
  },

  // Onboarding (Node.js server)
  ONBOARDING: () => {
    const config = getCurrentConfig();
    return config.baseUrl + config.onboarding;
  },

  // Supabase functions (still needed)
  SUPABASE_CREATE_VOICE_CLONE: () => {
    const config = getCurrentConfig();
    return config.supabase.baseUrl + config.supabase.functions.createVoiceClone;
  },

  SUPABASE_PROCESS_ONBOARDING: () => {
    const config = getCurrentConfig();
    return (
      config.supabase.baseUrl + config.supabase.functions.processOnboarding
    );
  },
};

/**
 * API Headers - Common headers for requests
 */
export const API_HEADERS = {
  JSON: {
    'Content-Type': 'application/json',
  },

  SUPABASE_AUTH: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
  },

  // For server endpoints that require user authentication (legacy Supabase)
  USER_AUTH: (token: string) => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }),

  // For server endpoints that require Clerk authentication
  CLERK_AUTH: (clerkToken: string) => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${clerkToken}`,
  }),

  CREATOMATE_AUTH: {
    Authorization: `Bearer ${process.env.CREATOMATE_API_KEY}`,
  },
};

/**
 * Utility function to log current API configuration (for debugging)
 */
export const debugApiConfig = () => {
  console.log('🔧 Current API Environment:', CURRENT_API_ENVIRONMENT);
  console.log('🔧 Current Config:', getCurrentConfig());
  console.log('🔧 Video Generate URL:', API_ENDPOINTS.VIDEO_GENERATE());
  console.log('🔧 S3 Upload URL:', API_ENDPOINTS.S3_UPLOAD());
};

/**
 * Environment-specific configurations
 */
export const ENV_CONFIG = {
  isDevelopment: CURRENT_API_ENVIRONMENT === API_ENVIRONMENTS.DEVELOPMENT,
  isLocalServer: CURRENT_API_ENVIRONMENT === API_ENVIRONMENTS.LOCAL_SERVER,
  isProduction: CURRENT_API_ENVIRONMENT === API_ENVIRONMENTS.PRODUCTION,
  useNodeServer: CURRENT_API_ENVIRONMENT !== API_ENVIRONMENTS.DEVELOPMENT,
};
