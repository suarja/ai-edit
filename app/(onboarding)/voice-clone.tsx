import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { Mic, ArrowRight } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { testVoiceAPIConnectivity } from '@/lib/api/voice-recording-client';
import { useState, useEffect } from 'react';

export default function OnboardingVoiceCloneScreen() {
  const [isAPIReady, setIsAPIReady] = useState(true);
  const [isChecking, setIsChecking] = useState(true);

  // Check API connectivity on mount
  useEffect(() => {
    const checkAPI = async () => {
      try {
        setIsChecking(true);
        const isReady = await testVoiceAPIConnectivity();
        setIsAPIReady(isReady);
      } catch (error) {
        console.error('API check error:', error);
        setIsAPIReady(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAPI();
  }, []);

  const handleCreateVoice = () => {
    router.push('/(settings)/voice-clone');
  };

  const handleContinueToRecording = () => {
    router.push('/(onboarding)/voice-recording');
  };

  const handleSkip = () => {
    router.push('/(tabs)/videos');
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
              Just record or upload a few short audio samples, and we&apos;ll
              create a perfect clone of your voice
            </Text>
          </View>

          {!isAPIReady && !isChecking && (
            <View style={styles.warningBox}>
              <Text style={styles.warningTitle}>Connection Issue</Text>
              <Text style={styles.warningText}>
                We&apos;re having trouble connecting to our voice service. You
                can still continue, but voice cloning may not work properly.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={handleContinueToRecording}
          >
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
  warningBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 20,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ef4444',
  },
  warningText: {
    fontSize: 14,
    color: '#ef4444',
    opacity: 0.8,
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
