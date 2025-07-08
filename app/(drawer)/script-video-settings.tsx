import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

// Custom hooks
import useVideoRequest from '@/app/hooks/useVideoRequest';
import useConfigurationStatus from '@/app/hooks/useConfigurationStatus';
import { useRevenueCat } from '@/providers/RevenueCat';
import { SupportService } from '@/lib/services/support/supportService';

// Components
import VideoTagFilterSystem from '@/components/VideoTagFilterSystem';
import ConfigurationCards from '@/app/components/ConfigurationCards';
import SubmitButton from '@/app/components/SubmitButton';
import ErrorDisplay from '@/app/components/ErrorDisplay';
import AdvancedToggle from '@/app/components/AdvancedToggle';
import LanguageSelector from '@/app/components/LanguageSelector';
import { DiscreteUsageDisplay } from '@/components/DiscreteUsageDisplay';

export default function ScriptVideoSettingsScreen() {
  // Get script parameters from navigation
  const params = useLocalSearchParams();
  const scriptId = Array.isArray(params.scriptId)
    ? params.scriptId[0]
    : params.scriptId;
  const script = Array.isArray(params.script)
    ? params.script[0]
    : params.script;
  const wordCount = Array.isArray(params.wordCount)
    ? params.wordCount[0]
    : params.wordCount;
  const estimatedDuration = Array.isArray(params.estimatedDuration)
    ? params.estimatedDuration[0]
    : params.estimatedDuration;
  const title = Array.isArray(params.title) ? params.title[0] : params.title;

  // RevenueCat integration
  const { isPro, videosRemaining, refreshUsage, isReady, userUsage } =
    useRevenueCat();

  // Main state and actions from hooks
  const videoRequest = useVideoRequest();

  // Configuration status
  const configStatus = useConfigurationStatus({
    voiceClone: videoRequest.voiceClone,
    editorialProfile: videoRequest.editorialProfile,
    captionConfig: videoRequest.captionConfig,
  });

  // Set the script as the prompt when component mounts
  useEffect(() => {
    if (script && !videoRequest.prompt && scriptId) {
      videoRequest.setPrompt(script);
      videoRequest.setScriptId(scriptId);
    }
  }, [script, videoRequest.prompt, scriptId]);

  // Check if user can generate video (quota + other validations)
  const canGenerateVideo =
    !isReady || !userUsage || isPro || videosRemaining > 0;

  // Compute if submit button should be disabled
  const isSubmitDisabled =
    !script ||
    videoRequest.selectedVideos.length === 0 ||
    (isReady && userUsage && !canGenerateVideo);

  // Show loading state for the entire screen only if video request data is loading
  if (videoRequest.loading) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleRefresh = () => {
    videoRequest.onRefresh();
    refreshUsage();
  };

  const handleGenerateVideo = async () => {
    if (!script || videoRequest.selectedVideos.length === 0) {
      Alert.alert(
        'Configuration incomplète',
        'Veuillez sélectionner au moins une vidéo source.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      // Use the script directly instead of the prompt input
      await videoRequest.handleSubmit();

      // Si succès, afficher la popup avec deux choix
      Alert.alert(
        'Génération lancée !',
        'Votre vidéo est en cours de génération. Vous serez notifié quand elle sera prête.',
        [
          {
            text: 'Voir les vidéos',
            onPress: () => router.replace('/videos'),
          },
          {
            text: 'Annuler',
            onPress: () => router.replace('/'),
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      // Notifier l'équipe via SupportService
      try {
        // On tente de récupérer le jobId ou scriptId pour le contexte
        const jobId = scriptId || 'unknown';
        // On suppose que getToken est accessible via videoRequest (sinon à adapter)
        const token =
          (videoRequest.getToken && (await videoRequest.getToken())) || '';
        await SupportService.reportIssue({
          jobId,
          errorMessage: error instanceof Error ? error.message : String(error),
          token,
          context: { script, selectedVideos: videoRequest.selectedVideos },
          notifyUser: false, // On gère la popup manuellement
        });
      } catch (supportError) {
        // On ignore les erreurs du support pour ne pas bloquer l'utilisateur
        console.warn('Support notification failed:', supportError);
      }
      // Afficher la popup d'erreur générique
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de la génération. Notre équipe a été notifiée. Veuillez réessayer plus tard.',
        [
          {
            text: 'OK',
            onPress: () => {},
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={videoRequest.refreshing}
            onRefresh={handleRefresh}
            tintColor="#007AFF"
          />
        }
      >
        <ErrorDisplay error={videoRequest.error} />

        {/* Discrete Usage Display */}
        <DiscreteUsageDisplay />

        {/* Script Preview */}
        <View style={styles.scriptPreview}>
          <Text style={styles.scriptPreviewTitle}>📝 Script à Générer</Text>
          <Text style={styles.scriptContent} numberOfLines={6}>
            {script}
          </Text>
          <View style={styles.scriptMeta}>
            <Text style={styles.scriptMetaText}>
              {wordCount} mots • ~
              {Math.round(parseFloat(estimatedDuration || '0'))}s
            </Text>
          </View>
        </View>

        {/* Video selection */}
        <VideoTagFilterSystem
          videos={videoRequest.sourceVideos}
          selectedVideoIds={videoRequest.selectedVideos}
          onVideoToggle={videoRequest.toggleVideoSelection}
        />

        {/* Toggle for advanced settings */}
        <AdvancedToggle
          showAdvanced={videoRequest.showAdvanced}
          hasIncompleteConfig={configStatus.hasIncompleteConfig}
          onToggle={() =>
            videoRequest.setShowAdvanced(!videoRequest.showAdvanced)
          }
        />

        {/* Advanced settings */}
        {videoRequest.showAdvanced && (
          <View style={styles.configSection}>
            {/* Language selector */}
            <LanguageSelector
              selectedLanguage={videoRequest.outputLanguage}
              onLanguageChange={videoRequest.setOutputLanguage}
            />

            {/* Configuration cards with proper navigation */}
            <ConfigurationCards
              voiceConfigured={configStatus.voiceConfigured}
              editorialConfigured={configStatus.editorialConfigured}
              captionConfigured={configStatus.captionConfigured}
              captionConfig={videoRequest.captionConfig}
            />
          </View>
        )}

        {/* Show quota warning if limit reached and RevenueCat data is loaded */}
        {isReady && userUsage && !canGenerateVideo && (
          <View style={styles.quotaWarning}>
            <Text style={styles.quotaWarningText}>
              ⚠️ Limite de vidéos atteinte. Passez Pro pour continuer à créer
              des vidéos !
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Submit button */}
      <SubmitButton
        onSubmit={handleGenerateVideo}
        isSubmitting={videoRequest.submitting}
        isDisabled={isSubmitDisabled || !canGenerateVideo}
      />
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
  scriptPreview: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  scriptPreviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 12,
  },
  scriptContent: {
    fontSize: 15,
    color: '#fff',
    lineHeight: 22,
    marginBottom: 12,
  },
  scriptMeta: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  scriptMetaText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  configSection: {
    gap: 16,
  },
  quotaWarning: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  quotaWarningText: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});
