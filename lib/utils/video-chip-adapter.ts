import { VideoType } from '@/types/video';
import { VideoChipItem } from '@/types/video-chips';

/**
 * Transform a VideoType object to a chip-compatible format
 * This reduces the data payload and prepares for chip display
 */
export const transformVideoToChip = (video: VideoType): VideoChipItem => {
  // Create a readable title from video properties
  const title =
    video.title || `Video ${video.id?.slice(0, 8)}` || 'Untitled Video';

  // Format duration if available
  const duration =
    video.duration || video.duration_seconds
      ? formatDuration(video.duration || video.duration_seconds || 0)
      : undefined;

  // Map processing status
  const status = mapProcessingStatus(video.processing_status);

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
 * Transform an array of VideoType to chip format
 */
export const transformVideosToChips = (
  videos: VideoType[]
): VideoChipItem[] => {
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
 * Map VideoType processing status to standardized status
 */
const mapProcessingStatus = (
  status: VideoType['processing_status']
): VideoChipItem['status'] => {
  if (!status) return 'processed';

  switch (status) {
    case 'pending':
    case 'processing':
      return 'processing';
    case 'failed':
      return 'error';
    case 'completed':
      return 'processed';
    default:
      return 'processed';
  }
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
