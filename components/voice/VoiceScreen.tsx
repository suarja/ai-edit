import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import VoiceList from './VoiceList';
import {
  VoiceConfig,
  VoiceConfigStorage,
  VoiceService,
} from '@/lib/services/voiceService';
import VoiceCreateButton from './VoiceCreateButton';
import VoiceRecordingSection from './VoiceRecordingSection';
import { useGetUser } from '../hooks/useGetUser';
import { useAuth } from '@clerk/clerk-expo';

export const VoiceScreen: React.FC = () => {
  const [step, setStep] = useState<'list' | 'record'>('list');
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [voices, setVoices] = useState<VoiceConfig[]>(
    VoiceConfigStorage.getDefaultVoicesList()
  );
  const { getToken } = useAuth();
  const { fetchUser } = useGetUser();

  useEffect(() => {
    const fetchVoices = async () => {
      setIsLoading(true);
      const token = await getToken();
      if (token) {
        const voice = await VoiceService.getExistingVoice(token);
        if (voice) {
          const mappedVoices = VoiceService.voiceMapper(voice);
          if (mappedVoices) {
            mappedVoices.forEach((v) => {
              if (!voices.some((voice) => voice.voiceId === v.voiceId)) {
                setVoices((prev) => [...prev, v]);
              }
            });
          }
        }
      }
      setIsLoading(false);
    };
    fetchVoices();
  }, []);

  const handleAddClonedVoice = async (voice: VoiceConfig) => {
    setVoices((prev) => {
      const exists = prev.some((v) => v.voiceId === voice.voiceId);
      const updated = exists ? prev : [...prev, voice];
      return updated;
    });
    setSelectedVoiceId(voice.voiceId);
    const user = await fetchUser();
    if (user) {
      await VoiceConfigStorage.save(user.id, voice);
    }
    setStep('list');
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
      {isLoading ? (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator size="small" color="#0000ff" />
        </View>
      ) : (
        <>
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
