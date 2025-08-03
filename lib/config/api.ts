/**
 * Centralized API Configuration
 *
 * This file manages all API endpoints for the mobile app, allowing easy switching
 * between the legacy EAS functions and the new Node.js server.
 */

import { env } from '@/lib/config/env';

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
    scriptsModifyCurrentScript: '/api/scripts/modify-current-script',
    webhooksCreatomate: '/api/webhooks/creatomate',
    voiceClone: '/api/voice-clone',
    userVoices: '/api/voice-clone/user-voices',
    onboarding: '/api/onboarding',
    userManagement: '/api/user-management',

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
      baseUrl: env.SUPABASE_URL,
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
    scriptsModifyCurrentScript: '/api/scripts/modify-current-script',
    webhooksCreatomate: '/api/webhooks/creatomate',
    voiceClone: '/api/voice-clone',
    userVoices: '/api/voice-clone/user-voices',
    onboarding: '/api/onboarding',
    support: '/api/support',
    userManagement: '/api/user-management',
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
      baseUrl: env.SUPABASE_URL,
      functions: {
        createVoiceClone: '/functions/v1/create-voice-clone',
        processOnboarding: '/functions/v1/process-onboarding',
      },
    },
  },

  [API_ENVIRONMENTS.PRODUCTION]: {
    // Production Node.js server
    baseUrl: env.SERVER_URL,
    videoGenerate: '/api/videos/generate',
    videoStatus: '/api/videos/status',
    s3Upload: '/api/s3-upload',
    promptsEnhance: '/api/prompts/enhance',
    promptsEnhanceSystem: '/api/prompts/enhance-system',
    promptsGenerateSystem: '/api/prompts/generate-system',
    scripts: '/api/scripts',
    scriptsModifyCurrentScript: '/api/scripts/modify-current-script',
    webhooksCreatomate: '/api/webhooks/creatomate',
    voiceClone: '/api/voice-clone',
    userVoices: '/api/voice-clone/user-voices',
    onboarding: '/api/onboarding',
    support: '/api/support',
    userManagement: '/api/user-management',
    // TikTok Analyzer endpoints
    tiktokAnalyzer: {
      baseUrl: env.TIKTOK_ANALYZER_URL || env.SERVER_URL,
      accountAnalysis: '/api/account-analysis',
      accountAnalysisStatus: '/api/account-analysis/status',
      accountAnalysisResult: '/api/account-analysis/result',
      accountAnalysisChat: '/api/account-analysis/chat',
      accountAnalysisExisting: '/api/account-analysis/existing',
      handleValidate: '/api/account-analysis/validate-handle',
    },

    // Supabase functions (still needed for some features)
    supabase: {
      baseUrl: env.SUPABASE_URL,
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
  env.ENVIRONMENT === 'production' || env.ENVIRONMENT === 'preview'
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

  /**
   * @deprecated - Not used anymore, replaced by script-based video generation
   * Legacy endpoint from initial video generation implementation
   */
  VIDEO_GENERATE: () => {
    const config = getCurrentConfig();
    return config.baseUrl + config.videoGenerate;
  },

  /**
   * ACTIVELY USED ✅ - Video status tracking
   * Used in: app/(drawer)/videos.tsx
   * Purpose: Check video generation/processing status
   * Backend: server-primary/routes/api/videos.ts
   */
  VIDEO_STATUS: (videoId: string) => {
    const config = getCurrentConfig();
    return `${config.baseUrl}${config.videoStatus}/${videoId}`;
  },

  /**
   * ACTIVELY USED ✅ - Source video upload
   * Used in: components/hooks/useSourceVideos.ts
   * Purpose: Upload source videos to S3 storage
   * Backend: server-primary/routes/api/s3Upload.ts
   */
  S3_UPLOAD: () => {
    const config = getCurrentConfig();
    return config.baseUrl + config.s3Upload;
  },

  /**
   * NOT USED ❌ - Video analysis endpoint
   * No usage found in mobile app
   * Backend: server-primary/routes/api/videoAnalysis.ts
   * TODO: Verify if this should be removed
   */
  VIDEO_ANALYSIS: () => {
    const config = getCurrentConfig();
    return config.baseUrl + '/api/video-analysis';
  },

  /**
   * ACTIVELY USED ✅ - Video deletion
   * Used in: app/(drawer)/video-details/[id].tsx
   * Purpose: Delete videos from system
   * Backend: server-primary/routes/api/videoDelete.ts
   */
  VIDEO_DELETE: () => {
    const config = getCurrentConfig();
    return config.baseUrl + '/api/videos';
  },

  /**
   * @deprecated - Legacy prompt enhancement
   * Not used anymore but in the legacy create video page
   * Replaced by script-based generation flow
   */
  PROMPTS_ENHANCE: () => {
    const config = getCurrentConfig();
    return config.baseUrl + config.promptsEnhance;
  },
  /**
   * @deprecated - Legacy system prompt enhancement
   * Not used anymore but in the legacy create video page
   */
  PROMPTS_ENHANCE_SYSTEM: () => {
    const config = getCurrentConfig();
    return config.baseUrl + config.promptsEnhanceSystem;
  },
  /**
   * @deprecated - Legacy system prompt generation
   * Not used anymore but in the legacy create video page
   */
  PROMPTS_GENERATE_SYSTEM: () => {
    const config = getCurrentConfig();
    return config.baseUrl + config.promptsGenerateSystem;
  },

  /**
   * ACTIVELY USED ✅ - Script management
   * Used in: app/hooks/useScriptChat.ts, components/ScriptActionsModal.tsx, ScriptListActions.tsx
   * Purpose: CRUD operations for video scripts
   * Backend: server-primary/routes/api/scripts.ts
   */
  SCRIPTS: () => {
    const config = getCurrentConfig();
    return config.baseUrl + config.scripts;
  },
  
  /**
   * COMMENTED OUT IN CODE ⚠️ - Script-based video generation
   * Defined but commented out in: app/hooks/useVideoRequest.ts
   * Purpose: Generate video from script (main flow)
   * Backend: server-primary/routes/api/scripts.ts - generateVideoFromScriptHandler
   * TODO: Verify why this is commented out
   */
  SCRIPT_GENERATE_VIDEO: (scriptId: string) => {
    const config = getCurrentConfig();
    return `${config.baseUrl}${config.scripts}/generate-video/${scriptId}`;
  },

  /**
   * ACTIVELY USED ✅ - Script modification with AI
   * Used in: app/hooks/useScriptChat.ts
   * Purpose: Modify existing scripts with AI assistance
   * Backend: server-primary/routes/api/scripts.ts - modifyCurrentScriptHandler
   */
  SCRIPTS_MODIFY_CURRENT_SCRIPT: (scriptId: string) => {
    const config = getCurrentConfig();
    return `${config.baseUrl}${config.scriptsModifyCurrentScript}/${scriptId}`;
  },

  /**
   * @deprecated - Webhook endpoint moved to dedicated server
   * Not used by mobile app (webhooks are server-to-server)
   * Backend: server-primary/routes/api/webhooks.ts still exists
   */
  WEBHOOKS_CREATOMATE: () => {
    const config = getCurrentConfig();
    return config.baseUrl + config.webhooksCreatomate;
  },

  /**
   * ACTIVELY USED ✅ - Voice cloning operations
   * Used in: lib/services/voiceService.ts
   * Purpose: Voice cloning and sample management
   * Backend: server-primary/routes/api/voiceClone.ts
   */
  VOICE_CLONE: () => {
    const config = getCurrentConfig();
    return config.baseUrl + config.voiceClone;
  },

  /**
   * ACTIVELY USED ✅ - User voice library
   * Used in: lib/services/voiceService.ts
   * Purpose: Retrieve user's cloned voices
   * Backend: server-primary/routes/api/voiceClone.ts
   */
  USER_VOICES: () => {
    const config = getCurrentConfig();
    return config.baseUrl + config.userVoices;
  },

  /**
   * ACTIVELY USED ✅ - User onboarding
   * Used in: lib/services/voiceRecordingService.ts
   * Purpose: Process onboarding data including voice samples
   * Backend: server-primary/routes/api/onboarding.ts
   */
  ONBOARDING: () => {
    const config = getCurrentConfig();
    return config.baseUrl + config.onboarding;
  },

  /**
   * ACTIVELY USED ✅ - TikTok analysis initiation
   * Used in: components/analysis/StartAnalysisScreen.tsx
   * Purpose: Start TikTok account analysis
   * Backend: server-analyzer/routes/accountAnalysis.ts - startAnalysis
   */
  TIKTOK_ANALYSIS_START: () => {
    const config = getCurrentConfig();
    return (
      config.tiktokAnalyzer.baseUrl + config.tiktokAnalyzer.accountAnalysis
    );
  },

  /**
   * ACTIVELY USED ✅ - TikTok analysis status check
   * Used in: components/analysis/AnalysisInProgressScreen.tsx
   * Purpose: Check analysis job status
   * Backend: server-analyzer/routes/accountAnalysis.ts - getAnalysisStatus
   */
  TIKTOK_ANALYSIS_STATUS: (runId: string) => {
    const config = getCurrentConfig();
    return `${config.tiktokAnalyzer.baseUrl}${config.tiktokAnalyzer.accountAnalysisStatus}/${runId}`;
  },
  
  /**
   * @deprecated - Not used in mobile app
   * Backend endpoint exists but marked as TODO: remove
   * Backend: server-analyzer/routes/accountAnalysis.ts - getAnalysisStatusResult
   */
  TIKTOK_ANALYSIS_RESULT: (runId: string) => {
    const config = getCurrentConfig();
    return `${config.tiktokAnalyzer.baseUrl}${config.tiktokAnalyzer.accountAnalysisResult}/${runId}`;
  },

  /**
   * ACTIVELY USED ✅ - TikTok account insights
   * Used in: app/(drawer)/(analysis)/account-insights.tsx
   * Purpose: Retrieve analyzed account context and insights
   * Backend: server-analyzer/routes/accountContextRoutes.ts
   */
  TIKTOK_ACCOUNT_CONTEXT: (accountId: string) => {
    const config = getCurrentConfig();
    return `${config.tiktokAnalyzer.baseUrl}/api/account-context/${accountId}`;
  },

  /**
   * @deprecated - Chat endpoint not used
   * Replaced by conversation-based approach
   * Backend: server-analyzer/routes/accountAnalysis.ts - analysisChat
   */
  TIKTOK_ANALYSIS_CHAT: () => {
    const config = getCurrentConfig();
    return (
      config.tiktokAnalyzer.baseUrl + config.tiktokAnalyzer.accountAnalysisChat
    );
  },

  /**
   * ACTIVELY USED ✅ - Check existing analyses
   * Used in: components/hooks/useAccountAnalysis.ts
   * Purpose: Check for existing completed analyses
   * Backend: server-analyzer/routes/accountAnalysis.ts - getExistingAnalysis
   */
  TIKTOK_ANALYSIS_EXISTING: () => {
    const config = getCurrentConfig();
    return (
      config.tiktokAnalyzer.baseUrl +
      config.tiktokAnalyzer.accountAnalysisExisting
    );
  },
  
  /**
   * @deprecated - Duplicate of TIKTOK_ANALYSIS_VALIDATE
   * Backend marked as TODO: remove this route
   * Backend: server-analyzer/routes/accountAnalysis.ts - validateHandle
   */
  TIKTOK_HANDLE_VALIDATE: () => {
    const config = getCurrentConfig();
    return config.tiktokAnalyzer.baseUrl + config.tiktokAnalyzer.handleValidate;
  },

  /**
   * ACTIVELY USED ✅ - TikTok conversations list
   * Used in: app/(drawer)/(analysis)/account-conversations.tsx
   * Purpose: Retrieve AI-generated conversations for an account
   * Backend: server-analyzer/routes/accountAnalysis.ts - getAnalysisConversations
   */
  TIKTOK_CONVERSATIONS: () => {
    const config = getCurrentConfig();
    return `${config.tiktokAnalyzer.baseUrl}/api/account-analysis/conversations`;
  },

  /**
   * ACTIVELY USED ✅ - TikTok conversation details
   * Used in: components/hooks/useTikTokChatSimple.ts
   * Purpose: Retrieve messages for a specific conversation
   * Backend: server-analyzer/routes/accountAnalysis.ts - getConversationMessages
   */
  TIKTOK_CONVERSATION_MESSAGES: (conversationId: string) => {
    const config = getCurrentConfig();
    return `${config.tiktokAnalyzer.baseUrl}/api/account-analysis/conversations/${conversationId}/messages`;
  },

  /**
   * @deprecated - Legacy Supabase function
   * Replaced by Node.js voice clone endpoints
   * No longer used in mobile app
   */
  SUPABASE_CREATE_VOICE_CLONE: () => {
    const config = getCurrentConfig();
    return config.supabase.baseUrl + config.supabase.functions.createVoiceClone;
  },
  
  /**
   * @deprecated - Legacy Supabase function
   * Replaced by Node.js onboarding endpoint
   * No longer used in mobile app
   */
  SUPABASE_PROCESS_ONBOARDING: () => {
    const config = getCurrentConfig();
    return (
      config.supabase.baseUrl + config.supabase.functions.processOnboarding
    );
  },

  /**
   * ACTIVELY USED ✅ - TikTok handle validation
   * Used in: components/analysis/StartAnalysisScreen.tsx
   * Purpose: Validate TikTok handle before analysis
   * Backend: server-analyzer/routes/accountAnalysis.ts - validateHandle
   * Note: Duplicate of TIKTOK_HANDLE_VALIDATE (which is deprecated)
   */
  TIKTOK_ANALYSIS_VALIDATE: () => {
    const config = getCurrentConfig();
    return config.tiktokAnalyzer.baseUrl + config.tiktokAnalyzer.handleValidate;
  },

  /**
   * ACTIVELY USED ✅ - Active job check
   * Used in: components/hooks/useAccountAnalysis.ts
   * Purpose: Check for active/running analysis jobs
   * Backend: server-analyzer/routes/accountAnalysis.ts - getAnalysisActiveJob
   * TODO: Fix URL path - missing /api prefix
   */
  TIKTOK_ANALYSIS_ACTIVE_JOB: () => {
    const config = getCurrentConfig();
    return `${config.tiktokAnalyzer.baseUrl}/api/account-analysis/active-job`;
  },

  /**
   * ACTIVELY USED ✅ - Support/issue reporting
   * Used in: lib/services/support/supportService.ts
   * Purpose: Report issues and send support requests
   * Backend: server-primary/routes/api/support.ts
   */
  SUPPORT_REPORT_ISSUE: () => {
    const config = getCurrentConfig();
    return config.baseUrl + config.support + '/report-issue';
  },

  /**
   * ACTIVELY USED ✅ - User account deletion
   * Used in: components/hooks/useUserProfileManager.ts
   * Purpose: Delete user account and data
   * Backend: server-primary/routes/api/userManagement.ts
   */
  DELETE_USER: () => {
    const config = getCurrentConfig();
    return config.baseUrl + config.userManagement + '/delete-user';
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
    Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
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
    Authorization: `Bearer ${env.CREATOMATE_API_KEY}`,
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
