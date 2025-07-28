/**
 * VideoValidationService for Mobile App
 * Implements client-side validation using shared types from editia-core
 */

import {
  VideoType,
  CaptionConfiguration,
  EditorialProfile,
  Language,
  LANGUAGES,
  isValidCaptionConfig,
  isValidEditorialProfile,
  isValidVideo,
} from '@/lib/types/video.types';
import { VideoTypeSchema } from 'editia-core';

// Error codes for validation failures
export type ValidationErrorCode =
  | 'REQUIRED_FIELD_MISSING'
  | 'INVALID_TYPE'
  | 'EMPTY_VALUE'
  | 'VALUE_TOO_LONG'
  | 'INSUFFICIENT_VIDEOS'
  | 'TOO_MANY_VIDEOS'
  | 'INVALID_VIDEO'
  | 'UNSUPPORTED_LANGUAGE'
  | 'INVALID_EDITORIAL_PROFILE'
  | 'INVALID_CAPTION_CONFIG'
  | 'VALIDATION_ERROR';

// Validation error details
export interface ValidationErrorDetails {
  code: ValidationErrorCode;
  field?: string;
  message: string;
  context?: Record<string, any>;
}

// Video generation payload (mobile-specific structure)
export interface VideoGenerationPayload {
  prompt: string;
  systemPrompt?: string;
  selectedVideos: VideoType[];
  editorialProfile?: EditorialProfile;
  voiceId?: string;
  captionConfig?: CaptionConfiguration;
  outputLanguage: Language;
}

// Validation result types
export interface ValidationSuccess {
  success: true;
  payload: VideoGenerationPayload;
}

export interface ValidationFailure {
  success: false;
  details: ValidationErrorDetails;
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

// Video generation error class
export class VideoGenerationError extends Error {
  public readonly code: string;
  public readonly context?: Record<string, any>;
  public readonly retryable: boolean;
  public readonly userMessage: string;

  constructor(
    message: string,
    code: string,
    context?: Record<string, any>,
    retryable = false,
    userMessage?: string
  ) {
    super(message);
    this.name = 'VideoGenerationError';
    this.code = code;
    this.context = context;
    this.retryable = retryable;
    this.userMessage = userMessage || message;
  }
}

// Validated video structure for processing
export interface ValidatedVideo {
  id: string;
  url: string;
  title: string;
  description: string;
  tags: string[];
}

/**
 * VideoValidationService - Client-side validation for video generation requests
 */
export class VideoValidationService {
  // Validation limits
  private static readonly MAX_PROMPT_LENGTH = 2000;
  private static readonly MAX_SYSTEM_PROMPT_LENGTH = 1000;
  private static readonly MIN_VIDEOS = 1;
  private static readonly MAX_VIDEOS = 10;

