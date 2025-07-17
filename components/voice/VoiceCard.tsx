import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Switch } from 'react-native';
import { VoiceConfig } from './VoiceScreen';

type VoiceCardProps = {
  voice: VoiceConfig;
  selected: boolean;
  onSelect: () => void;
};

const VoiceCard: React.FC<VoiceCardProps> = ({ voice, selected, onSelect }) => {
  return (
    <View style={[styles.card, selected && styles.selected]}>
      <View style={styles.headerRow}>
        <Text style={styles.name}>{voice.voiceName}</Text>
        <Switch
          value={selected}
          onValueChange={onSelect}
          trackColor={{ false: '#333', true: '#007AFF' }}
          thumbColor={selected ? '#fff' : '#888'}
        />
      </View>
      {voice.description && (
        <Text style={styles.description}>{voice.description}</Text>
      )}
      {voice.isCloned && <Text style={styles.cloned}>Clonée</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: '#007AFF',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    color: '#888',
    fontSize: 13,
    marginTop: 2,
    marginBottom: 2,
  },
  cloned: {
    color: '#10b981',
    fontSize: 12,
    marginTop: 4,
  },
});

export default VoiceCard;
