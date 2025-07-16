import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Mic } from 'lucide-react-native';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
  type ExpoSpeechRecognitionResult,
} from 'expo-speech-recognition';
import { SHARED_STYLE_COLORS, sharedStyles } from '@/constants/sharedStyles';

type VoiceDictationProps = {
  onTranscriptChange: (transcript: string) => void;
  currentValue: string;
} & React.ComponentProps<typeof TextInput>;

export default function VoiceDictation({
  onTranscriptChange,
  currentValue,
}: VoiceDictationProps) {
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const baseTranscriptRef = useRef('');

  useEffect(() => {
    return () => {
      ExpoSpeechRecognitionModule.stop();
    };
  }, []);

  useSpeechRecognitionEvent('start', () => {
    setIsRecognizing(true);
    setError(null);
    baseTranscriptRef.current = currentValue.trim();
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
        const interimTranscript = event.results[0].transcript;
        const newText = baseTranscriptRef.current
          ? `${baseTranscriptRef.current} ${interimTranscript}`
          : interimTranscript;
        onTranscriptChange(newText);

        if (event.isFinal) {
          baseTranscriptRef.current = newText.trim();
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
        lang: 'fr-FR',
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
          <ActivityIndicator
            size="small"
            color={SHARED_STYLE_COLORS.background}
          />
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
