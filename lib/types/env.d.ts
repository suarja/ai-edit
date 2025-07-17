/// <reference types="expo/types" />

declare module '@env' {
  export const EXPO_PUBLIC_SUPABASE_URL: string;
  export const EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
  export const EXPO_PUBLIC_IS_TESTFLIGHT: string;
  export const EXPO_PUBLIC_ENVIRONMENT:
    | 'development'
    | 'preview'
    | 'production';
  export const EXPO_PUBLIC_SERVER_URL: string;
  export const EXPO_PUBLIC_ELEVENLABS_API_KEY: string;
  export const EXPO_PUBLIC_ANALYTICS_KEY: string;
}

// Add support for accessing environment variables via process.env
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_SUPABASE_URL: string;
      EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
      EXPO_PUBLIC_IS_TESTFLIGHT: string;
      EXPO_PUBLIC_ENVIRONMENT: 'development' | 'preview' | 'production';
      EXPO_PUBLIC_SERVER_URL: string;
      EXPO_PUBLIC_ELEVENLABS_API_KEY: string;
      EXPO_PUBLIC_ANALYTICS_KEY: string;

      // Non-public variables
      OPENAI_API_KEY?: string;
      CREATOMATE_API_KEY?: string;
      AWS_REGION?: string;
      AWS_ACCESS_KEY_ID?: string;
      AWS_SECRET_ACCESS_KEY?: string;
    }
  }
}

export {};
