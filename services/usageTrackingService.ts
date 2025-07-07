import { supabase } from '@/lib/supabase';

/**
 * Types de ressources pouvant être suivies
 */
export type ResourceType =
  | 'videos'
  | 'source_videos'
  | 'voice_clones'
  | 'account_analysis';

/**
 * Interface pour les informations d'utilisation
 */
export interface UserUsage {
  id: string;
  user_id: string;
  videos_generated: number;
  videos_limit: number;
  source_videos_used: number;
  source_videos_limit: number;
  voice_clones_used: number;
  voice_clones_limit: number;
  account_analysis_used: number;
  account_analysis_limit: number;
  next_reset_date: string;
  is_early_adopter?: boolean;
}

/**
 * Récupère les informations d'utilisation d'un utilisateur
 * @param userId ID de l'utilisateur
 * @returns Informations d'utilisation ou null en cas d'erreur
 */
export async function getUserUsage(userId: string): Promise<UserUsage | null> {
  try {
    const { data, error } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user usage:', error);
      return null;
    }

    return data as UserUsage;
  } catch (error) {
    console.error('Exception in getUserUsage:', error);
    return null;
  }
}

/**
 * Vérifie si un utilisateur a atteint sa limite pour une ressource donnée
 * @param userId ID de l'utilisateur
 * @param resourceType Type de ressource à vérifier
 * @returns true si la limite est atteinte, false sinon
 */
export async function hasReachedLimit(
  userId: string,
  resourceType: ResourceType
): Promise<boolean> {
  try {
    const usage = await getUserUsage(userId);
    if (!usage) return true; // En cas d'erreur, considérer la limite comme atteinte par sécurité

    switch (resourceType) {
      case 'videos':
        return usage.videos_generated >= usage.videos_limit;
      case 'source_videos':
        return usage.source_videos_used >= usage.source_videos_limit;
      case 'voice_clones':
        return usage.voice_clones_used >= usage.voice_clones_limit;
      case 'account_analysis':
        return usage.account_analysis_used >= usage.account_analysis_limit;
      default:
        return true; // Par défaut, considérer la limite comme atteinte
    }
  } catch (error) {
    console.error(`Error checking limit for ${resourceType}:`, error);
    return true; // En cas d'erreur, considérer la limite comme atteinte par sécurité
  }
}

/**
 * Incrémente le compteur d'utilisation d'une ressource
 * @param userId ID de l'utilisateur
 * @param resourceType Type de ressource à incrémenter
 * @returns true si l'incrémentation a réussi, false sinon
 */
export async function incrementResourceUsage(
  userId: string,
  resourceType: ResourceType
): Promise<boolean> {
  try {
    // Déterminer le champ à incrémenter
    let usedField: string;

    switch (resourceType) {
      case 'videos':
        usedField = 'videos_generated';
        break;
      case 'source_videos':
        usedField = 'source_videos_used';
        break;
      case 'voice_clones':
        usedField = 'voice_clones_used';
        break;
      case 'account_analysis':
        usedField = 'account_analysis_used';
        break;
      default:
        throw new Error(`Unsupported resource type: ${resourceType}`);
    }

    // Incrémenter le compteur d'utilisation
    const { error } = await supabase
      .from('user_usage')
      .update({
        [usedField]: supabase.rpc('increment', { row_id: usedField }),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      console.error(`Failed to increment ${resourceType} usage:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error incrementing ${resourceType} usage:`, error);
    return false;
  }
}

/**
 * Réinitialise le compteur d'utilisation d'une ressource
 * @param userId ID de l'utilisateur
 * @param resourceType Type de ressource à réinitialiser
 * @returns true si la réinitialisation a réussi, false sinon
 */
export async function resetResourceUsage(
  userId: string,
  resourceType: ResourceType
): Promise<boolean> {
  try {
    // Déterminer le champ à réinitialiser
    let usedField: string;

    switch (resourceType) {
      case 'videos':
        usedField = 'videos_generated';
        break;
      case 'source_videos':
        usedField = 'source_videos_used';
        break;
      case 'voice_clones':
        usedField = 'voice_clones_used';
        break;
      case 'account_analysis':
        usedField = 'account_analysis_used';
        break;
      default:
        throw new Error(`Unsupported resource type: ${resourceType}`);
    }

    // Réinitialiser le compteur d'utilisation
    const { error } = await supabase
      .from('user_usage')
      .update({
        [usedField]: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      console.error(`Failed to reset ${resourceType} usage:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error resetting ${resourceType} usage:`, error);
    return false;
  }
}

/**
 * Met à jour les limites d'utilisation d'un utilisateur en fonction de son plan
 * @param userId ID de l'utilisateur
 * @param planId ID du plan d'abonnement
 * @returns true si la mise à jour a réussi, false sinon
 */
export async function updateUserLimits(
  userId: string,
  planId: string
): Promise<boolean> {
  try {
    // Récupérer les limites du plan
    const { data: planData, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !planData) {
      console.error('Failed to fetch plan limits:', planError);
      return false;
    }

    // Mettre à jour les limites de l'utilisateur
    const { error } = await supabase
      .from('user_usage')
      .update({
        videos_limit: planData.videos_limit,
        source_videos_limit: planData.source_videos_limit,
        voice_clones_limit: planData.voice_clones_limit,
        account_analysis_limit: planData.account_analysis_limit,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Failed to update user limits:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating user limits:', error);
    return false;
  }
}

/**
 * Crée un enregistrement d'utilisation pour un nouvel utilisateur
 * @param userId ID de l'utilisateur
 * @param planId ID du plan d'abonnement (par défaut 'free')
 * @returns true si la création a réussi, false sinon
 */
export async function createUserUsageRecord(
  userId: string,
  planId: string = 'free'
): Promise<boolean> {
  try {
    // Récupérer les limites du plan
    const { data: planData, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !planData) {
      console.error('Failed to fetch plan limits:', planError);
      return false;
    }

    // Créer l'enregistrement d'utilisation
    const { error } = await supabase.from('user_usage').insert([
      {
        user_id: userId,
        videos_generated: 0,
        videos_limit: planData.videos_limit,
        source_videos_used: 0,
        source_videos_limit: planData.source_videos_limit,
        voice_clones_used: 0,
        voice_clones_limit: planData.voice_clones_limit,
        account_analysis_used: 0,
        account_analysis_limit: planData.account_analysis_limit,
        next_reset_date: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(), // 30 jours à partir de maintenant
        is_early_adopter: false,
      },
    ]);

    if (error) {
      console.error('Failed to create usage record:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error creating usage record:', error);
    return false;
  }
}
