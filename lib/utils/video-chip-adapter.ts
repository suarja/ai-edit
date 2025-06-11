import { VideoChipItem } from '@/types/video-chips';

/**
 * Transform a video object to a chip-compatible format
 * This reduces the data payload and prepares for chip display
 */
export const transformVideoToChip = (video: any): VideoChipItem => {
  // Create a readable title from various video properties
  const title =
    video.title ||
    video.filename ||
    video.original_filename ||
    `Video ${video.id?.slice(0, 8)}` ||
    'Untitled Video';

  // Format duration if available
  const duration = video.duration ? formatDuration(video.duration) : undefined;

  // Map processing status
  const status = mapProcessingStatus(video.processing_status || video.status);

  return {
    label: title,
    value: video.id,
    tags: video.tags || [],
    duration,
    status,
    created_at: video.created_at,
  };
};

/**
 * Transform an array of videos to chip format
 */
export const transformVideosToChips = (videos: any[]): VideoChipItem[] => {
  return videos.map(transformVideoToChip);
};

/**
 * Format duration from seconds to readable format
 */
const formatDuration = (duration: number | string): string => {
  const seconds =
    typeof duration === 'string' ? parseFloat(duration) : duration;

  if (isNaN(seconds) || seconds < 0) return '0:00';

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Map various processing status values to standardized status
 */
const mapProcessingStatus = (
  status: string | undefined
): VideoChipItem['status'] => {
  if (!status) return 'processed';

  const normalizedStatus = status.toLowerCase();

  if (
    normalizedStatus.includes('process') ||
    normalizedStatus.includes('pending')
  ) {
    return 'processing';
  }

  if (normalizedStatus.includes('error') || normalizedStatus.includes('fail')) {
    return 'error';
  }

  return 'processed';
};

/**
 * Get chip display text with optional metadata
 */
export const getChipDisplayText = (
  chip: VideoChipItem,
  config?: { showDuration?: boolean; showStatus?: boolean }
): string => {
  let displayText = chip.label;

  if (config?.showDuration && chip.duration) {
    displayText += ` (${chip.duration})`;
  }

  if (config?.showStatus && chip.status !== 'processed') {
    const statusEmoji = chip.status === 'processing' ? '⏳' : '❌';
    displayText += ` ${statusEmoji}`;
  }

  return displayText;
};
