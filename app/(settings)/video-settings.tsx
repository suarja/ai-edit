import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Save } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import VideoSettingsSection from '@/components/VideoSettingsSection';
import { CaptionConfiguration } from '@/types/video';
import { CaptionConfigStorage } from '@/lib/utils/caption-config-storage';

export default function VideoSettingsScreen() {
  const [captionConfig, setCaptionConfig] =
    useState<CaptionConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCaptionConfig();
  }, []);

  const fetchCaptionConfig = async () => {
    try {
      // Get user ID for key scoping
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/(auth)/sign-in');
        return;
      }

      // Load from device storage using utility
      const config = await CaptionConfigStorage.load(user.id);
      setCaptionConfig(config);
    } catch (err) {
      console.error('Error loading caption config:', err);
      Alert.alert('Erreur', 'Échec du chargement de la configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!captionConfig || !captionConfig.presetId) {
      Alert.alert('Erreur', 'Veuillez sélectionner un style de sous-titres');
      return;
    }

    try {
      setSaving(true);

      // Get user ID for key scoping
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/(auth)/sign-in');
        return;
      }

      // Save to device storage using utility
      const success = await CaptionConfigStorage.save(user.id, captionConfig);

      if (success) {
        Alert.alert('Succès', 'Configuration des sous-titres sauvegardée !', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert('Erreur', 'Échec de la sauvegarde');
      }
    } catch (err) {
      console.error('Error saving caption config:', err);
      Alert.alert('Erreur', 'Échec de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Configuration Vidéo</Text>
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!captionConfig?.presetId || saving) && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={!captionConfig?.presetId || saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Save size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <VideoSettingsSection
          captionConfig={captionConfig}
          onCaptionConfigChange={setCaptionConfig}
        />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(0, 122, 255, 0.5)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#888',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
});
