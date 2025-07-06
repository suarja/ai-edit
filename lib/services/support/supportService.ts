import { API_ENDPOINTS } from '@/lib/config/api';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

interface ReportIssuePayload {
  jobId: string;
  errorMessage?: string | null;
  token: string;
  context?: Record<string, any>;
}

export class SupportService {
  static async reportIssue({
    jobId,
    errorMessage,
    token,
    context = {},
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

    const response = await fetch(API_ENDPOINTS.SUPPORT_REPORT_ISSUE(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(errorReport),
    });

    if (response.status === 202) {
      return { success: true, message: 'Report sent successfully.' };
    } else {
      const result = await response.json();
      throw new Error(
        result.error || 'An unknown error occurred while reporting the issue.'
      );
    }
  }
}
