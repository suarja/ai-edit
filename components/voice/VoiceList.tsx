import React from 'react';
import { View } from 'react-native';
import { VoiceConfig } from './VoiceScreen';
import VoiceCard from './VoiceCard';

type VoiceListProps = {
  voices: VoiceConfig[];
  selectedVoiceId: string | null;
  onSelect: (voiceId: string) => void;
};

const VoiceList: React.FC<VoiceListProps> = ({
  voices,
  selectedVoiceId,
  onSelect,
}) => {
  return (
    <View>
      {voices.map((voice) => (
        <VoiceCard
          key={voice.voiceId}
          voice={voice}
          selected={voice.voiceId === selectedVoiceId}
          onSelect={() => onSelect(voice.voiceId)}
        />
      ))}
    </View>
  );
};

export default VoiceList;
