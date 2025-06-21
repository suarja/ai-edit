import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Image,
  ActivityIndicator,
  ScrollView,
  TextInput,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bell,
  Key,
  Shield,
  CircleHelp as HelpCircle,
  LogOut,
  Globe,
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
import { useClerkAuth } from '@/hooks/useClerkAuth';
import { useClerkSupabaseClient } from '@/lib/supabase-clerk';
import { useClerk } from '@clerk/clerk-expo';
import { useGetUser } from '@/lib/hooks/useGetUser';

type UserProfile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string;
  role?: string;
};

type UsageInfo = {
  id: string;
  user_id: string;
  videos_generated: number;
  videos_limit: number;
};

export default function SettingsScreen() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    full_name: '',
    avatar_url: null,
    email: '',
    role: 'user',
  });
  const [editedProfile, setEditedProfile] = useState<UserProfile>({
    id: '',
    full_name: '',
    avatar_url: null,
    email: '',
  });
  const [userUsage, setUserUsage] = useState<UsageInfo | null>(null);
  const [usageLoading, setUsageLoading] = useState(true);
  const [usageError, setUsageError] = useState<string | null>(null);

  const [testingPrompt, setTestingPrompt] = useState('');
  const [testingStatus, setTestingStatus] = useState<string | null>(null);
  const [testingError, setTestingError] = useState<string | null>(null);
  const [testingLoading, setTestingLoading] = useState(false);

  // Admin panel states
  const [searchUserId, setSearchUserId] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [foundUserUsage, setFoundUserUsage] = useState<UsageInfo | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Clerk hooks
  const { client: supabase } = useClerkSupabaseClient();
  const { signOut } = useClerk();

  const { fetchUser, clerkUser, clerkLoaded, isSignedIn } = useGetUser();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchProfile(), fetchUserUsage()]);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    if (clerkLoaded) {
      if (!isSignedIn) {
        router.replace('/(auth)/sign-in-clerk');
        return;
      }
      fetchProfile();
      fetchUserUsage();
    }
  }, [clerkLoaded, isSignedIn]);

  const fetchProfile = async () => {
    try {
      const user = await fetchUser();
      if (!user) {
        console.log('No user found');
        router.replace('/(auth)/sign-in-clerk');
        return;
      }

      const isAdmin = profile.role === 'admin';
      console.log('isAdmin', isAdmin);
      setProfile({
        id: user.id,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        email: user.email,
        role: user.role,
      });
      setEditedProfile({
        id: user.id,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        email: user.email,
      });

      // If the user is an admin, ensure they have a user_roles entry
      if (isAdmin) {
        await ensureAdminRoleEntry(user.id); // Use the database ID from fetchUser
      }

      console.log('Profile loaded successfully');
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Échec du chargement du profil');
      // Don't redirect on error, just show the error
    } finally {
      setLoading(false);
    }
  };

  const fetchUserUsage = async () => {
    try {
      setUsageLoading(true);
      setUsageError(null);

      // Get the database user (which includes the database ID)
      const user = await fetchUser();
      if (!user) {
        console.log('No database user found for usage data');
        return;
      }

      console.log('Fetching usage data for database user ID:', user.id);

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
          console.log('No usage record found, creating one...');
          await createUsageRecord(user.id); // Use database ID
          return;
        }

        setUsageError('Failed to load usage data');
        return;
      }

      console.log('Usage data retrieved:', usageData);
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

  // Function to ensure admin users have an entry in user_roles table
  const ensureAdminRoleEntry = async (userId: string) => {
    try {
      // First check if an entry already exists
      const { data: existingRole, error: checkError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      if (checkError) {
        console.error('Error checking admin role entry:', checkError);
        return;
      }

      // If no entry exists, create one
      if (!existingRole) {
        console.log('No admin role entry found, creating one...');
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: 'admin',
          });

        if (insertError) {
          console.error('Error creating admin role entry:', insertError);
        } else {
          console.log('Admin role entry created successfully');
        }
      } else {
        console.log('Admin role entry already exists');
      }
    } catch (err) {
      console.error('Error ensuring admin role entry:', err);
    }
  };

  const handleSave = async () => {
    try {
      setUpdating(true);
      setError(null);

      // Get the database user (which includes the database ID)
      const user = await fetchUser();
      if (!user) {
        throw new Error('User not found');
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({
          full_name: editedProfile.full_name,
          avatar_url: editedProfile.avatar_url,
        })
        .eq('id', user.id); // Use database ID directly

      if (updateError) throw updateError;

      setProfile(editedProfile);
      setIsEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Échec de la mise à jour du profil');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      setError(null);

      // Clear all local state before signing out
      setProfile({
        id: '',
        full_name: '',
        avatar_url: null,
        email: '',
        role: '',
      });
      setEditedProfile({
        id: '',
        full_name: '',
        avatar_url: null,
        email: '',
      });
      setSuccess(false);
      setIsEditing(false);

      // Sign out from Clerk
      await signOut();

      // Navigate to sign-in screen
      router.replace('/(auth)/sign-in-clerk');
    } catch (err) {
      console.error('Error signing out:', err);
      setError('Échec de la déconnexion');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  const debugSection = (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Débogage</Text>

      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => router.push('/(onboarding)/welcome')}
      >
        <View style={styles.settingInfo}>
          <Bug size={24} color="#fff" />
          <Text style={styles.settingText}>Tester le Flux d&apos;Accueil</Text>
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
              <Text style={styles.debugButtonText}>Générer une Vidéo Test</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  // Admin section component that's only shown to admin users
  const adminSection = profile.role === 'admin' && (
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
  );

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
        {error && (
          <View style={styles.errorContainer}>
            <AlertCircle size={20} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {success && (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>
              Profil mis à jour avec succès !
            </Text>
          </View>
        )}

        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri:
                  editedProfile.avatar_url ||
                  'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg',
              }}
              style={styles.profileImage}
            />
          </View>

          <View style={styles.profileInfo}>
            {isEditing ? (
              <>
                <TextInput
                  style={styles.nameInput}
                  value={editedProfile.full_name || ''}
                  onChangeText={(text) =>
                    setEditedProfile((prev) => ({ ...prev, full_name: text }))
                  }
                  placeholder="Entrez votre nom"
                  placeholderTextColor="#666"
                />
                <TextInput
                  style={styles.nameInput}
                  value={editedProfile.avatar_url || ''}
                  onChangeText={(text) =>
                    setEditedProfile((prev) => ({ ...prev, avatar_url: text }))
                  }
                  placeholder="URL de l'avatar"
                  placeholderTextColor="#666"
                />
              </>
            ) : (
              <>
                <Text style={styles.profileName}>
                  {profile.full_name || 'Nom non défini'}
                </Text>
                <Text style={styles.profileEmail}>{profile.email}</Text>
              </>
            )}
          </View>

          {isEditing ? (
            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.editActionButton}
                onPress={() => {
                  setIsEditing(false);
                  setEditedProfile(profile);
                }}
              >
                <X size={20} color="#ef4444" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editActionButton, styles.saveButton]}
                onPress={handleSave}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Check size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.editProfileText}>Modifier</Text>
            </TouchableOpacity>
          )}
        </View>

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
          <Text style={styles.sectionTitle}>Compte</Text>

          {/* TODO: Implement API Keys functionality
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Key size={24} color="#fff" />
              <Text style={styles.settingText}>Clés API</Text>
            </View>
          </TouchableOpacity>
          */}

          {/* TODO: Implement Privacy settings
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Shield size={24} color="#fff" />
              <Text style={styles.settingText}>Confidentialité</Text>
            </View>
          </TouchableOpacity>
          */}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Préférences</Text>

          {/* TODO: Implement Push Notifications functionality
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Bell size={24} color="#fff" />
              <Text style={styles.settingText}>Notifications Push</Text>
            </View>
            <Switch
              trackColor={{ false: '#333', true: '#007AFF' }}
              thumbColor="#fff"
              value={notifications}
              onValueChange={setNotifications}
            />
          </View>
          */}

          {/* TODO: Implement Language selection
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Globe size={24} color="#fff" />
              <Text style={styles.settingText}>Langue</Text>
            </View>
            <Text style={styles.settingValue}>Français</Text>
          </View>
          */}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>

          {/* TODO: Implement Help Center functionality
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <HelpCircle size={24} color="#fff" />
              <Text style={styles.settingText}>Centre d'Aide</Text>
            </View>
          </TouchableOpacity>
          */}
        </View>

        {profile.role === 'admin' && adminSection}

        {__DEV__ && debugSection}

        <TouchableOpacity
          style={[styles.logoutButton, loading && styles.logoutButtonDisabled]}
          onPress={handleLogout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#666" />
          ) : (
            <>
              <LogOut size={20} color="#666" />
              <Text style={styles.logoutButtonText}>Déconnexion</Text>
            </>
          )}
        </TouchableOpacity>
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
});
