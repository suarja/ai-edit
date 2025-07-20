import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Crown, AlertTriangle } from 'lucide-react-native';
import { useRevenueCat } from '@/contexts/providers/RevenueCat';

interface DiscreteUsageDisplayProps {
  onUpgradePress?: () => void;
}

export const DiscreteUsageDisplay: React.FC<DiscreteUsageDisplayProps> = ({
  onUpgradePress,
}) => {
  const { currentPlan, videosRemaining, userUsage, isReady, presentPaywall } =
    useRevenueCat();

  if (!isReady || !userUsage) {
    return null;
  }

  const handleUpgrade = async () => {
    if (onUpgradePress) {
      onUpgradePress();
    } else {
      await presentPaywall();
    }
  };

  const isAtLimit = videosRemaining === 0;
  const isNearLimit = videosRemaining <= 1;

  // Ne pas afficher pour les utilisateurs payants avec des vidéos illimitées
  if (currentPlan !== 'free' && userUsage.videos_generated_limit === -1) {
    return null;
  }

  // Ne pas afficher pour les utilisateurs payants avec encore des vidéos
  if (currentPlan !== 'free' && videosRemaining > 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {currentPlan === 'free' ? (
          <>
            <View style={styles.iconContainer}>
              {isAtLimit ? (
                <AlertTriangle size={14} color="#ef4444" />
              ) : (
                <Crown size={14} color="#007AFF" />
              )}
            </View>
            <Text style={styles.usageText}>
              {isAtLimit
                ? 'Limite atteinte'
                : `${videosRemaining} vidéo${
                    videosRemaining !== 1 ? 's' : ''
                  } restante${videosRemaining !== 1 ? 's' : ''}`}
            </Text>
          </>
        ) : (
          <>
            <View style={styles.iconContainer}>
              <Crown size={14} color="#FFD700" />
            </View>
            <Text style={styles.usageText}>
              {videosRemaining} vidéo{videosRemaining !== 1 ? 's' : ''} restante
              {videosRemaining !== 1 ? 's' : ''}
            </Text>
          </>
        )}
      </View>

      {/* Show upgrade button only for free users who are near/at limit */}
      {currentPlan === 'free' && (isNearLimit || isAtLimit) && (
        <TouchableOpacity
          style={[
            styles.upgradeButton,
            isAtLimit && styles.upgradeButtonUrgent,
          ]}
          onPress={handleUpgrade}
        >
          <Text style={styles.upgradeButtonText}>
            {isAtLimit ? 'Débloquer' : 'Pro'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: 6,
  },
  usageText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  upgradeButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  upgradeButtonUrgent: {
    backgroundColor: '#ef4444',
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
});
