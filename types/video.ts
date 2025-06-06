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
  thumbnail_url?: string;
  file_size?: number;
  processing_status?: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface GeneratedVideoType {
  id: string;
  type: 'generated';
  created_at: string;
  render_status: 'queued' | 'rendering' | 'done' | 'error';
  render_url: string | null;
  script: string;
  title?: string;
  description?: string;
}

export type AnyVideoType = VideoType | GeneratedVideoType;

export interface CaptionConfiguration {
  presetId: string;
  placement?: 'top' | 'bottom' | 'center';
}

// Enhanced types for better validation
export interface ValidatedVideo {
  id: string;
  url: string;
  title: string;
  description: string;
  tags: string[];
}

export interface VideoGenerationRequest {
  prompt: string;
  systemPrompt: string;
  selectedVideos: VideoType[];
  editorialProfile: EditorialProfile;
  voiceId: string;
  captionConfig?: CaptionConfiguration;
  outputLanguage: string;
}

export interface EditorialProfile {
  persona_description: string;
  tone_of_voice: string;
  audience: string;
  style_notes: string;
}

export interface VideoGenerationResult {
  requestId: string;
  scriptId: string;
  renderId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  estimatedCompletionTime?: Date;
}

export interface VideoGenerationError extends Error {
  code: string;
  context?: Record<string, any>;
  retryable: boolean;
  userMessage: string;
}

// Helper functions
export function getVideoUrl(video: AnyVideoType): string | null {
  if ('upload_url' in video) {
    // Regular VideoType
    return video.upload_url;
  } else if ('render_url' in video) {
    // GeneratedVideoType
    return video.render_url;
  }
  return null;
}

// Type guards for runtime validation
export function isValidVideo(video: any): video is VideoType {
  return (
    typeof video === 'object' &&
    video !== null &&
    typeof video.id === 'string' &&
    typeof video.upload_url === 'string' &&
    typeof video.title === 'string' &&
    Array.isArray(video.tags)
  );
}

export function isValidCaptionConfig(
  config: any
): config is CaptionConfiguration {
  return (
    typeof config === 'object' &&
    config !== null &&
    typeof config.presetId === 'string' &&
    config.presetId.trim().length > 0 &&
    (config.placement === undefined ||
      ['top', 'bottom', 'center'].includes(config.placement))
  );
}

export function isValidEditorialProfile(
  profile: any
): profile is EditorialProfile {
  return (
    typeof profile === 'object' &&
    profile !== null &&
    typeof profile.persona_description === 'string' &&
    typeof profile.tone_of_voice === 'string' &&
    typeof profile.audience === 'string' &&
    typeof profile.style_notes === 'string'
  );
}
