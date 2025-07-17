import AsyncStorage from '@react-native-async-storage/async-storage';
import { CaptionConfigStorage } from '@/lib/utils/caption-config-storage';
import { CaptionConfiguration } from '@/lib/types/video';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('CaptionConfigStorage', () => {
  const testUserId = 'test-user-123';
  const testConfig: CaptionConfiguration = {
    presetId: 'karaoke',
    placement: 'bottom',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getKey', () => {
    it('should generate correct storage key for user', () => {
      // This tests the private method indirectly through other methods
      const expectedKey = `caption_configuration_${testUserId}`;
      CaptionConfigStorage.save(testUserId, testConfig);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        expectedKey,
        JSON.stringify(testConfig)
      );
    });
  });

  describe('load', () => {
    it('should load and parse stored configuration', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(testConfig));

      const result = await CaptionConfigStorage.load(testUserId);

      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(
        `caption_configuration_${testUserId}`
      );
      expect(result).toEqual(testConfig);
    });

    it('should return null when no configuration is stored', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await CaptionConfigStorage.load(testUserId);

      expect(result).toBeNull();
    });

    it('should return null when storage throws an error', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await CaptionConfigStorage.load(testUserId);

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error loading caption config:',
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });

    it('should return null when stored data is invalid JSON', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('invalid-json');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await CaptionConfigStorage.load(testUserId);

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('save', () => {
    it('should save configuration to storage', async () => {
      mockAsyncStorage.setItem.mockResolvedValue();

      const result = await CaptionConfigStorage.save(testUserId, testConfig);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        `caption_configuration_${testUserId}`,
        JSON.stringify(testConfig)
      );
      expect(result).toBe(true);
    });

    it('should return false when storage throws an error', async () => {
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await CaptionConfigStorage.save(testUserId, testConfig);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error saving caption config:',
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });

    it('should handle different configuration types', async () => {
      const configs = [
        { presetId: 'beasty', placement: 'top' as const },
        { presetId: 'karaoke', placement: 'center' as const },
        { presetId: 'karaoke' }, // placement optional
      ];

      mockAsyncStorage.setItem.mockResolvedValue();

      for (const config of configs) {
        const result = await CaptionConfigStorage.save(testUserId, config);
        expect(result).toBe(true);
      }

      expect(mockAsyncStorage.setItem).toHaveBeenCalledTimes(configs.length);
    });
  });

  describe('clear', () => {
    it('should remove configuration from storage', async () => {
      mockAsyncStorage.removeItem.mockResolvedValue();

      const result = await CaptionConfigStorage.clear(testUserId);

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(
        `caption_configuration_${testUserId}`
      );
      expect(result).toBe(true);
    });

    it('should return false when storage throws an error', async () => {
      mockAsyncStorage.removeItem.mockRejectedValue(new Error('Storage error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await CaptionConfigStorage.clear(testUserId);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error clearing caption config:',
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });
  });

  describe('getDefault', () => {
    it('should return default configuration', () => {
      const defaultConfig = CaptionConfigStorage.getDefault();

      expect(defaultConfig).toEqual({
        presetId: 'karaoke',
        placement: 'bottom',
      });
    });

    it('should return consistent default configuration', () => {
      const config1 = CaptionConfigStorage.getDefault();
      const config2 = CaptionConfigStorage.getDefault();

      expect(config1).toEqual(config2);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete save/load cycle', async () => {
      mockAsyncStorage.setItem.mockResolvedValue();
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(testConfig));

      // Save configuration
      const saveResult = await CaptionConfigStorage.save(
        testUserId,
        testConfig
      );
      expect(saveResult).toBe(true);

      // Load configuration
      const loadResult = await CaptionConfigStorage.load(testUserId);
      expect(loadResult).toEqual(testConfig);
    });

    it('should handle save/clear/load cycle', async () => {
      mockAsyncStorage.setItem.mockResolvedValue();
      mockAsyncStorage.removeItem.mockResolvedValue();
      mockAsyncStorage.getItem.mockResolvedValue(null);

      // Save configuration
      await CaptionConfigStorage.save(testUserId, testConfig);

      // Clear configuration
      const clearResult = await CaptionConfigStorage.clear(testUserId);
      expect(clearResult).toBe(true);

      // Load should return null
      const loadResult = await CaptionConfigStorage.load(testUserId);
      expect(loadResult).toBeNull();
    });

    it('should handle multiple users independently', async () => {
      const userId1 = 'user-1';
      const userId2 = 'user-2';
      const config1 = { presetId: 'karaoke', placement: 'top' as const };
      const config2 = { presetId: 'beasty', placement: 'bottom' as const };

      mockAsyncStorage.setItem.mockResolvedValue();

      await CaptionConfigStorage.save(userId1, config1);
      await CaptionConfigStorage.save(userId2, config2);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        `caption_configuration_${userId1}`,
        JSON.stringify(config1)
      );
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        `caption_configuration_${userId2}`,
        JSON.stringify(config2)
      );
    });
  });
});
