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
import { sharedStyles } from '@/lib/constants/sharedStyles';

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
          <Crown size={24} color="#007AFF" />
          <Text style={styles.title}>Abonnement</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
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
              <Crown size={24} color="#FFD700" />
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
                <BarChart3 size={20} color="#007AFF" />
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
                <ActivityIndicator size="small" color="#888" />
              ) : (
                <>
                  <RotateCcw size={16} color="#888" />
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
              <Crown size={24} color="#007AFF" />
              <Text style={styles.title}>Plan Créateur</Text>
            </View>
            <View style={styles.planInfo}>
              <Text style={styles.planDescription}>
                Plan Créateur: {videosRemaining} vidéos restantes ce mois.
              </Text>
            </View>
            <View style={styles.usageSection}>
              <View style={styles.usageHeader}>
                <BarChart3 size={20} color="#007AFF" />
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
                        videosRemaining <= 3 ? '#f59e0b' : '#4CAF50',
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
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Zap size={16} color="#fff" />
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
                <ActivityIndicator size="small" color="#888" />
              ) : (
                <>
                  <RotateCcw size={16} color="#888" />
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
              <Crown size={24} color="#007AFF" />
              <Text style={styles.title}>Plan Découverte</Text>
            </View>
            <View style={styles.planInfo}>
              <Text style={styles.planDescription}>
                Plan Découverte: {videosRemaining} vidéos restantes ce mois.
              </Text>
            </View>
            <View style={styles.usageSection}>
              <View style={styles.usageHeader}>
                <BarChart3 size={20} color="#007AFF" />
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
                        videosRemaining === 0 ? '#ef4444' : '#007AFF',
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
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Zap size={16} color="#fff" />
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
                <ActivityIndicator size="small" color="#888" />
              ) : (
                <>
                  <RotateCcw size={16} color="#888" />
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
    marginVertical: 8,
  },
  proContainer: {
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  title: {
    color: '#fff',
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
    color: '#888',
    fontSize: 14,
  },
  planInfo: {
    marginBottom: 20,
  },
  planDescription: {
    color: '#fff',
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
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  usageBar: {
    height: 6,
    backgroundColor: '#333',
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
    color: '#fff',
    fontSize: 14,
  },
  usageRemaining: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  usageWarning: {
    color: '#ef4444',
  },
  limitReachedText: {
    color: '#ef4444',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  upgradeButton: {
    backgroundColor: '#007AFF',
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
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  restoreButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  restoreButtonText: {
    color: '#888',
    fontSize: 12,
  },
});
