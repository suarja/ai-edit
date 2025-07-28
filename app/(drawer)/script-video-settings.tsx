import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronDown, ChevronUp } from 'lucide-react-native';

// Custom hooks
import useVideoRequest from '@/app/hooks/useVideoRequest';
import useConfigurationStatus from '@/app/hooks/useConfigurationStatus';
import { useRevenueCat } from '@/contexts/providers/RevenueCat';

// Components
import VideoTagFilterSystem from '@/components/VideoTagFilterSystem';
import ConfigurationCards from '@/app/components/ConfigurationCards';
import SubmitButton from '@/app/components/SubmitButton';
import ErrorDisplay from '@/app/components/ErrorDisplay';
import AdvancedToggle from '@/app/components/AdvancedToggle';
import LanguageSelector from '@/app/components/LanguageSelector';
import { DiscreteUsageDisplay } from '@/components/DiscreteUsageDisplay';
import AnalysisHeader from '@/components/analysis/AnalysisHeader';
import { ScriptService } from '@/lib/services/scriptService';
import { SHARED_STYLE_COLORS } from '@/lib/constants/sharedStyles';

export default function ScriptVideoSettingsScreen() {
  // Get script parameters from navigation
  const params = useLocalSearchParams();
  const scriptId = Array.isArray(params.scriptId)
    ? params.scriptId[0]
    : params.scriptId;
  const script = Array.isArray(params.script)
    ? params.script[0]
    : params.script;

  // RevenueCat integration
  const {
    currentPlan,
    videosRemaining,
    refreshUsage,
    isReady,
    userUsage,
    setShowPaywall,
  } = useRevenueCat();

  // Main state and actions from hooks
  const videoRequest = useVideoRequest();

  // State for script preview expansion
  const [isScriptExpanded, setIsScriptExpanded] = useState(false);

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

  // État 0: Conditions de base (script + vidéo sélectionnée) - pour tous les utilisateurs
  const hasBasicConditions = script && videoRequest.selectedVideos.length > 0;

  // État utilisateur gratuit avec vidéos restantes
  const isFreeUserWithVideos = currentPlan === 'free' && videosRemaining > 0;

  // État utilisateur gratuit sans vidéos restantes
  const isFreeUserWithoutVideos =
    currentPlan === 'free' && videosRemaining === 0;

  // Reactive script validation
  const scriptValidation = useMemo(() => {
    if (
      !userUsage ||
      !currentPlan ||
      !script ||
      videoRequest.selectedVideos.length === 0
    ) {
      return { isValid: false, warnings: [] };
    }

    return ScriptService.validateScript({
      script,
      plan: currentPlan,
      userUsage,
      videos: videoRequest.selectedVideos,
    });
  }, [script, videoRequest.selectedVideos, userUsage, currentPlan]);

  // Compute if submit button should be disabled
  const isSubmitDisabled =
    !userUsage || !hasBasicConditions || !scriptValidation.isValid;

  const { wordCount, estimatedDuration } =
    ScriptService.calculateScriptDuration(script);

  // Reactive requirements warnings
  const requirementsWarnings = useMemo(() => {
    const warnings = [];

    // Vérifications de base
    if (!script) {
      warnings.push('📝 Sélectionnez un script à générer');
    }

    if (videoRequest.selectedVideos.length === 0) {
      warnings.push('🎬 Sélectionnez au moins une vidéo source');
    }

    // Vérifications avancées avec ScriptService
    if (scriptValidation.warnings.length > 0) {
      warnings.push(...scriptValidation.warnings);
    }

    return warnings;
  }, [script, videoRequest.selectedVideos.length, scriptValidation.warnings]);

  // Show loading state for the entire screen only if video request data is loading
  if (videoRequest.loading) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={SHARED_STYLE_COLORS.primary} />
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
        // const jobId = scriptId || 'unknown';
        // const token = await getToken();
        // await SupportService.reportIssue({
        //   jobId,
        //   token: token || '',
        //   errorMessage: error instanceof Error ? error.message : String(error),
        //   context: { script, selectedVideos: videoRequest.selectedVideos },
        //   notifyUser: false, // On gère la popup manuellement
        // });
      } catch (supportError) {
        // On ignore les erreurs du support pour ne pas bloquer l'utilisateur
        console.warn('Support notification failed:', supportError);
      }
      // Afficher la popup d'erreur générique
      Alert.alert(
        'Erreur',
        error instanceof Error ? error.message : String(error),
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={videoRequest.refreshing}
            onRefresh={handleRefresh}
            tintColor={SHARED_STYLE_COLORS.primary}
          />
        }
      >
        <AnalysisHeader title="Configuration Vidéo" showBackButton />
        <ErrorDisplay error={videoRequest.error} />

        {/* Discrete Usage Display */}
        <DiscreteUsageDisplay />

        {/* Script Preview */}
        <TouchableOpacity
          style={styles.scriptPreview}
          onPress={() => setIsScriptExpanded(!isScriptExpanded)}
          activeOpacity={0.8}
        >
          <View style={styles.scriptPreviewHeader}>
            <Text style={styles.scriptPreviewTitle}>📝 Script à Générer</Text>
            {isScriptExpanded ? (
              <ChevronUp size={20} color={SHARED_STYLE_COLORS.primary} />
            ) : (
              <ChevronDown size={20} color={SHARED_STYLE_COLORS.primary} />
            )}
          </View>

          {isScriptExpanded && (
            <>
              <Text style={styles.scriptContent}>{script}</Text>
              <View style={styles.scriptMeta}>
                <Text style={styles.scriptMetaText}>
                  {wordCount} mots • ~{Math.round(estimatedDuration)}s
                </Text>
              </View>
            </>
          )}

          {!isScriptExpanded && (
            <Text style={styles.scriptPreviewText} numberOfLines={2}>
              {script}
            </Text>
          )}
        </TouchableOpacity>

        {/* Video selection */}
        <VideoTagFilterSystem
          videos={videoRequest.sourceVideos}
          selectedVideoIds={videoRequest.selectedVideos}
          onVideoToggle={videoRequest.toggleVideoSelection}
          clearSelectedVideos={() => videoRequest.handleReset()}
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
        {isReady && userUsage && isFreeUserWithoutVideos && (
          <View style={styles.quotaWarning}>
            <Text style={styles.quotaWarningText}>
              ⚠️ Limite de vidéos atteinte. Passez Pro pour continuer à créer
              des vidéos !
            </Text>
          </View>
        )}

        {/* Show requirements warnings only when there are issues */}
        {requirementsWarnings.length > 0 && (
          <View style={styles.requirementsContainer}>
            {requirementsWarnings.map((warning, index) => (
              <View key={index} style={styles.conditionsWarning}>
                <Text style={styles.conditionsWarningText}>{warning}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Submit button */}
      <SubmitButton
        onSubmit={handleGenerateVideo}
        isSubmitting={videoRequest.submitting}
        isDisabled={isSubmitDisabled}
        showWatermarkInfo={isReady && isFreeUserWithVideos}
        onUpgradePress={() => setShowPaywall(true)}
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
    backgroundColor: SHARED_STYLE_COLORS.backgroundSecondary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  scriptPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scriptPreviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: SHARED_STYLE_COLORS.primary,
  },
  scriptPreviewText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
    fontStyle: 'italic',
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
    backgroundColor: SHARED_STYLE_COLORS.primaryOverlay,
    borderWidth: 1,
    borderColor: SHARED_STYLE_COLORS.primaryBorder,
    borderRadius: 10,
    padding: 12,
    marginVertical: 6,
  },
  quotaWarningText: {
    color: SHARED_STYLE_COLORS.error,
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  conditionsWarning: {
    backgroundColor: 'rgba(255, 149, 0, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.2)',
    borderRadius: 10,
    padding: 12,
    marginVertical: 6,
  },
  conditionsWarningText: {
    color: SHARED_STYLE_COLORS.warning,
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  requirementsContainer: {
    marginTop: 10,
  },
});
