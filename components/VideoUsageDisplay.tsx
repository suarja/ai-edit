import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Crown, Zap } from 'lucide-react-native';
import { useRevenueCat } from '@/contexts/providers/RevenueCat';

interface VideoUsageDisplayProps {
  onUpgradePress?: () => void;
  style?: any;
}

// Fallback prices when RevenueCat offerings can't be loaded
const FALLBACK_PRICES = {
  regular: '9,99€',
  earlyAdopter: '4,99€',
};

export const VideoUsageDisplay: React.FC<VideoUsageDisplayProps> = ({
  onUpgradePress,
  style,
}) => {
  const {
    currentPlan,
    videosRemaining,
    userUsage,
    presentPaywall,
    offerings,
    isReady,
    hasOfferingError,
  } = useRevenueCat();

  if (!isReady || !userUsage) {
    return (
      <View style={[styles.container, style]}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  const handleUpgrade = async () => {
    if (onUpgradePress) {
      onUpgradePress();
    } else {
      // If we have offering errors, show a custom alert instead of RevenueCat UI
      if (hasOfferingError) {
        Alert.alert(
          'Service temporairement indisponible',
          'Notre service de paiement est actuellement en maintenance. Veuillez réessayer plus tard.',
          [{ text: 'OK' }]
        );
        return;
      }

      await presentPaywall();
    }
  };

  if (currentPlan !== 'free') {
    return (
      <View style={[styles.container, styles.proContainer, style]}>
        <View style={styles.iconContainer}>
          <Crown size={20} color="#FFD700" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.proTitle}>Membre Premium</Text>
          <Text style={styles.proSubtitle}>
            {userUsage.videos_generated_limit - userUsage.videos_generated} vidéos restantes
            ce mois
          </Text>
        </View>
      </View>
    );
  }

  // Free user - show quota and upgrade option
  const isLimitReached = videosRemaining <= 0;

  // Get appropriate price to display (use fallback if there's an offering error)
  const priceToShow = offerings?.monthly?.product.priceString || FALLBACK_PRICES.regular;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.quotaSection}>
        <View style={styles.quotaInfo}>
          <Text style={styles.quotaTitle}>
            {videosRemaining} vidéo{videosRemaining !== 1 ? 's' : ''} restante
            {videosRemaining !== 1 ? 's' : ''}
          </Text>
          <Text style={styles.quotaSubtitle}>
            {userUsage.videos_generated}/{userUsage.videos_generated_limit} utilisées ce mois
          </Text>
        </View>

        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${
                    (userUsage.videos_generated / userUsage.videos_generated_limit) * 100
                  }%`,
                  backgroundColor: isLimitReached ? '#FF3B30' : '#007AFF',
                },
              ]}
            />
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.upgradeButton,
        ]}
        onPress={handleUpgrade}
      >
        <Zap size={16} color="#fff" />
        <Text style={styles.upgradeButtonText}>
          Passer Pro ({priceToShow})
        </Text>
      </TouchableOpacity>

      {isLimitReached && (
        <Text style={styles.limitReachedText}>
          Limite atteinte. Passez Pro pour continuer à créer des vidéos !
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  proContainer: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  proTitle: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '600',
  },
  proSubtitle: {
    color: '#888',
    fontSize: 14,
    marginTop: 2,
  },
  quotaSection: {
    marginBottom: 12,
  },
  quotaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quotaTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  quotaSubtitle: {
    color: '#888',
    fontSize: 14,
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  upgradeButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    position: 'relative',
  },
  earlyAdopterButton: {
    backgroundColor: '#FF6B35', // Orange pour early adopter
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  earlyAdopterBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  earlyAdopterBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  limitReachedText: {
    color: '#FF3B30',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  loadingText: {
    color: '#888',
    fontSize: 14,
    marginLeft: 8,
  },
});
