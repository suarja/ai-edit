import { useState, useEffect } from 'react';
import { useRevenueCat } from '@/contexts/providers/RevenueCat';
import { useClerkSupabaseClient } from '@/lib/config/supabase-clerk';
import { FeatureId } from 'editia-core';

/**
 * Hook pour vérifier l'accès à une fonctionnalité spécifique
 * @param featureId Identifiant de la fonctionnalité à vérifier
 * @returns Informations sur l'accès à la fonctionnalité
 */
export function useFeatureAccess(featureId: FeatureId): {
  hasAccess: boolean;
  isLoading: boolean;
  remainingUsage: number;
  totalLimit: number;
  currentPlan: string;
} {
  const { currentPlan, userUsage, isReady } = useRevenueCat();
  const [hasAccess, setHasAccess] = useState(false);
  const [remainingUsage, setRemainingUsage] = useState(0);
  const [totalLimit, setTotalLimit] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { client: supabase } = useClerkSupabaseClient();

  useEffect(() => {
    console.log("useFeatureAccess", featureId);
    const checkAccess = async () => {
      if (!isReady) return;

      try {
        setIsLoading(true);

        // Vérifier si la fonctionnalité nécessite un plan spécifique
        const { data: featureData, error } = await supabase
          .from('feature_flags')
          .select('*')
          .eq('id', featureId)
          .eq('is_active', true)
          .single();

        if (error) {
          console.error(`Error fetching feature flag ${featureId}:`, error);
          // Si erreur, on utilise une logique de fallback basée uniquement sur isPro
          setHasAccess(currentPlan !== 'free');
          setIsLoading(false);
          return;
        }

        // Accès basé sur le plan requis
        const isFree = currentPlan === 'free';
        const requiresPro = featureData?.required_plan === 'pro';
        const requiresCreator = featureData?.required_plan === 'creator';
        const noPlanRequired = featureData?.required_plan === null;
        
        // Si aucun plan n'est requis, l'accès est automatiquement accordé
        if (noPlanRequired || isFree) {
          setHasAccess(true);
          setRemainingUsage(999);
          setTotalLimit(999);
          setIsLoading(false);
          return;
        }
        
        // Vérifier l'accès basé sur le plan
        let hasFeatureAccess = false;
        if (requiresPro) {
          hasFeatureAccess = currentPlan === 'pro';
        } else if (requiresCreator) {
          hasFeatureAccess = currentPlan === 'creator' || currentPlan === 'pro';
        } else {
          hasFeatureAccess = true; // Aucun plan requis
        }

        // Calcul des limites d'utilisation
        let remaining = 0;
        let limit = 0;

        if (userUsage) {
          switch (featureId) {
            case 'voice_clone':
              remaining = Math.max(
                0,
                (userUsage.voice_clones_limit || 0) -
                  (userUsage.voice_clones_used || 0)
              );
              limit = userUsage.voice_clones_limit || 0;
              break;
            case 'account_analysis':
              remaining = Math.max(
                0,
                (userUsage.account_analysis_limit || 0) -
                  (userUsage.account_analysis_used || 0)
              );
              limit = userUsage.account_analysis_limit || 0;
              break;
            case 'video_generation':
              remaining = Math.max(
                0,
                userUsage.videos_generated_limit - userUsage.videos_generated
              );
              limit = userUsage.videos_generated_limit;
              break;
            case 'source_videos':
              remaining = Math.max(
                0,
                (userUsage.source_videos_limit || 30) -
                  (userUsage.source_videos_used || 0)
              );
              limit = userUsage.source_videos_limit || 30;
              break;
            default:
              // Pour les fonctionnalités sans limite spécifique
              remaining = isFree ? 999 : 0;
              limit = isFree ? 999 : 0;
          }
        }

        // L'utilisateur a accès si:
        // 1. La fonctionnalité est disponible pour son plan ET
        // 2. Soit il est Pro (donc pas de limite), soit il a encore des utilisations disponibles
        // Si aucun plan n'est requis, l'accès est automatiquement accordé
        const finalAccess = noPlanRequired ? true : (hasFeatureAccess && (isFree || remaining > 0));
        setHasAccess(finalAccess);
        setRemainingUsage(remaining);
        setTotalLimit(limit);
      } catch (error) {
        console.error(`Error checking access for feature ${featureId}:`, error);
        // En cas d'erreur, on utilise une logique de fallback basée uniquement sur isPro
        setHasAccess(currentPlan !== 'free');
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [featureId, currentPlan, isReady, userUsage]);

  return { hasAccess, isLoading, remainingUsage, totalLimit, currentPlan };
}

/**
 * Hook pour vérifier l'accès à plusieurs fonctionnalités à la fois
 * @param featureIds Liste des identifiants de fonctionnalités à vérifier
 * @returns Mapping des accès par fonctionnalité
 */
export function useMultipleFeatureAccess(featureIds: FeatureId[]): {
  accessMap: Record<
    string,
    { hasAccess: boolean; remainingUsage: number; totalLimit: number }
  >;
  isLoading: boolean;
  currentPlan: string;
} {
  const { currentPlan, userUsage, isReady } = useRevenueCat();
  const [accessMap, setAccessMap] = useState<
    Record<
      string,
      { hasAccess: boolean; remainingUsage: number; totalLimit: number }
    >
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const { client: supabase } = useClerkSupabaseClient();

  useEffect(() => {
    const checkMultipleAccess = async () => {
      if (!isReady || featureIds.length === 0) return;

      try {
        setIsLoading(true);

        // Récupérer toutes les fonctionnalités demandées en une seule requête
        const { data: featureData, error } = await supabase
          .from('feature_flags')
          .select('*')
          .in('id', featureIds)
          .eq('is_active', true);

        if (error) {
          console.error('Error fetching feature flags:', error);
          // Fallback: accès basé uniquement sur isPro
          const fallbackMap: Record<
            string,
            { hasAccess: boolean; remainingUsage: number; totalLimit: number }
          > = {};
          featureIds.forEach((id) => {
            fallbackMap[id] = {
              hasAccess: currentPlan !== 'free',
              remainingUsage: currentPlan !== 'free' ? 999 : 0,
              totalLimit: currentPlan !== 'free' ? 999 : 0,
            };
          });
          setAccessMap(fallbackMap);
          setIsLoading(false);
          return;
        }

        // Créer un mapping des fonctionnalités par ID pour un accès facile
        const featureMap = new Map();
        featureData?.forEach((feature) => {
          featureMap.set(feature.id, feature);
        });

        // Construire le mapping d'accès
        const newAccessMap: Record<
          string,
          { hasAccess: boolean; remainingUsage: number; totalLimit: number }
        > = {};

        for (const featureId of featureIds) {
          const feature = featureMap.get(featureId);
          const requiresPro = feature?.required_plan === 'pro';
          const requiresCreator = feature?.required_plan === 'creator';
          const noPlanRequired = feature?.required_plan === null;
          
          // Si aucun plan n'est requis, l'accès est automatiquement accordé
          if (noPlanRequired) {
            newAccessMap[featureId] = {
              hasAccess: true,
              remainingUsage: 999,
              totalLimit: 999,
            };
            continue;
          }
          
          // Vérifier l'accès basé sur le plan
          let hasFeatureAccess = false;
          if (requiresPro) {
            hasFeatureAccess = currentPlan === 'pro';
          } else if (requiresCreator) {
            hasFeatureAccess = currentPlan === 'creator' || currentPlan === 'pro';
          } else {
            hasFeatureAccess = true; // Aucun plan requis
          }

          let remaining = 0;
          let limit = 0;

          if (userUsage) {
            switch (featureId) {
              case 'voice_clone':
                remaining = Math.max(
                  0,
                  (userUsage.voice_clones_limit || 0) -
                    (userUsage.voice_clones_used || 0)
                );
                limit = userUsage.voice_clones_limit || 0;
                break;
              case 'account_analysis':
                remaining = Math.max(
                  0,
                  (userUsage.account_analysis_limit || 0) -
                    (userUsage.account_analysis_used || 0)
                );
                limit = userUsage.account_analysis_limit || 0;
                break;
              case 'video_generation':
                remaining = Math.max(
                  0,
                  userUsage.videos_generated_limit - userUsage.videos_generated
                );
                limit = userUsage.videos_generated_limit;
                break;
              case 'source_videos':
                remaining = Math.max(
                  0,
                  (userUsage.source_videos_limit || 30) -
                    (userUsage.source_videos_used || 0)
                );
                limit = userUsage.source_videos_limit || 30;
                break;
              default:
                remaining = currentPlan !== 'free' ? 999 : 0;
                limit = currentPlan !== 'free' ? 999 : 0;
            }
          }

          newAccessMap[featureId] = {
            hasAccess: noPlanRequired ? true : (hasFeatureAccess && (currentPlan !== 'free' || remaining > 0)),
            remainingUsage: remaining,
            totalLimit: limit,
          };
        }

        setAccessMap(newAccessMap);
      } catch (error) {
        console.error('Error checking multiple feature access:', error);
        // Fallback en cas d'erreur
        const fallbackMap: Record<
          string,
          { hasAccess: boolean; remainingUsage: number; totalLimit: number }
        > = {};
        featureIds.forEach((id) => {
          fallbackMap[id] = {
            hasAccess: currentPlan !== 'free',
            remainingUsage: currentPlan !== 'free' ? 999 : 0,
            totalLimit: currentPlan !== 'free' ? 999 : 0,
          };
        });
        setAccessMap(fallbackMap);
      } finally {
        setIsLoading(false);
      }
    };

    checkMultipleAccess();
  }, [featureIds, currentPlan, isReady, userUsage]);

  return { accessMap, isLoading, currentPlan };
}
