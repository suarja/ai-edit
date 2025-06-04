import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Wand2 } from 'lucide-react-native';
import usePromptEnhancement from '@/app/hooks/usePromptEnhancement';

type PromptInputProps = {
  prompt: string;
  systemPrompt: string;
  onPromptChange: (text: string) => void;
  onSystemPromptChange: (text: string) => void;
  title: string;
  description: string;
  placeholder: string;
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
};

const PromptInput: React.FC<PromptInputProps> = ({
  prompt,
  systemPrompt,
  onPromptChange,
  onSystemPromptChange,
  title,
  description,
  placeholder,
  maxLength = 1000,
  multiline = true,
  numberOfLines = 6,
}) => {
  const { enhancing, error, enhancePrompt } = usePromptEnhancement();

  const handleEnhancePrompt = async () => {
    enhancePrompt(
      prompt,
      systemPrompt,
      (enhancedPrompt, enhancedSystemPrompt) => {
        onPromptChange(enhancedPrompt);
        onSystemPromptChange(enhancedSystemPrompt);
      }
    );
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionDescription}>{description}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.promptInput}
          multiline={multiline}
          numberOfLines={numberOfLines}
          placeholder={placeholder}
          placeholderTextColor="#666"
          value={prompt}
          onChangeText={onPromptChange}
          maxLength={maxLength}
        />
        <TouchableOpacity
          style={styles.enhanceButton}
          onPress={handleEnhancePrompt}
          disabled={enhancing || !prompt.trim()}
        >
          {enhancing ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Wand2 size={18} color="#fff" />
          )}
          <Text style={styles.enhanceButtonText}>
            {enhancing ? 'Amélioration...' : 'Améliorer'}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.inputFooter}>
        <Text style={styles.charCount}>
          {prompt.length}/{maxLength}
        </Text>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
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
  inputContainer: {
    position: 'relative',
  },
  promptInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    color: '#fff',
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 140,
    borderWidth: 1,
    borderColor: '#333',
    paddingBottom: 60, // Extra space for the enhance button
  },
  enhanceButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#7958FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#7958FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  enhanceButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 8,
  },
});

export default PromptInput;
