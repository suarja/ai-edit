import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useOnboardingContext } from '@/contexts/OnboardingContext';
import { OnboardingService } from '@/lib/services/onboardingService';
import { useUser } from '@clerk/clerk-expo';

/**
 * Panel de debug pour l'onboarding - à utiliser en développement
 * Affiche l'état actuel et permet de forcer certaines actions
 */
export const OnboardingDebugPanel: React.FC = () => {
  const { user } = useUser();
  const { 
    currentStep, 
    isActive, 
    isLoading, 
    hasCompleted, 
    restart, 
    quit,
    forceRefresh,
    state 
  } = useOnboardingContext();

  // Test immédiat au render
  useEffect(() => {
    console.log('🎆 OnboardingDebugPanel mounted');
    console.log('👤 User:', user?.id);
    console.log('🎯 Hook state:', { currentStep, isActive, isLoading, hasCompleted });
  }, [user?.id, currentStep, isActive, isLoading, hasCompleted]);

  if (!__DEV__) return null;
  
  const testDirectOnboarding = async () => {
    if (!user?.id) {
      Alert.alert('Erreur', 'Pas d\'utilisateur connecté');
      return;
    }
    
    console.log('🧪 Test direct onboarding...');
    try {
      // Test direct du service
      const newState = await OnboardingService.resetOnboarding(user.id, false);
      console.log('🎯 État créé:', newState);
      
      // Vérifier que l'app devrait afficher l'onboarding
      const shouldShow = await OnboardingService.shouldShowOnboarding(user.id);
      console.log('🎯 Should show result:', shouldShow);
      
      Alert.alert('Test Service OK', 
        `État: step ${newState.currentStep}\nShould show: ${shouldShow}\n\n` +
        `Maintenant testez le bouton "Hook" pour voir si le hook réagit.`
      );
    } catch (error) {
      console.error('❌ Erreur test:', error);
      Alert.alert('Erreur', error.message);
    }
  };

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
          style={[styles.button, styles.testButton]} 
          onPress={testDirectOnboarding}
        >
          <Text style={styles.buttonText}>🧪 TEST</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button} 
          onPress={() => {
            console.log('🔄 Hook restart called');
            restart();
          }}
        >
          <Text style={styles.buttonText}>🔄 Hook</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button} 
          onPress={forceRefresh}
        >
          <Text style={styles.buttonText}>🔄 Force</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={async () => {
            if (user?.id) {
              const currentState = await OnboardingService.getState(user.id);
              console.log('🔍 Service state:', currentState);
              Alert.alert('Service State', JSON.stringify(currentState, null, 2));
            }
          }}
        >
          <Text style={styles.buttonText}>🔍 State</Text>
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
  testButton: {
    backgroundColor: 'rgba(255, 255, 0, 0.3)',
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});