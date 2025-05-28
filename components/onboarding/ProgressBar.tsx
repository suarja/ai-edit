import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';

interface ProgressBarProps {
  steps: readonly string[];
  currentStep: string;
  completedSteps: string[];
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  steps,
  currentStep,
  completedSteps,
}) => {
  const { width } = useWindowDimensions();

  return (
    <View style={[styles.container, { width: width * 0.9 }]}>
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          {index > 0 && (
            <View
              style={[
                styles.connector,
                completedSteps.includes(steps[index - 1])
                  ? styles.completedConnector
                  : {},
              ]}
              testID="step-connector"
            />
          )}
          <View
            style={[
              styles.step,
              completedSteps.includes(step) && styles.completedStep,
              currentStep === step && styles.currentStep,
            ]}
            testID="step-indicator"
          />
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 40,
    marginVertical: 10,
    alignSelf: 'center',
  },
  step: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#333',
  },
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: '#333',
    marginHorizontal: 5,
  },
  completedConnector: {
    backgroundColor: '#007AFF',
  },
  completedStep: {
    backgroundColor: '#007AFF',
  },
  currentStep: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#007AFF',
  },
});
