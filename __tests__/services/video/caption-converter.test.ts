import { convertCaptionConfigToCreatomate } from '@/lib/utils/video/caption-converter';
import { CaptionConfiguration } from '@/lib/types/video';

describe('Caption Converter', () => {
  it('returns default structure when no config is provided', () => {
    const result = convertCaptionConfigToCreatomate(null);

    expect(result).toHaveProperty('elements');
    expect(result.elements).toHaveLength(1);
    expect(result.elements[0]).toHaveProperty('id', 'caption-1');
    expect(result.elements[0]).toHaveProperty('y_alignment', '90%');
    expect(result.elements[0]).toHaveProperty(
      'transcript_placement',
      'animate'
    );
    expect(result.elements[0]).toHaveProperty('transcript_effect', 'karaoke');
    expect(result.elements[0]).toHaveProperty('font_family', 'Montserrat');
    expect(result.elements[0]).toHaveProperty('font_size', '8 vmin');
    expect(result.elements[0]).toHaveProperty('stroke_width', '1.05 vmin');
  });

  it('returns default structure when undefined config is provided', () => {
    const result = convertCaptionConfigToCreatomate(undefined);

    expect(result).toHaveProperty('elements');
    expect(result.elements).toHaveLength(1);
    expect(result.elements[0]).toHaveProperty('transcript_effect', 'karaoke');
  });

  it('converts karaoke preset correctly with top placement', () => {
    const config: CaptionConfiguration = {
      presetId: 'karaoke',
      placement: 'top',
    };

    const result = convertCaptionConfigToCreatomate(config);

    expect(result.elements[0]).toHaveProperty('transcript_effect', 'karaoke');
    expect(result.elements[0]).toHaveProperty('y_alignment', '10%');
    expect(result.elements[0]).toHaveProperty('transcript_color', '#04f827');
    expect(result.elements[0]).toHaveProperty('font_family', 'Montserrat');
    expect(result.elements[0]).toHaveProperty(
      'background_color',
      'rgba(216,216,216,0)'
    );
    expect(result.elements[0]).toHaveProperty('stroke_width', '1.05 vmin');
  });

  it('converts karaoke preset correctly with bottom placement', () => {
    const config: CaptionConfiguration = {
      presetId: 'karaoke',
      placement: 'bottom',
    };

    const result = convertCaptionConfigToCreatomate(config);

    expect(result.elements[0]).toHaveProperty('transcript_effect', 'karaoke');
    expect(result.elements[0]).toHaveProperty('y_alignment', '90%');
    expect(result.elements[0]).toHaveProperty('transcript_color', '#04f827');
  });

  it('converts beasty preset correctly with center placement', () => {
    const config: CaptionConfiguration = {
      presetId: 'beasty',
      placement: 'center',
    };

    const result = convertCaptionConfigToCreatomate(config);

    expect(result.elements[0]).toHaveProperty('transcript_effect', 'highlight');
    expect(result.elements[0]).toHaveProperty('y_alignment', '50%');
    expect(result.elements[0]).toHaveProperty('transcript_color', '#FFFD03');
    expect(result.elements[0]).toHaveProperty('font_family', 'Montserrat');
    expect(result.elements[0]).toHaveProperty('background_x_padding', '26%');
  });

  it('uses preset default placement when placement not specified', () => {
    const config: CaptionConfiguration = {
      presetId: 'karaoke',
    };

    const result = convertCaptionConfigToCreatomate(config);

    // Should use preset default placement (bottom)
    expect(result.elements[0]).toHaveProperty('y_alignment', '90%');
  });

  it('throws error for non-existent preset', () => {
    const config: CaptionConfiguration = {
      presetId: 'non-existent-preset',
      placement: 'bottom',
    };

    expect(() => convertCaptionConfigToCreatomate(config)).toThrow(
      'Preset with ID non-existent-preset not found'
    );
  });

  it('includes all required Creatomate properties', () => {
    const config: CaptionConfiguration = {
      presetId: 'karaoke',
      placement: 'bottom',
    };

    const result = convertCaptionConfigToCreatomate(config);
    const element = result.elements[0];

    // Check all required properties are present
    expect(element).toHaveProperty('id');
    expect(element).toHaveProperty('name');
    expect(element).toHaveProperty('type', 'text');
    expect(element).toHaveProperty('track', 2);
    expect(element).toHaveProperty('time', 0);
    expect(element).toHaveProperty('width');
    expect(element).toHaveProperty('height');
    expect(element).toHaveProperty('x_alignment', '50%');
    expect(element).toHaveProperty('y_alignment');
    expect(element).toHaveProperty('font_family');
    expect(element).toHaveProperty('font_weight');
    expect(element).toHaveProperty('font_size');
    expect(element).toHaveProperty('background_color');
    expect(element).toHaveProperty('background_x_padding');
    expect(element).toHaveProperty('background_y_padding');
    expect(element).toHaveProperty('background_border_radius');
    expect(element).toHaveProperty('transcript_effect');
    expect(element).toHaveProperty('transcript_placement');
    expect(element).toHaveProperty('transcript_maximum_length');
    expect(element).toHaveProperty('transcript_color');
    expect(element).toHaveProperty('fill_color');
    expect(element).toHaveProperty('stroke_color');
    expect(element).toHaveProperty('stroke_width');
  });
});
