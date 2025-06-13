import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { AuthEventType, handleAuthRedirect } from '@/lib/utils/authRedirect';
import { supabase } from '@/lib/supabase';

export default function EmailVerifyCallback() {
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Vérifier si l'utilisateur est authentifié
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error('Error checking session:', error);
          router.replace('/(auth)/sign-in');
          return;
        }

        if (session && session.user.email_confirmed_at) {
          // Email confirmé, rediriger vers l'onboarding ou l'app principale
          if (session.user.user_metadata?.onboarding_completed) {
            handleAuthRedirect(AuthEventType.SIGN_IN_SUCCESS, true);
          } else {
            handleAuthRedirect(AuthEventType.SIGN_UP_SUCCESS, true);
          }
        } else {
          // Email pas encore confirmé ou pas de session, retourner au sign-in
          router.replace('/(auth)/sign-in');
        }
      } catch (error) {
        console.error('Error in email verify callback:', error);
        router.replace('/(auth)/sign-in');
      }
    };

    handleCallback();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.text}>Vérification en cours...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  text: {
    color: '#fff',
    fontSize: 16,
  },
});
