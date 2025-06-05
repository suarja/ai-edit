import { CaptionConfiguration } from '@/types/video';
import { VIDEO_PRESETS } from '@/lib/config/video-presets';

/**
 * Converts a CaptionConfiguration to the Creatomate JSON structure
 * @param config The caption configuration from the UI
 * @returns A JSON object in the format expected by Creatomate
 */
export function convertCaptionConfigToCreatomate(
  config: CaptionConfiguration | null | undefined
): Record<string, any> {
  if (!config || !config.presetId) {
    // Return default structure if no config provided
    return {
      elements: [
        {
          id: 'caption-1',
          name: 'Subtitle-2',
          type: 'text',
          track: 2,
          time: 0,
          duration: null,
          x: '50%',
          y: '90%',
          width: '86.66%',
          height: '100%',
          font_family: 'Montserrat',
          font_weight: '700',
          font_size: '40px',
          text_transform: 'uppercase',
          fill_color: '#FFFFFF',
          stroke_color: '#000000',
          stroke_width: '8px',
          shadow_color: '#000000',
          shadow_blur: '2px',
          shadow_x: '2px',
          shadow_y: '2px',
          transcript_effect: 'karaoke',
          transcript_placement: 'bottom',
          transcript_maximum_length: 14,
          highlight_color: '#04f827',
        },
      ],
    };
  }

  // Find the selected preset
  const preset = VIDEO_PRESETS.find((p) => p.id === config.presetId);
  if (!preset) {
    throw new Error(`Preset with ID ${config.presetId} not found`);
  }

  // Use config values or fallback to preset values
  const placement = config.placement || preset.placement;

  // Map placement to y position
  let yPosition = '90%'; // Default bottom
  if (placement === 'top') {
    yPosition = '10%';
  } else if (placement === 'center') {
    yPosition = '50%';
  }

  return {
    elements: [
      {
        id: 'caption-1',
        name: 'Subtitle-2',
        type: 'text',
        track: 2,
        time: 0,
        duration: null,
        x: '50%',
        y: yPosition,
        width: '86.66%',
        height: '100%',
        font_family: preset.fontFamily,
        font_weight: preset.fontWeight === 'bold' ? '700' : '400',
        font_size: `${preset.fontSize}px`,
        text_transform: preset.uppercase ? 'uppercase' : 'none',
        fill_color: preset.fontColor,
        stroke_color: preset.strokeColor,
        stroke_width: `${preset.strokeWidth}px`,
        shadow_color: preset.shadowColor,
        shadow_blur: `${preset.shadowBlur}px`,
        shadow_x: `${preset.shadowOffsetX}px`,
        shadow_y: `${preset.shadowOffsetY}px`,
        transcript_effect: preset.effect,
        transcript_placement: 'animate',
        transcript_maximum_length: preset.maxWordsPerLine,
        highlight_color: preset.highlightColor,
      },
    ],
  };
}
