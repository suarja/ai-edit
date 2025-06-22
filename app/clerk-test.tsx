import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { ClerkAuthTest } from '@/components/ClerkAuthTest';

export default function ClerkTestPage() {
  const handleGoToSignIn = () => {
    router.push('/(auth)/sign-in');
  };

  const handleGoToSignUp = () => {
    router.push('/(auth)/sign-up');
  };

  const handleGoToHome = () => {
    router.push('/');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🧪 Clerk Integration Test</Text>
        <Text style={styles.subtitle}>
          Test the Clerk authentication integration
        </Text>
      </View>

      <View style={styles.content}>
        {/* Authentication Status Component */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Authentication Status</Text>
          <ClerkAuthTest />
        </View>

        {/* Navigation Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚀 Navigation</Text>

          <TouchableOpacity style={styles.button} onPress={handleGoToSignIn}>
            <Text style={styles.buttonText}>Go to Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleGoToSignUp}>
            <Text style={styles.buttonText}>Go to Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonSecondary}
            onPress={handleGoToHome}
          >
            <Text style={styles.buttonSecondaryText}>Go to Home</Text>
          </TouchableOpacity>
        </View>

        {/* Direct Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔗 Direct Links</Text>

          <Link href="/(auth)/sign-in" asChild>
            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkText}>Link to Sign In</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/(auth)/sign-up" asChild>
            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkText}>Link to Sign Up</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/" asChild>
            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkText}>Link to Landing</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Environment Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Environment</Text>
          <View style={styles.envInfo}>
            <Text style={styles.envText}>
              Platform: {require('react-native').Platform.OS}
            </Text>
            <Text style={styles.envText}>
              Environment: {__DEV__ ? 'Development' : 'Production'}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 24,
  },
  section: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondary: {
    backgroundColor: '#333',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonSecondaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#444',
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  envInfo: {
    gap: 8,
  },
  envText: {
    color: '#888',
    fontSize: 14,
    fontFamily: 'monospace',
  },
});
