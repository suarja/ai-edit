import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

type UsageData = {
  videosGenerated: number;
  videosLimit: number;
  usagePercentage: number;
  nextResetDate: string;
  remainingVideos: number;
};

export default function UsageDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);

  useEffect(() => {
    async function fetchUsage() {
      try {
        setLoading(true);
        setError(null);

        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          throw new Error('User not authenticated');
        }

        // Fetch usage data
        const { data, error } = await supabase
          .from('user_usage')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        // If no usage record exists, create one
        if (error && error.code === 'PGRST116') {
          console.log('No usage record found, creating one...');

          // Create a new usage record
          const { data: newData, error: insertError } = await supabase
            .from('user_usage')
            .insert({
              user_id: user.id,
              videos_generated: 0,
              videos_limit: 5,
              last_reset_date: new Date().toISOString(),
              next_reset_date: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000
              ).toISOString(),
            })
            .select()
            .single();

          if (insertError) throw insertError;

          // Use the newly created record
          setUsage({
            videosGenerated: newData.videos_generated,
            videosLimit: newData.videos_limit,
            usagePercentage: 0,
            nextResetDate: new Date(
              newData.next_reset_date
            ).toLocaleDateString(),
            remainingVideos: newData.videos_limit,
          });
        } else if (error) {
          throw error;
        } else if (data) {
          setUsage({
            videosGenerated: data.videos_generated,
            videosLimit: data.videos_limit,
            usagePercentage: Math.round(
              (data.videos_generated / data.videos_limit) * 100
            ),
            nextResetDate: new Date(data.next_reset_date).toLocaleDateString(),
            remainingVideos: Math.max(
              0,
              data.videos_limit - data.videos_generated
            ),
          });
        }
      } catch (err: any) {
        console.error('Error fetching usage:', err);
        setError(err.message || 'Failed to load usage data');
      } finally {
        setLoading(false);
      }
    }

    fetchUsage();

    // Set up a refresh interval every 5 minutes
    const intervalId = setInterval(() => fetchUsage(), 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading usage data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <AlertCircle size={24} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  if (!usage) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No usage data available</Text>
      </View>
    );
  }

  // Determine status icon and color based on usage percentage
  const getStatusInfo = () => {
    const percentage = usage.usagePercentage;

    if (percentage >= 90) {
      return {
        icon: <AlertTriangle size={20} color="#FF3B30" />,
        color: '#FF3B30',
        text: 'Almost at limit',
      };
    } else if (percentage >= 70) {
      return {
        icon: <AlertTriangle size={20} color="#FF9500" />,
        color: '#FF9500',
        text: 'Approaching limit',
      };
    } else {
      return {
        icon: <CheckCircle size={20} color="#34C759" />,
        color: '#34C759',
        text: 'Good standing',
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Video Generation Usage</Text>

      <View style={styles.statusContainer}>
        {statusInfo.icon}
        <Text style={[styles.statusText, { color: statusInfo.color }]}>
          {statusInfo.text}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {usage.videosGenerated} / {usage.videosLimit} videos used
        </Text>

        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${usage.usagePercentage}%`,
                backgroundColor: statusInfo.color,
              },
            ]}
          />
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Remaining:</Text>
          <Text style={styles.infoValue}>{usage.remainingVideos} videos</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Next reset:</Text>
          <Text style={styles.infoValue}>{usage.nextResetDate}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    marginTop: 8,
  },
  statsText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#333333',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#999999',
  },
  infoValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
  },
  loadingText: {
    marginTop: 8,
    color: '#FFFFFF',
    fontSize: 14,
  },
});
