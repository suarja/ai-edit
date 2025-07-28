import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { SHARED_STYLE_COLORS } from '@/lib/constants/sharedStyles';

type VoiceCreateButtonProps = {
  onCreate: () => void;
};

const VoiceCreateButton: React.FC<VoiceCreateButtonProps> = ({ onCreate }) => (
  <TouchableOpacity style={styles.button} onPress={onCreate}>
    <Text style={styles.text}>Créer une voix personnalisée</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: SHARED_STYLE_COLORS.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginVertical: 16,
  },
  text: {
    color: SHARED_STYLE_COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VoiceCreateButton;
