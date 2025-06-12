import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AdminUsageSettings from '@/components/AdminUsageSettings';
import { AlertTriangle } from 'lucide-react-native';
import { useClerkSupabaseClient } from '@/lib/supabase-clerk';
import { useGetUser } from '@/lib/hooks/useGetUser';

export default function AdminUsageSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const { client: supabase } = useClerkSupabaseClient();
  const { fetchUser } = useGetUser();

  useEffect(() => {
    async function checkAdminAccess() {
      try {
        const user = await fetchUser();

        if (!user) {
          // Redirect to login if not authenticated
          router.replace('/(auth)/sign-in');
          return;
        }

        // Check if user has admin role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();

        if (!roleError && roleData) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Error checking admin access:', error);
      } finally {
        setLoading(false);
      }
    }

    checkAdminAccess();
  }, [fetchUser, supabase]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Checking admin access...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.unauthorizedContainer}>
          <AlertTriangle size={48} color="#ef4444" />
          <Text style={styles.unauthorizedTitle}>Access Denied</Text>
          <Text style={styles.unauthorizedText}>
            You do not have admin privileges to access this page.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AdminUsageSettings />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#888',
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  unauthorizedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ef4444',
    marginTop: 16,
    marginBottom: 8,
  },
  unauthorizedText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
});
