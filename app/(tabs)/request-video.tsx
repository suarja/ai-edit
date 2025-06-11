import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Custom hooks
import useVideoRequest from '@/app/hooks/useVideoRequest';
import useConfigurationStatus from '@/app/hooks/useConfigurationStatus';

// Components
import VideoSelectionChips from '@/components/VideoSelectionChips';
import PromptInput from '@/app/components/PromptInput';
import SystemPromptInput from '@/app/components/SystemPromptInput';
import ConfigurationCards from '@/app/components/ConfigurationCards';
import SubmitButton from '@/app/components/SubmitButton';
import ErrorDisplay from '@/app/components/ErrorDisplay';
import AdvancedToggle from '@/app/components/AdvancedToggle';
import LanguageSelector from '@/app/components/LanguageSelector';

export default function RequestVideoScreen() {
  // Main state and actions from hooks
  const videoRequest = useVideoRequest();

  // Configuration status
  const configStatus = useConfigurationStatus({
    voiceClone: videoRequest.voiceClone,
    editorialProfile: videoRequest.editorialProfile,
    captionConfig: videoRequest.captionConfig,
  });

  // Compute if submit button should be disabled
  const isSubmitDisabled =
    !videoRequest.prompt ||
    typeof videoRequest.prompt !== 'string' ||
    !videoRequest.prompt.trim() ||
    videoRequest.selectedVideos.length === 0;

  if (videoRequest.loading) {
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
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Créer une Vidéo</Text>
            <Text style={styles.subtitle}>
              Générez du contenu à partir de vos vidéos
            </Text>
          </View>
          <View style={styles.headerIcon}>
            <Sparkles size={24} color="#007AFF" />
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={videoRequest.refreshing}
            onRefresh={videoRequest.onRefresh}
            tintColor="#007AFF"
          />
        }
      >
        <ErrorDisplay error={videoRequest.error} />

        {/* Main prompt input with enhancement */}
        <PromptInput
          prompt={videoRequest.prompt}
          systemPrompt={videoRequest.systemPrompt}
          onPromptChange={videoRequest.setPrompt}
          onSystemPromptChange={videoRequest.setSystemPrompt}
          onReset={videoRequest.handleReset}
          title="Description de la Vidéo"
          description="Décrivez le type de contenu que vous souhaitez créer"
          placeholder="Ex: Créez une vidéo explicative sur les meilleures pratiques de productivité, en utilisant un ton professionnel mais accessible..."
          maxLength={1000}
          numberOfLines={6}
          outputLanguage={videoRequest.outputLanguage}
        />

        {/* Video selection - Using lightweight chips (safe from crashes) */}
        <VideoSelectionChips
          videos={videoRequest.sourceVideos}
          selectedVideoIds={videoRequest.selectedVideos}
          onVideoToggle={videoRequest.toggleVideoSelection}
          config={{
            variant: 'outlined',
            allowMultipleSelection: true,
            showDuration: true,
            showStatus: true,
            showTags: false,
          }}
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

            {/* System prompt input */}
            <SystemPromptInput
              systemPrompt={videoRequest.systemPrompt}
              onSystemPromptChange={videoRequest.setSystemPrompt}
              outputLanguage={videoRequest.outputLanguage}
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
      </ScrollView>

      {/* Submit button */}
      <SubmitButton
        onSubmit={videoRequest.handleSubmit}
        isSubmitting={videoRequest.submitting}
        isDisabled={isSubmitDisabled}
      />
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
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerIcon: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 12,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  configSection: {
    marginBottom: 24,
  },
});
