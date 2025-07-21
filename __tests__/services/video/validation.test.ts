import {
  VideoValidationService,
  ValidationErrorDetails,
  VideoGenerationPayload,
} from '@/lib/services/video/validation';
import {
  VideoType,
  EditorialProfile,
  CaptionConfiguration,
} from '@/lib/types/video.types';
import { jest, describe, beforeEach, test, expect } from '@jest/globals';

describe('VideoValidationService', () => {
  let validPayload: any;
  let validVideo: VideoType;
  let validEditorialProfile: EditorialProfile;
  let validCaptionConfig: CaptionConfiguration;

  beforeEach(() => {
    validVideo = {
      id: 'video-1',
      title: 'Test Video',
      description: 'A test video',
      upload_url: 'https://example.com/video.mp4',
      tags: ['test'],
      user_id: 'user-1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    validEditorialProfile = {
      persona_description: 'Professional content creator',
      tone_of_voice: 'Conversational and friendly',
      audience: 'Tech professionals',
      style_notes: 'Clear and engaging',
    };

    validCaptionConfig = {
      presetId: 'karaoke',
      placement: 'bottom' as const,
    };

    validPayload = {
      prompt: 'Create a video about productivity tips',
      systemPrompt: 'Use a professional tone',
      selectedVideos: [validVideo],
      editorialProfile: validEditorialProfile,
      voiceId: 'voice-123',
      captionConfig: validCaptionConfig,
      outputLanguage: 'en',
    };
  });

  describe('validateRequest', () => {
    test('should validate a valid request successfully', () => {
      const result = VideoValidationService.validateRequest(validPayload);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.payload.prompt).toBe(
          'Create a video about productivity tips'
        );
        expect(result.payload.outputLanguage).toBe('en');
        expect(result.payload.selectedVideos).toHaveLength(1);
      }
    });

    test('should fail validation for missing required fields', () => {
      const invalidPayload = { ...validPayload };
      delete invalidPayload.prompt;
      delete invalidPayload.outputLanguage;

      const result = VideoValidationService.validateRequest(invalidPayload);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.details.field).toBe('prompt');
        expect(result.details.code).toBe('REQUIRED_FIELD_MISSING');
      }
    });

    test('should fail validation for invalid prompt type', () => {
      const invalidPayload = { ...validPayload, prompt: 123 };

      const result = VideoValidationService.validateRequest(invalidPayload);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.details.field).toBe('prompt');
        expect(result.details.code).toBe('INVALID_TYPE');
      }
    });

    test('should fail validation for empty prompt', () => {
      const invalidPayload = { ...validPayload, prompt: '   ' };

      const result = VideoValidationService.validateRequest(invalidPayload);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.details.code).toBe('EMPTY_VALUE');
      }
    });

    test('should fail validation for prompt too long', () => {
      const longPrompt = 'a'.repeat(2001);
      const invalidPayload = { ...validPayload, prompt: longPrompt };

      const result = VideoValidationService.validateRequest(invalidPayload);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.details.code).toBe('VALUE_TOO_LONG');
      }
    });

    test('should fail validation for invalid selectedVideos type', () => {
      const invalidPayload = { ...validPayload, selectedVideos: 'not-array' };

      const result = VideoValidationService.validateRequest(invalidPayload);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.details.field).toBe('selectedVideos');
        expect(result.details.code).toBe('INVALID_TYPE');
      }
    });

    test('should fail validation for insufficient videos', () => {
      const invalidPayload = { ...validPayload, selectedVideos: [] };

      const result = VideoValidationService.validateRequest(invalidPayload);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.details.code).toBe('INSUFFICIENT_VIDEOS');
      }
    });

    test('should fail validation for too many videos', () => {
      const tooManyVideos = Array(11).fill(validVideo);
      const invalidPayload = { ...validPayload, selectedVideos: tooManyVideos };

      const result = VideoValidationService.validateRequest(invalidPayload);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.details.code).toBe('TOO_MANY_VIDEOS');
      }
    });

    test('should fail validation for invalid video object', () => {
      const invalidVideo = { id: 'video-1' }; // Missing required fields
      const invalidPayload = {
        ...validPayload,
        selectedVideos: [invalidVideo],
      };

      const result = VideoValidationService.validateRequest(invalidPayload);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.details.code).toBe('INVALID_VIDEO');
        expect(result.details.field).toBe('selectedVideos[0]');
      }
    });

    test('should fail validation for unsupported language', () => {
      const invalidPayload = {
        ...validPayload,
        outputLanguage: 'invalid-lang',
      };

      const result = VideoValidationService.validateRequest(invalidPayload);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.details.code).toBe('UNSUPPORTED_LANGUAGE');
      }
    });

    test('should fail validation for invalid editorial profile', () => {
      const invalidProfile = { persona_description: 'test' }; // Missing required fields
      const invalidPayload = {
        ...validPayload,
        editorialProfile: invalidProfile,
      };

      const result = VideoValidationService.validateRequest(invalidPayload);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.details.code).toBe('INVALID_EDITORIAL_PROFILE');
      }
    });

    test('should fail validation for invalid caption config', () => {
      const invalidConfig = { presetId: '' }; // Empty presetId should fail
      const invalidPayload = { ...validPayload, captionConfig: invalidConfig };

      const result = VideoValidationService.validateRequest(invalidPayload);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.details.code).toBe('INVALID_CAPTION_CONFIG');
      }
    });

    test('should handle system prompt validation', () => {
      const longSystemPrompt = 'a'.repeat(1001);
      const invalidPayload = {
        ...validPayload,
        systemPrompt: longSystemPrompt,
      };

      const result = VideoValidationService.validateRequest(invalidPayload);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.details.field).toBe('systemPrompt');
        expect(result.details.code).toBe('VALUE_TOO_LONG');
      }
    });

    test('should handle voice ID validation', () => {
      const invalidPayload = { ...validPayload, voiceId: '' };

      const result = VideoValidationService.validateRequest(invalidPayload);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.details.field).toBe('voiceId');
        expect(result.details.code).toBe('EMPTY_VALUE');
      }
    });

    test('should handle unexpected errors gracefully', () => {
      // Mock an error in validation
      const originalValidate = VideoValidationService.validateRequest;
      const mockError = new Error('Unexpected error');

      jest
        .spyOn(VideoValidationService, 'validateRequest')
        .mockImplementation(() => {
          throw mockError;
        });

      const result = VideoValidationService.validateRequest(validPayload);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.details.code).toBe('VALIDATION_ERROR');
      }

      // Restore original method
      VideoValidationService.validateRequest = originalValidate;
    });
  });

  describe('validateVideos', () => {
    test('should validate videos with upload URLs successfully', () => {
      const videos = [validVideo];
      const result = VideoValidationService.validateVideos(videos);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'video-1',
        url: 'https://example.com/video.mp4',
        title: 'Test Video',
        description: 'A test video',
        tags: ['test'],
      });
    });

    test('should throw VideoGenerationError for missing upload URL', () => {
      const videoWithoutUrl = { ...validVideo };
      delete videoWithoutUrl.upload_url;

      expect(() => {
        VideoValidationService.validateVideos([videoWithoutUrl]);
      }).toThrow('Video at index 0 is missing upload URL');
    });

    test('should handle empty descriptions and tags gracefully', () => {
      const videoWithEmptyFields = {
        ...validVideo,
        description: '',
        tags: undefined as any,
      };

      const result = VideoValidationService.validateVideos([
        videoWithEmptyFields,
      ]);

      expect(result[0].description).toBe('');
      expect(result[0].tags).toEqual([]);
    });
  });

  describe('createError', () => {
    test('should create VideoGenerationError with all properties', () => {
      const error = VideoValidationService.createError(
        'Test error',
        'TEST_CODE',
        { key: 'value' },
        true,
        'User-friendly message'
      );

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.context).toEqual({ key: 'value' });
      expect(error.retryable).toBe(true);
      expect(error.userMessage).toBe('User-friendly message');
    });

    test('should use message as userMessage when not provided', () => {
      const error = VideoValidationService.createError(
        'Test error',
        'TEST_CODE'
      );

      expect(error.userMessage).toBe('Test error');
      expect(error.retryable).toBe(false);
    });
  });

  describe('edge cases', () => {
    test('should handle null and undefined values', () => {
      const nullPayload = {
        prompt: null,
        selectedVideos: null,
        outputLanguage: undefined,
      };

      const result = VideoValidationService.validateRequest(nullPayload);

      expect(result.success).toBe(false);
    });

    test('should trim whitespace from strings', () => {
      const payloadWithWhitespace = {
        ...validPayload,
        prompt: '  Create a video about productivity tips  ',
        systemPrompt: '  Use a professional tone  ',
      };

      const result = VideoValidationService.validateRequest(
        payloadWithWhitespace
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.payload.prompt).toBe(
          'Create a video about productivity tips'
        );
        expect(result.payload.systemPrompt).toBe('Use a professional tone');
      }
    });

    test('should handle all supported languages', () => {
      const supportedLanguages = ['fr', 'en', 'es', 'de', 'it'];

      supportedLanguages.forEach((lang) => {
        const payload = { ...validPayload, outputLanguage: lang };
        const result = VideoValidationService.validateRequest(payload);

        expect(result.success).toBe(true);
      });
    });
  });
});
