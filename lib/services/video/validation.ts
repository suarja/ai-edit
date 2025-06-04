import { VideoType, CaptionConfiguration } from '@/types/video';
import { errorResponse, HttpStatus } from '@/lib/utils/api/responses';

/**
 * Types for video generation
 */
export type EditorialProfile = {
  persona_description: string;
  tone_of_voice: string;
  audience: string;
  style_notes: string;
};

export type VideoGenerationPayload = {
  prompt: string;
  systemPrompt: string;
  selectedVideos: VideoType[];
  editorialProfile: EditorialProfile;
  voiceId: string;
  captionConfig?: CaptionConfiguration;
};

/**
 * Result of validation - either success with payload or error
 */
export type ValidationResult =
  | { success: true; payload: VideoGenerationPayload }
  | { success: false; error: Response };

/**
 * Validation service for video generation requests
 */
export class VideoValidationService {
  /**
   * Validates the video generation request body
   * @param body The request body to validate
   * @returns ValidationResult with either the validated payload or an error
   */
  static validateRequest(body: any): ValidationResult {
    const {
      prompt,
      systemPrompt,
      selectedVideos,
      editorialProfile,
      voiceId,
      captionConfig,
    } = body;

    // Check required fields
    const missing = {
      prompt: !prompt,
      selectedVideos: !selectedVideos?.length,
      systemPrompt: !systemPrompt,
      editorialProfile: !editorialProfile,
      voiceId: !voiceId,
    };

    // If any required fields are missing, return error
    if (!prompt || !selectedVideos?.length) {
      return {
        success: false,
        error: errorResponse(
          'Missing required fields',
          HttpStatus.BAD_REQUEST,
          { missing }
        ),
      };
    }

    // Return validated payload
    return {
      success: true,
      payload: {
        prompt,
        systemPrompt,
        selectedVideos,
        editorialProfile,
        voiceId,
        captionConfig,
      },
    };
  }

  /**
   * Validates that all videos have upload URLs
   * @param videos Array of videos to validate
   * @returns Array of validated video objects or throws error
   */
  static validateVideos(videos: any[]): {
    id: string;
    url: string;
    title: string;
    description: string;
    tags: string[];
  }[] {
    return videos.map((video) => {
      if (!video.upload_url) {
        throw new Error(`Missing upload URL for video ${video.id}`);
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
}
