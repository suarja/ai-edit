import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { OnboardingService } from '@/lib/services/onboardingService';

/**
 * Overlay de test minimal pour déboguer
 */
export const OnboardingTestOverlay: React.FC = () => {
  const { user } = useUser();
  const [shouldShow, setShouldShow] = React.useState(false);
  const [testState, setTestState] = React.useState<any>(null);

  // Test direct du service au mount
  useEffect(() => {
    const testService = async () => {
      if (!user?.id) return;
      
      console.log('🧪 OnboardingTestOverlay - Testing service...');
      
      try {
        // Vérifier si on devrait montrer l'onboarding
        const shouldShowResult = await OnboardingService.shouldShowOnboarding(user.id);
        console.log('🎯 Should show onboarding:', shouldShowResult);
        
        // Obtenir l'état actuel
        const currentState = await OnboardingService.getState(user.id);
        console.log('📊 Current state:', currentState);
        
        setShouldShow(shouldShowResult);
        setTestState(currentState);
        
      } catch (error) {
        console.error('❌ Test service error:', error);
      }
    };
    
    testService();
  }, [user?.id]);

  // Affichage conditionnel
  if (!shouldShow && !testState) {
    console.log('🚫 OnboardingTestOverlay - Not showing (no state)');
    return null;
  }

  console.log('✅ OnboardingTestOverlay - SHOWING!');

  return (
    <Modal visible={true} transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>🧪 TEST OVERLAY</Text>
          <Text style={styles.text}>User: {user?.id?.slice(0, 8)}</Text>
          <Text style={styles.text}>Should Show: {shouldShow ? '✅' : '❌'}</Text>
          <Text style={styles.text}>
            State: {testState ? `Step ${testState.currentStep}` : 'null'}
          </Text>
          <Text style={styles.text}>
            Completed: {testState?.hasCompletedOnboarding ? '✅' : '❌'}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 0, 0, 0.8)', // Rouge pour être visible
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#000',
    padding: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ff0000',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 5,
  },
});