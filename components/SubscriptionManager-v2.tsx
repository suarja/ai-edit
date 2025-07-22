/**
 * 🎨 SubscriptionManager v2 - Migré vers la Palette Editia
 * 
 * MIGRATION PHASE 2:
 * ❌ Avant: 33 couleurs hardcodées pour barres de progression et états de subscription
 * ✅ Après: Interface cohérente avec palette Editia (#FF0050, #FFD700, #00FF88, #007AFF)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Crown, Zap, RotateCcw, BarChart3 } from 'lucide-react-native';
import { useRevenueCat } from '@/contexts/providers/RevenueCat';
import { COLORS } from '@/lib/constants/colors';

interface SubscriptionManagerProps {
  style?: any;
}

export const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({
  style,
}) => {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const {
    isReady,
    userUsage,
    videosRemaining,
    sourceVideosRemaining,
    voiceClonesRemaining,
    accountAnalysisRemaining,
    presentPaywall,
    restorePurchases,
    hasOfferingError,
    currentPlan,
    plans,
  } = useRevenueCat();

  if (!isReady || !userUsage || !plans) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.header}>
          <Crown size={24} color={COLORS.interactive.secondary} />
          <Text style={styles.title}>Abonnement</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.interactive.primary} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </View>
    );
  }

  const handleUpgrade = async () => {
    try {
      setIsUpgrading(true);

      if (hasOfferingError) {
        Alert.alert(
          'Service temporairement indisponible',
          'Notre service de paiement est actuellement en maintenance. Veuillez réessayer plus tard.',
          [{ text: 'OK' }]
        );
        return;
      }

      const success = await presentPaywall();
      if (success) {
        Alert.alert(
          'Félicitations! 🎉',
          'Votre abonnement a été activé avec succès!',
          [{ text: 'Parfait!' }]
        );
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de la mise à niveau. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleRestore = async () => {
    try {
      setIsRestoring(true);
      const success = await restorePurchases();

      if (success) {
        Alert.alert(
          'Achats restaurés',
          'Vos achats ont été restaurés avec succès!',
          [{ text: 'Parfait!' }]
        );
      } else {
        Alert.alert(
          'Aucun achat trouvé',
          'Aucun achat premium trouvé pour ce compte.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Restore error:', error);
      Alert.alert(
        'Erreur',
        'Impossible de restaurer les achats. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsRestoring(false);
    }
  };

  const renderContent = () => {
    switch (currentPlan) {
      case 'pro':
        return (
          <View style={[styles.container, styles.proContainer, style]}>
            <View style={styles.header}>
              <Crown size={24} color={COLORS.brand.gold} />
              <Text style={styles.title}>Plan Pro</Text>
            </View>
            <View style={styles.planInfo}>
              <Text style={styles.planDescription}>
                Vous avez accès à toutes les fonctionnalités premium. Merci pour
                votre confiance !
              </Text>
            </View>
            <View style={styles.usageSection}>
              <View style={styles.usageHeader}>
                <BarChart3 size={20} color={COLORS.interactive.primary} />
                <Text style={styles.usageTitle}>Utilisation ce mois</Text>
              </View>
              <View style={styles.usageStats}>
                <Text style={styles.usageText}>
                  {userUsage.videos_generated} vidéos générées
                </Text>
                <Text style={styles.usageUnlimited}>Illimité</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.restoreButton}
              onPress={handleRestore}
              disabled={isRestoring}
              activeOpacity={0.8}
            >
              {isRestoring ? (
                <ActivityIndicator size="small" color={COLORS.text.disabled} />
              ) : (
                <>
                  <RotateCcw size={16} color={COLORS.text.disabled} />
                  <Text style={styles.restoreButtonText}>
                    Restaurer les achats
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        );

      case 'creator':
        return (
          <View style={[styles.container, style]}>
            <View style={styles.header}>
              <Crown size={24} color={COLORS.interactive.secondary} />
              <Text style={styles.title}>Plan Créateur</Text>
            </View>
            <View style={styles.planInfo}>
              <Text style={styles.planDescription}>
                Plan Créateur: {videosRemaining} vidéos restantes ce mois.
              </Text>
            </View>
            <View style={styles.usageSection}>
              <View style={styles.usageHeader}>
                <BarChart3 size={20} color={COLORS.interactive.primary} />
                <Text style={styles.usageTitle}>Utilisation ce mois</Text>
              </View>
              <View style={styles.usageBar}>
                <View
                  style={[
                    styles.usageProgress,
                    {
                      width: `${Math.min(
                        (userUsage.videos_generated /
                          userUsage.videos_generated_limit) *
                          100,
                        100
                      )}%`,
                      backgroundColor:
                        videosRemaining <= 3 
                          ? COLORS.status.warning // #FF9500 (Warning orange)
                          : COLORS.status.success, // #00FF88 (Vert Editia!)
                    },
                  ]}
                />
              </View>
              <View style={styles.usageStats}>
                <Text style={styles.usageText}>
                  {userUsage.videos_generated} /{' '}
                  {userUsage.videos_generated_limit} vidéos utilisées
                </Text>
                <Text style={[
                  styles.usageRemaining,
                  videosRemaining <= 3 && styles.usageWarning
                ]}>
                  {videosRemaining} restantes
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={handleUpgrade}
              disabled={isUpgrading}
              activeOpacity={0.8}
            >
              {isUpgrading ? (
                <ActivityIndicator size="small" color={COLORS.text.primary} />
              ) : (
                <>
                  <Zap size={16} color={COLORS.text.primary} />
                  <Text style={styles.upgradeButtonText}>
                    Passer Pro pour l'illimité
                  </Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.restoreButton}
              onPress={handleRestore}
              disabled={isRestoring}
              activeOpacity={0.8}
            >
              {isRestoring ? (
                <ActivityIndicator size="small" color={COLORS.text.disabled} />
              ) : (
                <>
                  <RotateCcw size={16} color={COLORS.text.disabled} />
                  <Text style={styles.restoreButtonText}>
                    Restaurer les achats
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        );

      case 'free':
      default:
        return (
          <View style={[styles.container, style]}>
            <View style={styles.header}>
              <Crown size={24} color={COLORS.interactive.secondary} />
              <Text style={styles.title}>Plan Découverte</Text>
            </View>
            <View style={styles.planInfo}>
              <Text style={styles.planDescription}>
                Plan Découverte: {videosRemaining} vidéos restantes ce mois.
              </Text>
            </View>
            <View style={styles.usageSection}>
              <View style={styles.usageHeader}>
                <BarChart3 size={20} color={COLORS.interactive.primary} />
                <Text style={styles.usageTitle}>Utilisation ce mois</Text>
              </View>
              <View style={styles.usageBar}>
                <View
                  style={[
                    styles.usageProgress,
                    {
                      width: `${Math.min(
                        (userUsage.videos_generated /
                          userUsage.videos_generated_limit) *
                          100,
                        100
                      )}%`,
                      backgroundColor:
                        videosRemaining === 0 
                          ? COLORS.status.error // #FF3B30 (Rouge système)
                          : COLORS.interactive.secondary, // #007AFF (Bleu Editia!)
                    },
                  ]}
                />
              </View>
              <View style={styles.usageStats}>
                <Text style={styles.usageText}>
                  {userUsage.videos_generated} /{' '}
                  {userUsage.videos_generated_limit} vidéos utilisées
                </Text>
                <Text
                  style={[
                    styles.usageRemaining,
                    videosRemaining === 0 && styles.usageError,
                  ]}
                >
                  {videosRemaining} restantes
                </Text>
              </View>
              {videosRemaining === 0 && (
                <Text style={styles.limitReachedText}>
                  Limite atteinte! Passez au plan Créateur pour continuer.
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={handleUpgrade}
              disabled={isUpgrading}
              activeOpacity={0.8}
            >
              {isUpgrading ? (
                <ActivityIndicator size="small" color={COLORS.text.primary} />
              ) : (
                <>
                  <Zap size={16} color={COLORS.text.primary} />
                  <Text style={styles.upgradeButtonText}>
                    Débloquer 15 vidéos/mois avec le plan Créateur
                  </Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.restoreButton}
              onPress={handleRestore}
              disabled={isRestoring}
              activeOpacity={0.8}
            >
              {isRestoring ? (
                <ActivityIndicator size="small" color={COLORS.text.disabled} />
              ) : (
                <>
                  <RotateCcw size={16} color={COLORS.text.disabled} />
                  <Text style={styles.restoreButtonText}>
                    Restaurer les achats
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        );
    }
  };

  return renderContent();
};

const styles = StyleSheet.create({
  // ✅ Container principal avec design cohérent
  container: {
    backgroundColor: COLORS.background.secondary, // #1a1a1a
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.surface.border, // rgba(255, 255, 255, 0.2)
    shadowColor: COLORS.shadow.neutral,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  // ✅ Pro container avec Or Editia
  proContainer: {
    backgroundColor: 'rgba(255, 215, 0, 0.08)', // Or background léger
    borderWidth: 2, // Border plus prononcée pour le premium
    borderColor: COLORS.brand.goldOverlay, // rgba(255, 215, 0, 0.2)
    shadowColor: COLORS.shadow.premium,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  
  // ✅ Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  
  title: {
    color: COLORS.text.primary, // #FFFFFF
    fontSize: 18,
    fontWeight: '600',
  },
  
  // ✅ Loading state
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  
  loadingText: {
    color: COLORS.text.tertiary, // #B0B0B0
    fontSize: 14,
  },
  
  // ✅ Plan info
  planInfo: {
    marginBottom: 20,
  },
  
  planDescription: {
    color: COLORS.text.primary,
    fontSize: 16,
    lineHeight: 22,
  },
  
  // ✅ Usage section améliorée
  usageSection: {
    marginBottom: 20,
  },
  
  usageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  
  usageTitle: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  
  // ✅ Barre de progression avec design moderne
  usageBar: {
    height: 8, // Hauteur plus généreuse
    backgroundColor: COLORS.surface.divider, // #333333
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  
  usageProgress: {
    height: '100%',
    borderRadius: 4,
  },
  
  usageStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  usageText: {
    color: COLORS.text.primary,
    fontSize: 14,
  },
  
  usageRemaining: {
    color: COLORS.text.tertiary, // #B0B0B0
    fontSize: 14,
    fontWeight: '600',
  },
  
  // ✅ États d'usage avec couleurs Editia
  usageUnlimited: {
    color: COLORS.status.success, // #00FF88 (Vert Editia!)
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  usageWarning: {
    color: COLORS.status.warning, // #FF9500
  },
  
  usageError: {
    color: COLORS.status.error, // #FF3B30
  },
  
  limitReachedText: {
    color: COLORS.status.error,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  
  // ✅ Upgrade button avec Rouge Editia
  upgradeButton: {
    backgroundColor: COLORS.interactive.primary, // #FF0050 (Rouge Editia!)
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
    minHeight: 48, // Touch target accessible
    shadowColor: COLORS.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  
  upgradeButtonText: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  
  // ✅ Restore button amélioré
  restoreButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.surface.border, // rgba(255, 255, 255, 0.2)
    borderRadius: 12, // Radius cohérent
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 44, // Touch target accessible
  },
  
  restoreButtonText: {
    color: COLORS.text.disabled, // #808080
    fontSize: 12,
  },
});

/**
 * 🎨 RÉSUMÉ DE LA MIGRATION SUBSCRIPTION MANAGER:
 * 
 * ✅ COULEURS PRINCIPALES MIGRÉES:
 * • #007AFF (bleu) → #FF0050 (Rouge Editia) pour boutons upgrade et icônes principales
 * • #FFD700 → Maintenu comme couleur Or Editia pour Pro plan avec backgrounds légers
 * • #4CAF50 (vert) → #00FF88 (Vert Editia) pour barres de progression normales
 * • #ef4444 → #FF3B30 (Rouge système) pour les erreurs et limites atteintes
 * • #f59e0b → #FF9500 (Orange warning) pour les avertissements
 * • #888/#333 → Hiérarchie cohérente (#B0B0B0, #333333, #808080)
 * 
 * 📊 AMÉLIORATIONS BARRES DE PROGRESSION:
 * • Hauteur augmentée (6px → 8px) pour meilleure lisibilité
 * • Couleurs contextuelles: Vert pour normal, Orange pour warning, Rouge pour erreur
 * • Background cohérent avec surface.divider (#333333)
 * • States visuels renforcés (unlimited en vert, warning en orange)
 * 
 * 🚀 NOUVEAUTÉS:
 * • Pro container avec border Or et shadow premium
 * • Container principal avec elevation et borders cohérents
 * • Touch targets accessibles (44px minimum)
 * • Hiérarchie de couleurs respectée pour tous les états
 * • Progress bars avec couleurs intelligentes selon l'usage
 * 
 * 33 couleurs hardcodées → Interface de subscription cohérente Editia ✨
 */