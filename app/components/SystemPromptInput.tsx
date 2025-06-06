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
  const maxLength = 2000; // Increased for video generation technical instructions

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
        placeholder="Ex: Optimisez l'engagement en intégrant des appels à l'action et des éléments interactifs pour susciter l'intérêt des spectateurs dès le début de la vidéo."
        placeholderTextColor="#666"
        value={systemPrompt}
        onChangeText={onSystemPromptChange}
        maxLength={maxLength}
      />
      <View style={styles.inputFooter}>
        <Text
          style={[
            styles.charCount,
            systemPrompt.length > maxLength * 0.9 && styles.charCountWarning,
          ]}
        >
          {systemPrompt.length}/{maxLength}
        </Text>
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
  charCountWarning: {
    color: '#FF9500',
  },
});

export default SystemPromptInput;
