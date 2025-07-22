/**
 * 🎨 Source Videos Screen v2 - Migré vers la Palette Editia
 * 
 * MIGRATION PHASE 3:
 * ❌ Avant: Écran utilisant sourceVideoStyles.ts + couleurs hardcodées inline
 * ✅ Après: Écran cohérent utilisant sourceVideoStyles-v2.ts + palette Editia centralisée
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { Crown } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import VideoUploader from '@/components/VideoUploader';
import VideoMetadataEditor from '@/components/VideoMetadataEditor';
import ErrorDisplay from '@/components/ErrorDisplay';
import VideoList from '@/components/VideoList';

import { useSourceVideos } from '@/components/hooks/useSourceVideos';
import { useRevenueCat } from '@/contexts/providers/RevenueCat';
import { useGetUser } from '@/components/hooks/useGetUser';
import { sourceVideoStyle } from '@/lib/utils/styles/sourceVideoStyles-v2'; // ✅ Version migrée
import { COLORS } from '@/lib/constants/colors'; // ✅ Import centralisé

export default function SourceVideosScreen() {
  const {
    data,
    actions
  } = useSourceVideos();

  // Use the same pattern as settings.tsx and videos.tsx
  const { clerkLoaded, isSignedIn } = useGetUser();

  // Get subscription info for free tier limits
  const { currentPlan, isReady: revenueCatReady, userUsage } = useRevenueCat();
  console.log('currentPlan', currentPlan);
  console.log('userUsage', userUsage);

  React.useEffect(() => {
    if (clerkLoaded) {
      if (!isSignedIn) {
        router.replace('/(auth)/sign-in');
        return;
      }
      actions.fetchVideos();
    }
  }, [clerkLoaded, isSignedIn]);

  if (data.loading) {
    return (
      <SafeAreaView style={sourceVideoStyle.container} edges={[]}>
        <View style={sourceVideoStyle.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.interactive.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={sourceVideoStyle.container} edges={[]}>
      <View style={sourceVideoStyle.content}>
        {/* ✅ Plan info avec design cohérent */}
        {revenueCatReady && userUsage && currentPlan === 'free' && (
          <View style={sourceVideoStyle.planInfoContainer}>
            <Text style={sourceVideoStyle.planInfoText}>
              {userUsage.source_videos_used}/{userUsage.source_videos_limit}{' '}
              vidéos sources (Plan Gratuit)
            </Text>
          </View>
        )}

        {data.error && (
          <ErrorDisplay
            message={data.error}
            onAcknowledge={async () => {
              actions.clearError();
              actions.setShowSupportButton(false);
              actions.setEditingVideo({
                id: data.editingVideo.id,
                title: '',
                description: '',
                tags: '',
              });
              await actions.fetchVideos();
            }}
          />
        )}

        {/* ✅ Free tier limit avec Or Editia */}
        {revenueCatReady && !data.canUploadMore && (
          <View style={sourceVideoStyle.limitContainer}>
            <Crown size={20} color={COLORS.brand.gold} />
            <View style={sourceVideoStyle.limitTextContainer}>
              <Text style={sourceVideoStyle.limitTitle}>
                Limite de vidéos sources atteinte
              </Text>
              <Text style={sourceVideoStyle.limitDescription}>
                Vous avez atteint la limite de{' '}
                {userUsage?.source_videos_limit || 0} vidéos sources du plan
                gratuit. Passez Pro pour uploader plus de vidéos.
              </Text>
            </View>
          </View>
        )}

        <View style={sourceVideoStyle.uploadSection}>
          {/*
            Nouveau flow :
            - L'utilisateur clique sur "Uploader une vidéo" (VideoUploader)
            - Upload S3, puis analyse on-device
            - Après analyse (ou si ignorée), le formulaire d'édition metadata s'affiche toujours (pré-rempli si analyse OK)
          */}
          {!data.editingVideo.id && data.canUploadMore && (
            <VideoUploader
              getPresignedUrl={actions.getPresignedUrl}
              onUploadComplete={actions.handleUploadComplete}
              onUploadError={actions.handleUploadError}
              onUploadStart={actions.clearError}
              onAnalysisComplete={actions.handleAnalysisComplete}
              onAnalysisError={actions.handleError}
              onManualEdit={() => {
                if (data.currentVideoId) {
                  actions.setEditingVideo({
                    id: data.currentVideoId,
                    title: '',
                    description: '',
                    tags: '',
                  });
                  actions.setEditingVideoId(data.currentVideoId);
                }
              }}
            />
          )}
        </View>

        {/* ✅ Metadata Editor Modal avec design Editia */}
        <Modal
          style={sourceVideoStyle.modalContainer}
          visible={!!data.editingVideo.id}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {
            actions.setEditingVideo({ id: null, title: '', description: '', tags: '' });
            actions.setEditingVideoId(null);
            actions.setCurrentVideoId(null);
            actions.clearError();
          }}
        >
          <View style={sourceVideoStyle.modalBackdrop}>
            <SafeAreaView
              style={sourceVideoStyle.modalContent}
              edges={['top', 'bottom']}
            >
              {/* Reuse existing style */}
              <VideoMetadataEditor
                videoId={data.editingVideo.id || ''}
                analysisData={
                  data.hasAnalysisData &&
                  typeof data.editingVideoId === 'string' &&
                  data.videos.find((v) => v.id === data.editingVideoId)?.analysis_data
                    ? data.videos.find((v) => v.id === data.editingVideoId)?.analysis_data
                    : undefined
                }
                onSave={async (metadata) => {
                  actions.setEditingVideo((prev) => ({
                    ...prev,
                    title: metadata.title,
                    description: metadata.description,
                    tags: metadata.tags.join(', '),
                  }));
                  await actions.updateVideoMetadata(metadata);
                }}
                onCancel={() => {
                  actions.setEditingVideo({
                    id: null,
                    title: '',
                    description: '',
                    tags: '',
                  });
                  actions.setEditingVideoId(null);
                  actions.setCurrentVideoId(null);
                  actions.clearError();
                }}
                isSaving={data.savingMetadata}
              />
              {/* ✅ Analysis actions avec design cohérent */}
              {data.hasAnalysisData && (
                <View style={sourceVideoStyle.analysisActions}>
                  <TouchableOpacity
                    style={sourceVideoStyle.rejectButton}
                    onPress={actions.rejectAnalysis}
                    activeOpacity={0.8}
                  >
                    <Text style={sourceVideoStyle.rejectButtonText}>
                      Rejeter l&apos;analyse
                    </Text>
                  </TouchableOpacity>
                  <Text style={sourceVideoStyle.analysisHelperText}>
                    Rejeter l&apos;analyse supprimera les suggestions
                    automatiques
                  </Text>
                </View>
              )}
            </SafeAreaView>
          </View>
        </Modal>

        <View style={sourceVideoStyle.videosList}>
          <Text style={sourceVideoStyle.sectionTitle}>Vos Vidéos</Text>
          <VideoList
            videos={data.videos}
            playingVideoId={data.playingVideoId}
            loadingVideoIds={data.loadingVideoIds}
            errorVideoIds={data.errorVideoIds}
            visibleVideoIds={data.visibleVideoIds}
            onVideoPress={actions.handleVideoPress}
            onPlayToggle={actions.handlePlayToggle}
            onLoadStart={actions.handleVideoLoadStart}
            onLoad={actions.handleVideoLoad}
            onError={actions.handleVideoError}
            viewabilityConfigCallbackPairs={data.viewabilityConfigCallbackPairs}
            refreshing={data.refreshing}
            onRefresh={actions.onRefresh}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

