import { convertCaptionConfigToCreatomate } from '@/lib/utils/video/caption-converter';
import { CaptionConfiguration } from '@/types/video';

describe('Caption Converter', () => {
  it('returns default structure when no config is provided', () => {
    const result = convertCaptionConfigToCreatomate(null);

    expect(result).toHaveProperty('elements');
    expect(result.elements).toHaveLength(1);
    expect(result.elements[0]).toHaveProperty('id', 'caption-1');
    expect(result.elements[0]).toHaveProperty('y', '90%');
    expect(result.elements[0]).toHaveProperty('transcript_placement', 'bottom');
  });

  it('converts karaoke preset correctly', () => {
    const config: CaptionConfiguration = {
      presetId: 'karaoke',
      placement: 'top',
      lines: 1,
    };

    const result = convertCaptionConfigToCreatomate(config);

    expect(result.elements[0]).toHaveProperty('transcript_effect', 'karaoke');
    expect(result.elements[0]).toHaveProperty('y', '10%');
    expect(result.elements[0]).toHaveProperty('highlight_color', '#04f827');
  });

  it('converts beasty preset correctly', () => {
    const config: CaptionConfiguration = {
      presetId: 'beasty',
      placement: 'middle',
      lines: 3,
    };

    const result = convertCaptionConfigToCreatomate(config);

    expect(result.elements[0]).toHaveProperty('transcript_effect', 'highlight');
    expect(result.elements[0]).toHaveProperty('y', '50%');
    expect(result.elements[0]).toHaveProperty('highlight_color', '#FFFD03');
  });

  it('throws error for non-existent preset', () => {
    const config: CaptionConfiguration = {
      presetId: 'non-existent-preset',
    };

    expect(() => convertCaptionConfigToCreatomate(config)).toThrow();
  });
});
