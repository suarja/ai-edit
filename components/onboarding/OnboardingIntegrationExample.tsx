/**
 * EXEMPLE D'INTÉGRATION - OnboardingIntegrationExample.tsx
 * 
 * Ce fichier montre comment intégrer le système d'onboarding
 * dans votre application React Native Expo.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { OnboardingOverlay } from './OnboardingOverlay';
import { useOnboarding } from '@/app/hooks/useOnboarding';

/**
 * 1. INTÉGRATION DANS LE LAYOUT PRINCIPAL
 * 
 * Ajoutez OnboardingOverlay dans votre layout principal
 * pour qu'il soit affiché par-dessus toutes les pages.
 */
export function RootLayoutWithOnboarding() {
  return (
    <>
      {/* Votre navigation normale */}
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
      
      {/* Overlay d'onboarding - s'affiche automatiquement si nécessaire */}
      <OnboardingOverlay />
    </>
  );
}

/**
 * 2. INTÉGRATION DANS LES SETTINGS
 * 
 * Permettez aux utilisateurs de refaire le tour guidé
 */
export function SettingsScreenWithOnboarding() {
  const { restart, hasCompleted, getAnalytics } = useOnboarding();
  
  const handleRestartOnboarding = async () => {
    await restart();
    // L'overlay s'affichera automatiquement
  };
  
  const handleViewAnalytics = async () => {
    const analytics = await getAnalytics();
    console.log('Onboarding analytics:', analytics);
  };
  
  return (
    <View style={styles.settingsContainer}>
      <Text style={styles.sectionTitle}>Aide & Support</Text>
      
      <TouchableOpacity 
        style={styles.settingsRow}
        onPress={handleRestartOnboarding}
      >
        <Text style={styles.settingsText}>🎯 Refaire le tour guidé</Text>
        <Text style={styles.settingsArrow}>→</Text>
      </TouchableOpacity>
      
      {hasCompleted && (
        <TouchableOpacity 
          style={styles.settingsRow}
          onPress={handleViewAnalytics}
        >
          <Text style={styles.settingsText}>📊 Voir mes statistiques</Text>
          <Text style={styles.settingsArrow}>→</Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity style={styles.settingsRow}>
        <Text style={styles.settingsText}>💬 Contacter le support</Text>
        <Text style={styles.settingsArrow}>→</Text>
      </TouchableOpacity>
    </View>
  );
}

/**
 * 3. DÉTECTION DU STATUT PRO
 * 
 * Hook pour connecter votre système de subscription
 */
export function useProStatusIntegration() {
  const { updateProStatus } = useOnboarding();
  
  // TODO: Connecter avec votre système RevenueCat/Stripe
  const checkAndUpdateProStatus = async () => {
    try {
      // Exemple avec RevenueCat
      // const customerInfo = await Purchases.getCustomerInfo();
      // const isPro = customerInfo.entitlements.active.pro !== undefined;
      
      const isPro = false; // Remplacer par votre logique
      await updateProStatus(isPro);
    } catch (error) {
      console.error('Error checking pro status:', error);
    }
  };
  
  return { checkAndUpdateProStatus };
}

/**
 * 4. COMPOSANT AVEC GUARD ONBOARDING
 * 
 * Exemple d'intégration avec vos guards existants
 */
export function ProtectedFeatureWithOnboarding() {
  const { isActive, hasCompleted } = useOnboarding();
  
  // Si l'onboarding est actif, ne pas afficher le contenu
  if (isActive) {
    return null; // L'overlay s'occupera de l'affichage
  }
  
  // Si l'onboarding n'est pas terminé, proposer de le faire
  if (!hasCompleted) {
    return (
      <View style={styles.onboardingPrompt}>
        <Text style={styles.promptTitle}>Découvrez Editia</Text>
        <Text style={styles.promptMessage}>
          Faites le tour guidé pour découvrir toutes les fonctionnalités
        </Text>
        <TouchableOpacity style={styles.promptButton}>
          <Text style={styles.promptButtonText}>Commencer le tour</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={styles.featureContent}>
      <Text>Votre feature protégée ici</Text>
    </View>
  );
}

/**
 * 5. ANALYTICS ET TRACKING
 * 
 * Exemple de tracking des conversions
 */
export function OnboardingAnalyticsExample() {
  const { getAnalytics } = useOnboarding();
  
  React.useEffect(() => {
    const trackOnboardingMetrics = async () => {
      const analytics = await getAnalytics();
      if (!analytics) return;
      
      // Envoyer à votre système d'analytics
      // Analytics.track('onboarding_completed', {
      //   completion_rate: analytics.completionRate,
      //   time_spent: analytics.timeSpent,
      //   was_skipped: analytics.wasSkipped,
      //   steps_viewed: analytics.viewedSteps,
      // });
      
      console.log('Onboarding metrics:', {
        completionRate: `${analytics.completionRate}%`,
        timeSpent: analytics.timeSpent ? `${Math.round(analytics.timeSpent / 1000)}s` : 'N/A',
        wasSkipped: analytics.wasSkipped,
        progress: `${analytics.viewedSteps}/${analytics.totalSteps} steps`,
      });
    };
    
    trackOnboardingMetrics();
  }, [getAnalytics]);
  
  return null;
}

const styles = StyleSheet.create({
  settingsContainer: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingsText: {
    fontSize: 16,
    color: '#FFF',
  },
  settingsArrow: {
    fontSize: 18,
    color: '#666',
  },
  onboardingPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#000',
  },
  promptTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  promptMessage: {
    fontSize: 16,
    color: '#B0B0B0',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  promptButton: {
    backgroundColor: '#FF0050',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  promptButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  featureContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});