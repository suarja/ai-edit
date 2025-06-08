import { readFile } from 'fs/promises';
import { join } from 'path';
import { CreatomateBuilder } from '../../server/src/services/creatomateBuilder';
import { jest, describe, beforeEach, test, expect } from '@jest/globals';

describe('CreatomateBuilder - Enhanced Caption System', () => {
  let creatomateBuilder: CreatomateBuilder;
  let errorTemplate: any;

  beforeEach(async () => {
    // Load the error template from the JSON file
    const templatePath = join(
      process.cwd(),
      'server/src/services/template-error.json'
    );
    const templateContent = await readFile(templatePath, 'utf-8');
    errorTemplate = JSON.parse(templateContent);

    // Create a fresh instance for each test
    creatomateBuilder = CreatomateBuilder.getInstance('gpt-4');
  });

  describe('Default Configuration', () => {
    test('should apply default caption config when none provided', () => {
      const handleCaptionConfiguration = (
        creatomateBuilder as any
      ).handleCaptionConfiguration.bind(creatomateBuilder);

      // Test with no caption config
      handleCaptionConfiguration(errorTemplate, null);

      // Verify default karaoke settings are applied
      let foundSubtitle = false;
      errorTemplate.elements.forEach((scene: any) => {
        scene.elements.forEach((element: any) => {
          if (
            element.type === 'text' &&
            element.name &&
            element.name.toLowerCase().includes('subtitle')
          ) {
            foundSubtitle = true;
            expect(element.transcript_effect).toBe('karaoke');
            expect(element.transcript_color).toBe('#04f827');
            expect(element.y_alignment).toBe('90%'); // bottom placement
          }
        });
      });

      expect(foundSubtitle).toBe(true);
    });

    test('should not require user setup for basic functionality', () => {
      const handleCaptionConfiguration = (
        creatomateBuilder as any
      ).handleCaptionConfiguration.bind(creatomateBuilder);

      // Test with undefined config (simulating no user setup)
      handleCaptionConfiguration(errorTemplate, undefined);

      // Should still have functioning captions
      let hasSubtitles = false;
      errorTemplate.elements.forEach((scene: any) => {
        scene.elements.forEach((element: any) => {
          if (
            element.type === 'text' &&
            element.name &&
            element.name.toLowerCase().includes('subtitle')
          ) {
            hasSubtitles = true;
            // Should have valid properties
            expect(element.transcript_effect).toBeDefined();
            expect(element.transcript_color).toBeDefined();
            expect(element.y_alignment).toBeDefined();
          }
        });
      });

      expect(hasSubtitles).toBe(true);
    });
  });

  describe('Caption Toggle Functionality', () => {
    test('should remove all subtitle elements when disabled', () => {
      const handleCaptionConfiguration = (
        creatomateBuilder as any
      ).handleCaptionConfiguration.bind(creatomateBuilder);

      const disabledConfig = {
        enabled: false,
        presetId: 'karaoke',
        placement: 'bottom',
      };

      handleCaptionConfiguration(errorTemplate, disabledConfig);

      // Verify no subtitle elements remain
      let hasSubtitles = false;
      errorTemplate.elements.forEach((scene: any) => {
        scene.elements.forEach((element: any) => {
          if (
            element.type === 'text' &&
            element.name &&
            element.name.toLowerCase().includes('subtitle')
          ) {
            hasSubtitles = true;
          }
        });
      });

      expect(hasSubtitles).toBe(false);
    });

    test('should preserve video and audio elements when captions disabled', () => {
      const handleCaptionConfiguration = (
        creatomateBuilder as any
      ).handleCaptionConfiguration.bind(creatomateBuilder);

      // Count video and audio elements before
      let videoCountBefore = 0;
      let audioCountBefore = 0;
      errorTemplate.elements.forEach((scene: any) => {
        scene.elements.forEach((element: any) => {
          if (element.type === 'video') videoCountBefore++;
          if (element.type === 'audio') audioCountBefore++;
        });
      });

      const disabledConfig = {
        enabled: false,
      };

      handleCaptionConfiguration(errorTemplate, disabledConfig);

      // Count video and audio elements after
      let videoCountAfter = 0;
      let audioCountAfter = 0;
      errorTemplate.elements.forEach((scene: any) => {
        scene.elements.forEach((element: any) => {
          if (element.type === 'video') videoCountAfter++;
          if (element.type === 'audio') audioCountAfter++;
        });
      });

      expect(videoCountAfter).toBe(videoCountBefore);
      expect(audioCountAfter).toBe(audioCountBefore);
    });

    test('should apply configuration when enabled explicitly', () => {
      const handleCaptionConfiguration = (
        creatomateBuilder as any
      ).handleCaptionConfiguration.bind(creatomateBuilder);

      const enabledConfig = {
        enabled: true,
        presetId: 'beasty',
        placement: 'top',
        transcriptColor: '#FF0000',
        transcriptEffect: 'highlight',
      };

      handleCaptionConfiguration(errorTemplate, enabledConfig);

      // Verify configuration is applied
      let foundConfiguredSubtitle = false;
      errorTemplate.elements.forEach((scene: any) => {
        scene.elements.forEach((element: any) => {
          if (
            element.type === 'text' &&
            element.name &&
            element.name.toLowerCase().includes('subtitle')
          ) {
            foundConfiguredSubtitle = true;
            expect(element.transcript_effect).toBe('highlight');
            expect(element.transcript_color).toBe('#FF0000');
            expect(element.y_alignment).toBe('10%'); // top placement
          }
        });
      });

      expect(foundConfiguredSubtitle).toBe(true);
    });
  });

  describe('Enhanced Controls', () => {
    test('should override preset color with custom color', () => {
      const handleCaptionConfiguration = (
        creatomateBuilder as any
      ).handleCaptionConfiguration.bind(creatomateBuilder);

      const customConfig = {
        enabled: true,
        presetId: 'karaoke', // Default karaoke color is #04f827
        transcriptColor: '#FF5722', // Custom override
      };

      handleCaptionConfiguration(errorTemplate, customConfig);

      errorTemplate.elements.forEach((scene: any) => {
        scene.elements.forEach((element: any) => {
          if (
            element.type === 'text' &&
            element.name &&
            element.name.toLowerCase().includes('subtitle')
          ) {
            expect(element.transcript_color).toBe('#FF5722'); // Should use custom color
            expect(element.transcript_effect).toBe('karaoke'); // Should keep preset effect
          }
        });
      });
    });

    test('should override preset effect with custom effect', () => {
      const handleCaptionConfiguration = (
        creatomateBuilder as any
      ).handleCaptionConfiguration.bind(creatomateBuilder);

      const customConfig = {
        enabled: true,
        presetId: 'karaoke', // Default karaoke effect is 'karaoke'
        transcriptEffect: 'bounce', // Custom override
      };

      handleCaptionConfiguration(errorTemplate, customConfig);

      errorTemplate.elements.forEach((scene: any) => {
        scene.elements.forEach((element: any) => {
          if (
            element.type === 'text' &&
            element.name &&
            element.name.toLowerCase().includes('subtitle')
          ) {
            expect(element.transcript_effect).toBe('bounce'); // Should use custom effect
            expect(element.transcript_color).toBe('#04f827'); // Should keep preset color
          }
        });
      });
    });

    test('should support all transcript effects', () => {
      const handleCaptionConfiguration = (
        creatomateBuilder as any
      ).handleCaptionConfiguration.bind(creatomateBuilder);

      const effects = [
        'karaoke',
        'highlight',
        'fade',
        'bounce',
        'slide',
        'enlarge',
      ];

      effects.forEach((effect) => {
        // Create a fresh copy of the template for each test
        const testTemplate = JSON.parse(JSON.stringify(errorTemplate));

        const config = {
          enabled: true,
          transcriptEffect: effect,
        };

        handleCaptionConfiguration(testTemplate, config);

        let foundEffect = false;
        testTemplate.elements.forEach((scene: any) => {
          scene.elements.forEach((element: any) => {
            if (
              element.type === 'text' &&
              element.name &&
              element.name.toLowerCase().includes('subtitle')
            ) {
              foundEffect = true;
              expect(element.transcript_effect).toBe(effect);
            }
          });
        });

        expect(foundEffect).toBe(true);
      });
    });

    test('should support custom placement overrides', () => {
      const handleCaptionConfiguration = (
        creatomateBuilder as any
      ).handleCaptionConfiguration.bind(creatomateBuilder);

      const placements = [
        { placement: 'top', expectedY: '10%' },
        { placement: 'center', expectedY: '50%' },
        { placement: 'bottom', expectedY: '90%' },
      ];

      placements.forEach(({ placement, expectedY }) => {
        // Create a fresh copy of the template for each test
        const testTemplate = JSON.parse(JSON.stringify(errorTemplate));

        const config = {
          enabled: true,
          placement: placement as 'top' | 'center' | 'bottom',
        };

        handleCaptionConfiguration(testTemplate, config);

        let foundPlacement = false;
        testTemplate.elements.forEach((scene: any) => {
          scene.elements.forEach((element: any) => {
            if (
              element.type === 'text' &&
              element.name &&
              element.name.toLowerCase().includes('subtitle')
            ) {
              foundPlacement = true;
              expect(element.y_alignment).toBe(expectedY);
            }
          });
        });

        expect(foundPlacement).toBe(true);
      });
    });
  });

  describe('Configuration Support', () => {
    test('should work with standard caption configurations', () => {
      const handleCaptionConfiguration = (
        creatomateBuilder as any
      ).handleCaptionConfiguration.bind(creatomateBuilder);

      // Standard format configuration
      const config = {
        enabled: true,
        presetId: 'beasty',
        placement: 'bottom',
        transcriptColor: '#FFFD03',
      };

      handleCaptionConfiguration(errorTemplate, config);

      // Should work and apply the configuration
      let foundSubtitle = false;
      errorTemplate.elements.forEach((scene: any) => {
        scene.elements.forEach((element: any) => {
          if (
            element.type === 'text' &&
            element.name &&
            element.name.toLowerCase().includes('subtitle')
          ) {
            foundSubtitle = true;
            expect(element.transcript_color).toBe('#FFFD03');
            expect(element.y_alignment).toBe('90%'); // bottom
          }
        });
      });

      expect(foundSubtitle).toBe(true);
    });

    test('should support center placement', () => {
      const handleCaptionConfiguration = (
        creatomateBuilder as any
      ).handleCaptionConfiguration.bind(creatomateBuilder);

      // Configuration with center placement
      const config = {
        enabled: true,
        presetId: 'karaoke',
        placement: 'center',
        transcriptColor: '#04f827',
      };

      handleCaptionConfiguration(errorTemplate, config);

      // Should apply center placement (50%)
      errorTemplate.elements.forEach((scene: any) => {
        scene.elements.forEach((element: any) => {
          if (
            element.type === 'text' &&
            element.name &&
            element.name.toLowerCase().includes('subtitle')
          ) {
            expect(element.y_alignment).toBe('50%'); // center position
          }
        });
      });
    });
  });

  describe('Integration with Post-Processing Pipeline', () => {
    test('should work alongside video.fit fixes', async () => {
      // This test verifies that the enhanced caption system doesn't interfere
      // with existing post-processing steps like video.fit fixes

      const buildJson = (creatomateBuilder as any).buildJson.bind(
        creatomateBuilder
      );

      // Mock the template generation to return our test template
      const originalGenerateTemplate = (creatomateBuilder as any)
        .generateTemplate;
      (creatomateBuilder as any).generateTemplate = jest
        .fn()
        .mockResolvedValue(errorTemplate);

      // Mock planVideoStructure
      const originalPlanVideoStructure = (creatomateBuilder as any)
        .planVideoStructure;
      (creatomateBuilder as any).planVideoStructure = jest
        .fn()
        .mockResolvedValue({ scenes: [] });

      try {
        const params = {
          script: 'Test script',
          selectedVideos: [],
          voiceId: 'test-voice',
          captionStructure: {
            enabled: true,
            presetId: 'karaoke',
            placement: 'bottom',
          },
        };

        const result = await buildJson(params);

        // Verify video.fit is still applied
        let hasVideoElements = false;
        result.elements.forEach((scene: any) => {
          scene.elements.forEach((element: any) => {
            if (element.type === 'video') {
              hasVideoElements = true;
              expect(element.fit).toBe('cover'); // Should be fixed by fixTemplate
            }
          });
        });

        // Verify captions are also applied
        let hasCaptionElements = false;
        result.elements.forEach((scene: any) => {
          scene.elements.forEach((element: any) => {
            if (
              element.type === 'text' &&
              element.name &&
              element.name.toLowerCase().includes('subtitle')
            ) {
              hasCaptionElements = true;
              expect(element.transcript_effect).toBe('karaoke');
            }
          });
        });

        expect(hasVideoElements).toBe(true);
        expect(hasCaptionElements).toBe(true);
      } finally {
        // Restore original methods
        (creatomateBuilder as any).generateTemplate = originalGenerateTemplate;
        (creatomateBuilder as any).planVideoStructure =
          originalPlanVideoStructure;
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid preset IDs gracefully', () => {
      const handleCaptionConfiguration = (
        creatomateBuilder as any
      ).handleCaptionConfiguration.bind(creatomateBuilder);

      const invalidConfig = {
        enabled: true,
        presetId: 'invalid-preset-id',
        placement: 'bottom',
      };

      // Should not throw an error
      expect(() => {
        handleCaptionConfiguration(errorTemplate, invalidConfig);
      }).not.toThrow();

      // Should fall back to default settings
      let foundSubtitle = false;
      errorTemplate.elements.forEach((scene: any) => {
        scene.elements.forEach((element: any) => {
          if (
            element.type === 'text' &&
            element.name &&
            element.name.toLowerCase().includes('subtitle')
          ) {
            foundSubtitle = true;
            // Should have valid fallback properties
            expect(element.transcript_effect).toBeDefined();
            expect(element.transcript_color).toBeDefined();
          }
        });
      });

      expect(foundSubtitle).toBe(true);
    });

    test('should handle malformed config objects gracefully', () => {
      const handleCaptionConfiguration = (
        creatomateBuilder as any
      ).handleCaptionConfiguration.bind(creatomateBuilder);

      const malformedConfig = {
        enabled: 'not-a-boolean', // Invalid type
        presetId: 123, // Invalid type
        placement: 'invalid-placement', // Invalid value
        transcriptColor: 'not-a-color', // Invalid format
      };

      // Should not throw an error
      expect(() => {
        handleCaptionConfiguration(errorTemplate, malformedConfig);
      }).not.toThrow();
    });
  });
});
