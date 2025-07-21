import { z } from 'zod';
import { Database } from './supabase-types';

// Import shared types from editia-core React Native build
import type {
  VideoType,
  CaptionConfiguration,
  VideoEditorialProfile,
  Language,
  VideoRequestStatus,
  VideoId,
  ScriptId,
  UserId,
  HexColor,
  TranscriptEffect,
  EnhancedGeneratedVideoType,
} from 'editia-core/react-native';

import {
  LANGUAGES,
  VideoTemplateService,
  CaptionConfigurationSchema,
  VideoEditorialProfileSchema,
  validateCaptionConfig,
  validateVideoEditorialProfile,
  isValidVideo,
} from 'editia-core/react-native';

// Re-export shared types for backward compatibility
export type {
  VideoType,
  CaptionConfiguration,
  Language,
  VideoId,
  ScriptId,
  UserId,
  HexColor,
  TranscriptEffect,
  EnhancedGeneratedVideoType,
};

export { LANGUAGES, VideoTemplateService };

// Alias for backward compatibility
export type EditorialProfile = VideoEditorialProfile;

// Enhanced transcript effects for mobile-specific features (extends shared type)
export type MobileTranscriptEffect =
  | TranscriptEffect
  | 'karaoke'
  | 'highlight'
  | 'fade'
  | 'bounce'
  | 'slide'
  | 'enlarge';

// Mobile-specific video types (extend shared types)

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
  status: VideoRequestStatus;
  error_message?: string;
  analytics?: VideoAnalytics;
}

// Uploaded video type for the video details page

export type IUploadedVideo = Pick<
  Database['public']['Tables']['videos']['Row'],
  'id' | 'title' | 'description' | 'tags' | 'upload_url' | 'duration_seconds' | 'created_at' | 'storage_path' | 'user_id'
>;
// Union type for any video type
export type AnyVideoType =
  | VideoType
  | GeneratedVideo
  | EnhancedGeneratedVideoType
  | IUploadedVideo;

// Mobile-specific video request type (may have different structure than server)
export interface MobileVideoRequest {
  id: string;
  prompt: string;
  system_prompt: string;
  selected_videos: VideoType[];
  editorial_profile?: EditorialProfile;
  voice_id?: string;
  caption_config?: CaptionConfiguration;
  output_language: Language;
  status: VideoRequestStatus;
  created_at: string;
  updated_at: string;
  user_id: string;
}

// Utility function to get video URL from any video type
export function getVideoUrl(video: AnyVideoType): string | null {
  if ('upload_url' in video && video.upload_url) {
    return video.upload_url;
  }
  if ('render_url' in video && video.render_url) {
    return video.render_url as string;
  }
  if ('video_url' in video && video.video_url) {
    return video.video_url;
  }
  return null;
}

// Re-export shared validation schemas and functions
export const captionConfigSchema = CaptionConfigurationSchema;
export const editorialProfileSchema = VideoEditorialProfileSchema;

// Re-export validation functions
export { validateCaptionConfig as isValidCaptionConfig };
export { validateVideoEditorialProfile as isValidEditorialProfile };
export { isValidVideo };

// Mobile-specific validation schemas
export const mobileVideoRequestSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  system_prompt: z.string(),
  selected_videos: z.array(z.any()),
  editorial_profile: VideoEditorialProfileSchema.optional(),
  voice_id: z.string().optional(),
  caption_config: CaptionConfigurationSchema.optional(),
  output_language: z.string(),
  status: z.enum(['queued', 'processing', 'completed', 'failed']),
  created_at: z.string(),
  updated_at: z.string(),
  user_id: z.string(),
});

// Type guard for uploaded videos
export const isUploadedVideo = (video: any): video is IUploadedVideo => {
  return isValidVideo(video);
};
