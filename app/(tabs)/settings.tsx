import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Image, ActivityIndicator, ScrollView, TextInput, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Key, Shield, CircleHelp as HelpCircle, LogOut, Globe, CircleAlert as AlertCircle, Check, X, Mic, CreditCard as Edit3, Bug, Play, Wand as Wand2 } from 'lucide-react-native';

type UserProfile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string;
};

export default function SettingsScreen() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    full_name: '',
    avatar_url: null,
    email: '',
  });
  const [editedProfile, setEditedProfile] = useState<UserProfile>({
    id: '',
    full_name: '',
    avatar_url: null,
    email: '',
  });

  const [testingPrompt, setTestingPrompt] = useState('');
  const [testingStatus, setTestingStatus] = useState<string | null>(null);
  const [testingError, setTestingError] = useState<string | null>(null);
  const [testingLoading, setTestingLoading] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/(auth)/sign-in');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      setProfile({
        id: user.id,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        email: user.email!,
      });
      setEditedProfile({
        id: user.id,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        email: user.email!,
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setUpdating(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('users')
        .update({
          full_name: editedProfile.full_name,
          avatar_url: editedProfile.avatar_url,
        })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      setProfile(editedProfile);
      setIsEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace('/(auth)/sign-in');
    } catch (err) {
      console.error('Error signing out:', err);
      setError('Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  const handleTestGeneration = async () => {
    if (!testingPrompt) {
      setTestingError('Please enter a prompt');
      return;
    }

    try {
      setTestingLoading(true);
      setTestingError(null);
      setTestingStatus('Initializing test...');

      // Get user's editorial profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('editorial_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Get user's voice clone
      const { data: voiceClone } = await supabase
        .from('voice_clones')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Get a sample video
      const { data: videos } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', user.id)
        .limit(1);

      if (!videos?.length) {
        throw new Error('No source videos found. Please upload a video first.');
      }

      setTestingStatus('Starting generation...');

      // Generate video
      const response = await fetch('/api/videos/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: testingPrompt,
          selectedVideos: [videos[0].id],
          editorialProfile: profile || undefined,
          voiceId: voiceClone?.elevenlabs_voice_id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate video');
      }

      const { requestId } = await response.json();

      // Start polling for status
      pollVideoStatus(requestId);

    } catch (err) {
      console.error('Error testing video generation:', err);
      setTestingError(err.message);
      setTestingStatus(null);
    } finally {
      setTestingLoading(false);
    }
  };

  const pollVideoStatus = async (requestId: string) => {
    try {
      const response = await fetch(`/api/videos/status/${requestId}`);
      if (!response.ok) throw new Error('Failed to check status');

      const data = await response.json();
      setTestingStatus(data.metadata?.status || 'Processing...');

      if (data.render_status === 'rendering') {
        setTimeout(() => pollVideoStatus(requestId), 5000);
      } else if (data.render_status === 'done') {
        setTestingStatus('Video generated successfully!');
        router.push('/(tabs)/videos');
      } else if (data.render_status === 'error') {
        throw new Error(data.metadata?.error || 'Generation failed');
      }
    } catch (err) {
      console.error('Error polling status:', err);
      setTestingError(err.message);
      setTestingStatus(null);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  const debugSection = (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Debug</Text>
      
      <TouchableOpacity 
        style={styles.settingItem}
        onPress={() => router.push('/(onboarding)/welcome')}
      >
        <View style={styles.settingInfo}>
          <Bug size={24} color="#fff" />
          <Text style={styles.settingText}>Test Welcome Flow</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.debugContainer}>
        <Text style={styles.debugTitle}>Test Video Generation</Text>
        
        <TextInput
          style={styles.debugInput}
          placeholder="Enter test prompt..."
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
          style={[styles.debugButton, testingLoading && styles.debugButtonDisabled]}
          onPress={handleTestGeneration}
          disabled={testingLoading}
        >
          {testingLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Wand2 size={20} color="#fff" />
              <Text style={styles.debugButtonText}>Generate Test Video</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

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
            <Text style={styles.successText}>Profile updated successfully!</Text>
          </View>
        )}

        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: editedProfile.avatar_url || 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg'
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
                  onChangeText={(text) => setEditedProfile(prev => ({ ...prev, full_name: text }))}
                  placeholder="Enter your name"
                  placeholderTextColor="#666"
                />
                <TextInput
                  style={styles.nameInput}
                  value={editedProfile.avatar_url || ''}
                  onChangeText={(text) => setEditedProfile(prev => ({ ...prev, avatar_url: text }))}
                  placeholder="Enter avatar URL"
                  placeholderTextColor="#666"
                />
              </>
            ) : (
              <>
                <Text style={styles.profileName}>{profile.full_name || 'No name set'}</Text>
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
              <Text style={styles.editProfileText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Content Creation</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/(tabs)/voice-clone')}
          >
            <View style={styles.settingInfo}>
              <Mic size={24} color="#fff" />
              <Text style={styles.settingText}>Voice Clone</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/(tabs)/editorial')}
          >
            <View style={styles.settingInfo}>
              <Edit3 size={24} color="#fff" />
              <Text style={styles.settingText}>Editorial Profile</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Key size={24} color="#fff" />
              <Text style={styles.settingText}>API Keys</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Shield size={24} color="#fff" />
              <Text style={styles.settingText}>Privacy</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Bell size={24} color="#fff" />
              <Text style={styles.settingText}>Push Notifications</Text>
            </View>
            <Switch
              trackColor={{ false: '#333', true: '#007AFF' }}
              thumbColor="#fff"
              value={notifications}
              onValueChange={setNotifications}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Globe size={24} color="#fff" />
              <Text style={styles.settingText}>Language</Text>
            </View>
            <Text style={styles.settingValue}>English</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <HelpCircle size={24} color="#fff" />
              <Text style={styles.settingText}>Help Center</Text>
            </View>
          </TouchableOpacity>
        </View>

        {__DEV__ && debugSection}

        <TouchableOpacity
          style={[styles.logoutButton, loading && styles.logoutButtonDisabled]}
          onPress={handleLogout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <LogOut size={24} color="#fff" />
              <Text style={styles.logoutButtonText}>Log Out</Text>
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
  header: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
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
    backgroundColor: '#ef4444',
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
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
});