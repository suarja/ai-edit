import React from 'react';
import { View, Button } from 'react-native';
import { VoiceRecordingUI } from './VoiceRecordingUI';
import { VoiceConfig } from './VoiceScreen';

type VoiceRecordingSectionProps = {
  onComplete: (voice: VoiceConfig) => void;
  onCancel: () => void;
};

const VoiceRecordingSection: React.FC<VoiceRecordingSectionProps> = ({
  onComplete,
  onCancel,
}) => {
  // TODO: intégrer la logique d'enregistrement et de création de voix
  // Pour l'instant, bouton factice pour simuler la complétion
  return (
    <View>
      <VoiceRecordingUI />
      <Button title="Annuler" onPress={onCancel} />
      <Button
        title="Terminer (factice)"
        onPress={() =>
          onComplete({
            voiceId: Date.now().toString(),
            voiceName: 'Nouvelle voix clonée',
            isCloned: true,
            description: 'Description de la voix clonée',
          })
        }
      />
    </View>
  );
};

export default VoiceRecordingSection;
