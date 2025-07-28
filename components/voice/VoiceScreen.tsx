import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, View } from 'react-native';
import VoiceList from './VoiceList';
import {
  VoiceConfig,
  VoiceConfigStorage,
  VoiceService,
} from '@/lib/services/voiceService';
import VoiceCreateButton from './VoiceCreateButton';
import { useGetUser } from '../hooks/useGetUser';
import { useAuth } from '@clerk/clerk-expo';
import { VoiceRecordingUI } from './VoiceRecordingUI';
import { SHARED_STYLE_COLORS } from '@/lib/constants/sharedStyles';

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
    fetchVoices();
  }, []);
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
          <ActivityIndicator size="small" color={SHARED_STYLE_COLORS.primary} />
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
        <View>
          <VoiceRecordingUI handleUpdateVoices={handleAddClonedVoice} />
          <Button title="Annuler" onPress={() => setStep('list')} />
        </View>
      )}
    </View>
  );
};

export default VoiceScreen;
