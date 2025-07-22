import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { useRouter, useSegments } from 'expo-router';
import { OnboardingService, OnboardingState } from '@/lib/services/onboardingService';
import { getStepRoute, getTotalSteps } from '@/lib/config/onboarding-steps';

/**
 * Hook pour gérer l'onboarding informatif
 * Contrôle l'affichage, la navigation et les interactions
 */
export function useOnboarding() {
  const { user } = useUser();
  const router = useRouter();
  const segments = useSegments();
  
  // État local
  const [state, setState] = useState<OnboardingState | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialisation - vérifie si l'onboarding doit être affiché
  useEffect(() => {
    const initializeOnboarding = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Vérifier si l'onboarding doit être affiché
        const shouldShow = await OnboardingService.shouldShowOnboarding(user.id);
        
        if (shouldShow) {
          // Récupérer l'état existant ou créer un nouveau
          let currentState = await OnboardingService.getState(user.id);
          
          if (!currentState) {
            // TODO: Détecter si l'utilisateur est Pro/Créateur
            const isPro = false; // À connecter avec votre système de subscription
            currentState = await OnboardingService.initOnboarding(user.id, isPro);
          }
          
          setState(currentState);
          setIsActive(true);
        }
      } catch (error) {
        console.error('Error initializing onboarding:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeOnboarding();
  }, [user?.id]);

  // Navigation vers l'étape courante
  const navigateToCurrentStep = useCallback(async () => {
    if (!state) return;
    
    const route = getStepRoute(state.currentStep);
    if (route) {
      try {
        router.push(route);
      } catch (error) {
        console.error('Navigation error:', error);
      }
    }
  }, [state, router]);

  // Passer à l'étape suivante
  const nextStep = useCallback(async () => {
    if (!user?.id || !state) return;
    
    try {
      const newState = await OnboardingService.nextStep(user.id);
      if (newState) {
        setState(newState);
        
        // Si l'onboarding est terminé, le désactiver
        if (newState.hasCompletedOnboarding) {
          setIsActive(false);
          // Optionnel: naviguer vers une page spécifique
          // router.push('/home');
          return;
        }
        
        // Naviguer vers la prochaine page
        await navigateToCurrentStep();
      }
    } catch (error) {
      console.error('Error advancing to next step:', error);
    }
  }, [user?.id, state, navigateToCurrentStep]);

  // Quitter l'onboarding
  const quit = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      await OnboardingService.skipOnboarding(user.id);
      setIsActive(false);
      setState(null);
    } catch (error) {
      console.error('Error quitting onboarding:', error);
    }
  }, [user?.id]);

  // Rediriger vers la page de paiement Pro
  const goToPro = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      // Rediriger vers la page de subscription
      router.push('/subscription/upgrade');
      
      // Ne pas arrêter l'onboarding - il continuera après l'upgrade
      // L'utilisateur pourra revenir et continuer le tour
    } catch (error) {
      console.error('Error navigating to pro upgrade:', error);
    }
  }, [user?.id, router]);

  // Redémarrer l'onboarding (depuis les settings)
  const restart = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      // TODO: Détecter si l'utilisateur est Pro/Créateur
      const isPro = false;
      const newState = await OnboardingService.resetOnboarding(user.id, isPro);
      
      setState(newState);
      setIsActive(true);
      
      // Naviguer vers le début
      await navigateToCurrentStep();
    } catch (error) {
      console.error('Error restarting onboarding:', error);
    }
  }, [user?.id, navigateToCurrentStep]);

  // Mettre à jour le statut Pro (appelé après upgrade)
  const updateProStatus = useCallback(async (isPro: boolean) => {
    if (!user?.id) return;
    
    try {
      const newState = await OnboardingService.updateProStatus(user.id, isPro);
      if (newState) {
        setState(newState);
      }
    } catch (error) {
      console.error('Error updating pro status:', error);
    }
  }, [user?.id]);

  // Obtenir les analytics de l'onboarding
  const getAnalytics = useCallback(async () => {
    if (!user?.id) return null;
    
    try {
      return await OnboardingService.getAnalytics(user.id);
    } catch (error) {
      console.error('Error getting onboarding analytics:', error);
      return null;
    }
  }, [user?.id]);

  // Calculer le progrès
  const progress = state ? {
    current: state.currentStep + 1,
    total: getTotalSteps(),
    percentage: Math.round(((state.currentStep + 1) / getTotalSteps()) * 100)
  } : null;

  return {
    // État
    currentStep: state?.currentStep ?? 0,
    isActive: isActive && !isLoading,
    isLoading,
    isPro: state?.isPro ?? false,
    hasCompleted: state?.hasCompletedOnboarding ?? false,
    progress,
    
    // Actions
    nextStep,
    quit,
    goToPro,
    restart,
    updateProStatus,
    getAnalytics,
    
    // Utilitaires
    state, // État complet pour debug
  };
}