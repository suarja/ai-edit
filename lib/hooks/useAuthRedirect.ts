import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '@/lib/supabase';
import { 
  AuthEventType, 
  handleAuthRedirect, 
  parseAuthCallback 
} from '@/lib/utils/authRedirect';

export function useAuthRedirect() {
  const router = useRouter();
  const linkingRef = useRef<{ remove: () => void } | null>(null);

  useEffect(() => {
    // Gérer l'URL initiale lors du lancement de l'app
    const handleInitialUrl = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          await processAuthUrl(initialUrl);
        }
      } catch (error) {
        console.error('Error handling initial URL:', error);
      }
    };

    // Gérer les URLs reçues pendant que l'app est ouverte
    const handleUrlChange = async (event: { url: string }) => {
      await processAuthUrl(event.url);
    };

    // Configurer les listeners
    handleInitialUrl();
    linkingRef.current = Linking.addEventListener('url', handleUrlChange);

    // Nettoyer les listeners
    return () => {
      linkingRef.current?.remove();
    };
  }, []);

  const processAuthUrl = async (url: string) => {
    try {
      // Parser l'URL pour extraire les informations d'authentification
      const authData = parseAuthCallback(url);
      
      if (authData.error) {
        console.error('Auth callback error:', authData.error);
        router.replace('/(auth)/sign-in');
        return;
      }

      // Si on a des tokens, configurer la session Supabase
      if (authData.accessToken && authData.refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: authData.accessToken,
          refresh_token: authData.refreshToken,
        });

        if (error) {
          console.error('Error setting session:', error);
          router.replace('/(auth)/sign-in');
          return;
        }
      }

      // Rediriger selon le type d'événement
      if (authData.eventType) {
        const { data: { session } } = await supabase.auth.getSession();
        handleAuthRedirect(authData.eventType, !!session);
      }
    } catch (error) {
      console.error('Error processing auth URL:', error);
      router.replace('/(auth)/sign-in');
    }
  };

  return {
    processAuthUrl,
  };
}

export function useAuthStateRedirect() {
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, !!session);

        switch (event) {
          case 'SIGNED_IN':
            // Vérifier si c'est une première connexion ou une connexion de reset password
            if (session?.user?.app_metadata?.provider === 'email') {
              if (session.user.email_confirmed_at) {
                handleAuthRedirect(AuthEventType.SIGN_IN_SUCCESS, true);
              } else {
                // Email pas encore confirmé, rester sur sign-in
                router.replace('/(auth)/sign-in');
              }
            } else {
              handleAuthRedirect(AuthEventType.SIGN_IN_SUCCESS, true);
            }
            break;

          case 'SIGNED_OUT':
            router.replace('/(auth)/sign-in');
            break;

          case 'PASSWORD_RECOVERY':
            // Ce cas est géré par le deep linking, mais on peut ajouter une logique de fallback
            handleAuthRedirect(AuthEventType.PASSWORD_RECOVERY, !!session);
            break;

          case 'TOKEN_REFRESHED':
            // Session rafraîchie, pas besoin de redirection
            break;

          default:
            console.log('Unhandled auth event:', event);
            break;
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [router]);
} 