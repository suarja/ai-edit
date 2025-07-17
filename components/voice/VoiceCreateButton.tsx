import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

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
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginVertical: 16,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VoiceCreateButton;
