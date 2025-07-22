import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { OnboardingService } from '@/lib/services/onboardingService';

/**
 * Test ultra-simple pour vérifier que l'overlay peut s'afficher
 */
export const SimpleOnboardingTest: React.FC = () => {
  const { user } = useUser();
  const [showTest, setShowTest] = useState(false);

  const testShow = async () => {
    console.log('🧪 Testing simple show...');
    setShowTest(true);
  };

  const testService = async () => {
    if (!user?.id) return;
    
    console.log('🧪 Testing service...');
    try {
      const newState = await OnboardingService.resetOnboarding(user.id, false);
      console.log('✅ Service OK:', newState);
      
      // Force l'affichage
      setShowTest(true);
    } catch (error) {
      console.error('❌ Service error:', error);
    }
  };

  if (!__DEV__) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={testShow}>
        <Text style={styles.text}>🧪 Show Test Overlay</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={testService}>
        <Text style={styles.text}>🔧 Test Service + Show</Text>
      </TouchableOpacity>

      {showTest && (
        <Modal visible={true} transparent>
          <View style={styles.overlay}>
            <View style={styles.card}>
              <Text style={styles.title}>🧪 TEST OVERLAY OK!</Text>
              <Text style={styles.message}>
                Si vous voyez ceci, l'overlay peut s'afficher.
                Le problème est dans la logique du hook.
              </Text>
              
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowTest(false)}
              >
                <Text style={styles.closeText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#00ff00',
    margin: 16,
    borderRadius: 8,
  },
  button: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 32,
    width: '100%',
    maxHeight: '70%',
    borderWidth: 2,
    borderColor: '#00ff00',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#E0E0E0',
    lineHeight: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#FF0050',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: 'center',
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});