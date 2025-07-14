import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  Crown,
  Zap,
  Check,
  RotateCcw,
  BarChart3,
  Star,
} from 'lucide-react-native';
import { useRevenueCat } from '@/providers/RevenueCat';
import { sharedStyles } from '@/constants/sharedStyles';

interface SubscriptionManagerProps {
  style?: any;
}

export const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({
  style,
}) => {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const {
    isPro,
    isReady,
    userUsage,
    videosRemaining,
    goPro,
    restorePurchases,
    hasOfferingError,
    currentPlan,
    dynamicVideosLimit,
    plans,
    currentOffering,
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

      const success = await goPro();
      if (success) {
        Alert.alert(
          'Félicitations! 🎉',
          'Vous êtes maintenant membre Premium. Profitez de toutes les fonctionnalités!',
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

  const usagePercentage =
    (userUsage.videos_generated / dynamicVideosLimit) * 100;
  const isNearLimit = usagePercentage >= 80;

  const proPlan = plans.pro;
  const freePlan = plans.free;

  const priceToShow = currentOffering?.monthly?.product.priceString || 'N/A';

  if (isPro) {
    return (
      <View style={[styles.container, styles.proContainer, style]}>
        <View style={styles.header}>
          <Crown size={24} color="#FFD700" />
          <Text style={styles.title}>Abonnement Premium</Text>
        </View>

        <View style={styles.planInfo}>
          <View style={styles.planHeader}>
            <View style={styles.planBadge}>
              <Star size={16} color="#FFD700" />
              <Text style={styles.planBadgeText}>{proPlan.name}</Text>
            </View>
            <Text style={styles.planPrice}>{priceToShow}/mois</Text>
          </View>

          <View style={styles.featuresList}>
            {proPlan.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Check size={16} color="#4CAF50" />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
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
                  width: `${Math.min(usagePercentage, 100)}%`,
                  backgroundColor: isNearLimit ? '#f59e0b' : '#4CAF50',
                },
              ]}
            />
          </View>

          <View style={styles.usageStats}>
            <Text style={styles.usageText}>
              {userUsage.videos_generated} / {dynamicVideosLimit} vidéos
              utilisées
            </Text>
            <Text style={styles.usageRemaining}>
              {videosRemaining} restantes
            </Text>
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
              <Text style={styles.restoreButtonText}>Restaurer les achats</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Crown size={24} color="#007AFF" />
        <Text style={styles.title}>Abonnement</Text>
      </View>

      <View style={styles.freePlanInfo}>
        <View style={styles.freePlanHeader}>
          <Text style={styles.freePlanTitle}>{freePlan.name}</Text>
          <Text style={styles.freePlanSubtitle}>
            Débloquez plus de possibilités avec Premium
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
                  width: `${Math.min(usagePercentage, 100)}%`,
                  backgroundColor: isNearLimit ? '#ef4444' : '#007AFF',
                },
              ]}
            />
          </View>

          <View style={styles.usageStats}>
            <Text style={styles.usageText}>
              {userUsage.videos_generated} / {dynamicVideosLimit} vidéos
              utilisées
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
              Limite atteinte! Passez Premium pour continuer.
            </Text>
          )}
        </View>

        <View style={styles.upgradeSection}>
          <Text style={styles.upgradeTitle}>Passez à {proPlan.name}</Text>

          {/* <View style={styles.premiumFeatures}>
            {proPlan.map((feature, index) => (
              <View key={index} style={styles.premiumFeature}>
                <Zap size={16} color="#007AFF" />
                <Text style={styles.premiumFeatureText}>{feature}</Text>
              </View>
            ))}
          </View> */}

          <TouchableOpacity
            style={[styles.upgradeButton, isUpgrading && styles.disabledButton]}
            onPress={handleUpgrade}
            disabled={isUpgrading}
          >
            {isUpgrading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Zap size={16} color="#fff" />
                <Text style={styles.upgradeButtonText}>
                  Passer Premium ({priceToShow})
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
      </View>
    </View>
  );
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
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  planBadgeText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
  },
  planPrice: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '600',
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    color: '#fff',
    fontSize: 14,
  },
  freePlanInfo: {
    marginBottom: 20,
  },
  freePlanHeader: {
    marginBottom: 16,
  },
  freePlanTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  freePlanSubtitle: {
    color: '#888',
    fontSize: 14,
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
  upgradeSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  upgradeTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  premiumFeatures: {
    gap: 8,
    marginBottom: 16,
  },
  premiumFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  premiumFeatureText: {
    color: '#888',
    fontSize: 14,
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
    position: 'relative',
  },
  disabledButton: {
    opacity: 0.6,
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
