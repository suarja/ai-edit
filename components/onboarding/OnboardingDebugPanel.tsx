import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useOnboarding } from '@/app/hooks/useOnboarding';
import { OnboardingService } from '@/lib/services/onboardingService';

/**
 * Panel de debug pour l'onboarding - à utiliser en développement
 * Affiche l'état actuel et permet de forcer certaines actions
 */
export const OnboardingDebugPanel: React.FC = () => {
  const { 
    currentStep, 
    isActive, 
    isLoading, 
    hasCompleted, 
    restart, 
    quit,
    state 
  } = useOnboarding();

  if (!__DEV__) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛠 Onboarding Debug</Text>
      
      <Text style={styles.info}>
        Step: {currentStep} | Active: {isActive ? '✅' : '❌'} | 
        Loading: {isLoading ? '⏳' : '✅'} | Completed: {hasCompleted ? '✅' : '❌'}
      </Text>

      {state && (
        <Text style={styles.stateInfo}>
          User: {state.userId.slice(0, 8)}... | 
          Steps viewed: {state.viewedSteps.join(', ')}
        </Text>
      )}

      <View style={styles.buttons}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={restart}
        >
          <Text style={styles.buttonText}>🔄 Restart</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button} 
          onPress={quit}
        >
          <Text style={styles.buttonText}>❌ Quit</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button} 
          onPress={async () => {
            console.log('🔍 Current onboarding state:', state);
            const users = await OnboardingService.getAllOnboardingUsers();
            console.log('👥 All onboarding users:', users);
          }}
        >
          <Text style={styles.buttonText}>🔍 Log State</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ff4444',
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  info: {
    color: 'white',
    fontSize: 12,
    marginBottom: 4,
  },
  stateInfo: {
    color: 'white',
    fontSize: 10,
    marginBottom: 12,
  },
  buttons: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 4,
    flex: 1,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});