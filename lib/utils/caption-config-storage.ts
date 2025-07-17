import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CaptionConfiguration,
  isValidCaptionConfig,
  TranscriptEffect,
} from '@/lib/types/video';
import { VIDEO_PRESETS } from '@/lib/config/video-presets';

export class CaptionConfigStorage {
  private static readonly STORAGE_KEY_PREFIX = 'caption_config_';

  /**
   * Default caption configuration
   */
  private static readonly DEFAULT_CONFIG: CaptionConfiguration = {
    enabled: true,
    presetId: 'karaoke',
    placement: 'bottom',
    transcriptColor: '#04f827',
    transcriptEffect: 'karaoke',
  };

  /**
   * Load caption configuration for a user
   */
  static async load(userId: string): Promise<CaptionConfiguration | null> {
    try {
      const key = `${this.STORAGE_KEY_PREFIX}${userId}`;
      const stored = await AsyncStorage.getItem(key);

      if (stored) {
        const parsed = JSON.parse(stored);

        // Validate the configuration
        if (isValidCaptionConfig(parsed)) {
          return parsed;
        }

        console.warn(
          'Invalid caption config format found, falling back to default'
        );
      }

      return null;
    } catch (error) {
      console.error('Error loading caption config:', error);
      return null;
    }
  }

  /**
   * Save caption configuration for a user
   */
  static async save(
    userId: string,
    config: CaptionConfiguration
  ): Promise<boolean> {
    try {
      const key = `${this.STORAGE_KEY_PREFIX}${userId}`;

      // Validate config before saving
      if (!isValidCaptionConfig(config)) {
        console.error('Invalid caption config, cannot save');
        return false;
      }

      await AsyncStorage.setItem(key, JSON.stringify(config));
      return true;
    } catch (error) {
      console.error('Error saving caption config:', error);
      return false;
    }
  }

  /**
   * Get default caption configuration
   */
  static getDefault(): CaptionConfiguration {
    return { ...this.DEFAULT_CONFIG };
  }

  /**
   * Smart default that ensures captions work without user setup
   * Loads user config if available, otherwise returns smart defaults
   */
  static async getOrDefault(userId: string): Promise<CaptionConfiguration> {
    const stored = await this.load(userId);
    return stored || this.getDefault();
  }

  /**
   * Get preset configuration by ID
   */
  static getPreset(presetId: string) {
    const preset = VIDEO_PRESETS.find((p) => p.id === presetId);
    if (!preset) {
      console.warn(`Preset ${presetId} not found, falling back to karaoke`);
      return VIDEO_PRESETS.find((p) => p.id === 'karaoke') || VIDEO_PRESETS[0];
    }
    return preset;
  }

  /**
   * Get all available preset IDs
   */
  static getAvailablePresets(): string[] {
    return VIDEO_PRESETS.map((preset) => preset.id);
  }

  /**
   * Get all available transcript effects
   */
  static getAvailableEffects(): TranscriptEffect[] {
    return ['karaoke', 'highlight', 'fade', 'bounce', 'slide', 'enlarge'];
  }

  /**
   * Validate and sanitize a caption configuration
   */
  static validateAndSanitize(config: any): CaptionConfiguration {
    // If config is null/undefined, return default
    if (!config) {
      return this.getDefault();
    }

    // If it's already a valid config, return as-is
    if (isValidCaptionConfig(config)) {
      return config;
    }

    // Otherwise, sanitize the config with fallbacks
    const sanitized: CaptionConfiguration = {
      enabled: Boolean(config.enabled ?? true),
      presetId:
        typeof config.presetId === 'string' &&
        this.getAvailablePresets().includes(config.presetId)
          ? config.presetId
          : 'karaoke',
      placement: ['top', 'center', 'bottom'].includes(config.placement)
        ? config.placement
        : 'bottom',
      transcriptColor:
        typeof config.transcriptColor === 'string' &&
        config.transcriptColor.startsWith('#')
          ? config.transcriptColor
          : undefined,
      transcriptEffect: this.getAvailableEffects().includes(
        config.transcriptEffect
      )
        ? config.transcriptEffect
        : undefined,
    };

    return sanitized;
  }

  /**
   * Clear stored configuration for a user
   */
  static async clear(userId: string): Promise<boolean> {
    try {
      const key = `${this.STORAGE_KEY_PREFIX}${userId}`;
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error clearing caption config:', error);
      return false;
    }
  }

  /**
   * Check if user has any stored configuration
   */
  static async hasStoredConfig(userId: string): Promise<boolean> {
    try {
      const key = `${this.STORAGE_KEY_PREFIX}${userId}`;
      const stored = await AsyncStorage.getItem(key);
      return stored !== null;
    } catch (error) {
      console.error('Error checking stored caption config:', error);
      return false;
    }
  }

  /**
   * Create a configuration with custom overrides
   */
  static createCustomConfig(
    basePresetId: string = 'karaoke',
    overrides: Partial<CaptionConfiguration> = {}
  ): CaptionConfiguration {
    const basePreset = this.getPreset(basePresetId);

    const baseConfig: CaptionConfiguration = {
      enabled: true,
      presetId: basePresetId,
      placement: 'bottom',
      transcriptColor: basePreset.transcript_color as `#${string}`,
      transcriptEffect: basePreset.transcript_effect as TranscriptEffect,
    };

    return {
      ...baseConfig,
      ...overrides,
    };
  }
}
