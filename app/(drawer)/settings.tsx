import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
  RefreshControl,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Play,
  Search,
  Mic,
  CreditCard as Edit3,
  AlertCircle,
  FileText,
  Shield,
  BookUser,
} from 'lucide-react-native';
import AdminUsageControl from '@/components/AdminUsageControl';
import { SubscriptionManager } from '@/components/SubscriptionManager';
import { useClerkSupabaseClient } from '@/lib/config/supabase-clerk';
import UserProfileManager from '@/components/UserProfileManager';
import SupportPanel from '@/components/SupportPanel';
import { DebugPanel } from '@/components/DebugPanel';
import { sharedStyles } from '@/lib/constants/sharedStyles';

export default function SettingsScreen() {
  // ... (existing state and logic remains the same)
  const [refreshing, setRefreshing] = useState(false);
  const [userUsage, setUserUsage] = useState<any>(null);
  const [usageLoading, setUsageLoading] = useState(true);
  const [usageError, setUsageError] = useState<string | null>(null);
  const [testingPrompt, setTestingPrompt] = useState('');
  const [testingStatus, setTestingStatus] = useState(null);
  const [testingError, setTestingError] = useState(null);
  const [testingLoading, setTestingLoading] = useState(false);
  const [searchUserId, setSearchUserId] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [foundUserUsage, setFoundUserUsage] = useState<any>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const { client: supabase } = useClerkSupabaseClient();

  const fetchUserUsage = async () => {
    // ...
  };

  const onRefresh = useCallback(async () => {
    // ...
  }, []);

  const handleSearchUser = async () => {
    // ...
  };

  const openURL = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error('Failed to open URL:', err)
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
          />
        }
      >
        <UserProfileManager />
        <SubscriptionManager />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Création de Contenu</Text>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/(settings)/voice-clone')}
          >
            <View style={styles.settingInfo}>
              <Mic size={24} color="#fff" />
              <Text style={styles.settingText}>Clone Vocal</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/(settings)/editorial')}
          >
            <View style={styles.settingInfo}>
              <Edit3 size={24} color="#fff" />
              <Text style={styles.settingText}>Profil Éditorial</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/(settings)/video-settings')}
          >
            <View style={styles.settingInfo}>
              <Play size={24} color="#fff" />
              <Text style={styles.settingText}>Configuration Vidéo</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => openURL('https://editia.app/privacy-policy')}
          >
            <View style={styles.settingInfo}>
              <Shield size={24} color="#fff" />
              <Text style={styles.settingText}>Privacy Policy</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => openURL('https://editia.app/terms-of-service')}
          >
            <View style={styles.settingInfo}>
              <FileText size={24} color="#fff" />
              <Text style={styles.settingText}>Terms of Service</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => openURL('https://editia.app/payment-policy')}
          >
            <View style={styles.settingInfo}>
              <BookUser size={24} color="#fff" />
              <Text style={styles.settingText}>Payment Policy</Text>
            </View>
          </TouchableOpacity>
        </View>

        <SupportPanel />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Administration</Text>
          <View style={styles.adminContainer}>
            <Text style={styles.adminTitle}>
              Contrôle d&apos;Utilisation Utilisateur
            </Text>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                value={searchUserId}
                onChangeText={setSearchUserId}
                placeholder="ID Utilisateur"
                placeholderTextColor="#666"
              />
              <TouchableOpacity
                style={[
                  styles.searchButton,
                  searchLoading && styles.searchButtonDisabled,
                ]}
                onPress={handleSearchUser}
                disabled={searchLoading}
              >
                {searchLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Search size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
            {searchError && (
              <View style={styles.searchErrorContainer}>
                <AlertCircle size={16} color="#ef4444" />
                <Text style={styles.searchErrorText}>{searchError}</Text>
              </View>
            )}
            {foundUserUsage &&
              foundUserUsage.user_id &&
              foundUserUsage.videos_limit && (
                <AdminUsageControl
                  userId={foundUserUsage.user_id}
                  currentLimit={foundUserUsage.videos_limit}
                  onUpdate={handleSearchUser}
                />
              )}
          </View>
        </View>
        {__DEV__ && <DebugPanel />}
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#888',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: sharedStyles.sectionContainer.backgroundColor,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    color: '#fff',
    fontSize: 16,
  },
  adminContainer: {
    backgroundColor: '#4b5563',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  adminTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#fff',
    height: 44,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonDisabled: {
    opacity: 0.7,
  },
  searchErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D1116',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  searchErrorText: {
    color: '#ef4444',
    fontSize: 14,
    flex: 1,
  },
});
