import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useOnboardingContext } from '@/contexts/OnboardingContext';
import { useRevenueCat } from '@/contexts/providers/RevenueCat';
import { getStepContent, getTotalSteps } from '@/lib/config/onboarding-steps';
import { OnboardingCelebration } from './OnboardingCelebration';

const { width, height } = Dimensions.get('window');

/**
 * Overlay d'onboarding informatif qui bloque complètement l'interaction
 * Affiche des messages marketing optimisés pour la conversion
 */
export const OnboardingOverlay: React.FC = () => {
  const hookData = useOnboardingContext();
  const { currentStep, isActive, nextStep, quit, showCelebration, closeCelebration } = hookData;
  const { presentPaywall, showPaywall } = useRevenueCat();
  const [showVideo, setShowVideo] = useState(false);

  // Masquer l'onboarding si le paywall est ouvert
  if (!isActive || showPaywall) {
    return (
      <>
        {/* Garder la célébration même si l'onboarding est masqué */}
        <OnboardingCelebration 
          visible={showCelebration} 
          onComplete={closeCelebration}
        />
      </>
    );
  }

  const stepInfo = getStepContent(currentStep);
  if (!stepInfo) {
    return null;
  }

  const totalSteps = getTotalSteps();
  
  const handleGoToPro = async () => {
    await presentPaywall();
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <Modal 
        visible={isActive} 
        transparent 
        animationType="slide" // Slide pour un comportement natif
        presentationStyle="overFullScreen"
      >
        {/* Overlay semi-transparent pour voir la page */}
        <TouchableOpacity 
          style={styles.fullBlockingOverlay}
          activeOpacity={1} // Empêcher les clics sur le background
        >
          {/* Card principale */}
          <View style={styles.card}>
            {/* Progress indicator */}
            <View style={styles.progressContainer}>
              {Array.from({ length: totalSteps }, (_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressDot,
                    index === currentStep && styles.progressDotActive,
                    index < currentStep && styles.progressDotCompleted,
                  ]}
                />
              ))}
            </View>

            {/* Contenu principal */}
            <Text style={styles.title}>{stepInfo.title}</Text>
            <Text style={styles.message}>{stepInfo.message}</Text>

            {/* Highlight box */}
            {stepInfo.highlight && (
              <View style={styles.highlightBox}>
                <Text style={styles.highlightText}>{stepInfo.highlight}</Text>
              </View>
            )}

            {/* Subtext */}
            {stepInfo.subtext && (
              <Text style={styles.subtext}>{stepInfo.subtext}</Text>
            )}

            {/* Stats */}
            {stepInfo.stats && (
              <Text style={styles.stats}>📊 {stepInfo.stats}</Text>
            )}

            {/* Example */}
            {stepInfo.example && (
              <Text style={styles.example}>{stepInfo.example}</Text>
            )}

            {/* Tip box */}
            {stepInfo.tip && (
              <View style={styles.tipBox}>
                <Text style={styles.tipText}>💡 {stepInfo.tip}</Text>
              </View>
            )}

            {/* Placeholder pour vidéo future */}
            {stepInfo.videoUrl && (
              <TouchableOpacity
                style={styles.videoPlaceholder}
                onPress={() => setShowVideo(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.videoText}>🎥 Voir la démo</Text>
              </TouchableOpacity>
            )}

            {/* Actions */}
            <View style={styles.buttonsContainer}>
              {/* Bouton Quitter - seulement après la première étape */}
              {currentStep > 0 && (
                <TouchableOpacity 
                  onPress={quit} 
                  style={styles.quitButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quitText}>Plus tard</Text>
                </TouchableOpacity>
              )}

              {/* Bouton Pro - contextuel */}
              {stepInfo.showProButton && (
                <TouchableOpacity
                  onPress={handleGoToPro}
                  style={styles.proButton}
                  activeOpacity={0.8}
                >
                  <Text style={styles.proText}>👑 Devenir Pro</Text>
                </TouchableOpacity>
              )}

              {/* Bouton Suivant/Terminer */}
              <TouchableOpacity
                onPress={nextStep}
                style={styles.nextButton}
                activeOpacity={0.8}
              >
                <Text style={styles.nextText}>
                  {stepInfo.isFinal ? 'Commencer 🚀' : 'Continuer →'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* CTA final */}
            {stepInfo.cta && stepInfo.isFinal && (
              <Text style={styles.finalCta}>{stepInfo.cta}</Text>
            )}
          </View>
        </TouchableOpacity>

        {/* Modal vidéo pour le futur */}
        {showVideo && stepInfo.videoUrl && (
          <VideoModal
            url={stepInfo.videoUrl}
            onClose={() => setShowVideo(false)}
          />
        )}
      </Modal>
      
      {/* Célébration de fin d'onboarding */}
      <OnboardingCelebration 
        visible={showCelebration} 
        onComplete={closeCelebration}
      />
    </>
  );
};

