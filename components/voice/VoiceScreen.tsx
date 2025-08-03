import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, View } from 'react-native';
import VoiceList from './VoiceList';
import {
  VoiceConfig,
  VoiceConfigStorage,
  VoiceDatabase,
  VoiceService,
} from '@/lib/services/voiceService';
import VoiceCreateButton from './VoiceCreateButton';
import { useGetUser } from '../hooks/useGetUser';
import { useAuth } from '@clerk/clerk-expo';
import { VoiceRecordingUI } from './VoiceRecordingUI';
import { SHARED_STYLE_COLORS } from '@/lib/constants/sharedStyles';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import { useRevenueCat } from '@/contexts/providers/RevenueCat';
import { StandardFeatureLock } from '../guards/StandardFeatureLock';
import { Mic, Sparkles, Zap, Users } from 'lucide-react-native';

export const VoiceScreen: React.FC = () => {
  const [step, setStep] = useState<'list' | 'record'>('list');
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [voices, setVoices] = useState<VoiceConfig[]>(
    VoiceConfigStorage.getDefaultVoicesList()
  );
  const { getToken } = useAuth();
  const { fetchUser } = useGetUser();
  const { hasAccess: hasVoiceCloneAccess } = useFeatureAccess('voice_clone');
  const { presentPaywall } = useRevenueCat();

  useEffect(() => {
    fetchVoices();
  }, [hasVoiceCloneAccess]);
  const fetchVoices = async () => {
    setIsLoading(true);
    const token = await getToken();
    let newVoices: VoiceDatabase[] = [];
    
    // Only fetch cloned voices if user has voice clone access
    if (token && hasVoiceCloneAccess) {
      newVoices = (await VoiceService.getExistingVoice(token)) || [];
      if (newVoices) {
        const mappedVoices = VoiceService.voiceMapper(newVoices);
        if (mappedVoices) {
          const filteredVoices = mappedVoices.filter(
            (v) => !voices.some((voice) => voice.voiceId === v.voiceId)
          );
          setVoices((prev) => [...prev, ...filteredVoices]);
        }
      }
    }
    setIsLoading(false);
  };
  const handleAddClonedVoice = async (voice: VoiceConfig) => {
    await fetchVoices();
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

  const handleCreateVoice = () => {
    if (hasVoiceCloneAccess) {
      setStep('record');
    } else {
      presentPaywall();
    }
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
              <VoiceCreateButton 
                onCreate={handleCreateVoice} 
                hasAccess={hasVoiceCloneAccess}
              />
            </>
          )}
        </>
      )}
      {step === 'record' && (
        <>
          {hasVoiceCloneAccess ? (
            <View>
              <VoiceRecordingUI handleUpdateVoices={handleAddClonedVoice} />
              <Button title="Annuler" onPress={() => setStep('list')} />
            </View>
          ) : (
            <StandardFeatureLock
              featureIcon={<Mic color={SHARED_STYLE_COLORS.primary} />}
              featureTitle="Clonage de Voix IA"
              featureDescription="Créez votre voix clonée personnalisée pour des vidéos authentiques et engageantes."
              features={[
                {
                  icon: <Mic color="#10b981" />,
                  text: "Voix clonée en 30 secondes",
                },
                {
                  icon: <Sparkles color="#3b82f6" />,
                  text: "Qualité professionnelle",
                },
                {
                  icon: <Zap color="#f59e0b" />,
                  text: "Vidéos authentiques",
                },
                {
                  icon: <Users color="#8b5cf6" />,
                  text: "Engagement amélioré",
                },
              ]}
              requiredPlan="creator"
              onUnlock={() => {
                presentPaywall();
                setStep('list');
              }}
            />
          )}
        </>
      )}
    </View>
  );
};

export default VoiceScreen;
