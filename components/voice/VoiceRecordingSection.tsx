import React from 'react';
import { View, Button } from 'react-native';
import { VoiceRecordingUI } from './VoiceRecordingUI';
import { VoiceConfig } from '@/lib/services/voiceService';

type VoiceRecordingSectionProps = {
  onComplete: (voice: VoiceConfig) => void;
  onCancel: () => void;
};

const VoiceRecordingSection: React.FC<VoiceRecordingSectionProps> = ({
  onComplete,
  onCancel,
}) => {
  return (
    <View>
      <VoiceRecordingUI />
      <Button title="Annuler" onPress={onCancel} />
    </View>
  );
};

export default VoiceRecordingSection;
