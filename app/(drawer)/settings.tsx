import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  TextInput,
  RefreshControl,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  LogOut,
  CircleAlert as AlertCircle,
  Check,
  X,
  Mic,
  CreditCard as Edit3,
  Bug,
  Play,
  Wand as Wand2,
  Search,
} from 'lucide-react-native';
import AdminUsageControl from '@/components/AdminUsageControl';
import { SubscriptionManager } from '@/components/SubscriptionManager';
import { useClerkSupabaseClient } from '@/lib/supabase-clerk';
import { useGetUser } from '@/lib/hooks/useGetUser';
import UserProfileManager from '@/components/UserProfileManager';

type UsageInfo = {
  id: string;
  user_id: string;
  videos_generated: number;
  videos_limit: number;
};

export default function SettingsScreen() {
  // Remove user management state
  // const [loading, setLoading] = useState(true);
  // const [updating, setUpdating] = useState(false);
  // const [error, setError] = useState<string | null>(null);
  // const [success, setSuccess] = useState(false);
  // const [isEditing, setIsEditing] = useState(false);
  // const [profile, setProfile] = useState<UserProfile>({ ... });
  // const [editedProfile, setEditedProfile] = useState<UserProfile>({ ... });
  // const [deleting, setDeleting] = useState(false);
  // const [deleteError, setDeleteError] = useState<string | null>(null);
  // Remove handleSave, handleLogout, handleDeleteAccount

  // Keep only usage, admin, and other unrelated logic
  const [refreshing, setRefreshing] = useState(false);
  const [userUsage, setUserUsage] = useState<UsageInfo | null>(null);
  const [usageLoading, setUsageLoading] = useState(true);
  const [usageError, setUsageError] = useState<string | null>(null);
  const [testingPrompt, setTestingPrompt] = useState('');
  const [testingStatus, setTestingStatus] = useState<string | null>(null);
  const [testingError, setTestingError] = useState<string | null>(null);
  const [testingLoading, setTestingLoading] = useState(false);
  const [searchUserId, setSearchUserId] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [foundUserUsage, setFoundUserUsage] = useState<UsageInfo | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const { fetchUser } = useGetUser();

  const { client: supabase } = useClerkSupabaseClient();

  // Usage data fetcher
  const fetchUserUsage = async () => {
    try {
      setUsageLoading(true);
      setUsageError(null);
      const user = await fetchUser();
      // Get the database user (which includes the database ID)
      if (!user) {
        return;
      }

      // Use the database ID directly - no need to lookup again!
      const { data: usageData, error: usageError } = await supabase
        .from('user_usage')
        .select('*')
        .eq('user_id', user.id) // Use database ID directly
        .single();

      if (usageError) {
        console.error('Usage data error:', usageError);

        if (usageError.code === 'PGRST116') {
          // No usage record found, create one
          await createUsageRecord(user.id); // Use database ID
          return;
        }

        setUsageError('Failed to load usage data');
        return;
      }

      setUserUsage(usageData);
    } catch (err) {
      console.error('Error fetching usage data:', err);
      setUsageError('Failed to load usage data');
    } finally {
      setUsageLoading(false);
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
        .select('*')
        .single();

      if (error) {
        console.error('Error creating usage record:', error);
        setUsageError('Failed to initialize usage tracking');
        return;
      }

      setUserUsage(data);
    } catch (err) {
      console.error('Error creating usage record:', err);
      setUsageError('Failed to initialize usage tracking');
    }
  };

  // Admin: Search for a user by ID to adjust their usage limits
  const handleSearchUser = async () => {
    if (!searchUserId.trim()) return;

    try {
      setSearchLoading(true);
      setSearchError(null);
      setFoundUserUsage(null);

      // Check if user exists
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', searchUserId.trim())
        .maybeSingle();

      if (userError) throw userError;

      if (!userData) {
        setSearchError('Utilisateur non trouvé');
        return;
      }

      // Get user usage data
      const { data: usageData, error: usageError } = await supabase
        .from('user_usage')
        .select('*')
        .eq('user_id', searchUserId.trim())
        .single();

      if (usageError) throw usageError;

      setFoundUserUsage(usageData);
    } catch (err: any) {
      console.error('Error searching for user:', err);
      setSearchError(err.message || 'Erreur lors de la recherche');
    } finally {
      setSearchLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUserUsage();
    setRefreshing(false);
  }, []);

  // Remove all references to profile, loading, fetchUser

  // Remove adminSection's dependency on profile.role
  // Instead, fetch user role from UserProfileManager if needed, or hide adminSection for now

  // Remove all references to loading in the render

  // Remove all references to profile in the render

  // Only keep admin, usage, and other unrelated logic

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
        {/* Subscription Management */}
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
          <Text style={styles.sectionTitle}>Support</Text>

          <View style={styles.contactContainer}>
            <Text style={styles.contactHeader}>
              Contactez l&apos;équipe via votre canal préféré :
            </Text>

            {/* Email */}
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => {
                Linking.openURL('mailto:jason.h.suarez@gmail.com');
              }}
            >
              <View style={styles.settingInfo}>
                <AlertCircle size={24} color="#fff" />
                <Text style={styles.settingText}>Email</Text>
              </View>
            </TouchableOpacity>

            {/* WhatsApp */}
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => {
                Linking.openURL('https://wa.me/33660789132');
              }}
            >
              <View style={styles.settingInfo}>
                <Mic size={24} color="#25D366" />
                <Text style={styles.settingText}>WhatsApp</Text>
              </View>
            </TouchableOpacity>

            {/* Discord */}
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => {
                Linking.openURL('https://discord.gg/xNzaCV9cPb');
              }}
            >
              <View style={styles.settingInfo}>
                <Bug size={24} color="#7289da" />
                <Text style={styles.settingText}>
                  Discord : Rejoindre le serveur
                </Text>
              </View>
            </TouchableOpacity>

            {/* Telegram */}
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => {
                Linking.openURL('https://t.me/editia_support_bot');
              }}
            >
              <View style={styles.settingInfo}>
                <AlertCircle size={24} color="#229ED9" />
                <Text style={styles.settingText}>Telegram</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Admin section component that's only shown to admin users */}
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

            {foundUserUsage && (
              <AdminUsageControl
                userId={foundUserUsage.user_id}
                currentLimit={foundUserUsage.videos_limit}
                onUpdate={handleSearchUser}
              />
            )}
          </View>
        </View>

        {__DEV__ && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugTitle}>Débogage</Text>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/(onboarding)/welcome')}
            >
              <View style={styles.settingInfo}>
                <Bug size={24} color="#fff" />
                <Text style={styles.settingText}>
                  Tester le Flux d&apos;Accueil
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.debugContainer}>
              <Text style={styles.debugTitle}>Tester la Génération Vidéo</Text>

              <TextInput
                style={styles.debugInput}
                placeholder="Entrez une description test..."
                placeholderTextColor="#666"
                value={testingPrompt}
                onChangeText={setTestingPrompt}
                multiline
                numberOfLines={3}
              />

              {testingError && (
                <View style={styles.debugError}>
                  <AlertCircle size={16} color="#ef4444" />
                  <Text style={styles.debugErrorText}>{testingError}</Text>
                </View>
              )}

              {testingStatus && (
                <View style={styles.debugStatus}>
                  <Text style={styles.debugStatusText}>{testingStatus}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.debugButton,
                  testingLoading && styles.debugButtonDisabled,
                ]}
                disabled={testingLoading}
              >
                {testingLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Wand2 size={20} color="#fff" />
                    <Text style={styles.debugButtonText}>
                      Générer une Vidéo Test
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Remove logout and delete account buttons at the bottom */}
      </ScrollView>
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

  content: {
    flex: 1,
    padding: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D1116',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    flex: 1,
  },
  successContainer: {
    backgroundColor: '#042f2e',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  successText: {
    color: '#10b981',
    fontSize: 14,
    textAlign: 'center',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 16,
    gap: 16,
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  nameInput: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  profileEmail: {
    color: '#888',
    fontSize: 14,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editActionButton: {
    backgroundColor: '#333',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#10b981',
  },
  editProfileButton: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editProfileText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
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
    backgroundColor: '#1a1a1a',
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
  settingValue: {
    color: '#888',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
    marginBottom: 20,
  },
  logoutButtonDisabled: {
    opacity: 0.7,
  },
  logoutButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  debugContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    gap: 12,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  debugInput: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    textAlignVertical: 'top',
  },
  debugError: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D1116',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  debugErrorText: {
    color: '#ef4444',
    fontSize: 14,
    flex: 1,
  },
  debugStatus: {
    backgroundColor: '#042f2e',
    padding: 12,
    borderRadius: 8,
  },
  debugStatusText: {
    color: '#10b981',
    fontSize: 14,
    textAlign: 'center',
  },
  debugButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  debugButtonDisabled: {
    opacity: 0.7,
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  adminContainer: {
    backgroundColor: '#1a1a1a',
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
    backgroundColor: '#333',
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
  contactContainer: {
    backgroundColor: '#181a20',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    gap: 8,
  },
  contactHeader: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 8,
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ef4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 0,
    marginBottom: 20,
  },
  deleteButtonDisabled: {
    opacity: 0.7,
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '500',
  },
});
