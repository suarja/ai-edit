import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

interface OnboardingCelebrationProps {
  visible: boolean;
  onComplete: () => void;
}

export const OnboardingCelebration: React.FC<OnboardingCelebrationProps> = ({
  visible,
  onComplete,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      // Animation d'entrée
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-fermeture après 3 secondes
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onComplete();
        });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible, fadeAnim, scaleAnim, onComplete]);

  if (!visible) return null;

  return (
    <View style={styles.container}>
      {/* Confettis */}
      <ConfettiCannon
        count={200}
        origin={{ x: -10, y: 0 }}
        autoStart={true}
        fadeOut={true}
        explosionSpeed={350}
        fallSpeed={3000}
        colors={['#FF0050', '#FFD700', '#00FF88', '#007AFF', '#FF6B35']}
      />
      
      {/* Message de célébration */}
      <Animated.View
        style={[
          styles.celebrationCard,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.title}>Félicitations !</Text>
        <Text style={styles.message}>
          Vous êtes maintenant prêt à créer des vidéos incroyables avec Editia !
        </Text>
        <Text style={styles.subMessage}>
          L'aventure commence maintenant... 🚀
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 10000, // Au-dessus de l'onboarding
  },
  celebrationCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    maxWidth: '85%',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 80, 0.3)',
    shadowColor: '#FF0050',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  emoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 18,
    color: '#E0E0E0',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 12,
  },
  subMessage: {
    fontSize: 16,
    color: '#FF0050',
    textAlign: 'center',
    fontWeight: '600',
  },
});