/**
 * 🎨 RÉSUMÉ DE LA MIGRATION SOURCE VIDEOS SCREEN:
 * 
 * ✅ CHANGEMENTS PRINCIPAUX:
 * • Import de sourceVideoStyles-v2.ts (48 couleurs migrées vers palette Editia)
 * • ActivityIndicator: #007AFF → #FF0050 (Rouge Editia)
 * • Crown icon: #FFD700 maintenu (Or Editia cohérent)
 * • Modal styles inline → Styles centralisés dans sourceVideoStyles-v2
 * • Ajout de activeOpacity={0.8} pour feedback tactile
 * 
 * 🎬 AMÉLIORATIONS UX:
 * • Loader principal en Rouge Editia pour cohérence
 * • Plan info avec design moderne (borders, shadows)
 * • Limite container avec Or premium pour upgrade prompts
 * • Modal avec backdrop et content cohérents
 * • Touch feedback amélioré sur tous les boutons
 * 
 * 🚀 BÉNÉFICES:
 * • Réutilise les 48 couleurs migrées de sourceVideoStyles-v2
 * • Cohérence avec la palette Editia dans toute l'interface
 * • Meilleure séparation des responsabilités (styles centralisés)
 * • Feedback tactile moderne et accessible
 * 
 * Écran principal source-videos → Interface cohérente Editia ✨
 */