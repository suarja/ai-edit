import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  ActivityIndicator,
} from 'react-native';
import { Mic, MicOff } from 'lucide-react-native';
import {
  ExpoSpeechRecognitionModule,
  ExpoSpeechRecognitionResult,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

interface VoiceDictationProps {
  onTranscriptChange: (transcript: string) => void;
  currentValue: string;
}

export default function VoiceDictation({
  onTranscriptChange,
  currentValue,
}: VoiceDictationProps) {
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      // Ensure recognition is stopped when the component unmounts
      ExpoSpeechRecognitionModule.stop();
    };
  }, []);

  useSpeechRecognitionEvent('start', () => {
    setIsRecognizing(true);
    setError(null);
  });

  useSpeechRecognitionEvent('end', () => {
    setIsRecognizing(false);
  });

  useSpeechRecognitionEvent('error', (event) => {
    setError(event.message || 'An unknown error occurred.');
    setIsRecognizing(false);
  });

  useSpeechRecognitionEvent(
    'result',
    (event: { results: ExpoSpeechRecognitionResult[]; isFinal: boolean }) => {
      if (event.results && event.results[0]) {
        const transcript = event.results[0].transcript;
        if (event.isFinal) {
          const newText = currentValue
            ? `${currentValue} ${transcript}`
            : transcript;
          onTranscriptChange(newText.trim());
        }
      }
    }
  );

  const handleToggleRecognition = async () => {
    if (isRecognizing) {
      await ExpoSpeechRecognitionModule.stop();
      return;
    }

    try {
      const permissions =
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!permissions.granted) {
        setError('Microphone and speech recognition permissions are required.');
        return;
      }

      await ExpoSpeechRecognitionModule.start({
        lang: 'fr-FR', // Setting language to French
        interimResults: true,
        continuous: false,
      });
    } catch (e: any) {
      setError(e.message);
      setIsRecognizing(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleToggleRecognition}
        style={styles.micButton}
      >
        {isRecognizing ? (
          <ActivityIndicator size="small" color="#ff0000" />
        ) : (
          <Mic size={24} color="#fff" />
        )}
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButton: {
    padding: 8,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
});
