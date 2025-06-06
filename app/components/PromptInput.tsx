import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Sparkles, Undo, Redo, RotateCcw } from 'lucide-react-native';
import { usePromptEnhancement } from '@/app/hooks/usePromptEnhancement';

type PromptInputProps = {
  prompt: string;
  systemPrompt: string;
  onPromptChange: (text: string) => void;
  onSystemPromptChange: (text: string) => void;
  onReset?: () => void;
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
  onReset,
  title = 'Description',
  description = 'Décrivez ce que vous souhaitez créer',
  placeholder = 'Soyez aussi précis que possible...',
  maxLength = 1000, // Reduced from 5000 to align with video content requirements
  numberOfLines = 4,
  outputLanguage,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [localPrompt, setLocalPrompt] = useState(prompt);
  const promptEnhancement = usePromptEnhancement();
  const { enhancing } = promptEnhancement;

  // Sync local state with parent prop changes
  useEffect(() => {
    setLocalPrompt(prompt);
  }, [prompt]);

  // Handle local prompt changes
  const handlePromptChange = useCallback(
    (text: string) => {
      // Validate length for video content
      if (text.length > maxLength) {
        setError(
          `Le texte ne peut pas dépasser ${maxLength} caractères pour une vidéo optimale`
        );
        return;
      }

      setError(null);
      setLocalPrompt(text);
      onPromptChange(text);

      // Track for undo/redo
      if (text.trim()) {
        promptEnhancement.trackPromptChange(text);
      }
    },
    [maxLength, onPromptChange, promptEnhancement]
  );

  const handleEnhance = async () => {
    if (!localPrompt?.trim()) {
      setError("Veuillez entrer une description avant d'améliorer");
      return;
    }

    try {
      setError(null);

      const enhancedPrompt = await promptEnhancement.enhancePrompt(
        localPrompt,
        outputLanguage
      );

      if (enhancedPrompt && enhancedPrompt !== localPrompt) {
        // Validate enhanced prompt length
        if (enhancedPrompt.length > maxLength) {
          // Truncate if too long and show warning
          const truncatedPrompt = enhancedPrompt.substring(0, maxLength);
          setLocalPrompt(truncatedPrompt);
          onPromptChange(truncatedPrompt);
          setError(
            `Prompt amélioré tronqué à ${maxLength} caractères pour l'optimisation vidéo`
          );
        } else {
          setLocalPrompt(enhancedPrompt);
          onPromptChange(enhancedPrompt);
        }
      }

      // Handle system prompt enhancement/generation
      if (systemPrompt?.trim()) {
        const enhancedSystemPrompt =
          await promptEnhancement.enhanceSystemPrompt(
            systemPrompt,
            enhancedPrompt || localPrompt,
            outputLanguage
          );

        if (enhancedSystemPrompt) {
          onSystemPromptChange(enhancedSystemPrompt);
        }
      } else {
        const generatedSystemPrompt =
          await promptEnhancement.generateSystemPrompt(
            enhancedPrompt || localPrompt,
            outputLanguage
          );

        if (generatedSystemPrompt) {
          onSystemPromptChange(generatedSystemPrompt);
        }
      }
    } catch (err) {
      console.error('❌ Error in prompt enhancement:', err);
      setError(
        err instanceof Error ? err.message : "Erreur lors de l'amélioration"
      );
    }
  };

  const handleUndo = useCallback(() => {
    const previousPrompt = promptEnhancement.undoPrompt();
    if (previousPrompt !== null) {
      setLocalPrompt(previousPrompt);
      onPromptChange(previousPrompt);
    }
  }, [promptEnhancement, onPromptChange]);

  const handleRedo = useCallback(() => {
    const nextPrompt = promptEnhancement.redoPrompt();
    if (nextPrompt !== null) {
      setLocalPrompt(nextPrompt);
      onPromptChange(nextPrompt);
    }
  }, [promptEnhancement, onPromptChange]);

  const handleReset = useCallback(() => {
    setLocalPrompt('');
    setError(null);
    onPromptChange('');
    if (onReset) {
      onReset();
    }
  }, [onPromptChange, onReset]);

  // Initialize history with current prompt
  useEffect(() => {
    if (prompt?.trim()) {
      promptEnhancement.saveToHistory(prompt);
    }
  }, []); // Only run on mount

  // Word count for video optimization guidance - aligned with video pipeline
  const wordCount = localPrompt
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  // Video pipeline requirements:
  // - ScriptGenerator/Reviewer: 75-130 words optimal for 30-60 seconds
  // - Video-Creatomate-Agent-V2: 60-120 words total
  // - Optimal range: 60-120 words for video generation
  const isOptimalLength = wordCount >= 60 && wordCount <= 120;
  const isAcceptableLength = wordCount >= 30 && wordCount <= 150;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
        <View style={styles.controlColumn}>
          <TouchableOpacity
            style={[
              styles.enhanceButton,
              enhancing && styles.enhanceButtonDisabled,
            ]}
            onPress={handleEnhance}
            disabled={enhancing || !localPrompt?.trim()}
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

          <View style={styles.historyControls}>
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
                styles.resetButton,
                (!localPrompt?.trim() || enhancing) &&
                  styles.resetButtonDisabled,
              ]}
              onPress={handleReset}
              disabled={!localPrompt?.trim() || enhancing}
            >
              <RotateCcw size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TextInput
        style={[styles.input, enhancing && styles.inputDisabled]}
        multiline
        editable={!enhancing}
        numberOfLines={numberOfLines}
        placeholder={placeholder}
        placeholderTextColor="#666"
        value={localPrompt}
        onChangeText={handlePromptChange}
        maxLength={maxLength}
      />

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.footer}>
        <View style={styles.counter}>
          <Text
            style={[
              styles.counterText,
              isOptimalLength && styles.counterOptimal,
              !isAcceptableLength && styles.counterWarning,
            ]}
          >
            {localPrompt.length}/{maxLength} • {wordCount} mots
          </Text>
          {wordCount > 0 && (
            <Text
              style={[
                styles.guidanceText,
                isOptimalLength && styles.guidanceOptimal,
                !isAcceptableLength && styles.guidanceWarning,
              ]}
            >
              {isOptimalLength
                ? '✓ Optimal pour vidéo (60-120 mots)'
                : wordCount > 150
                ? '⚠ Trop long pour vidéo courte'
                : wordCount < 30
                ? 'Ajoutez plus de détails'
                : '✓ Acceptable pour vidéo'}
            </Text>
          )}
        </View>
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
  controlColumn: {
    alignItems: 'flex-end',
    gap: 8,
  },
  enhanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
    minWidth: 110,
    justifyContent: 'center',
  },
  enhanceButtonDisabled: {
    backgroundColor: 'rgba(0, 122, 255, 0.5)',
  },
  enhanceButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  historyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  historyButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.6)',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width: 28,
    height: 28,
  },
  historyButtonDisabled: {
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
  },
  resetButton: {
    backgroundColor: 'rgba(255, 149, 0, 0.6)',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width: 28,
    height: 28,
  },
  resetButtonDisabled: {
    backgroundColor: 'rgba(255, 149, 0, 0.2)',
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
  footer: {
    marginTop: 8,
  },
  counter: {
    alignItems: 'flex-end',
  },
  counterText: {
    color: '#888',
    fontSize: 12,
  },
  counterOptimal: {
    color: '#34C759',
  },
  counterWarning: {
    color: '#FF9500',
  },
  guidanceText: {
    color: '#666',
    fontSize: 11,
    marginTop: 2,
  },
  guidanceOptimal: {
    color: '#34C759',
  },
  guidanceWarning: {
    color: '#FF9500',
  },
  errorText: {
    color: '#ff3b30',
    marginTop: 8,
    fontSize: 14,
  },
});

export default PromptInput;
