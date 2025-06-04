import AsyncStorage from '@react-native-async-storage/async-storage';
import { CaptionConfiguration } from '@/types/video';

const CAPTION_CONFIG_KEY = 'caption_configuration';

/**
 * Utility class for managing caption configuration in device storage
 */
export class CaptionConfigStorage {
  /**
   * Get the storage key for a specific user
   */
  private static getKey(userId: string): string {
    return `${CAPTION_CONFIG_KEY}_${userId}`;
  }

  /**
   * Load caption configuration for a user
   */
  static async load(userId: string): Promise<CaptionConfiguration | null> {
    try {
      const storedConfig = await AsyncStorage.getItem(this.getKey(userId));
      if (storedConfig) {
        return JSON.parse(storedConfig);
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
      await AsyncStorage.setItem(this.getKey(userId), JSON.stringify(config));
      return true;
    } catch (error) {
      console.error('Error saving caption config:', error);
      return false;
    }
  }

  /**
   * Clear caption configuration for a user
   */
  static async clear(userId: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(this.getKey(userId));
      return true;
    } catch (error) {
      console.error('Error clearing caption config:', error);
      return false;
    }
  }

  /**
   * Get default caption configuration
   */
  static getDefault(): CaptionConfiguration {
    return {
      presetId: 'karaoke', // Default preset
      placement: 'bottom',
      lines: 3,
    };
  }
}
