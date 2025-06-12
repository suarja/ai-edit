import { z } from 'zod';

// Type definitions for color constraints
export type HexColor = `#${string}`;

// Enhanced transcript effects supported by Creatomate
export type TranscriptEffect =
  | 'karaoke'
  | 'highlight'
  | 'fade'
  | 'bounce'
  | 'slide'
  | 'enlarge';

// Caption configuration interface (simplified, no legacy support)
export interface CaptionConfiguration {
  enabled: boolean; // Toggle control for enabling/disabling captions
  presetId?: string; // Preset identifier (karaoke, beasty, etc.)
  placement: 'top' | 'center' | 'bottom'; // Position on screen
  transcriptColor?: HexColor; // Custom color override for transcript_color
  transcriptEffect?: TranscriptEffect; // Custom effect override for transcript_effect
}

// Video type definitions
export interface VideoType {
  id: string;
  title: string;
  description: string;
  upload_url: string;
  tags: string[];
  user_id: string;
  created_at: string;
  updated_at: string;
  duration?: number;
  duration_seconds?: number;
  thumbnail_url?: string;
  file_size?: number;
  processing_status?: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface VideoWithRelated extends VideoType {
  related_videos?: VideoType[];
}

export interface VideoAnalytics {
  views: number;
  likes: number;
  shares: number;
  watch_time_minutes: number;
  engagement_rate: number;
}

export interface GeneratedVideo extends VideoType {
  prompt: string;
  system_prompt?: string;
  render_id: string;
  video_url?: string;
  script?: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  error_message?: string;
  analytics?: VideoAnalytics;
}

// Enhanced generated video type for the video details page
export interface EnhancedGeneratedVideoType {
  id: string;
  type: 'generated';
  title?: string;
  description?: string;
  prompt?: string;
  script_content?: string;
  output_language?: string;
  created_at: string;
  render_status: 'queued' | 'rendering' | 'done' | 'error';
  render_url: string | null;
  render_error?: string;
  script?: {
    id: string;
    generated_script: string;
    raw_prompt: string;
    output_language: string;
  };
  duration_seconds?: number;
}

// Uploaded video type for the video details page
export interface UploadedVideoType {
  id: string;
  type: 'uploaded';
  title: string;
  description: string;
  tags: string[];
  upload_url: string;
  duration_seconds: number;
  created_at: string;
  storage_path?: string;
  user_id: string;
}

// Union type for any video type
export type AnyVideoType =
  | VideoType
  | GeneratedVideo
  | EnhancedGeneratedVideoType
  | UploadedVideoType;

export interface VideoRequest {
  id: string;
  prompt: string;
  system_prompt: string;
  selected_videos: VideoType[];
  editorial_profile?: EditorialProfile;
  voice_id?: string;
  caption_config?: CaptionConfiguration;
  output_language: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface EditorialProfile {
  persona_description: string;
  tone_of_voice: string;
  audience: string;
  style_notes: string;
  examples?: string;
}

// Language options
export type Language =
  | 'en'
  | 'fr'
  | 'es'
  | 'de'
  | 'it'
  | 'pt'
  | 'ru'
  | 'ja'
  | 'ko'
  | 'zh';

export const LANGUAGES: Record<Language, string> = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  ru: 'Русский',
  ja: '日本語',
  ko: '한국어',
  zh: '中文',
};

// Utility function to get video URL from any video type
export function getVideoUrl(video: AnyVideoType): string | null {
  if ('upload_url' in video && video.upload_url) {
    return video.upload_url;
  }
  if ('render_url' in video && video.render_url) {
    return video.render_url;
  }
  if ('video_url' in video && video.video_url) {
    return video.video_url;
  }
  return null;
}

// Validation schemas
export const videoSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  upload_url: z.string().url(),
  tags: z.array(z.string()),
  user_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  duration: z.number().optional(),
  thumbnail_url: z.string().url().optional(),
  file_size: z.number().optional(),
  processing_status: z
    .enum(['pending', 'processing', 'completed', 'failed'])
    .optional(),
});

export const captionConfigSchema = z.object({
  enabled: z.boolean(),
  presetId: z.string().optional(),
  placement: z.enum(['top', 'center', 'bottom']),
  transcriptColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  transcriptEffect: z
    .enum(['karaoke', 'highlight', 'fade', 'bounce', 'slide', 'enlarge'])
    .optional(),
});

export const editorialProfileSchema = z.object({
  persona_description: z.string().min(1),
  tone_of_voice: z.string().min(1),
  audience: z.string().min(1),
  style_notes: z.string().min(1),
  examples: z.string().optional(),
});

// Type guards
export const isValidVideo = (video: any): video is VideoType => {
  return videoSchema.safeParse(video).success;
};

export const isValidCaptionConfig = (
  config: any
): config is CaptionConfiguration => {
  return captionConfigSchema.safeParse(config).success;
};

export const isValidEditorialProfile = (
  profile: any
): profile is EditorialProfile => {
  return editorialProfileSchema.safeParse(profile).success;
};

// Type guard for uploaded videos
export const isUploadedVideo = (video: any): video is UploadedVideoType => {
  return video && video.type === 'uploaded';
};
