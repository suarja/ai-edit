import { useEffect } from 'react';
import { Linking } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

export interface AuthDeepLinkData {
  type: 'success' | 'error';
  action?: 'signup' | 'recovery' | 'email_change' | 'invite';
  message?: string;
}

export function useAuthDeepLinks() {
  useEffect(() => {
    // Gérer les deep links entrants
    const handleDeepLink = (url: string) => {
      console.log('Deep link reçu:', url);

      if (url.includes('editia://auth/success')) {
        // Rafraîchir la session après authentification réussie
        handleAuthSuccess();
      } else if (url.includes('editia://auth/error')) {
        // Gérer les erreurs d'authentification
        handleAuthError(url);
      }
    };

    // Écouter les deep links
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    // Vérifier si l'app a été ouverte avec un deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  const handleAuthSuccess = async () => {
    try {
      // Rafraîchir la session pour récupérer les dernières données
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error('Erreur lors de la récupération de session:', error);
        return;
      }

      if (session) {
        console.log('Session récupérée avec succès après deep link');
        // Rediriger vers le dashboard ou la page appropriée
        router.replace('/(app)/(tabs)/dashboard');
      } else {
        console.log('Pas de session trouvée');
        router.replace('/(auth)/sign-in');
      }
    } catch (error) {
      console.error('Erreur handleAuthSuccess:', error);
    }
  };

  const handleAuthError = (url: string) => {
    try {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      const reason = urlParams.get('reason') || 'unknown_error';

      console.error("Erreur d'authentification:", reason);

      // Rediriger vers la page de connexion avec le message d'erreur
      router.replace(`/(auth)/sign-in?error=${reason}`);
    } catch (error) {
      console.error('Erreur handleAuthError:', error);
      router.replace('/(auth)/sign-in?error=unknown_error');
    }
  };

  return {
    handleAuthSuccess,
    handleAuthError,
  };
}
