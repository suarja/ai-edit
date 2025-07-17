import { CaptionConfiguration } from '@/lib/types/video';
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
          name: 'Subtitles-1',
          type: 'text',
          track: 2,
          time: 0,
          width: '90%',
          height: '100%',
          x_alignment: '50%',
          y_alignment: '90%',
          font_family: 'Montserrat',
          font_weight: '700',
          font_size: '8 vmin',
          background_color: 'rgba(0,0,0,0.7)',
          background_x_padding: '26%',
          background_y_padding: '7%',
          background_border_radius: '28%',
          transcript_effect: 'karaoke',
          transcript_placement: 'animate',
          transcript_maximum_length: 25,
          transcript_color: '#04f827',
          fill_color: '#ffffff',
          stroke_color: '#333333',
          stroke_width: '1.05 vmin',
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

  // Map placement to y_alignment
  let y_alignment = '90%'; // Default bottom
  if (placement === 'top') {
    y_alignment = '10%';
  } else if (placement === 'center') {
    y_alignment = '50%';
  }

  return {
    elements: [
      {
        id: 'caption-1',
        name: 'Subtitles-1',
        type: 'text',
        track: 2,
        time: 0,
        width: preset.width,
        height: preset.height,
        x_alignment: '50%',
        y_alignment: y_alignment,
        font_family: preset.font_family,
        font_weight: preset.font_weight,
        font_size: preset.font_size,
        background_color: preset.background_color,
        background_x_padding: preset.background_x_padding,
        background_y_padding: preset.background_y_padding,
        background_border_radius: preset.background_border_radius,
        transcript_effect: preset.transcript_effect,
        transcript_placement: preset.transcript_placement,
        transcript_maximum_length: preset.transcript_maximum_length,
        transcript_color: preset.transcript_color,
        fill_color: preset.fill_color,
        stroke_color: preset.stroke_color,
        stroke_width: preset.stroke_width,
      },
    ],
  };
}
