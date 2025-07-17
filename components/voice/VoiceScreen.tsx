import React, { useState } from 'react';
import { View } from 'react-native';
// Sous-composants à créer
import VoiceList from './VoiceList';
import VoiceCreateButton from './VoiceCreateButton';
import VoiceRecordingSection from './VoiceRecordingSection';

// Types de voix (génériques ou clonées)
export type VoiceConfig = {
  voiceId: string;
  voiceName: string;
  description?: string;
  isCloned?: boolean;
};

const DEFAULT_VOICES: VoiceConfig[] = [
  {
    voiceId: '1',
    voiceName: 'Voix Garçon',
    description: 'Voix masculine générique, chaleureuse et claire.',
    isCloned: false,
  },
  {
    voiceId: '2',
    voiceName: 'Voix Fille',
    description: 'Voix féminine générique, douce et expressive.',
    isCloned: false,
  },
];

export const VoiceScreen: React.FC = () => {
  const [step, setStep] = useState<'list' | 'record'>('list');
  const [voices, setVoices] = useState<VoiceConfig[]>(DEFAULT_VOICES);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null);

  // Handler pour ajouter une voix clonée
  const handleAddClonedVoice = (voice: VoiceConfig) => {
    setVoices((prev) => [...prev, voice]);
    setSelectedVoiceId(voice.voiceId);
    setStep('list');
    // TODO: sauvegarder dans VoiceConfigStorage
  };

  return (
    <View>
      {step === 'list' && (
        <>
          <VoiceList
            voices={voices}
            selectedVoiceId={selectedVoiceId}
            onSelect={setSelectedVoiceId}
          />
          <VoiceCreateButton onCreate={() => setStep('record')} />
        </>
      )}
      {step === 'record' && (
        <VoiceRecordingSection
          onComplete={handleAddClonedVoice}
          onCancel={() => setStep('list')}
        />
      )}
    </View>
  );
};

export default VoiceScreen;
