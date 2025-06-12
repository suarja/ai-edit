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
import { withErrorBoundary } from '@/components/ErrorBoundary';
import { reportAuthError } from '@/lib/services/errorReporting';
import { IMAGES } from '@/lib/constants/images';
import { useClerkAuth } from '@/hooks/useClerkAuth';

function LandingScreen() {
  const [checking, setChecking] = useState(true);
  const { isLoaded, isSignedIn, initializing } = useClerkAuth();

  useEffect(() => {
    checkAuthAndRedirect();
  }, [isLoaded, isSignedIn]);

  const checkAuthAndRedirect = async () => {
    try {
      // Wait for Clerk to be fully loaded
      if (!isLoaded || initializing) {
        return;
      }

      if (isSignedIn) {
        // User is authenticated with Clerk, redirect to main app
        console.log(
          '✅ User authenticated with Clerk, redirecting to main app'
        );
        router.replace('/(tabs)/source-videos');
      } else {
        // User is not authenticated, stay on landing screen
        console.log('❌ User not authenticated, staying on landing screen');
        setChecking(false);
      }
    } catch (error) {
      reportAuthError(error as Error, {
        screen: 'LandingScreen',
        action: 'clerk_auth_check_exception',
      });
      console.error('Exception during Clerk auth check:', error);
      setChecking(false);
    }
  };

  const handleGetStarted = () => {
    // Redirect to new Clerk sign-in flow
    router.push('/(auth)/sign-in-clerk');
  };

  // Show loading while Clerk is initializing or we're checking auth
  if ((!isLoaded || initializing || checking) && !isSignedIn) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>
          {!isLoaded ? 'Loading authentication...' : 'Checking user status...'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{
            uri: IMAGES.landing.header,
          }}
          style={styles.headerImage}
        />
        <View style={styles.overlay} />
        <Text style={styles.title}>Créez des Vidéos Incroyables</Text>
        <Text style={styles.subtitle}>
          Transformez votre contenu en vidéos captivantes avec l&apos;IA
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.featureCard}>
          <Video size={32} color="#007AFF" />
          <Text style={styles.featureTitle}>Génération Vidéo Intelligente</Text>
          <Text style={styles.featureText}>
            Transformez vos idées en vidéos professionnelles en quelques minutes
            grâce à l&apos;IA avancée
          </Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
          <Play size={24} color="#fff" />
          <Text style={styles.buttonText}>Commencer</Text>
        </TouchableOpacity>

        {/* Debug info in development */}
        {__DEV__ && (
          <View style={styles.debugInfo}>
            <Text style={styles.debugText}>
              Debug: isLoaded={isLoaded ? 'true' : 'false'}
            </Text>
            <Text style={styles.debugText}>
              Debug: isSignedIn={isSignedIn ? 'true' : 'false'}
            </Text>
            <Text style={styles.debugText}>
              Debug: initializing={initializing ? 'true' : 'false'}
            </Text>
          </View>
        )}
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
    textAlign: 'center',
  },
  header: {
    height: 400,
    justifyContent: 'flex-end',
    padding: 20,
  },
  headerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
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
  debugInfo: {
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  debugText: {
    color: '#888',
    fontSize: 12,
    fontFamily: 'monospace',
  },
});

// Export with error boundary
export default withErrorBoundary(LandingScreen);
