import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';
import { BarChart3, AlertCircle } from 'lucide-react-native';
import {
  reportDatabaseError,
  reportAuthError,
} from '@/lib/services/errorReporting';

type UsageData = {
  videos_generated: number;
  videos_limit: number;
};

export default function UsageDashboard() {
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsageData();
  }, []);

  const fetchUsageData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        reportAuthError(error, {
          screen: 'UsageDashboard',
          action: 'get_user',
        });
        throw error;
      }

      if (!data.user) {
        const authError = new Error('No user found');
        reportAuthError(authError, {
          screen: 'UsageDashboard',
          action: 'no_user',
        });
        throw authError;
      }

      // Get usage data
      const { data: usageData, error: usageError } = await supabase
        .from('user_usage')
        .select('videos_generated, videos_limit')
        .eq('user_id', data.user.id)
        .single();

      if (usageError) {
        if (usageError.code === 'PGRST116') {
          // No usage record found, create one
          await createUsageRecord(data.user.id);
          return;
        }

        reportDatabaseError(
          usageError,
          'SELECT videos_generated, videos_limit FROM user_usage WHERE user_id = $1',
          {
            screen: 'UsageDashboard',
            action: 'fetch_usage',
            userId: data.user.id,
          }
        );
        throw usageError;
      }

      setUsage(usageData);
    } catch (err: any) {
      console.error('Error fetching usage data:', err);
      setError('Failed to load usage data');
    } finally {
      setLoading(false);
    }
  };

  const createUsageRecord = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_usage')
        .insert([
          {
            user_id: userId,
            videos_generated: 0,
            videos_limit: 5, // Default limit for new users
          },
        ])
        .select('videos_generated, videos_limit')
        .single();

      if (error) {
        reportDatabaseError(
          error,
          'INSERT INTO user_usage (user_id, videos_generated, videos_limit) VALUES ($1, $2, $3)',
          {
            screen: 'UsageDashboard',
            action: 'create_usage_record',
            userId: userId,
          }
        );
        throw error;
      }

      setUsage(data);
    } catch (err: any) {
      console.error('Error creating usage record:', err);
      setError('Failed to initialize usage tracking');
    }
  };

  if (loading) {
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

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <BarChart3 size={24} color="#007AFF" />
          <Text style={styles.title}>Usage Dashboard</Text>
        </View>
        <View style={styles.errorContainer}>
          <AlertCircle size={20} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
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
