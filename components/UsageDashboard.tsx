import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { BarChart3, AlertCircle } from 'lucide-react-native';
import { useRevenueCat } from '@/contexts/providers/RevenueCat';

type UsageData = {
  videos_generated: number;
  videos_limit: number;
};

type UsageDashboardProps = {
  usageData?: UsageData | null;
  forceRefresh?: boolean;
};

export default function UsageDashboard({
  usageData,
  forceRefresh = false,
}: UsageDashboardProps) {
  const {
    isReady,
    userUsage,
    videosRemaining,
    dynamicVideosLimit,
    isPro,
    refreshUsage,
  } = useRevenueCat();

  // Use RevenueCat data or prop data
  const usage =
    usageData ||
    (userUsage
      ? {
          videos_generated: userUsage.videos_generated,
          videos_limit: dynamicVideosLimit,
        }
      : null);

  useEffect(() => {
    // If we have forceRefresh and we're using RevenueCat data, refresh it
    if (forceRefresh && !usageData) {
      refreshUsage();
    }
  }, [forceRefresh, usageData, refreshUsage]);

  // Show loading if RevenueCat is not ready and we don't have prop data
  if (!isReady && !usageData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <BarChart3 size={24} color="#007AFF" />
          <Text style={styles.title}>Usage Dashboard</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.loadingText}>Loading usage data...</Text>
        </View>
      </View>
    );
  }

  if (!usage) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <BarChart3 size={24} color="#007AFF" />
          <Text style={styles.title}>Usage Dashboard</Text>
        </View>
        <Text style={styles.noDataText}>No usage data available</Text>
      </View>
    );
  }

  const usagePercentage = (usage.videos_generated / usage.videos_limit) * 100;
  const isNearLimit = usagePercentage >= 80;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BarChart3 size={24} color="#007AFF" />
        <Text style={styles.title}>Usage Dashboard</Text>
      </View>

      <View style={styles.usageContainer}>
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
            {usage.videos_generated} / {usage.videos_limit} videos generated
          </Text>
          <Text
            style={[styles.percentageText, isNearLimit && styles.warningText]}
          >
            {Math.round(usagePercentage)}% used
          </Text>
        </View>

        {isNearLimit && (
          <Text style={styles.warningMessage}>
            You're approaching your video generation limit. Consider upgrading
            for unlimited access.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  loadingText: {
    color: '#888',
    fontSize: 14,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2D1116',
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    flex: 1,
  },
  noDataText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 16,
  },
  usageContainer: {
    gap: 12,
  },
  usageBar: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
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
    color: '#fff',
    fontSize: 14,
  },
  percentageText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  warningText: {
    color: '#ef4444',
  },
  warningMessage: {
    color: '#f59e0b',
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
});
