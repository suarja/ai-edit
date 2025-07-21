import { VideoType } from './video.types';

/**
 * Video segment with temporal information
 */
export interface VideoSegment {
  start_time: string; // Format: "00:00"
  end_time: string; // Format: "00:15"
  content_type: 'intro' | 'main_content' | 'transition' | 'outro';
  description: string;
  visual_elements: string[];
  key_points: string[];
}

/**
 * Overall video structure analysis
 */
export interface VideoStructure {
  has_hook: boolean;
  has_call_to_action: boolean;
  transitions_count: number;
  pacing: 'fast' | 'medium' | 'slow';
}

/**
 * Key moments in the video for future editing
 */
export interface VideoKeyMoments {
  hook_start?: string; // Format: "00:05"
  main_content_start?: string; // Format: "00:15"
  call_to_action_start?: string; // Format: "01:45"
  end?: string; // Format: "02:00"
}

/**
 * Complete video analysis data from Gemini AI
 */
export interface VideoAnalysisData {
  // Basic metadata (existing + enhanced)
  title: string;
  description: string;
  tags: string[];

  // New: Temporal segmentation
  segments: VideoSegment[];

  // New: Global structure
  structure: VideoStructure;

  // Technical metadata
  content_type:
    | 'tutorial'
    | 'entertainment'
    | 'educational'
    | 'product_demo'
    | 'interview'
    | 'vlog'
    | 'other';
  language: string;
  duration_category: 'short' | 'medium' | 'long';

  // Timestamps for future editing
  key_moments: VideoKeyMoments;
}

/**
 * Extension of existing VideoType with analysis fields
 */
export interface VideoTypeWithAnalysis extends VideoType {
  analysis_status?: 'pending' | 'analyzing' | 'completed' | 'failed';
  analysis_data?: VideoAnalysisData;
  analysis_error?: string;
  analysis_completed_at?: string;
}

/**
 * Response from video analysis API
 */
export interface VideoAnalysisResponse {
  success: boolean;
  data?: VideoAnalysisData;
  error?: string;
  analysis_time?: number;
  method_used?: 'files' | 'inline';
}

/**
 * Request payload for video analysis
 */
export interface VideoAnalysisRequest {
  s3Key: string;
  fileName: string;
  fileSize: number;
}

/**
 * Validation schemas for video analysis data
 */
export const videoSegmentSchema = {
  start_time: (value: string) => /^\d{2}:\d{2}$/.test(value),
  end_time: (value: string) => /^\d{2}:\d{2}$/.test(value),
  content_type: (value: string) =>
    ['intro', 'main_content', 'transition', 'outro'].includes(value),
};

export const videoAnalysisDataSchema = {
  title: (value: string) => typeof value === 'string' && value.length > 0,
  description: (value: string) => typeof value === 'string' && value.length > 0,
  tags: (value: string[]) =>
    Array.isArray(value) && value.every((tag) => typeof tag === 'string'),
  segments: (value: VideoSegment[]) => Array.isArray(value) && value.length > 0,
  structure: (value: VideoStructure) =>
    typeof value === 'object' && value !== null,
  content_type: (value: string) =>
    [
      'tutorial',
      'entertainment',
      'educational',
      'product_demo',
      'interview',
      'vlog',
      'other',
    ].includes(value),
  language: (value: string) => typeof value === 'string' && value.length > 0,
  duration_category: (value: string) =>
    ['short', 'medium', 'long'].includes(value),
};

/**
 * Utility functions for video analysis
 */
export const VideoAnalysisUtils = {
  /**
   * Validate video analysis data
   */
  validateAnalysisData(data: any): data is VideoAnalysisData {
    try {
      return (
        videoAnalysisDataSchema.title(data.title) &&
        videoAnalysisDataSchema.description(data.description) &&
        videoAnalysisDataSchema.tags(data.tags) &&
        videoAnalysisDataSchema.segments(data.segments) &&
        videoAnalysisDataSchema.structure(data.structure) &&
        videoAnalysisDataSchema.content_type(data.content_type) &&
        videoAnalysisDataSchema.language(data.language) &&
        videoAnalysisDataSchema.duration_category(data.duration_category)
      );
    } catch {
      return false;
    }
  },

  /**
   * Convert seconds to MM:SS format
   */
  secondsToTimestamp(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  },

  /**
   * Convert MM:SS format to seconds
   */
  timestampToSeconds(timestamp: string): number {
    const [minutes, seconds] = timestamp.split(':').map(Number);
    return minutes * 60 + seconds;
  },

  /**
   * Get default analysis data structure
   */
  getDefaultAnalysisData(): VideoAnalysisData {
    return {
      title: '',
      description: '',
      tags: [],
      segments: [],
      structure: {
        has_hook: false,
        has_call_to_action: false,
        transitions_count: 0,
        pacing: 'medium',
      },
      content_type: 'other',
      language: 'fr',
      duration_category: 'medium',
      key_moments: {},
    };
  },
};
