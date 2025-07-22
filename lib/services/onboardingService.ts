import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OnboardingState {
  userId: string;
  hasCompletedOnboarding: boolean;
  currentStep: number; // 0-5
  startedAt: string;
  isPro: boolean;
  skippedAt?: string;
  viewedSteps: number[];
}

export interface StepContent {
  title: string;
  message: string;
  highlight?: string;
  subtext?: string;
  stats?: string;
  example?: string;
  tip?: string;
  cta?: string;
  showProButton: boolean;
  isFinal?: boolean;
  videoUrl?: string; // Pour support futur
  imageUrl?: string; // Pour support futur
}

/**
 * Service de gestion de l'onboarding informatif
 * Permet de suivre le parcours utilisateur et de l'informer sur les fonctionnalités
 */
export class OnboardingService {
  private static readonly STORAGE_KEY_PREFIX = 'onboarding_state_';
  private static readonly CURRENT_VERSION = '1.0.0'; // Pour migration future

  // État par défaut
  private static readonly DEFAULT_STATE: Omit<OnboardingState, 'userId'> = {
    hasCompletedOnboarding: false,
    currentStep: 0,
    startedAt: new Date().toISOString(),
    isPro: false,
    viewedSteps: [],
  };

  /**
   * Charge l'état de l'onboarding pour un utilisateur
   */
  static async getState(userId: string): Promise<OnboardingState | null> {
    try {
      const key = `${this.STORAGE_KEY_PREFIX}${userId}`;
      const stored = await AsyncStorage.getItem(key);
      
      if (!stored) return null;
      
      const parsed = JSON.parse(stored);
      
      // Validation basique
      if (!parsed.userId || !parsed.startedAt) {
        console.warn('Invalid onboarding state format, returning null');
        return null;
      }
      
      return parsed as OnboardingState;
    } catch (error) {
      console.error('Error loading onboarding state:', error);
      return null;
    }
  }

  /**
   * Initialise un nouvel onboarding pour un utilisateur
   */
  static async initOnboarding(userId: string, isPro: boolean = false): Promise<OnboardingState> {
    const state: OnboardingState = {
      ...this.DEFAULT_STATE,
      userId,
      isPro,
      viewedSteps: [0], // Premier step déjà vu
    };
    
    await this.saveState(state);
    return state;
  }

  /**
   * Sauvegarde l'état de l'onboarding
   */
  private static async saveState(state: OnboardingState): Promise<boolean> {
    try {
      const key = `${this.STORAGE_KEY_PREFIX}${state.userId}`;
      await AsyncStorage.setItem(key, JSON.stringify(state));
      return true;
    } catch (error) {
      console.error('Error saving onboarding state:', error);
      return false;
    }
  }

  /**
   * Passe à l'étape suivante de l'onboarding
   */
  static async nextStep(userId: string): Promise<OnboardingState | null> {
    const state = await this.getState(userId);
    if (!state || state.hasCompletedOnboarding) return state;
    
    // Marquer l'étape courante comme vue
    if (!state.viewedSteps.includes(state.currentStep)) {
      state.viewedSteps.push(state.currentStep);
    }
    
    // Avancer à l'étape suivante
    state.currentStep += 1;
    
    // Marquer l'onboarding comme terminé si on a atteint la fin
    if (state.currentStep >= 6) {
      state.hasCompletedOnboarding = true;
      state.currentStep = 5; // Rester sur la dernière étape
    }
    
    // Marquer la nouvelle étape comme vue
    if (!state.viewedSteps.includes(state.currentStep)) {
      state.viewedSteps.push(state.currentStep);
    }
    
    await this.saveState(state);
    return state;
  }

  /**
   * Termine l'onboarding (skip)
   */
  static async skipOnboarding(userId: string): Promise<void> {
    const state = await this.getState(userId);
    if (!state) return;
    
    state.hasCompletedOnboarding = true;
    state.skippedAt = new Date().toISOString();
    
    await this.saveState(state);
  }

  /**
   * Met à jour le statut Pro de l'utilisateur
   */
  static async updateProStatus(userId: string, isPro: boolean): Promise<OnboardingState | null> {
    const state = await this.getState(userId);
    if (!state) return null;
    
    state.isPro = isPro;
    await this.saveState(state);
    return state;
  }

  /**
   * Vérifie si l'utilisateur doit voir l'onboarding
   */
  static async shouldShowOnboarding(userId: string): Promise<boolean> {
    const state = await this.getState(userId);
    return !state || !state.hasCompletedOnboarding;
  }

  /**
   * Remet à zéro l'onboarding (pour reprendre le tour)
   */
  static async resetOnboarding(userId: string, isPro: boolean = false): Promise<OnboardingState> {
    // Supprimer l'ancien état
    const key = `${this.STORAGE_KEY_PREFIX}${userId}`;
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error clearing onboarding state:', error);
    }
    
    // Créer un nouveau
    return this.initOnboarding(userId, isPro);
  }

  /**
   * Obtient des statistiques sur l'onboarding (pour analytics futur)
   */
  static async getAnalytics(userId: string): Promise<{
    totalSteps: number;
    viewedSteps: number;
    completionRate: number;
    timeSpent?: number;
    wasSkipped: boolean;
  } | null> {
    const state = await this.getState(userId);
    if (!state) return null;
    
    const totalSteps = 6;
    const viewedSteps = state.viewedSteps.length;
    const completionRate = (viewedSteps / totalSteps) * 100;
    
    let timeSpent: number | undefined;
    if (state.skippedAt || state.hasCompletedOnboarding) {
      const endTime = state.skippedAt || new Date().toISOString();
      timeSpent = new Date(endTime).getTime() - new Date(state.startedAt).getTime();
    }
    
    return {
      totalSteps,
      viewedSteps,
      completionRate,
      timeSpent,
      wasSkipped: !!state.skippedAt,
    };
  }

  /**
   * Vérifie si une étape spécifique a été vue
   */
  static async hasViewedStep(userId: string, stepIndex: number): Promise<boolean> {
    const state = await this.getState(userId);
    return state ? state.viewedSteps.includes(stepIndex) : false;
  }

  /**
   * Obtient le nombre d'étapes vues
   */
  static async getViewedStepsCount(userId: string): Promise<number> {
    const state = await this.getState(userId);
    return state ? state.viewedSteps.length : 0;
  }

  /**
   * Debug: Obtient tous les utilisateurs avec onboarding
   */
  static async getAllOnboardingUsers(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys
        .filter(key => key.startsWith(this.STORAGE_KEY_PREFIX))
        .map(key => key.replace(this.STORAGE_KEY_PREFIX, ''));
    } catch (error) {
      console.error('Error getting all onboarding users:', error);
      return [];
    }
  }

  /**
   * Debug: Supprime tous les états d'onboarding (pour dev seulement)
   */
  static async clearAllOnboardingData(): Promise<boolean> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const onboardingKeys = keys.filter(key => key.startsWith(this.STORAGE_KEY_PREFIX));
      
      if (onboardingKeys.length > 0) {
        await AsyncStorage.multiRemove(onboardingKeys);
      }
      
      console.log(`Cleared ${onboardingKeys.length} onboarding states`);
      return true;
    } catch (error) {
      console.error('Error clearing all onboarding data:', error);
      return false;
    }
  }
}