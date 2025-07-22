/**
 * 🎨 VoiceList v2 - Migré vers la Palette Editia
 * 
 * MIGRATION:
 * ❌ Avant: Utilise VoiceCard avec couleurs hardcodées
 * ✅ Après: Utilise VoiceCard-v2 avec palette Editia cohérente
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { VoiceConfig, VoiceConfigStorage } from '@/lib/services/voiceService';
import { useGetUser } from '../hooks/useGetUser';
import VoiceCardV2 from './VoiceCard-v2';
import { DatabaseUser } from '@/lib/types/user.types';

type VoiceListProps = {
  voices: VoiceConfig[];
  selectedVoiceId: string | null;
  onSelect: (userId: string, voiceConfig: VoiceConfig) => void;
};

const VoiceListV2: React.FC<VoiceListProps> = ({
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
    return <View style={styles.emptyContainer} />;
  }

  return (
    <View style={styles.container}>
      {voices.map((voice) => (
        <VoiceCardV2
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

const styles = StyleSheet.create({
  // ✅ Container principal
  container: {
    paddingHorizontal: 20,
  },
  
  // ✅ Empty container
  emptyContainer: {
    flex: 1,
  },
});

export default VoiceListV2;

/**
 * 🎨 RÉSUMÉ DE LA MIGRATION VOICE LIST:
 * 
 * ✅ CHANGEMENTS PRINCIPAUX:
 * • Import VoiceCard-v2 avec migration complète vers palette Editia
 * • Container avec padding horizontal cohérent
 * • Empty state avec style explicite
 * 
 * 🎯 AMÉLIORATIONS:
 * • Padding horizontal standardisé (20px)
 * • Styles explicites pour empty state
 * • Préparé pour VoiceCard-v2 migré
 * 
 * Délègue la migration des couleurs à VoiceCard-v2 ✨
 */