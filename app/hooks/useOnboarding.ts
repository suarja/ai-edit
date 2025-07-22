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
  
  // État local avec debug
  const [state, setState] = useState<OnboardingState | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showWithDelay, setShowWithDelay] = useState(false);
  
  // Debug: wrapper pour setState avec logs
  const setStateWithLog = useCallback((newState: OnboardingState | null, source: string) => {
    console.log(`🔴 setState called from: ${source}`, newState);
    setState(newState);
  }, []);
  
  const setIsActiveWithLog = useCallback((newValue: boolean, source: string) => {
    console.log(`🟠 setIsActive called from: ${source}`, newValue);
    setIsActive(newValue);
  }, []);
  
  const setShowWithDelayWithLog = useCallback((newValue: boolean, source: string) => {
    console.log(`🟡 setShowWithDelay called from: ${source}`, newValue);
    setShowWithDelay(newValue);
  }, []);
  
  // Utiliser useRef pour éviter les re-renders intempestifs
  const hasInitialized = useRef(false);
  const isManualRestart = useRef(false);
  const restartInProgress = useRef(false);
  
  // Log chaque render du hook
  console.log('🎣 useOnboarding render:', {
    userId: user?.id?.slice(0, 8),
    state: state ? `step ${state.currentStep}` : 'null',
    isActive,
    isLoading,
    showWithDelay,
    hasInitialized: hasInitialized.current,
    isManualRestart: isManualRestart.current,
    restartInProgress: restartInProgress.current
  });

  // Initialisation - vérifie si l'onboarding doit être affiché
  useEffect(() => {
    const initializeOnboarding = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      
      // Ne pas réinitialiser si déjà fait ou si restart manuel en cours
      if (hasInitialized.current || restartInProgress.current) {
        console.log('🚑 Skipping initialization - already done or restart in progress');
        return;
      }
      
      // NOUVEAU: Ne pas initialiser si l'onboarding est déjà actif (évite les reset)
      if (isActive && state) {
        console.log('🚑 Skipping initialization - onboarding already active');
        return;
      }
      
      console.log('🔄 Initializing onboarding for first time...');
      
      try {
        // Vérifier si l'onboarding doit être affiché
        const shouldShow = await OnboardingService.shouldShowOnboarding(user.id);
        console.log('🎯 Should show onboarding:', shouldShow);
        
        if (shouldShow) {
          // Récupérer l'état existant ou créer un nouveau
          let currentState = await OnboardingService.getState(user.id);
          
          if (!currentState) {
            // TODO: Détecter si l'utilisateur est Pro/Créateur
            const isPro = false; // À connecter avec votre système de subscription
            currentState = await OnboardingService.initOnboarding(user.id, isPro);
          }
          
          setStateWithLog(currentState, 'INIT-shouldShow');
          setIsActiveWithLog(true, 'INIT-shouldShow');
          
          // Délai avant d'afficher l'overlay pour laisser voir la page
          setTimeout(() => {
            setShowWithDelayWithLog(true, 'INIT-delay');
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
        // Si l'onboarding est terminé, le désactiver
        if (newState.hasCompletedOnboarding) {
          setIsActiveWithLog(false, 'NEXT-completed');
          setStateWithLog(newState, 'NEXT-completed');
          return;
        }
        
        // Masquer temporairement l'overlay pour la navigation
        setShowWithDelayWithLog(false, 'NEXT-hideForNav');
        
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
        setStateWithLog(newState, 'NEXT-newStep');
        setTimeout(() => {
          setShowWithDelayWithLog(true, 'NEXT-showAfterNav');
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
      setShowWithDelayWithLog(false, 'QUIT');
      setIsActiveWithLog(false, 'QUIT');
      setStateWithLog(null, 'QUIT');
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
    console.log('🚀 RESTART CALLED!');
    
    if (!user?.id) {
      console.log('❌ No user ID available for onboarding restart');
      return;
    }
    
    try {
      console.log('🔄 Simple restart approach...');
      
      // Bloquer les useEffect pendant le restart
      restartInProgress.current = true;
      
      // 1. Créer un nouvel état dans le service
      const newState = await OnboardingService.resetOnboarding(user.id, false);
      console.log('✅ Service state created:', newState);
      
      // 2. Forcer tous les états React immédiatement
      setStateWithLog(newState, 'RESTART');
      setIsActiveWithLog(true, 'RESTART');
      setShowWithDelayWithLog(true, 'RESTART');
      
      console.log('💪 FORCED all states - overlay MUST show now!');
      
      // Débloquer après un délai
      setTimeout(() => {
        restartInProgress.current = false;
        console.log('✅ Restart completed, unlocked useEffect');
      }, 2000);
      
    } catch (error) {
      console.error('❌ Restart error:', error);
      restartInProgress.current = false;
    }
  }, [user?.id]);

  // Mettre à jour le statut Pro (appelé après upgrade)
  const updateProStatus = useCallback(async (isPro: boolean) => {
    if (!user?.id) return;
    
    try {
      const newState = await OnboardingService.updateProStatus(user.id, isPro);
      if (newState) {
        setStateWithLog(newState, 'UPDATE-PRO');
      }
    } catch (error) {
      console.error('Error updating pro status:', error);
    }
  }, [user?.id]);
  
  // Force refresh de l'onboarding (pour debug)
  const forceRefresh = useCallback(async () => {
    if (!user?.id) return;
    
    console.log('🔄 Force refreshing onboarding state...');
    try {
      const currentState = await OnboardingService.getState(user.id);
      console.log('👀 Force refresh found state:', currentState);
      
      if (currentState && !currentState.hasCompletedOnboarding) {
        console.log('🔥 FORCE setting all states...');
        setStateWithLog(currentState, 'FORCE-REFRESH');
        setIsActiveWithLog(true, 'FORCE-REFRESH');
        setShowWithDelayWithLog(true, 'FORCE-REFRESH');
        console.log('✅ Force refresh completed - overlay should appear!');
      } else {
        console.log('❌ No valid state found or already completed');
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

  // Debug: Log les valeurs individuelles qui composent isActive
  const finalIsActive = isActive && !isLoading && showWithDelay;
  console.log('🔍 useOnboarding return values:', {
    isActive,
    isLoading,
    showWithDelay,
    finalIsActive,
    computation: `${isActive} && !${isLoading} && ${showWithDelay} = ${finalIsActive}`
  });

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
    goToPro,
    restart,
    updateProStatus,
    getAnalytics,
    forceRefresh, // Pour debug
    
    // Utilitaires
    state, // État complet pour debug
  };
}