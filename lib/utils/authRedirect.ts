import { router } from 'expo-router';
import * as Linking from 'expo-linking';

export enum AuthEventType {
  PASSWORD_RECOVERY = 'PASSWORD_RECOVERY',
  EMAIL_CONFIRMATION = 'EMAIL_CONFIRMATION',
  SIGN_UP_SUCCESS = 'SIGN_UP_SUCCESS',
  SIGN_IN_SUCCESS = 'SIGN_IN_SUCCESS',
}

export interface AuthRedirectConfig {
  event: AuthEventType;
  route: string;
  replace?: boolean;
  requiresAuth?: boolean;
}

export const AUTH_REDIRECT_CONFIGS: Record<AuthEventType, AuthRedirectConfig> =
  {
    [AuthEventType.PASSWORD_RECOVERY]: {
      event: AuthEventType.PASSWORD_RECOVERY,
      route: '/(auth)/reset-password',
      replace: true,
      requiresAuth: true,
    },
    [AuthEventType.EMAIL_CONFIRMATION]: {
      event: AuthEventType.EMAIL_CONFIRMATION,
      route: '/(auth)/sign-in',
      replace: true,
      requiresAuth: false,
    },
    [AuthEventType.SIGN_UP_SUCCESS]: {
      event: AuthEventType.SIGN_UP_SUCCESS,
      route: '/(onboarding)/welcome',
      replace: true,
      requiresAuth: true,
    },
    [AuthEventType.SIGN_IN_SUCCESS]: {
      event: AuthEventType.SIGN_IN_SUCCESS,
      route: '/(tabs)/source-videos',
      replace: true,
      requiresAuth: true,
    },
  };

export function getRedirectUrl(eventType: AuthEventType): string {
  const baseUrl = __DEV__ ? 'exp://localhost:8081/--' : 'https://editia.app';

  const config = AUTH_REDIRECT_CONFIGS[eventType];
  return `${baseUrl}${config.route}`;
}

export function handleAuthRedirect(
  eventType: AuthEventType,
  isAuthenticated: boolean = false
) {
  const config = AUTH_REDIRECT_CONFIGS[eventType];

  if (!config) {
    console.error(`No redirect config found for event type: ${eventType}`);
    return;
  }

  // Vérifier si l'authentification est requise
  if (config.requiresAuth && !isAuthenticated) {
    console.warn(
      `Authentication required for ${eventType} but user is not authenticated`
    );
    router.replace('/(auth)/sign-in');
    return;
  }

  // Effectuer la redirection
  if (config.replace) {
    router.replace(config.route as any);
  } else {
    router.push(config.route as any);
  }
}

export function parseAuthCallback(url: string): {
  eventType?: AuthEventType;
  accessToken?: string;
  refreshToken?: string;
  error?: string;
} {
  try {
    const parsedUrl = Linking.parse(url);
    const queryParams = parsedUrl.queryParams || {};

    // Convert hash parameters to query parameters for Supabase URLs
    if (url.includes('#')) {
      const hashPart = url.split('#')[1];
      const hashParams = new URLSearchParams(hashPart);

      hashParams.forEach((value, key) => {
        queryParams[key] = value;
      });
    }

    const accessToken = queryParams.access_token as string;
    const refreshToken = queryParams.refresh_token as string;
    const error = queryParams.error as string;
    const type = queryParams.type as string;

    // Déterminer le type d'événement basé sur les paramètres et la route
    let eventType: AuthEventType | undefined;

    if (type === 'recovery' || parsedUrl.path?.includes('reset-password')) {
      eventType = AuthEventType.PASSWORD_RECOVERY;
    } else if (type === 'signup' || parsedUrl.path?.includes('verify')) {
      eventType = AuthEventType.EMAIL_CONFIRMATION;
    } else if (accessToken && refreshToken) {
      // Par défaut, considérer comme une connexion réussie
      eventType = AuthEventType.SIGN_IN_SUCCESS;
    }

    return {
      eventType,
      accessToken,
      refreshToken,
      error,
    };
  } catch (error) {
    console.error('Error parsing auth callback:', error);
    return { error: 'Invalid callback URL' };
  }
}

export function createAuthRedirectUrl(eventType: AuthEventType): string {
  return getRedirectUrl(eventType);
}
