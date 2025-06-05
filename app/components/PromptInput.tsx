import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Sparkles, Undo, Redo } from 'lucide-react-native';
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
  const [error, setError] = useState<string | null>(null);
  const [localPrompt, setLocalPrompt] = useState(prompt || '');
  // Force update counter - increment to force re-render
  const [forceUpdate, setForceUpdate] = useState(0);
  // Key for TextInput to force complete remount
  const [inputKey, setInputKey] = useState(Date.now().toString());
  const promptEnhancement = usePromptEnhancement();
  const { enhancing } = promptEnhancement;

  // Store current prompt for safer updates
  const promptRef = useRef(localPrompt);

  // Create a function to force a complete refresh
  const forceCompleteRefresh = useCallback(() => {
    console.log('🔄 Forcing complete refresh of TextInput');
    // Generate new key to completely remount TextInput
    setInputKey(Date.now().toString());
    // Force component update
    setForceUpdate((prev) => prev + 1);
  }, []);

  // Update local prompt when parent prompt changes
  useEffect(() => {
    console.log('📌 Parent prompt changed:', prompt);
    console.log('📌 Previous localPrompt:', localPrompt);
    // Update both state and ref
    setLocalPrompt(prompt || '');
    promptRef.current = prompt || '';
    console.log('📌 Updated localPrompt:', prompt || '');
  }, [prompt]);

  // Handle local prompt change and update parent
  const handlePromptChange = (text: string) => {
    console.log('📝 Text input changed to:', text);
    // Update both state and ref
    setLocalPrompt(text);
    promptRef.current = text;
    onPromptChange(text);
    // Track changes for undo/redo
    promptEnhancement.trackPromptChange(text);
  };

  const handleEnhance = async () => {
    if (!localPrompt || !localPrompt.trim()) {
      setError("Veuillez entrer une description avant d'améliorer");
      return;
    }

    try {
      setError(null);
      console.log('🚀 Starting enhancement with prompt:', localPrompt);

      const enhancedPrompt = await promptEnhancement.enhancePrompt(
        localPrompt,
        outputLanguage
      );

      console.log('✅ Received enhanced prompt:', enhancedPrompt);

      if (enhancedPrompt) {
        console.log('⏳ Setting local prompt state to:', enhancedPrompt);

        // First update ref
        promptRef.current = enhancedPrompt;

        // Then update state
        setLocalPrompt(enhancedPrompt);

        // Force a complete remount of the TextInput
        forceCompleteRefresh();

        console.log('🔄 Calling parent onPromptChange with:', enhancedPrompt);
        // Then update parent state
        onPromptChange(enhancedPrompt);

        // Debug timeout to check if local state was updated
        setTimeout(() => {
          console.log('🔍 After update - ref value:', promptRef.current);
          console.log('🔍 After update - localPrompt state:', localPrompt);
        }, 100);
      } else {
        console.warn('⚠️ enhancedPrompt was undefined or empty');
      }

      if (systemPrompt && systemPrompt.trim()) {
        console.log('🔄 Enhancing system prompt...');
        const enhancedSystemPrompt =
          await promptEnhancement.enhanceSystemPrompt(
            systemPrompt,
            enhancedPrompt || localPrompt, // Use original prompt if enhanced is undefined
            outputLanguage
          );

        if (enhancedSystemPrompt) {
          console.log(
            '✅ Calling onSystemPromptChange with enhanced system prompt'
          );
          onSystemPromptChange(enhancedSystemPrompt);
        } else {
          console.warn('⚠️ enhancedSystemPrompt was undefined or empty');
        }
      } else {
        console.log('🔄 Generating new system prompt...');
        const generatedSystemPrompt =
          await promptEnhancement.generateSystemPrompt(
            enhancedPrompt || localPrompt, // Use original prompt if enhanced is undefined
            outputLanguage
          );

        if (generatedSystemPrompt) {
          console.log(
            '✅ Calling onSystemPromptChange with generated system prompt'
          );
          onSystemPromptChange(generatedSystemPrompt);
        } else {
          console.warn('⚠️ generatedSystemPrompt was undefined or empty');
        }
      }
    } catch (err) {
      console.error('❌ Error in prompt enhancement:', err);
      setError(
        err instanceof Error ? err.message : "Erreur lors de l'amélioration"
      );
    }
  };

  const handleUndo = () => {
    console.log('⏪ Attempting to undo...');
    const previousPrompt = promptEnhancement.undoPrompt();
    if (previousPrompt !== null) {
      console.log('✅ Undoing to previous prompt:', previousPrompt);

      // Update ref first
      promptRef.current = previousPrompt;

      // Update state
      setLocalPrompt(previousPrompt);

      // Force update
      forceCompleteRefresh();

      // Notify parent
      onPromptChange(previousPrompt);
    } else {
      console.warn('⚠️ No previous prompt available for undo');
    }
  };

  const handleRedo = () => {
    console.log('⏩ Attempting to redo...');
    const nextPrompt = promptEnhancement.redoPrompt();
    if (nextPrompt !== null) {
      console.log('✅ Redoing to next prompt:', nextPrompt);

      // Update ref first
      promptRef.current = nextPrompt;

      // Update state
      setLocalPrompt(nextPrompt);

      // Force update
      forceCompleteRefresh();

      // Notify parent
      onPromptChange(nextPrompt);
    } else {
      console.warn('⚠️ No next prompt available for redo');
    }
  };

  // Initialize history with current prompt if needed
  useEffect(() => {
    console.log('🔄 Component mounted, initial prompt:', prompt);
    if (prompt && prompt.trim()) {
      console.log('💾 Saving initial prompt to history');
      promptEnhancement.saveToHistory(prompt);
      promptRef.current = prompt;
    }
  }, []);

  console.log(
    '🔄 Rendering PromptInput with forceUpdate:',
    forceUpdate,
    'inputKey:',
    inputKey
  );
  console.log('🔄 Current localPrompt:', localPrompt);
  console.log('🔄 Current promptRef value:', promptRef.current);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.historyButton,
              (!promptEnhancement.canUndo() || enhancing) &&
                styles.historyButtonDisabled,
            ]}
            onPress={handleUndo}
            disabled={!promptEnhancement.canUndo() || enhancing}
          >
            <Undo size={14} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.historyButton,
              (!promptEnhancement.canRedo() || enhancing) &&
                styles.historyButtonDisabled,
            ]}
            onPress={handleRedo}
            disabled={!promptEnhancement.canRedo() || enhancing}
          >
            <Redo size={14} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.enhanceButton,
              enhancing && styles.enhanceButtonDisabled,
            ]}
            onPress={handleEnhance}
            disabled={enhancing || !localPrompt || !localPrompt.trim()}
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
      </View>

      <TextInput
        key={inputKey}
        style={[styles.input, enhancing && styles.inputDisabled]}
        multiline
        editable={!enhancing}
        numberOfLines={numberOfLines}
        placeholder={placeholder}
        placeholderTextColor="#666"
        autoFocus={true}
        value={promptRef.current}
        onChangeText={handlePromptChange}
        maxLength={maxLength}
      />

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.counter}>
        <Text style={styles.counterText}>
          {(promptRef.current || '').length}/{maxLength}
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
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.6)',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyButtonDisabled: {
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
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
  inputDisabled: {
    backgroundColor: '#0f0f0f',
    color: '#999',
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
