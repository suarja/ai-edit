import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { ArrowRight, Mic, CircleStop as StopCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { supabase } from '@/lib/supabase';

const MAX_RECORDING_DURATION = 120000; // 2 minutes in milliseconds

export default function WelcomeScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Cleanup recording on unmount
  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [recording]);

  // Monitor recording duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      const startTime = Date.now();
      interval = setInterval(() => {
        const duration = Date.now() - startTime;
        setRecordingDuration(duration);
        
        if (duration >= MAX_RECORDING_DURATION) {
          stopRecording();
        }
      }, 100);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        (status) => console.log('Recording status:', status),
        100
      );
      
      setRecording(recording);
      setIsRecording(true);
      setError(null);
      setRecordingDuration(0);
    } catch (err) {
      console.error('Failed to start recording', err);
      setError('Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      // Only process if we have recorded for at least 1 second
      if (recordingDuration < 1000) {
        setError('Recording is too short. Please record for at least 1 second.');
        recording.stopAndUnloadAsync();
        setRecording(null);
        setIsRecording(false);
        return;
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (!uri) {
        throw new Error('Failed to get recording URI');
      }

      // Get recording status to verify we have data
      const status = await recording.getStatusAsync();
      console.log('Recording status after stop:', status);

      // Verify file exists and has content
      const response = await fetch(uri);
      const blob = await response.blob();
      
      if (blob.size === 0) {
        throw new Error('Recording is empty');
      }

      console.log('Recording file size:', blob.size);
      await processRecording(uri);

      setRecording(null);
      setIsRecording(false);
    } catch (err) {
      console.error('Failed to stop recording', err);
      setError('Failed to stop recording');
    }
  };

  const processRecording = async (uri: string) => {
    try {
      setProcessing(true);
      setError(null);
      setProgress('Preparing audio...');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const response = await fetch(uri);
      const blob = await response.blob();
      
      if (blob.size > 10 * 1024 * 1024) {
        throw new Error('Recording is too large. Please try a shorter message.');
      }

      const formData = new FormData();
      formData.append('file', {
        uri,
        type: 'audio/x-m4a',
        name: 'recording.m4a'
      } as any);
      formData.append('userId', user.id);

      setProgress('Transcribing audio...');

      const result = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/process-onboarding`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: formData,
        }
      );

      if (!result.ok) {
        const error = await result.json();
        throw new Error(error.error || 'Failed to process recording');
      }

      setProgress('Setting up your profile...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/(onboarding)/editorial');
    } catch (err) {
      console.error('Error processing recording:', err);
      setError(err.message || 'Failed to process recording');
    } finally {
      setProcessing(false);
      setProgress('');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Image 
          source={{ uri: 'https://images.pexels.com/photos/3756879/pexels-photo-3756879.jpeg' }}
          style={styles.headerImage}
        />
        <View style={styles.overlay} />
        <Text style={styles.title}>Welcome to Your AI Studio</Text>
        <Text style={styles.subtitle}>Tell us about your content style</Text>
      </View>

      <View style={styles.content}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>Quick Setup</Text>
          <Text style={styles.instructionText}>
            Record a brief introduction about:
          </Text>
          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>• Your content style and topics</Text>
            <Text style={styles.bulletPoint}>• Your target audience</Text>
            <Text style={styles.bulletPoint}>• Your preferred tone of voice</Text>
          </View>
          <Text style={styles.note}>
            We'll use AI to set up your profile and create your voice clone
          </Text>
          <Text style={styles.timeLimit}>
            Maximum recording time: 2 minutes
          </Text>
        </View>

        {processing ? (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.processingText}>{progress}</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={[styles.recordButton, isRecording && styles.recordingButton]}
            onPress={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? (
              <>
                <StopCircle size={32} color="#ef4444" />
                <Text style={[styles.recordButtonText, styles.recordingText]}>
                  Stop Recording
                </Text>
              </>
            ) : (
              <>
                <Mic size={32} color="#fff" />
                <Text style={styles.recordButtonText}>Start Recording</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.skipButton}
          onPress={() => router.push('/(onboarding)/editorial')}
        >
          <Text style={styles.skipButtonText}>I prefer to type instead</Text>
          <ArrowRight size={20} color="#888" />
        </TouchableOpacity>
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
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
  errorContainer: {
    backgroundColor: '#2D1116',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
  },
  instructions: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  instructionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 16,
    color: '#fff',
  },
  bulletPoints: {
    gap: 8,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#888',
  },
  note: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
  },
  timeLimit: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 8,
  },
  recordButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 16,
    gap: 12,
  },
  recordingButton: {
    backgroundColor: '#2D1116',
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  recordingText: {
    color: '#ef4444',
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
  },
  skipButtonText: {
    color: '#888',
    fontSize: 16,
  },
  processingContainer: {
    alignItems: 'center',
    gap: 12,
  },
  processingText: {
    color: '#fff',
    fontSize: 16,
  },
});