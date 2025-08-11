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
import { sharedStyles, SHARED_STYLE_COLORS } from '@/lib/constants/sharedStyles';

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
          <Crown size={24} color={SHARED_STYLE_COLORS.primary} />
          <Text style={styles.title}>Abonnement</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={SHARED_STYLE_COLORS.primary} />
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
          'Les forfaits d\'abonnement ne peuvent pas être chargés actuellement en raison d\'une maintenance. Veuillez réessayer dans quelques minutes.',
          [{ text: 'Compris' }]
        );
        return;
      }

      const success = await presentPaywall();
      if (success) {
        Alert.alert(
          'Abonnement activé',
          'Votre abonnement premium a été activé avec succès. Vous avez maintenant accès à toutes les fonctionnalités premium.',
          [{ text: 'Continuer' }]
        );
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      Alert.alert(
        'Erreur d\'abonnement',
        'L\'activation de votre abonnement a rencontré un problème. Aucun montant n\'a été débité. Veuillez vérifier votre connexion et réessayer.',
        [{ text: 'Compris' }]
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
          'Abonnements restaurés',
          'Vos abonnements ont été restaurés avec succès. Toutes les fonctionnalités premium sont maintenant disponibles.',
          [{ text: 'Continuer' }]
        );
      } else {
        Alert.alert(
          'Aucun abonnement à restaurer',
          'Aucun abonnement premium n\'a été trouvé pour cet identifiant Apple. Si vous avez effectué un achat, vérifiez que vous êtes connecté avec le bon compte Apple.',
          [{ text: 'Compris' }]
        );
      }
    } catch (error) {
      console.error('Restore error:', error);
      Alert.alert(
        'Erreur de restauration',
        'Impossible de restaurer vos abonnements depuis l\'App Store. Vérifiez votre connexion internet et réessayez.',
        [{ text: 'Compris' }]
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
              <Crown size={24} color={SHARED_STYLE_COLORS.accent} />
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
                <BarChart3 size={20} color={SHARED_STYLE_COLORS.primary} />
                <Text style={styles.usageTitle}>Utilisation ce mois</Text>
              </View>
              <View style={styles.usageStats}>
                <Text style={styles.usageText}>
                  {userUsage.videos_generated} vidéos générées
                </Text>
                <Text style={styles.usageRemaining}>Illimité</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.restoreButton}
              onPress={handleRestore}
              disabled={isRestoring}
            >
              {isRestoring ? (
                <ActivityIndicator size="small" color={SHARED_STYLE_COLORS.textMuted} />
              ) : (
                <>
                  <RotateCcw size={16} color={SHARED_STYLE_COLORS.textMuted} />
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
              <Crown size={24} color={SHARED_STYLE_COLORS.primary} />
              <Text style={styles.title}>Plan Créateur</Text>
            </View>
            <View style={styles.planInfo}>
              <Text style={styles.planDescription}>
                Plan Créateur: {videosRemaining} vidéos restantes ce mois.
              </Text>
            </View>
            <View style={styles.usageSection}>
              <View style={styles.usageHeader}>
                <BarChart3 size={20} color={SHARED_STYLE_COLORS.primary} />
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
                        videosRemaining <= 3 ? SHARED_STYLE_COLORS.warning : SHARED_STYLE_COLORS.success,
                    },
                  ]}
                />
              </View>
              <View style={styles.usageStats}>
                <Text style={styles.usageText}>
                  {userUsage.videos_generated} /{' '}
                  {userUsage.videos_generated_limit} vidéos utilisées
                </Text>
                <Text style={styles.usageRemaining}>
                  {videosRemaining} restantes
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={handleUpgrade}
              disabled={isUpgrading}
            >
              {isUpgrading ? (
                <ActivityIndicator size="small" color={SHARED_STYLE_COLORS.text} />
              ) : (
                <>
                  <Zap size={16} color={SHARED_STYLE_COLORS.text} />
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
            >
              {isRestoring ? (
                <ActivityIndicator size="small" color={SHARED_STYLE_COLORS.textMuted} />
              ) : (
                <>
                  <RotateCcw size={16} color={SHARED_STYLE_COLORS.textMuted} />
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
              <Crown size={24} color={SHARED_STYLE_COLORS.primary} />
              <Text style={styles.title}>Plan Découverte</Text>
            </View>
            <View style={styles.planInfo}>
              <Text style={styles.planDescription}>
                Plan Découverte: {videosRemaining} vidéos restantes ce mois.
              </Text>
            </View>
            <View style={styles.usageSection}>
              <View style={styles.usageHeader}>
                <BarChart3 size={20} color={SHARED_STYLE_COLORS.primary} />
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
                        videosRemaining === 0 ? SHARED_STYLE_COLORS.error : SHARED_STYLE_COLORS.primary,
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
                    videosRemaining === 0 && styles.usageWarning,
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
            >
              {isUpgrading ? (
                <ActivityIndicator size="small" color={SHARED_STYLE_COLORS.text} />
              ) : (
                <>
                  <Zap size={16} color={SHARED_STYLE_COLORS.text} />
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
            >
              {isRestoring ? (
                <ActivityIndicator size="small" color={SHARED_STYLE_COLORS.textMuted} />
              ) : (
                <>
                  <RotateCcw size={16} color={SHARED_STYLE_COLORS.textMuted} />
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
  container: {
    backgroundColor: sharedStyles.sectionContainer.backgroundColor,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  proContainer: {
    backgroundColor: SHARED_STYLE_COLORS.primaryOverlay,
    borderWidth: 1,
    borderColor: SHARED_STYLE_COLORS.primaryBorder,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  title: {
    color: SHARED_STYLE_COLORS.text,
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  loadingText: {
    color: SHARED_STYLE_COLORS.textMuted,
    fontSize: 14,
  },
  planInfo: {
    marginBottom: 20,
  },
  planDescription: {
    color: SHARED_STYLE_COLORS.text,
    fontSize: 16,
    lineHeight: 22,
  },
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
    color: SHARED_STYLE_COLORS.text,
    fontSize: 16,
    fontWeight: '500',
  },
  usageBar: {
    height: 6,
    backgroundColor: SHARED_STYLE_COLORS.backgroundTertiary,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  usageProgress: {
    height: '100%',
    borderRadius: 3,
  },
  usageStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  usageText: {
    color: SHARED_STYLE_COLORS.text,
    fontSize: 14,
  },
  usageRemaining: {
    color: SHARED_STYLE_COLORS.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  usageWarning: {
    color: SHARED_STYLE_COLORS.error,
  },
  limitReachedText: {
    color: SHARED_STYLE_COLORS.error,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  upgradeButton: {
    backgroundColor: SHARED_STYLE_COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  upgradeButtonText: {
    color: SHARED_STYLE_COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  restoreButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: SHARED_STYLE_COLORS.backgroundTertiary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  restoreButtonText: {
    color: SHARED_STYLE_COLORS.textMuted,
    fontSize: 12,
  },
});
