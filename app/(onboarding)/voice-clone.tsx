import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { Mic, ArrowRight } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingVoiceCloneScreen() {
  const handleCreateVoice = () => {
    router.push('/(settings)/voice-clone');
  };

  const handleSkip = () => {
    router.push('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Image
          source={{
            uri: 'https://images.pexels.com/photos/3756878/pexels-photo-3756878.jpeg',
          }}
          style={styles.headerImage}
        />
        <View style={styles.overlay} />
        <Text style={styles.title}>Clone Your Voice</Text>
        <Text style={styles.subtitle}>
          Create a unique AI voice that sounds just like you
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.benefits}>
          <View style={styles.benefit}>
            <Mic size={32} color="#007AFF" />
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Personalized Voice</Text>
              <Text style={styles.benefitDescription}>
                Your AI-generated videos will use your own voice, making your
                content more authentic and engaging
              </Text>
            </View>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Quick and Easy</Text>
            <Text style={styles.infoText}>
              Just record or upload a few short audio samples, and we'll create
              a perfect clone of your voice
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleCreateVoice}>
            <Text style={styles.buttonText}>Create Voice Clone</Text>
            <ArrowRight size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    height: 300,
    justifyContent: 'flex-end',
    padding: 20,
  },
  headerImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: 300,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 20,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  benefits: {
    gap: 24,
  },
  benefit: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
  },
  benefitContent: {
    flex: 1,
    gap: 8,
  },
  benefitTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  benefitDescription: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
  infoBox: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
    gap: 8,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  infoText: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    flex: 2,
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
    fontSize: 16,
    fontWeight: '600',
  },
});
