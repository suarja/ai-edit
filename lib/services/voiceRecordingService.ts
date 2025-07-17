import { API_ENDPOINTS } from '../config/api';
import {
  errorTaxonomy,
  VOICE_RECORDING_ERROR_CODES,
  VoiceRecordingError,
  VoiceRecordingResult,
} from '../types/voice-recording';
import { DatabaseUser } from '@/components/hooks/useGetUser';

interface VoiceCloneSubmissionData {
  name: string;
  recordings: { uri: string; name: string }[];
  user: DatabaseUser;
  token: string;
}

interface VoiceRecordingSubmissionData {
  uri: string;
  name: string;
  duration: number;
  fileName: string;
}

interface OnboardingSubmissionData extends VoiceRecordingSubmissionData {
  surveyData?: Record<string, any>;
  user: DatabaseUser;
  token: string;
  enableVoiceClone?: boolean;
}

export class VoiceRecordingService {
  static async submitVoiceClone(
    data: VoiceCloneSubmissionData
  ): Promise<VoiceRecordingResult> {
    try {
      console.log(`🎤 Soumission clone vocal SIMPLE:`, {
        name: data.name,
        recordings: data.recordings.length,
      });

      // 1. Vérifier l'authentification
      const user = data.user;

      // 2. Valider les fichiers
      for (const recording of data.recordings) {
        await VoiceRecordingService.validateAudioFile(
          recording.uri,
          recording.name
        );
      }

      // 3. Préparer FormData (plus simple que JSON/base64)
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('userId', user.id);

      // 4. Ajouter chaque fichier audio - FORMAT REACT NATIVE
      for (let i = 0; i < data.recordings.length; i++) {
        const recording = data.recordings[i];

        // Valider que le fichier existe et a une taille
        const response = await fetch(recording.uri);
        const blob = await response.blob();

        console.log(
          `🔍 Fichier original: ${recording.name}, taille: ${blob.size}, type: "${blob.type}"`
        );

        // Vérifier la taille minimum
        if (blob.size < 10000) {
          throw new Error(
            `Fichier trop petit: ${blob.size} bytes. Enregistrez plus longtemps.`
          );
        }

        // Nettoyer le nom de fichier pour ElevenLabs
        const cleanFileName = recording.name
          .replace(/\s+/g, '-')
          .toLowerCase()
          .replace(/[^a-z0-9.-]/g, '');

        console.log(
          `📁 Envoi vers serveur: ${cleanFileName}, taille: ${blob.size}, type: ${blob.type}`
        );

        // Format React Native FormData - utiliser l'URI et les métadonnées
        formData.append('files', {
          uri: recording.uri,
          type: blob.type || 'audio/m4a',
          name: cleanFileName,
        } as any);
      }

      console.log(
        '📡 Appel API voice clone FormData:',
        API_ENDPOINTS.VOICE_CLONE()
      );

      // 5. Appel API avec FormData vers le serveur Node.js
      const userToken = data.token;

      const response = await fetch(API_ENDPOINTS.VOICE_CLONE(), {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${userToken}`,
          // Pas de Content-Type pour FormData
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur API:', { status: response.status, errorText });
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

      console.log('✅ Clone vocal soumis avec succès:', {
        voiceId: result.voice_id,
      });

      return {
        successful: true,
        uri: data.recordings[0].uri,
        fileName: data.recordings[0].name,
        duration: 0,
        fileSize: 0,
        voiceCloneId: result.voice_id,
      };
    } catch (error: any) {
      console.error('❌ Échec soumission clone vocal:', error);
      throw VoiceRecordingService.createVoiceRecordingError(
        error,
        VOICE_RECORDING_ERROR_CODES.BACKEND_ERROR
      );
    }
  }
  static createVoiceRecordingError(
    error: any,
    fallbackCode: string = VOICE_RECORDING_ERROR_CODES.UNKNOWN_ERROR
  ): VoiceRecordingError {
    if (error.type && error.code && error.message) {
      return error;
    }

    let errorCode = fallbackCode;
    let errorMessage = error.message || "Une erreur inconnue s'est produite";

    // Mapping simple des erreurs communes
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      errorCode = VOICE_RECORDING_ERROR_CODES.NETWORK_ERROR;
      errorMessage =
        'Problème de connexion réseau. Vérifiez votre connexion internet.';
    } else if (
      errorMessage.includes('401') ||
      errorMessage.includes('permission')
    ) {
      errorCode = VOICE_RECORDING_ERROR_CODES.PERMISSION_DENIED;
      errorMessage = "Problème d'authentification. Reconnectez-vous.";
    } else if (
      errorMessage.includes('400') ||
      errorMessage.includes('validation')
    ) {
      errorCode = VOICE_RECORDING_ERROR_CODES.VALIDATION_ERROR;
      errorMessage = 'Données invalides. Vérifiez votre enregistrement.';
    } else if (errorMessage.includes('500') || errorMessage.includes('502')) {
      errorCode = VOICE_RECORDING_ERROR_CODES.BACKEND_ERROR;
      errorMessage = 'Erreur du serveur. Réessayez dans quelques instants.';
    }

    const baseError =
      errorTaxonomy[errorCode] ||
      errorTaxonomy[VOICE_RECORDING_ERROR_CODES.UNKNOWN_ERROR];

    return {
      ...baseError,
      message: errorMessage,
    };
  }

  static async validateAudioFile(
    uri: string,
    fileName: string
  ): Promise<{ blob: Blob; size: number }> {
    try {
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(
          `Impossible de lire le fichier audio: ${response.statusText}`
        );
      }

      const blob = await response.blob();

      if (blob.size === 0) {
        throw VoiceRecordingService.createVoiceRecordingError(
          { message: "Le fichier d'enregistrement est vide" },
          VOICE_RECORDING_ERROR_CODES.RECORDING_EMPTY
        );
      }

      if (blob.size > 10 * 1024 * 1024) {
        // 10MB max
        throw VoiceRecordingService.createVoiceRecordingError(
          {
            message: `Fichier trop volumineux: ${(
              blob.size /
              1024 /
              1024
            ).toFixed(1)}MB (max 10MB)`,
          },
          VOICE_RECORDING_ERROR_CODES.FILE_TOO_LARGE
        );
      }

      console.log(
        `✅ Fichier validé: ${fileName}, taille: ${(blob.size / 1024).toFixed(
          1
        )}KB`
      );
      return { blob, size: blob.size };
    } catch (error: any) {
      console.error(`❌ Validation échouée pour ${fileName}:`, error);
      throw VoiceRecordingService.createVoiceRecordingError(
        error,
        VOICE_RECORDING_ERROR_CODES.VALIDATION_ERROR
      );
    }
  }

  static async submitOnboardingRecording(
    data: OnboardingSubmissionData
  ): Promise<VoiceRecordingResult> {
    try {
      console.log(`🎤 Soumission onboarding:`, {
        fileName: data.fileName,
        uri: data.uri.substring(0, 50) + '...',
      });

      // 1. Vérifier l'authentification
      const user = data.user;

      // 2. Valider le fichier et obtenir le blob
      const { blob, size } = await VoiceRecordingService.validateAudioFile(
        data.uri,
        data.fileName
      );

      console.log(
        `✅ Fichier validé - taille: ${size} bytes, type: ${blob.type}`
      );

      // 3. Préparer les données pour l'API avec le format React Native
      const formData = new FormData();

      // Format React Native FormData - utiliser l'URI et les métadonnées
      formData.append('file', {
        uri: data.uri,
        type: blob.type || 'audio/m4a',
        name: data.fileName,
      } as any);
      formData.append('userId', user.id);

      if (data.surveyData) {
        formData.append(
          'survey_data',
          JSON.stringify({
            user_id: user.id,
            ...data.surveyData,
          })
        );
      }

      // Add voice clone preference
      formData.append(
        'enable_voice_clone',
        data.enableVoiceClone ? 'true' : 'false'
      );

      console.log(`📡 Appel API onboarding: ${API_ENDPOINTS.ONBOARDING()}`);

      // 4. Appel API vers le serveur Node.js
      const userToken = data.token;

      const response = await fetch(API_ENDPOINTS.ONBOARDING(), {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${userToken}`,
          // Pas de Content-Type pour FormData
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur API onboarding:', {
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

      console.log('✅ Onboarding soumis avec succès');

      return {
        successful: true,
        uri: data.uri,
        fileName: data.fileName,
        duration: data.duration,
        fileSize: size,
      };
    } catch (error: any) {
      console.error('❌ Échec soumission onboarding:', error);
      throw VoiceRecordingService.createVoiceRecordingError(
        error,
        VOICE_RECORDING_ERROR_CODES.BACKEND_ERROR
      );
    }
  }
}
