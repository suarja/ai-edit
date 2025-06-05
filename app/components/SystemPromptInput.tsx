import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

type SystemPromptInputProps = {
  systemPrompt: string;
  onSystemPromptChange: (text: string) => void;
  outputLanguage: string;
};

const SystemPromptInput: React.FC<SystemPromptInputProps> = ({
  systemPrompt,
  onSystemPromptChange,
  outputLanguage,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Instructions Système</Text>
      <Text style={styles.sectionDescription}>
        Instructions techniques spécifiques pour l'IA (optionnel)
      </Text>
      <TextInput
        style={styles.systemPromptInput}
        multiline
        numberOfLines={4}
        placeholder="Ex: Utilisez un style narratif, incluez des transitions fluides, mettez l'accent sur les points clés..."
        placeholderTextColor="#666"
        value={systemPrompt}
        onChangeText={onSystemPromptChange}
        maxLength={1500}
      />
      <View style={styles.inputFooter}>
        <Text style={styles.charCount}>{systemPrompt.length}/500</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  sectionDescription: {
    fontSize: 15,
    color: '#888',
    marginBottom: 16,
    lineHeight: 22,
  },
  systemPromptInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    color: '#fff',
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#333',
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  charCount: {
    color: '#888',
    fontSize: 12,
  },
});

export default SystemPromptInput;
