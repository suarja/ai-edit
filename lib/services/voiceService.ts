import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS, API_HEADERS } from '../config/api';
import { VoiceRecordingService } from './voiceRecordingService';
import { VOICE_RECORDING_ERROR_CODES } from '../types/voice-recording';
import { z } from 'zod';

const VoiceDatabaseSchema = z.object({
  elevenlabs_voice_id: z.string(),
  name: z.string(),
  is_public: z.boolean(),
  status: z.string(),
});

type VoiceDatabase = z.infer<typeof VoiceDatabaseSchema>;

export class VoiceService {
  static async getSelectedVoice(userId: string) {
    const hasStoredConfig = await VoiceConfigStorage.hasStoredConfig(userId);
    if (hasStoredConfig) {
      return VoiceConfigStorage.load(userId);
    }
    return null;
  }
  static async getExistingVoice(
    userId: string
  ): Promise<VoiceDatabase[] | null> {
    try {
      const response = await fetch(`${API_ENDPOINTS.USER_VOICES()}`, {
        headers: API_HEADERS.CLERK_AUTH(userId),
      });
      if (!response.ok) {
        throw new Error(`Failed to get existing voice: ${response.statusText}`);
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error(`Failed to get existing voice: ${data.error}`);
      }
      return data.data;
    } catch (error) {
      console.error('Error getting existing voice:', error);
      return null;
    }
  }

  static async getVoiceSamples(
    voiceId: string,
    data: { token: string }
  ): Promise<any[]> {
    try {
      console.log(`🔍 Récupération échantillons pour voix: ${voiceId}`);

      const userToken = data.token;

      // Appel à notre serveur qui va faire l'appel ElevenLabs
      const response = await fetch(
        `${API_ENDPOINTS.VOICE_CLONE()}/samples/${voiceId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${userToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur récupération échantillons:', {
          status: response.status,
          errorText,
        });
        throw new Error(
          `Erreur serveur (${response.status}): ${
            errorText || response.statusText
          }`
        );
      }

      const result = await response.json();
      if (!result || !result.success) {
        throw new Error(
          `Réponse invalide: ${result?.error || 'Erreur inconnue'}`
        );
      }

      console.log(
        `✅ Échantillons récupérés: ${result.samples?.length || 0} échantillons`
      );
      return result.samples || [];
    } catch (error: any) {
      console.error('❌ Échec récupération échantillons:', error);
      throw VoiceRecordingService.createVoiceRecordingError(
        error,
        VOICE_RECORDING_ERROR_CODES.BACKEND_ERROR
      );
    }
  }

  static async getVoiceSampleAudioUrl(
    voiceId: string,
    sampleId: string,
    data: { token: string }
  ): Promise<string> {
    try {
      const userToken = data.token;

      console.log(`🔗 Demande URL audio pour échantillon: ${sampleId}`);

      // Demander une URL temporaire avec auth propre
      const response = await fetch(
        `${API_ENDPOINTS.VOICE_CLONE()}/samples/${voiceId}/${sampleId}/audio-url`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${userToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get audio URL: ${response.statusText}`);
      }

      const result = await response.json();
      if (!result.success || !result.audioUrl) {
        throw new Error(`Invalid response: ${result.error || 'No audio URL'}`);
      }

      console.log(`✅ URL audio obtenue, expire dans ${result.expiresIn}s`);
      return result.audioUrl;
    } catch (error: any) {
      console.error('❌ Échec obtention URL audio:', error);
      throw VoiceRecordingService.createVoiceRecordingError(
        error,
        VOICE_RECORDING_ERROR_CODES.BACKEND_ERROR
      );
    }
  }

  static voiceMapper(voice: VoiceDatabase[]): VoiceConfig[] | null {
    const voices = voice.map((v) => {
      const { success, data, error } = VoiceDatabaseSchema.safeParse(v);
      if (!success) {
        console.error('Error parsing voice:', error);
        return null;
      }
      return data;
    });
    return voices
      .filter((v) => v !== null)
      .map((e) => {
        return {
          voiceId: e.elevenlabs_voice_id,
          voiceName: e.name || e.elevenlabs_voice_id,
          isPublic: e.is_public,
        };
      }) as VoiceConfig[];
  }
}

export type VoiceConfig = {
  voiceId: string;
  voiceName: string;
  voiceDescription?: string;
  voiceGender?: 'male' | 'female';
  voiceAge?: string;
  voiceLink?: string;
  isPublic: boolean;
};
export class VoiceConfigStorage {
  private static readonly STORAGE_KEY_PREFIX = 'voice_config_';

  static async load(userId: string): Promise<VoiceConfig | null> {
    const key = `${this.STORAGE_KEY_PREFIX}${userId}`;
    const stored = await AsyncStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  }

  static async save(userId: string, config: VoiceConfig): Promise<boolean> {
    const key = `${this.STORAGE_KEY_PREFIX}${userId}`;
    try {
      await AsyncStorage.setItem(key, JSON.stringify(config));
      return true;
    } catch (error) {
      console.error('Error saving voice config:', error);
      return false;
    }
  }

  static async clear(userId: string): Promise<boolean> {
    const key = `${this.STORAGE_KEY_PREFIX}${userId}`;
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error clearing voice config:', error);
      return false;
    }
  }

  static async hasStoredConfig(userId: string): Promise<boolean> {
    const key = `${this.STORAGE_KEY_PREFIX}${userId}`;
    const stored = await AsyncStorage.getItem(key);
    return stored !== null;
  }

  private static readonly DEFAULT_CONFIG: VoiceConfig = {
    // Default voice ID

    voiceId: 'jUHQdLfy668sllNiNTSW',
    voiceName: 'Clément',
    voiceDescription: 'Top Voice France- Narrative & calm',
    voiceGender: 'male',
    voiceAge: '20-30',
    isPublic: true,
  };

  static async getDefaultVoice(userId: string) {
    const hasStoredConfig = await VoiceConfigStorage.hasStoredConfig(userId);
    if (hasStoredConfig) {
      return VoiceConfigStorage.load(userId);
    }
    return this.DEFAULT_VOICES[0];
  }

  static getDefaultVoicesList() {
    return this.DEFAULT_VOICES;
  }

  private static readonly DEFAULT_VOICES: VoiceConfig[] = [
    {
      voiceId: 'McVZB9hVxVSk3Equu8EH',
      voiceName: 'Audrey',
      voiceDescription: 'Top Voice France- Narrative & calm',
      voiceGender: 'female',
      voiceAge: '20-30',
      voiceLink:
        'https://elevenlabs.io/app/voice-library?voiceId=McVZB9hVxVSk3Equu8EH',
      isPublic: true,
    },
    {
      voiceId: 'jUHQdLfy668sllNiNTSW',
      voiceName: 'Clément',
      voiceDescription: 'Top Voice France- Narrative & calm',
      voiceGender: 'male',
      voiceAge: '20-30',
      isPublic: false,
    },
  ];
}