  /**
   * Validates a video generation request payload
   */
  static validateRequest(payload: any): ValidationResult {
    try {
      // Validate required fields
      if (!payload.prompt) {
        return this.createValidationFailure(
          'REQUIRED_FIELD_MISSING',
          'prompt',
          'Prompt is required'
        );
      }

      if (!payload.outputLanguage) {
        return this.createValidationFailure(
          'REQUIRED_FIELD_MISSING',
          'outputLanguage',
          'Output language is required'
        );
      }

      // Validate types
      if (typeof payload.prompt !== 'string') {
        return this.createValidationFailure(
          'INVALID_TYPE',
          'prompt',
          'Prompt must be a string'
        );
      }

      if (payload.systemPrompt && typeof payload.systemPrompt !== 'string') {
        return this.createValidationFailure(
          'INVALID_TYPE',
          'systemPrompt',
          'System prompt must be a string'
        );
      }

      if (!Array.isArray(payload.selectedVideos)) {
        return this.createValidationFailure(
          'INVALID_TYPE',
          'selectedVideos',
          'Selected videos must be an array'
        );
      }

      // Trim and validate string values
      const trimmedPrompt = payload.prompt.trim();
      const trimmedSystemPrompt = payload.systemPrompt?.trim() || '';

      if (!trimmedPrompt) {
        return this.createValidationFailure(
          'EMPTY_VALUE',
          'prompt',
          'Prompt cannot be empty'
        );
      }

      if (trimmedPrompt.length > this.MAX_PROMPT_LENGTH) {
        return this.createValidationFailure(
          'VALUE_TOO_LONG',
          'prompt',
          `Prompt cannot exceed ${this.MAX_PROMPT_LENGTH} characters`
        );
      }

      if (trimmedSystemPrompt && trimmedSystemPrompt.length > this.MAX_SYSTEM_PROMPT_LENGTH) {
        return this.createValidationFailure(
          'VALUE_TOO_LONG',
          'systemPrompt',
          `System prompt cannot exceed ${this.MAX_SYSTEM_PROMPT_LENGTH} characters`
        );
      }

      // Validate voice ID
      if (payload.voiceId !== undefined) {
        if (typeof payload.voiceId !== 'string' || !payload.voiceId.trim()) {
          return this.createValidationFailure(
            'EMPTY_VALUE',
            'voiceId',
            'Voice ID cannot be empty when provided'
          );
        }
      }

      // Validate videos
      if (payload.selectedVideos.length < this.MIN_VIDEOS) {
        return this.createValidationFailure(
          'INSUFFICIENT_VIDEOS',
          'selectedVideos',
          `At least ${this.MIN_VIDEOS} video(s) must be selected`
        );
      }

      if (payload.selectedVideos.length > this.MAX_VIDEOS) {
        return this.createValidationFailure(
          'TOO_MANY_VIDEOS',
          'selectedVideos',
          `Maximum ${this.MAX_VIDEOS} videos allowed`
        );
      }

      // Validate each video
      for (let i = 0; i < payload.selectedVideos.length; i++) {
        const video = payload.selectedVideos[i];
        const videoValidation = VideoTypeSchema.omit({
    
          analysis_status: true,
        }).safeParse(video);
        if (!videoValidation.success) {
          console.log('video', video);
          console.log('videoValidation', videoValidation.error.errors);
          return this.createValidationFailure(
            'INVALID_VIDEO',
            `selectedVideos[${i}]`,
            videoValidation.error.errors.map((error) => error.message).join(', ')
          );
        }
      }

      // Validate language
      if (!Object.keys(LANGUAGES).includes(payload.outputLanguage)) {
        return this.createValidationFailure(
          'UNSUPPORTED_LANGUAGE',
          'outputLanguage',
          `Language '${payload.outputLanguage}' is not supported`
        );
      }

      // Validate editorial profile if provided
      if (payload.editorialProfile) {
        if (!isValidEditorialProfile(payload.editorialProfile)) {
          return this.createValidationFailure(
            'INVALID_EDITORIAL_PROFILE',
            'editorialProfile',
            'Editorial profile is invalid'
          );
        }
      }

      // Validate caption config if provided
      if (payload.captionConfig) {
        if (!isValidCaptionConfig(payload.captionConfig)) {
          return this.createValidationFailure(
            'INVALID_CAPTION_CONFIG',
            'captionConfig',
            'Caption configuration is invalid'
          );
        }
      }

      // Create validated payload
      const validatedPayload: VideoGenerationPayload = {
        prompt: trimmedPrompt,
        systemPrompt: trimmedSystemPrompt || undefined,
        selectedVideos: payload.selectedVideos,
        editorialProfile: payload.editorialProfile,
        voiceId: payload.voiceId?.trim() || undefined,
        captionConfig: payload.captionConfig,
        outputLanguage: payload.outputLanguage as Language,
      };

      return {
        success: true,
        payload: validatedPayload,
      };
    } catch (error) {
      return this.createValidationFailure(
        'VALIDATION_ERROR',
        undefined,
        'Unexpected validation error occurred'
      );
    }
  }

  /**
   * Validates and transforms videos for processing
   */
  static validateVideos(videos: VideoType[]): ValidatedVideo[] {
    return videos.map((video, index) => {
      if (!video.upload_url) {
        throw new VideoGenerationError(
          `Video at index ${index} is missing upload URL`,
          'MISSING_UPLOAD_URL',
          { videoId: video.id, index }
        );
      }

      return {
        id: video.id,
        url: video.upload_url,
        title: video.title || '',
        description: video.description || '',
        tags: video.tags || [],
      };
    });
  }

  /**
   * Creates a VideoGenerationError with specified properties
   */
  static createError(
    message: string,
    code: string,
    context?: Record<string, any>,
    retryable = false,
    userMessage?: string
  ): VideoGenerationError {
    return new VideoGenerationError(message, code, context, retryable, userMessage);
  }

  /**
   * Helper method to create validation failure results
   */
  private static createValidationFailure(
    code: ValidationErrorCode,
    field?: string,
    message?: string
  ): ValidationFailure {
    return {
      success: false,
      details: {
        code,
        field,
        message: message || `Validation failed for ${field || 'unknown field'}`,
      },
    };
  }
}