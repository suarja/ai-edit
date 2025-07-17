import React, { useState } from 'react';
import { View } from 'react-native';
import VoiceList from './VoiceList';
import VoiceCreateButton from './VoiceCreateButton';
import VoiceRecordingSection from './VoiceRecordingSection';
import {
  VoiceConfig,
  VoiceConfigStorage,
  VoiceService,
} from '@/lib/services/voiceService';

export const VoiceScreen: React.FC = () => {
  const [step, setStep] = useState<'list' | 'record'>('list');
  const [voices, setVoices] = useState<VoiceConfig[]>(
    VoiceConfigStorage.getDefaultVoicesList()
  );
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null);

  const handleAddClonedVoice = (voice: VoiceConfig) => {
    setVoices((prev) => [...prev, voice]);
    setSelectedVoiceId(voice.voiceId);
    setStep('list');
    // TODO: sauvegarder dans VoiceConfigStorage
  };

  const handleSelectVoice = async (
    userId: string,
    voiceConfig: VoiceConfig
  ) => {
    setSelectedVoiceId(voiceConfig.voiceId);
    await VoiceConfigStorage.save(userId, voiceConfig);
  };

  return (
    <View>
      {step === 'list' && (
        <>
          <VoiceList
            voices={voices}
            selectedVoiceId={selectedVoiceId}
            onSelect={handleSelectVoice}
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
