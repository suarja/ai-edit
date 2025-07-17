import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { VoiceConfig, VoiceConfigStorage } from '@/lib/services/voiceService';
import { DatabaseUser, useGetUser } from '../hooks/useGetUser';
import VoiceCard from './VoiceCard';

type VoiceListProps = {
  voices: VoiceConfig[];
  selectedVoiceId: string | null;
  onSelect: (userId: string, voiceConfig: VoiceConfig) => void;
};

const VoiceList: React.FC<VoiceListProps> = ({
  voices,
  selectedVoiceId,
  onSelect,
}) => {
  const [defaultVoiceId, setDefaultVoiceId] = useState<string | null>(null);
  const [user, setUser] = useState<DatabaseUser | null>(null);
  const { fetchUser } = useGetUser();
  useEffect(() => {
    async function getVoice() {
      const user = await fetchUser();
      if (user) {
        setUser(user);
        const voice = await VoiceConfigStorage.getDefaultVoice(user.id);
        if (voice) {
          setDefaultVoiceId(voice.voiceId);
        }
      }
    }
    getVoice();
  }, []);

  if (!user || !defaultVoiceId) {
    return <View />;
  }
  console.log('voices', voices);

  return (
    <View>
      {voices.map((voice) => (
        <VoiceCard
          key={voice.voiceId}
          voice={voice}
          selected={
            selectedVoiceId
              ? voice.voiceId === selectedVoiceId
              : voice.voiceId === defaultVoiceId
          }
          onSelect={() => onSelect(user.id, voice)}
        />
      ))}
    </View>
  );
};

export default VoiceList;
