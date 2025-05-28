import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ArrowRight } from 'lucide-react-native';

interface ProcessingScreenProps {
  title: string;
  message: string;
  steps: string[];
  onComplete?: () => void;
  autoComplete?: boolean;
  completionDelay?: number;
}

export const ProcessingScreen: React.FC<ProcessingScreenProps> = ({
  title,
  message,
  steps,
  onComplete,
  autoComplete = false,
  completionDelay = 2000,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex((prev) => {
          // Provide haptic feedback on step change
          try {
            Haptics.selectionAsync();
          } catch (error) {
            console.log('Haptics not available');
          }
          return prev + 1;
        });
      } else {
        clearInterval(interval);
        setCompleted(true);

        // Provide completion haptic feedback
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
          console.log('Haptics not available');
        }

        // Auto complete after delay if specified and allowed
        if (autoComplete && onComplete) {
          setTimeout(onComplete, completionDelay);
        }
      }
    }, 1500); // Advance steps every 1.5 seconds

    return () => clearInterval(interval);
  }, [
    currentStepIndex,
    steps.length,
    autoComplete,
    onComplete,
    completionDelay,
  ]);

  const handleContinue = () => {
    if (completed && onComplete) {
      onComplete();
    }
  };

  return (
    <View style={styles.container} testID="processing-screen">
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <View
            key={index}
            style={[
              styles.step,
              index < currentStepIndex && styles.completedStep,
              index === currentStepIndex && !completed && styles.activeStep,
              index === currentStepIndex && completed && styles.completedStep,
            ]}
          >
            {index < currentStepIndex ||
            (index === currentStepIndex && completed) ? (
              <Text style={styles.stepCheck}>✓</Text>
            ) : index === currentStepIndex ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.stepNumber}>{index + 1}</Text>
            )}
            <Text
              style={[
                styles.stepText,
                (index < currentStepIndex || index === currentStepIndex) &&
                  styles.activeStepText,
                index < currentStepIndex && styles.completedStepText,
              ]}
            >
              {step}
            </Text>
          </View>
        ))}
      </View>

      {/* Show continue button when processing is complete but not auto-completing */}
      {completed && !autoComplete && onComplete && (
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continuer</Text>
          <ArrowRight size={20} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#888',
    marginBottom: 32,
    textAlign: 'center',
  },
  stepsContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 40,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    gap: 12,
  },
  activeStep: {
    backgroundColor: '#00366B',
  },
  completedStep: {
    backgroundColor: '#004C99',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#333',
    color: '#888',
    textAlign: 'center',
    lineHeight: 24,
  },
  stepCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
  },
  stepText: {
    fontSize: 16,
    color: '#888',
  },
  activeStepText: {
    color: '#fff',
  },
  completedStepText: {
    fontWeight: '500',
  },
  continueButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    marginTop: 24,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
