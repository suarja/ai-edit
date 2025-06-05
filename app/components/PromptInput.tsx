import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { usePromptEnhancement } from '@/app/hooks/usePromptEnhancement';

type PromptInputProps = {
  prompt: string;
  systemPrompt: string;
  onPromptChange: (text: string) => void;
  onSystemPromptChange: (text: string) => void;
  title?: string;
  description?: string;
  placeholder?: string;
  maxLength?: number;
  numberOfLines?: number;
  outputLanguage: string;
};

const PromptInput: React.FC<PromptInputProps> = ({
  prompt,
  systemPrompt,
  onPromptChange,
  onSystemPromptChange,
  title = 'Description',
  description = 'Décrivez ce que vous souhaitez créer',
  placeholder = 'Soyez aussi précis que possible...',
  maxLength = 5000,
  numberOfLines = 4,
  outputLanguage,
}) => {
  const [enhancing, setEnhancing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const promptEnhancement = usePromptEnhancement();

  const handleEnhance = async () => {
    if (!prompt.trim()) {
      setError("Veuillez entrer une description avant d'améliorer");
      return;
    }

    try {
      setEnhancing(true);
      setError(null);

      const enhancedPrompt = await promptEnhancement.enhancePrompt(
        prompt,
        outputLanguage
      );
      onPromptChange(enhancedPrompt);

      if (systemPrompt.trim()) {
        const enhancedSystemPrompt =
          await promptEnhancement.enhanceSystemPrompt(
            systemPrompt,
            enhancedPrompt,
            outputLanguage
          );
        onSystemPromptChange(enhancedSystemPrompt);
      } else {
        const generatedSystemPrompt =
          await promptEnhancement.generateSystemPrompt(
            enhancedPrompt,
            outputLanguage
          );
        onSystemPromptChange(generatedSystemPrompt);
      }
    } catch (err) {
      console.error('Error in prompt enhancement:', err);
      setError(
        err instanceof Error ? err.message : "Erreur lors de l'amélioration"
      );
    } finally {
      setEnhancing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.enhanceButton,
            enhancing && styles.enhanceButtonDisabled,
          ]}
          onPress={handleEnhance}
          disabled={enhancing || !prompt.trim()}
        >
          {enhancing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Sparkles size={14} color="#fff" />
              <Text style={styles.enhanceButtonText}>Améliorer</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        multiline
        numberOfLines={numberOfLines}
        placeholder={placeholder}
        placeholderTextColor="#666"
        autoFocus={true}
        value={prompt}
        onChangeText={onPromptChange}
        maxLength={maxLength}
      />

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.counter}>
        <Text style={styles.counterText}>
          {prompt.length}/{maxLength}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  titleSection: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#888',
    flexShrink: 1,
  },
  enhanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 6,
    flexShrink: 0,
    minWidth: 90,
  },
  enhanceButtonDisabled: {
    backgroundColor: 'rgba(0, 122, 255, 0.5)',
  },
  enhanceButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 120,
  },
  counter: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  counterText: {
    color: '#888',
    fontSize: 12,
  },
  errorText: {
    color: '#ff3b30',
    marginTop: 8,
    fontSize: 14,
  },
});

export default PromptInput;
