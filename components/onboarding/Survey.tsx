import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { OptionCard } from './OptionCard';
import { SurveyOption } from '../../lib/constants/onboardingQuestions';
import * as Haptics from 'expo-haptics';

interface SurveyProps {
  question: string;
  options: SurveyOption[];
  onAnswer: (optionId: string) => void;
  selectedOption?: string;
  onContinue?: () => void;
}

export const Survey: React.FC<SurveyProps> = ({
  question,
  options,
  onAnswer,
  selectedOption,
  onContinue,
}) => {
  const [selected, setSelected] = useState<string | undefined>(selectedOption);

  // Update selected if selectedOption changes (e.g. when navigating back)
  useEffect(() => {
    setSelected(selectedOption);
  }, [selectedOption]);

  const handleSelect = (optionId: string) => {
    setSelected(optionId);
    onAnswer(optionId);

    // Provide haptic feedback
    try {
      Haptics.selectionAsync();
    } catch (error) {
      console.log('Haptics not available');
    }
  };

  const handleContinue = () => {
    if (selected && onContinue) {
      // Provide haptic feedback
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (error) {
        console.log('Haptics not available');
      }

      onContinue();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question}</Text>
      <View style={styles.options}>
        {options.map((option) => (
          <OptionCard
            key={option.id}
            text={option.text}
            selected={selected === option.id}
            onSelect={() => handleSelect(option.id)}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.continueButton, !selected && styles.disabledButton]}
        onPress={handleContinue}
        disabled={!selected}
        testID="continue-button"
      >
        <Text style={styles.continueText}>Continue</Text>
        <Text style={styles.arrowText}>→</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  question: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 24,
  },
  options: {
    marginBottom: 32,
  },
  continueButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 'auto',
  },
  disabledButton: {
    backgroundColor: '#333',
    opacity: 0.7,
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  arrowText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
