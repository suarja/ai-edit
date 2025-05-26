import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Video as VideoIcon, Send, CircleAlert as AlertCircle, CreditCard as Edit3, Mic as Mic2 } from 'lucide-react-native';
import { ResizeMode, Video } from 'expo-av';

// Default voice ID to use when no voice clone exists
const DEFAULT_VOICE_ID = 'NFcw9p0jKu3zbmXieNPE';

// Default editorial profile for when none exists
const DEFAULT_EDITORIAL_PROFILE = {
  persona_description: 'Professional content creator with a focus on clear, engaging communication',
  tone_of_voice: 'Conversational and friendly, yet professional',
  audience: 'Tech-savvy professionals interested in productivity and innovation',
  style_notes: 'Clear explanations with practical examples, maintaining a balance between informative and engaging content',
};

type SourceVideo = {
  id: string;
  title: string;
  upload_url: string;
  duration_seconds: number;
};

type VoiceClone = {
  id: string;
  elevenlabs_voice_id: string;
  status: string;
};

type EditorialProfile = {
  id: string;
  persona_description: string | null;
  tone_of_voice: string | null;
  audience: string | null;
  style_notes: string | null;
};

export default function RequestVideoScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [sourceVideos, setSourceVideos] = useState<SourceVideo[]>([]);
  const [voiceClone, setVoiceClone] = useState<VoiceClone | null>(null);
  const [editorialProfile, setEditorialProfile] = useState<EditorialProfile | null>(null);
  const [useEditorialProfile, setUseEditorialProfile] = useState(true);
  const [customEditorialProfile, setCustomEditorialProfile] = useState(DEFAULT_EDITORIAL_PROFILE);

  const fetchInitialData = async () => {
    try {
      console.log('Fetching initial data...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/(auth)/sign-in');
        return;
      }

      // Fetch source videos
      const { data: videos, error: videosError } = await supabase
        .from('videos')
        .select('id, title, upload_url, duration_seconds')
        .eq('user_id', user.id);

      if (videosError) throw videosError;
      setSourceVideos(videos || []);
      console.log('Fetched videos:', videos?.length || 0);

      // Fetch voice clone
      const { data: voice, error: voiceError } = await supabase
        .from('voice_clones')
        .select('id, elevenlabs_voice_id, status')
        .eq('user_id', user.id)
        .single();

      if (voiceError && voiceError.code !== 'PGRST116') throw voiceError;
      setVoiceClone(voice);
      console.log('Voice clone status:', voice?.status || 'none');

      // Fetch editorial profile
      const { data: profile, error: profileError } = await supabase
        .from('editorial_profiles')
        .select('id, persona_description, tone_of_voice, audience, style_notes')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;
      setEditorialProfile(profile);
      console.log('Editorial profile found:', !!profile);
      
      // If we have an editorial profile, use it as the base for custom profile
      if (profile) {
        setCustomEditorialProfile({
          persona_description: profile.persona_description || DEFAULT_EDITORIAL_PROFILE.persona_description,
          tone_of_voice: profile.tone_of_voice || DEFAULT_EDITORIAL_PROFILE.tone_of_voice,
          audience: profile.audience || DEFAULT_EDITORIAL_PROFILE.audience,
          style_notes: profile.style_notes || DEFAULT_EDITORIAL_PROFILE.style_notes,
        });
      }

    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError('Failed to load required data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchInitialData();
  }, []);

  const toggleVideoSelection = (videoId: string) => {
    setSelectedVideos(prev => 
      prev.includes(videoId)
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  const validateRequest = () => {
    if (!prompt) {
      Alert.alert(
        'Missing Prompt',
        'Please enter a prompt describing what you want your video to say.',
        [{ text: 'OK' }]
      );
      return false;
    }

    if (selectedVideos.length === 0) {
      Alert.alert(
        'No Videos Selected',
        'Please select at least one source video to use in your generated content.',
        [{ text: 'OK' }]
      );
      return false;
    }

    if (!useEditorialProfile && !customEditorialProfile.persona_description) {
      Alert.alert(
        'Missing Editorial Details',
        'For more authentic and personalized content, please provide some editorial details about your content style.',
        [{ text: 'OK' }]
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateRequest()) return;

    try {
      setSubmitting(true);
      setError(null);

      console.log('Preparing request payload...');
      const requestPayload = {
        prompt,
        selectedVideos,
        editorialProfile: useEditorialProfile 
          ? editorialProfile || DEFAULT_EDITORIAL_PROFILE
          : customEditorialProfile,
        voiceId: voiceClone?.elevenlabs_voice_id || DEFAULT_VOICE_ID,
      };
      console.log('Request payload:', JSON.stringify(requestPayload, null, 2));

      console.log('Sending request to /api/videos/generate...');
      const response = await fetch('/api/videos/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify(requestPayload),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const responseText = await response.text();
        console.log('Error response text:', responseText);
        
        let errorData;
        try {
          errorData = JSON.parse(responseText);
          throw new Error(errorData.error || 'Failed to submit video request');
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          throw new Error(`Server error: ${responseText}`);
        }
      }

      const data = await response.json();
      console.log('Success response:', data);

      // Navigate to videos tab to show progress
      router.push('/(tabs)/videos');

    } catch (err) {
      console.error('Error submitting video request:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit video request');
    } finally {
      setSubmitting(false);
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Request Video</Text>
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Video Prompt</Text>
          <TextInput
            style={styles.promptInput}
            multiline
            numberOfLines={4}
            placeholder="Ex: How I automated my content creation workflow"
            placeholderTextColor="#666"
            value={prompt}
            onChangeText={setPrompt}
            maxLength={500}
          />
          <Text style={styles.charCount}>{prompt.length}/500</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Instructions</Text>
          <TextInput
            style={styles.promptInput}
            multiline
            numberOfLines={4}
            placeholder="Additional instructions for the AI..."
            placeholderTextColor="#666"
            value={systemPrompt}
            onChangeText={setSystemPrompt}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Source Videos</Text>
            <Text style={styles.sectionSubtitle}>Select clips to use</Text>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.videoList}
          >
            {sourceVideos.map((video) => (
              <TouchableOpacity
                key={video.id}
                style={[
                  styles.videoCard,
                  selectedVideos.includes(video.id) && styles.videoCardSelected
                ]}
                onPress={() => toggleVideoSelection(video.id)}
              >
                <View style={styles.videoPreview}>
                  {video.upload_url ? (
                    <Video
                      source={{ uri: video.upload_url }}
                      style={styles.videoThumbnail}
                      resizeMode={ResizeMode.COVER}
                      shouldPlay={false}
                      isMuted={true}
                      useNativeControls={false}
                    />
                  ) : (
                    <VideoIcon size={24} color="#fff" />
                  )}
                </View>
                <Text style={styles.videoTitle} numberOfLines={2}>{video.title}</Text>
                <Text style={styles.videoDuration}>
                  {Math.floor(video.duration_seconds / 60)}:{String(video.duration_seconds % 60).padStart(2, '0')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Voice Clone</Text>
            {voiceClone ? (
              <View style={styles.voiceStatus}>
                <Mic2 size={16} color="#10b981" />
                <Text style={styles.voiceStatusText}>Ready</Text>
              </View>
            ) : (
              <View style={styles.voiceStatus}>
                <Text style={[styles.voiceStatusText, { color: '#888' }]}>Using default voice</Text>
                <TouchableOpacity
                  style={styles.createVoiceButton}
                  onPress={() => router.push('/(tabs)/voice-clone')}
                >
                  <Text style={styles.createVoiceText}>Create Custom Voice</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Editorial Profile</Text>
            <Switch
              trackColor={{ false: '#333', true: '#007AFF' }}
              thumbColor="#fff"
              value={useEditorialProfile}
              onValueChange={setUseEditorialProfile}
            />
          </View>

          {useEditorialProfile ? (
            editorialProfile ? (
              <View style={styles.editorialProfile}>
                <Text style={styles.editorialText}>{editorialProfile.persona_description}</Text>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => router.push('/(tabs)/editorial')}
                >
                  <Edit3 size={16} color="#007AFF" />
                  <Text style={styles.editButtonText}>Edit Profile</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.editorialProfile}>
                <Text style={styles.editorialText}>{DEFAULT_EDITORIAL_PROFILE.persona_description}</Text>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => router.push('/(tabs)/editorial')}
                >
                  <Edit3 size={16} color="#007AFF" />
                  <Text style={styles.editButtonText}>Customize Profile</Text>
                </TouchableOpacity>
              </View>
            )
          ) : (
            <View style={styles.customProfile}>
              <TextInput
                style={styles.customInput}
                multiline
                numberOfLines={3}
                placeholder="Persona description..."
                placeholderTextColor="#666"
                value={customEditorialProfile.persona_description}
                onChangeText={(text) => setCustomEditorialProfile(prev => ({
                  ...prev,
                  persona_description: text
                }))}
              />
              <TextInput
                style={styles.customInput}
                multiline
                numberOfLines={2}
                placeholder="Tone of voice..."
                placeholderTextColor="#666"
                value={customEditorialProfile.tone_of_voice}
                onChangeText={(text) => setCustomEditorialProfile(prev => ({
                  ...prev,
                  tone_of_voice: text
                }))}
              />
              <TextInput
                style={styles.customInput}
                multiline
                numberOfLines={2}
                placeholder="Target audience..."
                placeholderTextColor="#666"
                value={customEditorialProfile.audience}
                onChangeText={(text) => setCustomEditorialProfile(prev => ({
                  ...prev,
                  audience: text
                }))}
              />
              <TextInput
                style={styles.customInput}
                multiline
                numberOfLines={3}
                placeholder="Style notes..."
                placeholderTextColor="#666"
                value={customEditorialProfile.style_notes}
                onChangeText={(text) => setCustomEditorialProfile(prev => ({
                  ...prev,
                  style_notes: text
                }))}
              />
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (submitting || !prompt || selectedVideos.length === 0) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={submitting || !prompt || selectedVideos.length === 0}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Send size={24} color="#fff" />
              <Text style={styles.submitButtonText}>Generate Video</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#888',
  },
  promptInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 120,
  },
  charCount: {
    color: '#888',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },
  videoList: {
    gap: 12,
    paddingRight: 20,
  },
  videoCard: {
    width: 200,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  videoCardSelected: {
    backgroundColor: '#0A2F1E',
    borderColor: '#10b981',
    borderWidth: 1,
  },
  videoPreview: {
    width: '100%',
    height: 120,
    backgroundColor: '#333',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  videoDuration: {
    color: '#888',
    fontSize: 12,
  },
  voiceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voiceStatusText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '500',
  },
  createVoiceButton: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  createVoiceText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  editorialProfile: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  editorialText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  customProfile: {
    gap: 12,
  },
  customInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 14,
    textAlignVertical: 'top',
  },
  footer: {
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});