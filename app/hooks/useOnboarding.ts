import { useEffect, useState, useCallback, useRef } from 'react';
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
  const [showWithDelay, setShowWithDelay] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  
  
  // Utiliser useRef pour éviter les re-renders intempestifs
  const hasInitialized = useRef(false);
  const isManualRestart = useRef(false);
  const restartInProgress = useRef(false);
  

  // Initialisation - vérifie si l'onboarding doit être affiché
  useEffect(() => {
    const initializeOnboarding = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      
      // Ne pas réinitialiser si déjà fait ou si restart manuel en cours
      if (hasInitialized.current || restartInProgress.current) {
        return;
      }
      
      // Ne pas initialiser si l'onboarding est déjà actif (évite les reset)
      if (isActive && state) {
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
          
          // Délai avant d'afficher l'overlay pour laisser voir la page
          setTimeout(() => {
            setShowWithDelay(true);
          }, 1000);
        }
        
        hasInitialized.current = true;
      } catch (error) {
        console.error('Error initializing onboarding:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeOnboarding();
  }, [user?.id]); // Supprimé les dépendances qui causaient les re-renders

  // Navigation vers l'étape courante avec délai
  const navigateToCurrentStep = useCallback(async () => {
    if (!state) return;
    
    const route = getStepRoute(state.currentStep);
    if (route) {
      try {
        router.push(route);
        // Délai pour laisser la page se charger avant d'afficher l'overlay
        await new Promise(resolve => setTimeout(resolve, 800));
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
        // Si l'onboarding est terminé, déclencher la célébration
        if (newState.hasCompletedOnboarding) {
          setShowCelebration(true);
          setIsActive(false);
          setState(newState);
          return;
        }
        
        // Masquer temporairement l'overlay pour la navigation
        setShowWithDelay(false);
        
        // Naviguer vers la prochaine page
        const route = getStepRoute(newState.currentStep);
        if (route) {
          try {
            router.push(route);
            // Délai pour laisser la page se charger
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (error) {
            console.error('Navigation error:', error);
          }
        }
        
        // Mettre à jour l'état et réafficher l'overlay avec délai
        setState(newState);
        setTimeout(() => {
          setShowWithDelay(true);
        }, 500);
      }
    } catch (error) {
      console.error('Error advancing to next step:', error);
    }
  }, [user?.id, state, router]);

  // Quitter l'onboarding
  const quit = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      await OnboardingService.skipOnboarding(user.id);
      setShowWithDelay(false);
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

  // Redémarrer l'onboarding (depuis les settings) - Version simplifiée
  const restart = useCallback(async () => {
    if (!user?.id) {
      return;
    }
    
    try {
      // Bloquer les useEffect pendant le restart
      restartInProgress.current = true;
      
      // Créer un nouvel état dans le service
      const newState = await OnboardingService.resetOnboarding(user.id, false);
      
      // Forcer tous les états React immédiatement
      setState(newState);
      setIsActive(true);
      setShowWithDelay(true);
      
      // Débloquer après un délai
      setTimeout(() => {
        restartInProgress.current = false;
      }, 2000);
      
    } catch (error) {
      console.error('Error restarting onboarding:', error);
      restartInProgress.current = false;
    }
  }, [user?.id]);

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

  // Fermer la célébration
  const closeCelebration = useCallback(() => {
    setShowCelebration(false);
  }, []);
  
  // Force refresh de l'onboarding (pour debug)
  const forceRefresh = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const currentState = await OnboardingService.getState(user.id);
      
      if (currentState && !currentState.hasCompletedOnboarding) {
        setState(currentState);
        setIsActive(true);
        setShowWithDelay(true);
      }
    } catch (error) {
      console.error('Error force refreshing:', error);
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

  const finalIsActive = isActive && !isLoading && showWithDelay;

  return {
    // État
    currentStep: state?.currentStep ?? 0,
    isActive: finalIsActive,
    isLoading,
    isPro: state?.isPro ?? false,
    hasCompleted: state?.hasCompletedOnboarding ?? false,
    progress,
    
    // Actions
    nextStep,
    quit,
    restart,
    updateProStatus,
    getAnalytics,
    forceRefresh, // Pour debug
    closeCelebration,
    
    // Célébration
    showCelebration,
    
    // Utilitaires
    state, // État complet pour debug
  };
}