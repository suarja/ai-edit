import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

type UsageData = {
  videos_generated: number;
  videos_limit: number;
  next_reset_date: string;
};

export default function UsageDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Get the current user
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        setUser(data.user);
      } catch (err: any) {
        console.error('Error fetching user:', err);
        setError('Failed to fetch user data');
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchUsageData = async () => {
      try {
        setLoading(true);

        // First check if user is an admin
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();

        if (!roleError && roleData) {
          setIsAdmin(true);
        }

        // Fetch usage data
        const { data, error } = await supabase
          .from('user_usage')
          .select('videos_generated, videos_limit, next_reset_date')
          .eq('user_id', user.id)
          .single();

        if (error) {
          // If no row found, create a new usage record
          if (error.code === 'PGRST116') {
            await createUsageRecord(user.id);
            return;
          }
          throw error;
        }

        setUsageData(data);
      } catch (err: any) {
        console.error('Error fetching usage data:', err);
        setError('Failed to fetch usage information');
      } finally {
        setLoading(false);
      }
    };

    fetchUsageData();
  }, [user]);

  const createUsageRecord = async (userId: string) => {
    try {
      // Create a new usage record for this user
      const { data, error } = await supabase
        .from('user_usage')
        .insert([
          {
            user_id: userId,
            videos_generated: 0,
            videos_limit: 5,
          },
        ])
        .select('videos_generated, videos_limit, next_reset_date')
        .single();

      if (error) throw error;

      setUsageData(data);
    } catch (err: any) {
      console.error('Error creating usage record:', err);
      setError('Failed to initialize usage information');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading usage information...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!usageData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No usage information available</Text>
      </View>
    );
  }

  const usagePercentage = Math.min(
    100,
    Math.round((usageData.videos_generated / usageData.videos_limit) * 100)
  );

  const daysUntilReset = () => {
    const now = new Date();
    const resetDate = new Date(usageData.next_reset_date);
    const diffTime = Math.abs(resetDate.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Video Generation Usage</Text>
          {isAdmin && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>Admin</Text>
            </View>
          )}
        </View>

        <View style={styles.usageContainer}>
          <View style={styles.usageTextContainer}>
            <Text style={styles.usageCount}>
              {usageData.videos_generated} / {usageData.videos_limit}
            </Text>
            <Text style={styles.usageLabel}>Videos Generated This Month</Text>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${usagePercentage}%` },
                  usagePercentage >= 90 && styles.progressWarning,
                  usagePercentage >= 100 && styles.progressDanger,
                ]}
              />
            </View>
            <Text style={styles.progressText}>{usagePercentage}% used</Text>
          </View>
        </View>

        <View style={styles.resetContainer}>
          <Text style={styles.resetText}>
            Resets in {daysUntilReset()} days on{' '}
            {formatDate(usageData.next_reset_date)}
          </Text>
        </View>

        {isAdmin && (
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              As an admin, you can adjust usage limits in the admin panel.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  adminBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adminBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  usageContainer: {
    marginBottom: 16,
  },
  usageTextContainer: {
    marginBottom: 8,
  },
  usageCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  usageLabel: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981', // Green
    borderRadius: 4,
  },
  progressWarning: {
    backgroundColor: '#f59e0b', // Amber
  },
  progressDanger: {
    backgroundColor: '#ef4444', // Red
  },
  progressText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    textAlign: 'right',
  },
  resetContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#222',
    borderRadius: 8,
  },
  resetText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
  },
  infoContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  infoText: {
    fontSize: 14,
    color: '#fff',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
  },
});
