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
    scripts: '/api/scripts',
    webhooksCreatomate: '/api/webhooks/creatomate',
    voiceClone: '/api/voice-clone',
    onboarding: '/api/onboarding',

    // TikTok Analyzer endpoints
    tiktokAnalyzer: {
      baseUrl: 'http://localhost:3001',
      accountAnalysis: '/api/account-analysis',
      accountAnalysisStatus: '/api/account-analysis/status',
      accountAnalysisResult: '/api/account-analysis/result',
      accountAnalysisChat: '/api/account-analysis/chat',
      accountAnalysisExisting: '/api/account-analysis/existing',
      handleValidate: '/api/account-analysis/validate-handle',
    },

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
    scripts: '/api/scripts',
    webhooksCreatomate: '/api/webhooks/creatomate',
    voiceClone: '/api/voice-clone',
    onboarding: '/api/onboarding',

    // TikTok Analyzer endpoints
    tiktokAnalyzer: {
      baseUrl: 'http://localhost:3001',
      accountAnalysis: '/api/account-analysis',
      accountAnalysisStatus: '/api/account-analysis/status',
      accountAnalysisResult: '/api/account-analysis/result',
      accountAnalysisChat: '/api/account-analysis/chat',
      accountAnalysisExisting: '/api/account-analysis/existing',
      handleValidate: '/api/account-analysis/validate-handle',
    },

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
    scripts: '/api/scripts',
    webhooksCreatomate: '/api/webhooks/creatomate',
    voiceClone: '/api/voice-clone',
    onboarding: '/api/onboarding',

    // TikTok Analyzer endpoints
    tiktokAnalyzer: {
      baseUrl: process.env.EXPO_PUBLIC_TIKTOK_ANALYZER_URL || 'https://your-tiktok-analyzer-production-url.com',
      accountAnalysis: '/api/account-analysis',
      accountAnalysisStatus: '/api/account-analysis/status',
      accountAnalysisResult: '/api/account-analysis/result',
      accountAnalysisChat: '/api/account-analysis/chat',
      accountAnalysisExisting: '/api/account-analysis/existing',
      handleValidate: '/api/account-analysis/validate-handle',
    },

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
    : API_ENVIRONMENTS.LOCAL_SERVER; // Using local server for development

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

  // Script chat endpoints
  SCRIPTS: () => {
    const config = getCurrentConfig();
    return config.baseUrl + config.scripts;
  },

  SCRIPT_GENERATE_VIDEO: (scriptId: string) => {
    const config = getCurrentConfig();
    return `${config.baseUrl}${config.scripts}/${scriptId}/generate-video`;
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

  // TikTok Analysis endpoints
  TIKTOK_ANALYSIS_START: () => {
    const config = getCurrentConfig();
    return config.tiktokAnalyzer.baseUrl + config.tiktokAnalyzer.accountAnalysis;
  },

  TIKTOK_ANALYSIS_STATUS: (runId: string) => {
    const config = getCurrentConfig();
    return `${config.tiktokAnalyzer.baseUrl}${config.tiktokAnalyzer.accountAnalysisStatus}/${runId}`;
  },

  TIKTOK_ANALYSIS_RESULT: (runId: string) => {
    const config = getCurrentConfig();
    return `${config.tiktokAnalyzer.baseUrl}${config.tiktokAnalyzer.accountAnalysisResult}/${runId}`;
  },

  TIKTOK_ACCOUNT_CONTEXT: (accountId: string) => {
    const config = getCurrentConfig();
    return `${config.tiktokAnalyzer.baseUrl}/api/v1/account-context/${accountId}`;
  },

  TIKTOK_ANALYSIS_CHAT: () => {
    const config = getCurrentConfig();
    return config.tiktokAnalyzer.baseUrl + config.tiktokAnalyzer.accountAnalysisChat;
  },

  TIKTOK_ANALYSIS_EXISTING: () => {
    const config = getCurrentConfig();
    return config.tiktokAnalyzer.baseUrl + config.tiktokAnalyzer.accountAnalysisExisting;
  },

  TIKTOK_HANDLE_VALIDATE: () => {
    const config = getCurrentConfig();
    return config.tiktokAnalyzer.baseUrl + config.tiktokAnalyzer.handleValidate;
  },

  TIKTOK_CONVERSATIONS: () => {
    const config = getCurrentConfig();
    return `${config.tiktokAnalyzer.baseUrl}/api/account-analysis/conversations`;
  },

  TIKTOK_CONVERSATION_MESSAGES: (conversationId: string) => {
    const config = getCurrentConfig();
    return `${config.tiktokAnalyzer.baseUrl}/api/account-analysis/conversations/${conversationId}/messages`;
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
  isDevelopment: CURRENT_API_ENVIRONMENT === API_ENVIRONMENTS.LOCAL_SERVER,
  isProduction: CURRENT_API_ENVIRONMENT === API_ENVIRONMENTS.PRODUCTION,
  useNodeServer: true, // Always using Node server now
};
