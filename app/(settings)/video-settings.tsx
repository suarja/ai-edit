import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Text,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Save } from 'lucide-react-native';
import VideoSettingsSection from '@/components/VideoSettingsSection';
import SettingsHeader from '@/components/SettingsHeader';
import { CaptionConfiguration } from '@/lib/types/video.types';
import { CaptionConfigStorage } from '@/lib/utils/caption-config-storage';
import { useGetUser } from '@/components/hooks/useGetUser';

export default function VideoSettingsScreen() {
  const [captionConfig, setCaptionConfig] =
    useState<CaptionConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { fetchUser } = useGetUser();

  useEffect(() => {
    fetchCaptionConfig();
  }, []);

  const fetchCaptionConfig = async () => {
    try {
      // Get user ID for key scoping
      const user = await fetchUser();
      if (!user) {
        router.replace('/(auth)/sign-in');
        return;
      }

      // Load configuration using the enhanced getOrDefault method
      // This ensures we always have a working configuration
      const config = await CaptionConfigStorage.getOrDefault(user.id);
      setCaptionConfig(config);
    } catch (err) {
      console.error('Error loading caption config:', err);
      Alert.alert('Erreur', 'Échec du chargement de la configuration');
      // Fallback to default config if loading fails
      setCaptionConfig(CaptionConfigStorage.getDefault());
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!captionConfig) {
      Alert.alert('Erreur', 'Configuration invalide');
      return;
    }

    // Enhanced validation - check if essential properties are present when enabled
    if (
      captionConfig.enabled &&
      (!captionConfig.presetId || !captionConfig.transcriptColor)
    ) {
      Alert.alert(
        'Erreur',
        'Veuillez configurer un style de sous-titres complet'
      );
      return;
    }

    try {
      setSaving(true);

      // Get user ID for key scoping
      const user = await fetchUser();
      if (!user) {
        router.replace('/(auth)/sign-in');
        return;
      }

      // Save the enhanced configuration
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

  // Check if configuration is valid for saving
  const canSave =
    captionConfig &&
    (!captionConfig.enabled || // If disabled, can always save
      (captionConfig.presetId && captionConfig.transcriptColor)); // If enabled, need essential properties

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <SettingsHeader title="Configuration Vidéo" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <SettingsHeader
        title="Configuration Vidéo"
        rightButton={{
          icon: <Save size={20} color="#fff" />,
          onPress: handleSave,
          disabled: !canSave,
          loading: saving,
        }}
      />
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
