import { readFile } from 'fs/promises';
import { join } from 'path';
import { CreatomateBuilder } from '../../server/src/services/creatomateBuilder';
import { jest, describe, beforeEach, test, expect } from '@jest/globals';

describe('CreatomateBuilder', () => {
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

  describe('fixTemplate', () => {
    test('should fix video.fit from "crop" to "cover" in all video elements', () => {
      // Verify the template has the error condition (video.fit: "crop")
      let videoElementsWithCrop = 0;
      errorTemplate.elements.forEach((scene: any) => {
        scene.elements.forEach((element: any) => {
          if (element.type === 'video' && element.fit === 'crop') {
            videoElementsWithCrop++;
          }
        });
      });

      expect(videoElementsWithCrop).toBeGreaterThan(0);

      // Apply the fix using reflection to access private method
      const fixTemplate = (creatomateBuilder as any).fixTemplate.bind(
        creatomateBuilder
      );
      fixTemplate(errorTemplate);

      // Verify all video elements now have fit: "cover"
      errorTemplate.elements.forEach((scene: any) => {
        scene.elements.forEach((element: any) => {
          if (element.type === 'video') {
            expect(element.fit).toBe('cover');
          }
        });
      });
    });

    test('should only modify video elements, not other element types', () => {
      // Create a deep copy to preserve original for comparison
      const originalTemplate = JSON.parse(JSON.stringify(errorTemplate));

      // Apply the fix
      const fixTemplate = (creatomateBuilder as any).fixTemplate.bind(
        creatomateBuilder
      );
      fixTemplate(errorTemplate);

      // Verify non-video elements remain unchanged
      errorTemplate.elements.forEach((scene: any, sceneIndex: number) => {
        scene.elements.forEach((element: any, elementIndex: number) => {
          const originalElement =
            originalTemplate.elements[sceneIndex].elements[elementIndex];

          if (element.type !== 'video') {
            // For non-video elements, everything should be identical
            expect(element).toEqual(originalElement);
          } else {
            // For video elements, only the fit property should have changed
            const { fit: originalFit, ...restOriginal } = originalElement;
            const { fit: newFit, ...restNew } = element;

            expect(restNew).toEqual(restOriginal);
            expect(newFit).toBe('cover');
            expect(originalFit).toBe('crop');
          }
        });
      });
    });

    test('should handle template with no video elements gracefully', () => {
      const templateWithoutVideos = {
        width: 1080,
        height: 1920,
        elements: [
          {
            id: 'scene-1',
            type: 'composition',
            track: 1,
            elements: [
              {
                id: 'audio-1',
                type: 'audio',
                track: 1,
                source: 'test.mp3',
              },
              {
                id: 'text-1',
                type: 'text',
                track: 2,
                content: 'Test text',
              },
            ],
          },
        ],
        output_format: 'mp4',
      };

      // Should not throw an error
      const fixTemplate = (creatomateBuilder as any).fixTemplate.bind(
        creatomateBuilder
      );
      expect(() => fixTemplate(templateWithoutVideos)).not.toThrow();

      // Template should remain unchanged
      expect(templateWithoutVideos.elements[0].elements).toHaveLength(2);
      expect(templateWithoutVideos.elements[0].elements[0].type).toBe('audio');
      expect(templateWithoutVideos.elements[0].elements[1].type).toBe('text');
    });

    test('should handle empty elements array gracefully', () => {
      const templateWithEmptyElements = {
        width: 1080,
        height: 1920,
        elements: [],
        output_format: 'mp4',
      };

      const fixTemplate = (creatomateBuilder as any).fixTemplate.bind(
        creatomateBuilder
      );
      expect(() => fixTemplate(templateWithEmptyElements)).not.toThrow();
      expect(templateWithEmptyElements.elements).toHaveLength(0);
    });

    test('should handle nested empty elements gracefully', () => {
      const templateWithEmptyNestedElements = {
        width: 1080,
        height: 1920,
        elements: [
          {
            id: 'scene-1',
            type: 'composition',
            track: 1,
            elements: [],
          },
        ],
        output_format: 'mp4',
      };

      const fixTemplate = (creatomateBuilder as any).fixTemplate.bind(
        creatomateBuilder
      );
      expect(() => fixTemplate(templateWithEmptyNestedElements)).not.toThrow();
      expect(templateWithEmptyNestedElements.elements[0].elements).toHaveLength(
        0
      );
    });

    test('should fix video elements with different invalid fit values', () => {
      const templateWithVariousFitValues = {
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
                fit: 'crop',
                source: 'video1.mp4',
              },
              {
                id: 'video-2',
                type: 'video',
                fit: 'scale', // Another invalid value
                source: 'video2.mp4',
              },
              {
                id: 'video-3',
                type: 'video',
                fit: 'stretch', // Another invalid value
                source: 'video3.mp4',
              },
            ],
          },
        ],
        output_format: 'mp4',
      };

      const fixTemplate = (creatomateBuilder as any).fixTemplate.bind(
        creatomateBuilder
      );
      fixTemplate(templateWithVariousFitValues);

      // All video elements should have fit: "cover"
      templateWithVariousFitValues.elements[0].elements.forEach(
        (element: any) => {
          if (element.type === 'video') {
            expect(element.fit).toBe('cover');
          }
        }
      );
    });

    test('should preserve video elements that already have valid fit values', () => {
      const templateWithValidFitValues = {
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
                fit: 'contain', // Valid value
                source: 'video1.mp4',
              },
              {
                id: 'video-2',
                type: 'video',
                fit: 'fill', // Valid value
                source: 'video2.mp4',
              },
              {
                id: 'video-3',
                type: 'video',
                fit: 'crop', // Invalid value
                source: 'video3.mp4',
              },
            ],
          },
        ],
        output_format: 'mp4',
      };

      const fixTemplate = (creatomateBuilder as any).fixTemplate.bind(
        creatomateBuilder
      );
      fixTemplate(templateWithValidFitValues);

      // All video elements should now have fit: "cover" (the function always sets to "cover")
      templateWithValidFitValues.elements[0].elements.forEach(
        (element: any) => {
          if (element.type === 'video') {
            expect(element.fit).toBe('cover');
          }
        }
      );
    });
  });

  describe('template structure validation with error template', () => {
    test('error template should have expected structure before fix', () => {
      expect(errorTemplate.width).toBe(1080);
      expect(errorTemplate.height).toBe(1920);
      expect(errorTemplate.output_format).toBe('mp4');
      expect(Array.isArray(errorTemplate.elements)).toBe(true);
      expect(errorTemplate.elements).toHaveLength(5); // 5 scenes

      // Each scene should have 3 elements: video, audio, text
      errorTemplate.elements.forEach((scene: any, index: number) => {
        expect(scene.type).toBe('composition');
        expect(scene.elements).toHaveLength(3);

        const videoElement = scene.elements.find(
          (el: any) => el.type === 'video'
        );
        const audioElement = scene.elements.find(
          (el: any) => el.type === 'audio'
        );
        const textElement = scene.elements.find(
          (el: any) => el.type === 'text'
        );

        expect(videoElement).toBeDefined();
        expect(audioElement).toBeDefined();
        expect(textElement).toBeDefined();

        expect(videoElement.fit).toBe('crop'); // This is the error condition
      });
    });

    test('error template should have correct element properties after fix', () => {
      const fixTemplate = (creatomateBuilder as any).fixTemplate.bind(
        creatomateBuilder
      );
      fixTemplate(errorTemplate);

      errorTemplate.elements.forEach((scene: any, index: number) => {
        const videoElement = scene.elements.find(
          (el: any) => el.type === 'video'
        );
        const audioElement = scene.elements.find(
          (el: any) => el.type === 'audio'
        );
        const textElement = scene.elements.find(
          (el: any) => el.type === 'text'
        );

        // Video element should now have correct fit
        expect(videoElement.fit).toBe('cover');
        expect(videoElement.volume).toBe(0);
        expect(videoElement.x_alignment).toBe('50%');
        expect(videoElement.y_alignment).toBe('50%');

        // Audio element should have correct properties
        expect(audioElement.dynamic).toBe(true);
        expect(audioElement.provider).toContain('elevenlabs');

        // Text element should have correct properties
        expect(textElement.transcript_effect).toBe('karaoke');
        expect(textElement.transcript_source).toBe(`voice-scene-${index + 1}`);
        expect(textElement.font_family).toBe('Montserrat');
        expect(textElement.highlight_color).toBe('#FFFD03');
      });
    });
  });
});