/**
 * Placeholder pour le composant vidéo futur
 */
const VideoModal: React.FC<{ url: string; onClose: () => void }> = ({
  url,
  onClose,
}) => {
  return (
    <View style={styles.videoModal}>
      <View style={styles.videoContainer}>
        <Text style={styles.videoTitle}>Vidéo de démonstration</Text>
        <Text style={styles.videoUrl}>URL: {url}</Text>
        <TouchableOpacity onPress={onClose} style={styles.videoCloseButton}>
          <Text style={styles.videoCloseText}>Fermer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fullBlockingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Opacité réduite pour mieux voir
    justifyContent: 'flex-end', // Card en bas pour voir la page
    alignItems: 'center',
    zIndex: 1000, // Plus bas que le paywall
    width,
    height,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: 32,
    width: '100%',
    maxHeight: '70%', // Limite la hauteur pour voir la page
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4, // Ombre vers le haut
    },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 20,
    // Transition fluide pour les changements de contenu
    transform: [{ translateY: 0 }],
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transition: 'all 0.3s ease',
  },
  progressDotActive: {
    backgroundColor: '#FF0050', // Editia red
    width: 24,
    shadowColor: '#FF0050',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  progressDotCompleted: {
    backgroundColor: 'rgba(255, 0, 80, 0.6)',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 32,
  },
  message: {
    fontSize: 17,
    color: '#E0E0E0',
    lineHeight: 26,
    marginBottom: 20,
    textAlign: 'center',
  },
  highlightBox: {
    backgroundColor: 'rgba(255, 0, 80, 0.12)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 80, 0.3)',
  },
  highlightText: {
    color: '#FF0050',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 16,
  },
  subtext: {
    fontSize: 14,
    color: '#B0B0B0',
    fontStyle: 'italic',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 20,
  },
  stats: {
    fontSize: 15,
    color: '#00FF88',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  example: {
    fontSize: 13,
    color: '#909090',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 18,
  },
  tipBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  tipText: {
    fontSize: 14,
    color: '#FFD700',
    textAlign: 'center',
    lineHeight: 20,
  },
  videoPlaceholder: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  videoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
    flexWrap: 'wrap',
  },
  quitButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  quitText: {
    color: '#808080',
    fontSize: 15,
    fontWeight: '500',
  },
  proButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 16,
    flex: 1,
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  proText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 20,
  },
  nextButton: {
    backgroundColor: '#FF0050',
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 16,
    flex: 1,
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF0050',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  nextText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 20,
  },
  finalCta: {
    fontSize: 14,
    color: '#B0B0B0',
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
  // Styles pour VideoModal (placeholder)
  videoModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100000,
  },
  videoContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  videoTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  videoUrl: {
    color: '#B0B0B0',
    fontSize: 12,
    marginBottom: 20,
    textAlign: 'center',
  },
  videoCloseButton: {
    backgroundColor: '#FF0050',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  videoCloseText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});