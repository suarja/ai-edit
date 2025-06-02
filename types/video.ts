// Base video interface that both types will implement
export interface BaseVideoType {
  id: string;
  title?: string;
  description?: string;
  tags?: string[];
  created_at: string;
  duration_seconds?: number;
}

// Regular uploaded video type
export interface UploadedVideoType extends BaseVideoType {
  upload_url: string;
  storage_path?: string;
  user_id?: string;
  type: 'uploaded';
}

// AI-generated video type
export interface GeneratedVideoType extends BaseVideoType {
  render_status: 'queued' | 'rendering' | 'done' | 'error';
  render_url: string | null;
  render_snapshot_url?: string | null;
  render_duration?: number | null;
  render_width?: number | null;
  render_height?: number | null;
  render_error?: string | null;
  script_id?: string;
  script?: {
    id: string;
    raw_prompt: string;
    generated_script: string;
  } | null;
  type: 'generated';
}

// Union type for any video
export type VideoType = UploadedVideoType | GeneratedVideoType;

// Utility functions to check which type of video we're dealing with
export const isUploadedVideo = (
  video: VideoType
): video is UploadedVideoType => {
  return video.type === 'uploaded';
};

export const isGeneratedVideo = (
  video: VideoType
): video is GeneratedVideoType => {
  return video.type === 'generated';
};

// Utility to get the video URL regardless of type
export const getVideoUrl = (video: VideoType): string | null => {
  if (isUploadedVideo(video)) {
    return video.upload_url;
  } else if (isGeneratedVideo(video)) {
    return video.render_url;
  }
  return null;
};
