import { convertCaptionConfigToProperties } from '../../server/src/utils/video/preset-converter';

describe('Caption Configuration Converter', () => {
  describe('convertCaptionConfigToProperties', () => {
    test('should return empty object when captions are disabled', () => {
      const config = {
        enabled: false,
        placement: 'bottom' as const,
        transcriptColor: '#FFFD03' as const,
        transcriptEffect: 'highlight' as const,
      };

      const result = convertCaptionConfigToProperties(config);
      expect(result).toEqual({});
    });

    test('should return default properties when no config provided', () => {
      const result = convertCaptionConfigToProperties(null);
      
      expect(result).toHaveProperty('transcript_color', '#04f827');
      expect(result).toHaveProperty('transcript_effect', 'karaoke');
      expect(result).toHaveProperty('y_alignment', '90%');
      expect(result).toHaveProperty('font_family', 'Montserrat');
    });

    test('should use custom values when provided', () => {
      const config = {
        enabled: true,
        placement: 'center' as const,
        transcriptColor: '#FFFD03' as const,
        transcriptEffect: 'highlight' as const,
      };

      const result = convertCaptionConfigToProperties(config);
      
      expect(result.transcript_color).toBe('#FFFD03');
      expect(result.transcript_effect).toBe('highlight');
      expect(result.y_alignment).toBe('50%'); // center placement
    });

    test('should handle all placement options correctly', () => {
      const topConfig = { enabled: true, placement: 'top' as const };
      const centerConfig = { enabled: true, placement: 'center' as const };
      const bottomConfig = { enabled: true, placement: 'bottom' as const };

      expect(convertCaptionConfigToProperties(topConfig).y_alignment).toBe('10%');
      expect(convertCaptionConfigToProperties(centerConfig).y_alignment).toBe('50%');
      expect(convertCaptionConfigToProperties(bottomConfig).y_alignment).toBe('90%');
    });

    test('should handle all transcript effects', () => {
      const effects = ['karaoke', 'highlight', 'fade', 'bounce', 'slide', 'enlarge'];
      
      effects.forEach(effect => {
        const config = {
          enabled: true,
          transcriptEffect: effect as any,
        };
        
        const result = convertCaptionConfigToProperties(config);
        expect(result.transcript_effect).toBe(effect);
      });
    });

    test('should use fallback values for missing properties', () => {
      const config = {
        enabled: true,
        // No placement, color, or effect specified
      };

      const result = convertCaptionConfigToProperties(config);
      
      expect(result.transcript_color).toBe('#04f827'); // Default karaoke green
      expect(result.transcript_effect).toBe('karaoke'); // Default effect
      expect(result.y_alignment).toBe('90%'); // Default bottom placement
    });

    test('should preserve standard Creatomate properties', () => {
      const config = {
        enabled: true,
        transcriptColor: '#FF0000' as const,
        transcriptEffect: 'bounce' as const,
        placement: 'top' as const,
      };

      const result = convertCaptionConfigToProperties(config);
      
      // Should have all the standard properties
      expect(result.width).toBe('90%');
      expect(result.height).toBe('100%');
      expect(result.font_family).toBe('Montserrat');
      expect(result.font_weight).toBe('700');
      expect(result.font_size).toBe('8 vmin');
      expect(result.fill_color).toBe('#ffffff');
      expect(result.stroke_color).toBe('#333333');
      expect(result.stroke_width).toBe('1.05 vmin');
      expect(result.x_alignment).toBe('50%');
      expect(result.background_color).toBe('rgba(216,216,216,0)');
      expect(result.transcript_placement).toBe('animate');
      expect(result.transcript_maximum_length).toBe(25);
    });

    test('should work with real frontend config examples', () => {
      // Test the exact config from the user's example
      const userConfig = {
        enabled: true,
        presetId: 'highlight-yellow', // This should be ignored now
        placement: 'bottom' as const,
        transcriptColor: '#FFFD03' as const,
        transcriptEffect: 'highlight' as const,
      };

      const result = convertCaptionConfigToProperties(userConfig);
      
      expect(result.transcript_color).toBe('#FFFD03');
      expect(result.transcript_effect).toBe('highlight');
      expect(result.y_alignment).toBe('90%');
    });

    test('should handle custom frontend configurations', () => {
      // Test when user creates custom settings in frontend
      const customConfig = {
        enabled: true,
        presetId: 'custom', // Frontend marks as custom
        placement: 'center' as const,
        transcriptColor: '#00FF00' as const,
        transcriptEffect: 'slide' as const,
      };

      const result = convertCaptionConfigToProperties(customConfig);
      
      expect(result.transcript_color).toBe('#00FF00');
      expect(result.transcript_effect).toBe('slide');
      expect(result.y_alignment).toBe('50%');
    });
  });
}); 