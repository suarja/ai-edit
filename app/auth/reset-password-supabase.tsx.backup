import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { AuthEventType, handleAuthRedirect } from '@/lib/utils/authRedirect';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordCallback() {
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
          router.replace('/(auth)/forgot-password');
          return;
        }

        if (session) {
          // Rediriger vers la page de reset password dans l'app
          handleAuthRedirect(AuthEventType.PASSWORD_RECOVERY, true);
        } else {
          // Pas de session valide, retourner au forgot password
          router.replace('/(auth)/forgot-password');
        }
      } catch (error) {
        console.error('Error in reset password callback:', error);
        router.replace('/(auth)/forgot-password');
      }
    };

    handleCallback();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.text}>Redirection en cours...</Text>
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
