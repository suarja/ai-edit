import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BarChart3, Crown, AlertTriangle } from 'lucide-react-native';
import { useRevenueCat } from '@/providers/RevenueCat';

interface DiscreteUsageDisplayProps {
  onUpgradePress?: () => void;
}

export const DiscreteUsageDisplay: React.FC<DiscreteUsageDisplayProps> = ({
  onUpgradePress,
}) => {
  const {
    isPro,
    videosRemaining,
    userUsage,
    isReady,
    dynamicVideosLimit,
    goPro,
  } = useRevenueCat();

  if (!isReady || !userUsage) {
    return null;
  }

  const handleUpgrade = async () => {
    if (onUpgradePress) {
      onUpgradePress();
    } else {
      await goPro();
    }
  };

  const usagePercentage =
    (userUsage.videos_generated / dynamicVideosLimit) * 100;
  const isNearLimit = usagePercentage >= 80;
  const isAtLimit = videosRemaining === 0;

  return (
    <View style={styles.container}>
      <View style={styles.usageInfo}>
        <View style={styles.iconContainer}>
          {isPro ? (
            <Crown size={16} color="#FFD700" />
          ) : isAtLimit ? (
            <AlertTriangle size={16} color="#ef4444" />
          ) : (
            <BarChart3 size={16} color="#007AFF" />
          )}
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.usageText}>
            {isPro ? 'Premium' : 'Gratuit'} • {videosRemaining} vidéo
            {videosRemaining !== 1 ? 's' : ''} restante
            {videosRemaining !== 1 ? 's' : ''}
          </Text>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(usagePercentage, 100)}%`,
                    backgroundColor: isAtLimit
                      ? '#ef4444'
                      : isNearLimit
                      ? '#f59e0b'
                      : isPro
                      ? '#4CAF50'
                      : '#007AFF',
                  },
                ]}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Show upgrade button only for free users who are near/at limit */}
      {!isPro && (isNearLimit || isAtLimit) && (
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
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  usageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
  },
  usageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  progressContainer: {
    width: '100%',
  },
  progressBar: {
    height: 3,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 12,
  },
  upgradeButtonUrgent: {
    backgroundColor: '#ef4444',
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
