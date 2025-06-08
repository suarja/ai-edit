import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  EnhancedCaptionConfiguration,
  CaptionConfiguration,
  DEFAULT_CAPTION_CONFIG,
  migrateLegacyConfig,
  isValidEnhancedCaptionConfig,
  isValidCaptionConfig,
  TranscriptEffect,
} from '@/types/video';
import { VIDEO_PRESETS } from '@/lib/config/video-presets';

export class CaptionConfigStorage {
  private static readonly STORAGE_KEY_PREFIX = 'caption_config_';
  private static readonly LEGACY_STORAGE_KEY_PREFIX = 'caption_config_';

  /**
   * Load enhanced caption configuration for a user
   * Includes automatic migration from legacy format
   */
  static async load(
    userId: string
  ): Promise<EnhancedCaptionConfiguration | null> {
    try {
      const key = `${this.STORAGE_KEY_PREFIX}${userId}`;
      const stored = await AsyncStorage.getItem(key);

      if (stored) {
        const parsed = JSON.parse(stored);

        // Check if it's already in enhanced format
        if (isValidEnhancedCaptionConfig(parsed)) {
          return parsed;
        }

        // Check if it's a legacy format that needs migration
        if (isValidCaptionConfig(parsed)) {
          console.log('Migrating legacy caption config to enhanced format');
          const migrated = migrateLegacyConfig(parsed);

          // Save the migrated config
          await this.save(userId, migrated);
          return migrated;
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
   * Save enhanced caption configuration for a user
   */
  static async save(
    userId: string,
    config: EnhancedCaptionConfiguration
  ): Promise<boolean> {
    try {
      const key = `${this.STORAGE_KEY_PREFIX}${userId}`;

      // Validate config before saving
      if (!isValidEnhancedCaptionConfig(config)) {
        console.error('Invalid enhanced caption config, cannot save');
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
   * Get default enhanced caption configuration
   */
  static getDefault(): EnhancedCaptionConfiguration {
    return { ...DEFAULT_CAPTION_CONFIG };
  }

  /**
   * Smart default that ensures captions work without user setup
   * Loads user config if available, otherwise returns smart defaults
   */
  static async getOrDefault(
    userId: string
  ): Promise<EnhancedCaptionConfiguration> {
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
  static validateAndSanitize(config: any): EnhancedCaptionConfiguration {
    // If config is null/undefined, return default
    if (!config) {
      return this.getDefault();
    }

    // If it's already a valid enhanced config, return as-is
    if (isValidEnhancedCaptionConfig(config)) {
      return config;
    }

    // If it's a legacy config, migrate it
    if (isValidCaptionConfig(config)) {
      return migrateLegacyConfig(config);
    }

    // Otherwise, sanitize the config with fallbacks
    const sanitized: EnhancedCaptionConfiguration = {
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
    overrides: Partial<EnhancedCaptionConfiguration> = {}
  ): EnhancedCaptionConfiguration {
    const basePreset = this.getPreset(basePresetId);

    return {
      enabled: overrides.enabled ?? true,
      presetId: basePresetId,
      placement: overrides.placement ?? 'bottom',
      transcriptColor: overrides.transcriptColor ?? basePreset.transcript_color,
      transcriptEffect:
        overrides.transcriptEffect ??
        (basePreset.transcript_effect as TranscriptEffect),
    };
  }
}
