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

export interface CaptionConfiguration {
  presetId: string;
  placement: 'top' | 'bottom' | 'center';
  fontFamily?: string;
  fontSize?: number;
  fontColor?: string;
  backgroundColor?: string;
  animation?: string;
  effect?: string;
  highlightColor?: string;
  maxWordsPerLine?: number;
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
    ['top', 'bottom', 'center'].includes(config.placement) &&
    typeof config.lines === 'number' &&
    config.lines > 0
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
