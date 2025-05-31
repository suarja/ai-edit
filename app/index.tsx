import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Video, Play } from 'lucide-react-native';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { withErrorBoundary } from '@/components/ErrorBoundary';
import { reportAuthError } from '@/lib/services/errorReporting';

function LandingScreen() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        reportAuthError(error, {
          screen: 'LandingScreen',
          action: 'check_auth_state',
        });
        console.error('Auth state check error:', error);
      }

      if (session) {
        // User is already logged in, redirect to main app
        router.replace('/(tabs)/source-videos');
      }
    } catch (error) {
      reportAuthError(error as Error, {
        screen: 'LandingScreen',
        action: 'auth_check_exception',
      });
      console.error('Exception during auth check:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = () => {
    router.push('/(auth)/sign-in');
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{
            uri: 'https://images.pexels.com/photos/2873486/pexels-photo-2873486.jpeg',
          }}
          style={styles.headerImage}
        />
        <View style={styles.overlay} />
        <Text style={styles.title}>Créez des Vidéos Incroyables</Text>
        <Text style={styles.subtitle}>
          Transformez votre contenu en vidéos captivantes avec l'IA
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.featureCard}>
          <Video size={32} color="#007AFF" />
          <Text style={styles.featureTitle}>Génération Vidéo Intelligente</Text>
          <Text style={styles.featureText}>
            Transformez vos idées en vidéos professionnelles en quelques minutes
            grâce à l'IA avancée
          </Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
          <Play size={24} color="#fff" />
          <Text style={styles.buttonText}>Commencer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#888',
    fontSize: 16,
  },
  header: {
    height: 400,
    justifyContent: 'flex-end',
    padding: 20,
  },
  headerImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: 400,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#888',
    marginBottom: 20,
  },
  content: {
    flex: 1,
    padding: 20,
    gap: 24,
  },
  featureCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    gap: 12,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  featureText: {
    fontSize: 16,
    color: '#888',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

// Export with error boundary
export default withErrorBoundary(LandingScreen);
