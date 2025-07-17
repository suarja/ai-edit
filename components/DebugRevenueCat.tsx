import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRevenueCat } from '@/contexts/providers/RevenueCat';

interface DebugRevenueCatProps {
  visible?: boolean;
}

export const DebugRevenueCat: React.FC<DebugRevenueCatProps> = ({
  visible = true,
}) => {
  const {
    isPro,
    isReady,
    hasOfferingError,
    isDevMode,
    userUsage,
    videosRemaining,
    dynamicVideosLimit,
    goPro,
    refreshUsage,
  } = useRevenueCat();

  // Only show in development mode
  if (!isDevMode || !visible) {
    return null;
  }

  const handleTogglePro = async () => {
    if (hasOfferingError) {
      // This will trigger the development mode simulation
      await goPro();
    } else {
      Alert.alert(
        'RevenueCat Debug',
        'RevenueCat fonctionne normalement. Utilisez la paywall normale.'
      );
    }
  };

  const handleRefreshUsage = async () => {
    await refreshUsage();
    Alert.alert('Debug', 'Usage rechargé depuis la base de données');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔧 RevenueCat Debug</Text>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Status: {isReady ? '✅ Ready' : '⏳ Loading'}
        </Text>
        <Text style={styles.infoText}>Pro: {isPro ? '✅ Yes' : '❌ No'}</Text>
        <Text style={styles.infoText}>
          Offering Error: {hasOfferingError ? '⚠️ Yes' : '✅ No'}
        </Text>
        <Text style={styles.infoText}>
          Videos: {videosRemaining}/{dynamicVideosLimit}
        </Text>
        {userUsage && (
          <Text style={styles.infoText}>
            Generated: {userUsage.videos_generated}
          </Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleTogglePro}
          disabled={!hasOfferingError}
        >
          <Text style={styles.buttonText}>
            {hasOfferingError ? 'Simulate Pro' : 'Use Real Paywall'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleRefreshUsage}
        >
          <Text style={styles.buttonText}>Refresh Usage</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.note}>
        Ce panel n'apparaît qu'en mode développement
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#FF6B6B',
    zIndex: 1000,
  },
  title: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  infoContainer: {
    marginBottom: 12,
  },
  infoText: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
  },
  secondaryButton: {
    backgroundColor: '#4ECDC4',
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  note: {
    color: '#888',
    fontSize: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
