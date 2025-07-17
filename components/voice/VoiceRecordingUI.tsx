import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  Mic,
  CircleStop as StopCircle,
  AlertCircle,
  RefreshCw,
  Send,
} from 'lucide-react-native';
import {
  VoiceRecordingConfig,
  VoiceRecordingResult,
} from '@/lib/types/voice-recording';
import { useVoiceRecording } from '@/components/hooks/useVoiceRecording';
import { VoiceRecordingErrorWrapper } from './VoiceRecordingErrorBoundary';
import {
  useVoiceRecordingContext,
  VoiceRecordingContext,
} from './VoiceRecordingContext';
import { SimpleVoiceRecordingControls } from './VoiceRecordingControls';
import {
  VoiceRecordingInstructions,
  VoiceRecordingError,
  VoiceRecordingTimer,
} from './VoiceRecordingUtils';

interface VoiceRecordingUIProps {
  variant?: 'onboarding' | 'settings';
  config?: VoiceRecordingConfig;
  onComplete?: (result: VoiceRecordingResult) => void;
  onError?: (error: any) => void;
  customInstructions?: string[];
  showInstructions?: boolean;
  showTimer?: boolean;
  className?: string;
}

export const VoiceRecordingUI: React.FC<VoiceRecordingUIProps> = ({
  variant = 'onboarding',
  config,
  onComplete,
  onError,
  customInstructions,
  showInstructions = true,
  showTimer = true,
  className,
}) => {
  // Merge config with variant-specific defaults
  const mergedConfig: VoiceRecordingConfig = {
    variant,
    onSuccess: onComplete,
    onError,
    ...config,
  };

  const voiceRecording = useVoiceRecording(mergedConfig);

  return (
    <VoiceRecordingErrorWrapper onError={onError}>
      <VoiceRecordingContext.Provider value={voiceRecording}>
        <View style={styles.container}>
          {/* Instructions */}
          {showInstructions && (
            <VoiceRecordingInstructions
              variant={variant}
              customInstructions={customInstructions}
            />
          )}

          {/* Error Display */}
          <VoiceRecordingError />

          {/* Timer */}
          {showTimer && <VoiceRecordingTimer />}

          {/* Recording Controls */}
          <SimpleVoiceRecordingControls variant={variant} />
        </View>
      </VoiceRecordingContext.Provider>
    </VoiceRecordingErrorWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
});
