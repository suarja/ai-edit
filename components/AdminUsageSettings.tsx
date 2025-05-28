import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { Shield, CheckCircle, XCircle, User } from 'lucide-react-native';

export default function AdminUsageSettings() {
  const [email, setEmail] = useState('');
  const [newLimit, setNewLimit] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    message: string;
    userData?: any;
  } | null>(null);

  const findUser = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      // First verify that the current user is an admin
      const { data: currentUser } = await supabase.auth.getUser();
      const { data: adminCheck, error: adminError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', currentUser.user?.id)
        .eq('role', 'admin')
        .single();

      if (adminError || !adminCheck) {
        setResult({
          success: false,
          message: 'You do not have admin privileges to perform this action',
        });
        return;
      }

      // Look up the target user
      const { data: userData, error: userError } = await supabase
        .from('auth.users')
        .select('id, email, created_at')
        .eq('email', email.trim())
        .single();

      if (userError || !userData) {
        setResult({
          success: false,
          message: `No user found with email: ${email}`,
        });
        return;
      }

      // Get the user's usage data
      const { data: usageData, error: usageError } = await supabase
        .from('user_usage')
        .select('*')
        .eq('user_id', userData.id)
        .single();

      // If no usage record, return the user info anyway
      if (usageError && usageError.code !== 'PGRST116') {
        setResult({
          success: false,
          message: `Error fetching usage data: ${usageError.message}`,
        });
        return;
      }

      setResult({
        success: true,
        message: 'User found',
        userData: {
          ...userData,
          usage: usageData || { videos_generated: 0, videos_limit: 0 },
        },
      });
    } catch (error: any) {
      setResult({
        success: false,
        message: `Error: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateLimit = async () => {
    if (!result?.userData?.id) {
      Alert.alert('Error', 'Please find a user first');
      return;
    }

    const limit = parseInt(newLimit);
    if (isNaN(limit) || limit < 0) {
      Alert.alert('Error', 'Please enter a valid limit (0 or higher)');
      return;
    }

    try {
      setLoading(true);

      // Check if user has a usage record
      const { data: existingUsage, error: checkError } = await supabase
        .from('user_usage')
        .select('id')
        .eq('user_id', result.userData.id)
        .single();

      if (checkError && checkError.code === 'PGRST116') {
        // Create a new usage record
        const { error: insertError } = await supabase
          .from('user_usage')
          .insert({
            user_id: result.userData.id,
            videos_generated: 0,
            videos_limit: limit,
          });

        if (insertError) throw insertError;
      } else {
        // Update existing record
        const { error: updateError } = await supabase
          .from('user_usage')
          .update({ videos_limit: limit })
          .eq('user_id', result.userData.id);

        if (updateError) throw updateError;
      }

      // Refresh user data
      findUser();
      setNewLimit('');

      Alert.alert(
        'Success',
        `Updated limit for ${email} to ${limit} videos per month`
      );
    } catch (error: any) {
      Alert.alert('Error', `Failed to update limit: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetUsage = async () => {
    if (!result?.userData?.id) {
      Alert.alert('Error', 'Please find a user first');
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from('user_usage')
        .update({
          videos_generated: 0,
          last_reset_date: new Date().toISOString(),
          next_reset_date: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
        })
        .eq('user_id', result.userData.id);

      if (error) throw error;

      // Refresh user data
      findUser();

      Alert.alert('Success', `Reset usage for ${email}`);
    } catch (error: any) {
      Alert.alert('Error', `Failed to reset usage: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Shield size={24} color="#007AFF" />
        <Text style={styles.title}>Admin Usage Settings</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Find User</Text>
        <Text style={styles.description}>
          Enter a user's email to view or modify their usage limits
        </Text>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder="User email"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={findUser}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Search</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.loadingText}>Processing...</Text>
          </View>
        )}

        {result && (
          <View
            style={[
              styles.resultContainer,
              result.success ? styles.successContainer : styles.errorContainer,
            ]}
          >
            {result.success ? (
              <CheckCircle size={20} color="#10b981" />
            ) : (
              <XCircle size={20} color="#ef4444" />
            )}
            <Text
              style={[
                styles.resultText,
                result.success ? styles.successText : styles.errorText,
              ]}
            >
              {result.message}
            </Text>
          </View>
        )}

        {result?.userData && (
          <View style={styles.userInfoContainer}>
            <View style={styles.userHeader}>
              <User size={20} color="#fff" />
              <Text style={styles.userEmail}>{result.userData.email}</Text>
            </View>

            <View style={styles.usageInfo}>
              <View style={styles.usageRow}>
                <Text style={styles.usageLabel}>Current Usage:</Text>
                <Text style={styles.usageValue}>
                  {result.userData.usage.videos_generated} /{' '}
                  {result.userData.usage.videos_limit} videos
                </Text>
              </View>

              {result.userData.usage.next_reset_date && (
                <View style={styles.usageRow}>
                  <Text style={styles.usageLabel}>Next Reset:</Text>
                  <Text style={styles.usageValue}>
                    {new Date(
                      result.userData.usage.next_reset_date
                    ).toLocaleDateString()}
                  </Text>
                </View>
              )}

              <View style={styles.actionContainer}>
                <View style={styles.limitInputContainer}>
                  <Text style={styles.actionLabel}>New Limit:</Text>
                  <TextInput
                    style={styles.limitInput}
                    placeholder="10"
                    placeholderTextColor="#666"
                    value={newLimit}
                    onChangeText={setNewLimit}
                    keyboardType="number-pad"
                  />
                </View>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={updateLimit}
                  disabled={loading}
                >
                  <Text style={styles.actionButtonText}>Update Limit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.resetButton]}
                  onPress={resetUsage}
                  disabled={loading}
                >
                  <Text style={styles.actionButtonText}>Reset Usage</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  card: {
    margin: 16,
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: '#333',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  loadingText: {
    color: '#888',
  },
  resultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  successContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  resultText: {
    fontSize: 14,
  },
  successText: {
    color: '#10b981',
  },
  errorText: {
    color: '#ef4444',
  },
  userInfoContainer: {
    backgroundColor: '#222',
    borderRadius: 8,
    overflow: 'hidden',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#333',
    gap: 8,
  },
  userEmail: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  usageInfo: {
    padding: 12,
  },
  usageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  usageLabel: {
    color: '#888',
  },
  usageValue: {
    color: '#fff',
    fontWeight: '500',
  },
  actionContainer: {
    marginTop: 16,
    gap: 12,
  },
  limitInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionLabel: {
    color: '#888',
    width: 80,
  },
  limitInput: {
    flex: 1,
    backgroundColor: '#333',
    color: '#fff',
    padding: 8,
    borderRadius: 6,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#666',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
