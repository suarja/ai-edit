import { API_ENDPOINTS } from '@/lib/config/api';
import { Platform, Alert } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

interface ReportIssuePayload {
  jobId: string;
  errorMessage?: string | null;
  token: string;
  context?: Record<string, any>;
  notifyUser?: boolean;
}

export class SupportService {
  static isDevelopment = __DEV__;

  static async reportIssue({
    jobId,
    errorMessage,
    token,
    context = {},
    notifyUser = true,
  }: ReportIssuePayload): Promise<{ success: boolean; message: string }> {
    if (!token) {
      throw new Error('Authentication token is missing.');
    }

    // Collecter les informations système
    const deviceInfo = {
      brand: Device.brand,
      manufacturer: Device.manufacturer,
      modelName: Device.modelName,
      osName: Device.osName,
      osVersion: Device.osVersion,
      appVersion: Constants.expoConfig?.version || 'unknown',
      buildVersion:
        Constants.expoConfig?.ios?.buildNumber ||
        Constants.expoConfig?.android?.versionCode ||
        'unknown',
    };

    const errorReport = {
      timestamp: new Date().toISOString(),
      jobId,
      errorMessage,
      deviceInfo,
      platform: Platform.OS,
      appState: {
        ...context,
        networkState: navigator.onLine ? 'online' : 'offline',
      },
    };

    // En mode développement, on log seulement
    if (this.isDevelopment) {
      console.log('🔧 Support report (dev mode):', errorReport);
      if (notifyUser) {
        Alert.alert(
          'Mode Développement',
          "Un rapport d'erreur aurait été envoyé en production. Détails dans la console.",
          [{ text: 'OK' }]
        );
      }
      return { success: true, message: 'Dev mode - report logged.' };
    }

    // En production, on envoie au support
    const response = await fetch(API_ENDPOINTS.SUPPORT_REPORT_ISSUE(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(errorReport),
    });

    if (response.status === 202) {
      if (notifyUser) {
        Alert.alert(
          'Support Notifié',
          "Notre équipe a été informée du problème et va l'examiner.",
          [{ text: 'OK' }]
        );
      }
      return { success: true, message: 'Report sent successfully.' };
    } else {
      const result = await response.json();
      const error =
        result.error || 'An unknown error occurred while reporting the issue.';
      if (notifyUser) {
        Alert.alert(
          'Erreur',
          'Impossible de contacter le support. Veuillez réessayer plus tard.',
          [{ text: 'OK' }]
        );
      }
      throw new Error(error);
    }
  }
}
