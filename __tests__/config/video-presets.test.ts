import { VIDEO_PRESETS } from '@/lib/config/video-presets';

describe('Video Presets Configuration', () => {
  it('should export VIDEO_PRESETS as an array', () => {
    expect(Array.isArray(VIDEO_PRESETS)).toBe(true);
    expect(VIDEO_PRESETS.length).toBeGreaterThan(0);
  });

  it('should contain karaoke preset', () => {
    const karaokePreset = VIDEO_PRESETS.find(
      (preset) => preset.id === 'karaoke'
    );
    expect(karaokePreset).toBeDefined();
    expect(karaokePreset?.name).toBe('Karaoke');
  });

  it('should contain beasty preset', () => {
    const beastyPreset = VIDEO_PRESETS.find((preset) => preset.id === 'beasty');
    expect(beastyPreset).toBeDefined();
    expect(beastyPreset?.name).toBe('Beasty');
  });

  describe('Preset structure validation', () => {
    VIDEO_PRESETS.forEach((preset) => {
      describe(`${preset.name} preset`, () => {
        it('should have all required properties', () => {
          expect(preset).toHaveProperty('name');
          expect(preset).toHaveProperty('id');
          expect(preset).toHaveProperty('font_family');
          expect(preset).toHaveProperty('font_weight');
          expect(preset).toHaveProperty('font_size');
          expect(preset).toHaveProperty('fill_color');
          expect(preset).toHaveProperty('stroke_color');
          expect(preset).toHaveProperty('stroke_width');
          expect(preset).toHaveProperty('background_color');
          expect(preset).toHaveProperty('background_x_padding');
          expect(preset).toHaveProperty('background_y_padding');
          expect(preset).toHaveProperty('background_border_radius');
          expect(preset).toHaveProperty('transcript_effect');
          expect(preset).toHaveProperty('transcript_placement');
          expect(preset).toHaveProperty('transcript_color');
          expect(preset).toHaveProperty('transcript_maximum_length');
          expect(preset).toHaveProperty('width');
          expect(preset).toHaveProperty('height');
          expect(preset).toHaveProperty('placement');
        });

        it('should have valid font properties', () => {
          expect(typeof preset.font_family).toBe('string');
          expect(preset.font_family).toBeTruthy();
          expect(typeof preset.font_weight).toBe('string');
          expect(preset.font_weight).toBeTruthy();
          expect(typeof preset.font_size).toBe('string');
          expect(preset.font_size).toMatch(/\d+\s*vmin/);
        });

        it('should have valid color properties', () => {
          expect(typeof preset.fill_color).toBe('string');
          expect(preset.fill_color).toMatch(/^#[0-9a-fA-F]{6}$/);
          expect(typeof preset.stroke_color).toBe('string');
          expect(preset.stroke_color).toMatch(/^#[0-9a-fA-F]{6}$/);
          expect(typeof preset.transcript_color).toBe('string');
          expect(preset.transcript_color).toMatch(/^#[0-9a-fA-F]{6}$/);
        });

        it('should have valid background properties', () => {
          expect(typeof preset.background_color).toBe('string');
          expect(preset.background_color).toBeTruthy();
          expect(typeof preset.background_x_padding).toBe('string');
          expect(preset.background_x_padding).toMatch(/^\d+%$/);
          expect(typeof preset.background_y_padding).toBe('string');
          expect(preset.background_y_padding).toMatch(/^\d+%$/);
          expect(typeof preset.background_border_radius).toBe('string');
          expect(preset.background_border_radius).toMatch(/^\d+%$/);
        });

        it('should have valid transcript properties', () => {
          expect(['karaoke', 'highlight']).toContain(preset.transcript_effect);
          expect(preset.transcript_placement).toBe('animate');
          expect(typeof preset.transcript_maximum_length).toBe('number');
          expect(preset.transcript_maximum_length).toBeGreaterThan(0);
        });

        it('should have valid dimension properties', () => {
          expect(typeof preset.width).toBe('string');
          expect(preset.width).toMatch(/^\d+%$/);
          expect(typeof preset.height).toBe('string');
          expect(preset.height).toMatch(/^\d+%$/);
        });

        it('should have valid placement', () => {
          expect(['top', 'bottom', 'center']).toContain(preset.placement);
        });

        it('should have stroke_width in vmin units', () => {
          expect(typeof preset.stroke_width).toBe('string');
          expect(preset.stroke_width).toMatch(/\d+\.?\d*\s*vmin/);
        });
      });
    });
  });

  describe('Preset-specific validations', () => {
    it('karaoke preset should have correct transcript effect', () => {
      const karaokePreset = VIDEO_PRESETS.find(
        (preset) => preset.id === 'karaoke'
      );
      expect(karaokePreset?.transcript_effect).toBe('karaoke');
      expect(karaokePreset?.transcript_color).toBe('#04f827');
    });

    it('beasty preset should have correct transcript effect', () => {
      const beastyPreset = VIDEO_PRESETS.find(
        (preset) => preset.id === 'beasty'
      );
      expect(beastyPreset?.transcript_effect).toBe('highlight');
      expect(beastyPreset?.transcript_color).toBe('#FFFD03');
    });

    it('all presets should use Montserrat font', () => {
      VIDEO_PRESETS.forEach((preset) => {
        expect(preset.font_family).toBe('Montserrat');
      });
    });

    it('all presets should have consistent dimensions', () => {
      VIDEO_PRESETS.forEach((preset) => {
        expect(preset.width).toBe('90%');
        expect(preset.height).toBe('100%');
      });
    });

    it('all presets should have font weight 700', () => {
      VIDEO_PRESETS.forEach((preset) => {
        expect(preset.font_weight).toBe('700');
      });
    });

    it('all presets should have 8 vmin font size', () => {
      VIDEO_PRESETS.forEach((preset) => {
        expect(preset.font_size).toBe('8 vmin');
      });
    });

    it('all presets should have consistent background properties', () => {
      VIDEO_PRESETS.forEach((preset) => {
        expect(preset.background_color).toBe('rgba(0,0,0,0.7)');
        expect(preset.background_x_padding).toBe('26%');
        expect(preset.background_y_padding).toBe('7%');
        expect(preset.background_border_radius).toBe('28%');
      });
    });

    it('all presets should have consistent stroke properties', () => {
      VIDEO_PRESETS.forEach((preset) => {
        expect(preset.fill_color).toBe('#ffffff');
        expect(preset.stroke_color).toBe('#333333');
        expect(preset.stroke_width).toBe('1.05 vmin');
      });
    });
  });

  describe('Preset uniqueness', () => {
    it('should have unique IDs', () => {
      const ids = VIDEO_PRESETS.map((preset) => preset.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids.length).toBe(uniqueIds.length);
    });

    it('should have unique names', () => {
      const names = VIDEO_PRESETS.map((preset) => preset.name);
      const uniqueNames = [...new Set(names)];
      expect(names.length).toBe(uniqueNames.length);
    });

    it('should have unique transcript colors', () => {
      const colors = VIDEO_PRESETS.map((preset) => preset.transcript_color);
      const uniqueColors = [...new Set(colors)];
      expect(colors.length).toBe(uniqueColors.length);
    });
  });

  describe('Creatomate compatibility', () => {
    it('should use underscore naming convention for properties', () => {
      VIDEO_PRESETS.forEach((preset) => {
        // Check that we're using snake_case properties
        expect(preset).toHaveProperty('font_family');
        expect(preset).toHaveProperty('font_weight');
        expect(preset).toHaveProperty('font_size');
        expect(preset).toHaveProperty('fill_color');
        expect(preset).toHaveProperty('stroke_color');
        expect(preset).toHaveProperty('stroke_width');
        expect(preset).toHaveProperty('background_color');
        expect(preset).toHaveProperty('background_x_padding');
        expect(preset).toHaveProperty('background_y_padding');
        expect(preset).toHaveProperty('background_border_radius');
        expect(preset).toHaveProperty('transcript_effect');
        expect(preset).toHaveProperty('transcript_placement');
        expect(preset).toHaveProperty('transcript_color');
        expect(preset).toHaveProperty('transcript_maximum_length');

        // Check that we're NOT using camelCase properties
        expect(preset).not.toHaveProperty('fontFamily');
        expect(preset).not.toHaveProperty('fontWeight');
        expect(preset).not.toHaveProperty('fontSize');
        expect(preset).not.toHaveProperty('fillColor');
        expect(preset).not.toHaveProperty('strokeColor');
        expect(preset).not.toHaveProperty('strokeWidth');
      });
    });

    it('should use vmin units for font and stroke sizes', () => {
      VIDEO_PRESETS.forEach((preset) => {
        expect(preset.font_size).toContain('vmin');
        expect(preset.stroke_width).toContain('vmin');
      });
    });

    it('should use percentage units for dimensions and padding', () => {
      VIDEO_PRESETS.forEach((preset) => {
        expect(preset.width).toContain('%');
        expect(preset.height).toContain('%');
        expect(preset.background_x_padding).toContain('%');
        expect(preset.background_y_padding).toContain('%');
        expect(preset.background_border_radius).toContain('%');
      });
    });
  });
});
