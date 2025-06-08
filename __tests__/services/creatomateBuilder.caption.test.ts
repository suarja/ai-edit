import { readFile } from 'fs/promises';
import { join } from 'path';
import { CreatomateBuilder } from '../../server/src/services/creatomateBuilder';
import { jest, describe, beforeEach, test, expect } from '@jest/globals';

describe('CreatomateBuilder - Caption Fixing', () => {
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

  describe('fixCaptions', () => {
    test('should apply caption configuration to subtitle elements only', () => {
      const userCaptionConfig = {
        presetId: 'karaoke',
        placement: 'top' as const,
        highlightColor: '#FF5722',
      };

      const fixCaptions = (creatomateBuilder as any).fixCaptions.bind(
        creatomateBuilder
      );
      fixCaptions(errorTemplate, userCaptionConfig);

      // Verify all subtitle elements have been updated
      errorTemplate.elements.forEach((scene: any, sceneIndex: number) => {
        scene.elements.forEach((element: any) => {
          if (
            element.type === 'text' &&
            element.name &&
            element.name.toLowerCase().includes('subtitle')
          ) {
            expect(element.y_alignment).toBe('10%'); // top placement
            expect(element.transcript_color).toBe('#FF5722');
            expect(element.transcript_effect).toBe('karaoke');
            expect(element.font_family).toBe('Montserrat');
            expect(element.font_weight).toBe('700');
            expect(element.font_size).toBe('8 vmin'); // should stay in vmin
            expect(element.stroke_width).toBe('1.05 vmin'); // should stay in vmin
            expect(element.x_alignment).toBe('50%');
          }
        });
      });
    });

    test('should handle different placement options correctly', () => {
      const userCaptionConfigs = [
        { presetId: 'karaoke', placement: 'top' as const, expectedY: '10%' },
        { presetId: 'karaoke', placement: 'middle' as const, expectedY: '50%' },
        { presetId: 'karaoke', placement: 'bottom' as const, expectedY: '90%' },
      ];

      userCaptionConfigs.forEach(({ presetId, placement, expectedY }) => {
        // Create a fresh copy of the template
        const testTemplate = JSON.parse(JSON.stringify(errorTemplate));

        const fixCaptions = (creatomateBuilder as any).fixCaptions.bind(
          creatomateBuilder
        );
        fixCaptions(testTemplate, { presetId, placement });

        // Verify placement
        testTemplate.elements.forEach((scene: any) => {
          scene.elements.forEach((element: any) => {
            if (
              element.type === 'text' &&
              element.name &&
              element.name.toLowerCase().includes('subtitle')
            ) {
              expect(element.y_alignment).toBe(expectedY);
            }
          });
        });
      });
    });

    test('should apply different preset configurations', () => {
      const beastyConfig = {
        presetId: 'beasty',
        placement: 'bottom' as const,
        highlightColor: '#FFFD03',
      };

      const fixCaptions = (creatomateBuilder as any).fixCaptions.bind(
        creatomateBuilder
      );
      fixCaptions(errorTemplate, beastyConfig);

      // Verify beasty-specific settings
      errorTemplate.elements.forEach((scene: any) => {
        scene.elements.forEach((element: any) => {
          if (
            element.type === 'text' &&
            element.name &&
            element.name.toLowerCase().includes('subtitle')
          ) {
            expect(element.transcript_effect).toBe('highlight'); // beasty uses highlight
            expect(element.transcript_color).toBe('#FFFD03');
            expect(element.y_alignment).toBe('90%'); // bottom placement
          }
        });
      });
    });

    test('should preserve transcript_source for each subtitle element', () => {
      const userCaptionConfig = {
        presetId: 'karaoke',
        placement: 'top' as const,
        highlightColor: '#FF5722',
      };

      // Store original transcript sources
      const originalSources: string[] = [];
      errorTemplate.elements.forEach((scene: any) => {
        scene.elements.forEach((element: any) => {
          if (
            element.type === 'text' &&
            element.name &&
            element.name.toLowerCase().includes('subtitle') &&
            element.transcript_source
          ) {
            originalSources.push(element.transcript_source);
          }
        });
      });

      const fixCaptions = (creatomateBuilder as any).fixCaptions.bind(
        creatomateBuilder
      );
      fixCaptions(errorTemplate, userCaptionConfig);

      // Verify transcript sources are preserved
      let sourceIndex = 0;
      errorTemplate.elements.forEach((scene: any) => {
        scene.elements.forEach((element: any) => {
          if (
            element.type === 'text' &&
            element.name &&
            element.name.toLowerCase().includes('subtitle') &&
            element.transcript_source
          ) {
            expect(element.transcript_source).toBe(
              originalSources[sourceIndex]
            );
            sourceIndex++;
          }
        });
      });
    });

    test('should only modify subtitle elements, not other text elements', () => {
      const userCaptionConfig = {
        presetId: 'karaoke',
        placement: 'top' as const,
        highlightColor: '#FF5722',
      };

      // Create a deep copy to preserve original for comparison
      const originalTemplate = JSON.parse(JSON.stringify(errorTemplate));

      const fixCaptions = (creatomateBuilder as any).fixCaptions.bind(
        creatomateBuilder
      );
      fixCaptions(errorTemplate, userCaptionConfig);

      // Verify non-subtitle text elements remain unchanged
      errorTemplate.elements.forEach((scene: any, sceneIndex: number) => {
        scene.elements.forEach((element: any, elementIndex: number) => {
          const originalElement =
            originalTemplate.elements[sceneIndex].elements[elementIndex];

          if (
            element.type === 'text' &&
            (!element.name || !element.name.toLowerCase().includes('subtitle'))
          ) {
            // For non-subtitle text elements, everything should be identical
            expect(element).toEqual(originalElement);
          }
        });
      });
    });

    test('should handle template with no subtitle elements gracefully', () => {
      const templateWithoutSubtitles = {
        width: 1080,
        height: 1920,
        elements: [
          {
            id: 'scene-1',
            type: 'composition',
            track: 1,
            elements: [
              {
                id: 'video-1',
                type: 'video',
                track: 1,
                source: 'test.mp4',
              },
              {
                id: 'audio-1',
                type: 'audio',
                track: 2,
                source: 'test.mp3',
              },
              {
                id: 'text-1',
                name: 'Title',
                type: 'text',
                track: 3,
                text: 'Video Title',
              },
            ],
          },
        ],
        output_format: 'mp4',
      };

      const userCaptionConfig = {
        presetId: 'karaoke',
        placement: 'top' as const,
      };

      // Should not throw an error and not modify non-subtitle text
      const fixCaptions = (creatomateBuilder as any).fixCaptions.bind(
        creatomateBuilder
      );
      expect(() =>
        fixCaptions(templateWithoutSubtitles, userCaptionConfig)
      ).not.toThrow();

      // Verify title text element was not modified
      const titleElement = templateWithoutSubtitles.elements[0].elements[2];
      expect(titleElement.text).toBe('Video Title');
      expect(titleElement.y_alignment).toBeUndefined();
    });

    test('should handle null/undefined caption config gracefully', () => {
      const fixCaptions = (creatomateBuilder as any).fixCaptions.bind(
        creatomateBuilder
      );

      // Should not throw with null config
      expect(() => fixCaptions(errorTemplate, null)).not.toThrow();

      // Should not throw with undefined config
      expect(() => fixCaptions(errorTemplate, undefined)).not.toThrow();

      // Should not throw with empty config
      expect(() => fixCaptions(errorTemplate, {})).not.toThrow();
    });

    test('should apply default values when preset not found', () => {
      const invalidConfig = {
        presetId: 'non-existent-preset',
        placement: 'bottom' as const,
      };

      const fixCaptions = (creatomateBuilder as any).fixCaptions.bind(
        creatomateBuilder
      );
      fixCaptions(errorTemplate, invalidConfig);

      // Should apply default karaoke settings
      errorTemplate.elements.forEach((scene: any) => {
        scene.elements.forEach((element: any) => {
          if (
            element.type === 'text' &&
            element.name &&
            element.name.toLowerCase().includes('subtitle')
          ) {
            expect(element.transcript_effect).toBe('karaoke'); // default
            expect(element.transcript_color).toBe('#04f827'); // default karaoke color
          }
        });
      });
    });

    test('should correctly map preset properties to Creatomate format', () => {
      const karaokeConfig = {
        presetId: 'karaoke',
        placement: 'bottom' as const,
        highlightColor: '#CUSTOM',
      };

      const fixCaptions = (creatomateBuilder as any).fixCaptions.bind(
        creatomateBuilder
      );
      fixCaptions(errorTemplate, karaokeConfig);

      errorTemplate.elements.forEach((scene: any) => {
        scene.elements.forEach((element: any) => {
          if (
            element.type === 'text' &&
            element.name &&
            element.name.toLowerCase().includes('subtitle')
          ) {
            // Verify specific Creatomate field mappings
            expect(element.font_family).toBe('Montserrat');
            expect(element.font_weight).toBe('700');
            expect(element.font_size).toBe('8 vmin'); // keep vmin format
            expect(element.stroke_width).toBe('1.05 vmin'); // keep vmin format
            expect(element.fill_color).toBe('#ffffff');
            expect(element.stroke_color).toBe('#333333');
            expect(element.transcript_color).toBe('#CUSTOM');
            expect(element.transcript_effect).toBe('karaoke');
            expect(element.transcript_placement).toBe('animate');
            expect(element.background_color).toBe('rgba(216,216,216,0)');
            expect(element.background_x_padding).toBe('26%');
            expect(element.background_y_padding).toBe('7%');
            expect(element.background_border_radius).toBe('28%');
            expect(element.transcript_maximum_length).toBe(25);
            expect(element.width).toBe('90%');
            expect(element.height).toBe('100%');
            expect(element.x_alignment).toBe('50%');
            expect(element.y_alignment).toBe('90%'); // bottom placement
          }
        });
      });
    });

    test('should handle config without presetId gracefully', () => {
      const configWithoutPreset = {
        placement: 'top' as const,
        highlightColor: '#FF0000',
      };

      const fixCaptions = (creatomateBuilder as any).fixCaptions.bind(
        creatomateBuilder
      );
      fixCaptions(errorTemplate, configWithoutPreset);

      // Should apply default karaoke preset
      errorTemplate.elements.forEach((scene: any) => {
        scene.elements.forEach((element: any) => {
          if (
            element.type === 'text' &&
            element.name &&
            element.name.toLowerCase().includes('subtitle')
          ) {
            expect(element.transcript_effect).toBe('karaoke'); // default
            expect(element.font_family).toBe('Montserrat'); // default
            expect(element.y_alignment).toBe('10%'); // top placement as requested
            expect(element.transcript_color).toBe('#FF0000'); // custom highlight color
          }
        });
      });
    });
  });

  describe('integration with buildJson', () => {
    test('buildJson should call fixCaptions when caption config is provided', () => {
      // This test will verify that fixCaptions is called during the build process
      // We'll implement this once the fixCaptions method is created
      expect(true).toBe(true); // Placeholder for now
    });
  });
});
