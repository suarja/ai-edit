import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { VideoAnalysisData } from '@/types/videoAnalysis';

interface VideoMetadataEditorProps {
  videoId: string;
  analysisData?: VideoAnalysisData;
  onSave: (metadata: {
    title: string;
    description: string;
    tags: string[];
  }) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
}

const VideoMetadataEditor: React.FC<VideoMetadataEditorProps> = ({
  videoId,
  analysisData,
  onSave,
  onCancel,
  isSaving = false,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');

  // Initialize with analysis data if available
  useEffect(() => {
    if (analysisData) {
      setTitle(analysisData.title || '');
      setDescription(analysisData.description || '');
      setTags(analysisData.tags?.join(', ') || '');
    }
  }, [analysisData]);

  const handleSave = async () => {
    if (!title.trim()) {
      return; // Title is required
    }

    const tagsArray = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    await onSave({
      title: title.trim(),
      description: description.trim(),
      tags: tagsArray,
    });
  };

  const hasAnalysisData = !!analysisData;
  const isTitleValid = title.trim().length > 0;
  const isDescriptionValid = description.trim().length > 0;
  const isFormValid = isTitleValid && isDescriptionValid;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start' }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {hasAnalysisData
            ? 'Métadonnées générées par IA'
            : 'Ajouter des métadonnées'}
        </Text>
        <Text style={styles.subtitle}>
          {hasAnalysisData
            ? 'Modifiez les suggestions de notre IA ou ajoutez vos propres informations'
            : 'Ajoutez des informations pour organiser votre vidéo'}
        </Text>
      </View>

      {/* AI Analysis Indicator */}
      {hasAnalysisData && (
        <View style={styles.aiIndicator}>
          <Text style={styles.aiIndicatorText}>
            🤖 Analyse IA terminée - Suggestions disponibles
          </Text>
        </View>
      )}

      {/* Title Input */}
      <View style={styles.inputGroup}>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>
            Titre de la vidéo <Text style={{ color: '#ef4444' }}>*</Text>
          </Text>
          {hasAnalysisData && (
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>IA</Text>
            </View>
          )}
        </View>
        <TextInput
          style={[styles.input, !isTitleValid && styles.inputError]}
          placeholder="Ex: Guide complet de productivité"
          placeholderTextColor="#666"
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />
        {!isTitleValid && (
          <Text style={styles.errorText}>Le titre est obligatoire</Text>
        )}
      </View>

      {/* Description Input */}
      <View style={styles.inputGroup}>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>
            Description <Text style={{ color: '#ef4444' }}>*</Text>
          </Text>
          {hasAnalysisData && (
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>IA</Text>
            </View>
          )}
        </View>
        <TextInput
          style={[
            styles.textArea,
            styles.input,
            !isDescriptionValid && styles.inputError,
          ]}
          placeholder="Décrivez le contenu de votre vidéo..."
          placeholderTextColor="#666"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          maxLength={500}
        />
        <Text style={styles.characterCount}>
          {description.length}/500 caractères
        </Text>
        {!isDescriptionValid && (
          <Text style={styles.errorText}>La description est obligatoire</Text>
        )}
      </View>

      {/* Tags Input */}
      <View style={styles.inputGroup}>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>Tags</Text>
          {hasAnalysisData && (
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>IA</Text>
            </View>
          )}
        </View>
        <TextInput
          style={styles.input}
          placeholder="productivité, conseils, travail, séparés par des virgules"
          placeholderTextColor="#666"
          value={tags}
          onChangeText={setTags}
          maxLength={200}
        />
        <Text style={styles.helpText}>
          Séparez les tags par des virgules pour faciliter la recherche
        </Text>
      </View>

      {/* AI Analysis Details (if available) */}
      {hasAnalysisData && analysisData && (
        <View style={styles.analysisDetails}>
          <Text style={styles.analysisTitle}>📊 Détails de l&apos;analyse</Text>

          {/* Content Type */}
          {analysisData.content_type && (
            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>Type de contenu:</Text>
              <Text style={styles.analysisValue}>
                {analysisData.content_type}
              </Text>
            </View>
          )}

          {/* Duration Category */}
          {analysisData.duration_category && (
            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>Durée:</Text>
              <Text style={styles.analysisValue}>
                {analysisData.duration_category}
              </Text>
            </View>
          )}

          {/* Language */}
          {analysisData.language && (
            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>Langue:</Text>
              <Text style={styles.analysisValue}>{analysisData.language}</Text>
            </View>
          )}

          {/* Segments Preview */}
          {analysisData.segments && analysisData.segments.length > 0 && (
            <View style={styles.segmentsPreview}>
              <Text style={styles.segmentsTitle}>🎬 Segments détectés</Text>
              {analysisData.segments.slice(0, 3).map((segment, index) => (
                <View key={index} style={styles.segmentItem}>
                  <Text style={styles.segmentTime}>
                    {segment.start_time} - {segment.end_time}
                  </Text>
                  <Text style={styles.segmentDescription}>
                    {segment.description}
                  </Text>
                </View>
              ))}
              {analysisData.segments.length > 3 && (
                <Text style={styles.moreSegments}>
                  +{analysisData.segments.length - 3} autres segments
                </Text>
              )}
            </View>
          )}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
          disabled={isSaving}
        >
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.saveButton,
            (!isFormValid || isSaving) && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={!isFormValid || isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Sauvegarder</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  header: {
    marginBottom: 24,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: '#888888',
    lineHeight: 22,
  },

  aiIndicator: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.3)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },

  aiIndicatorText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },

  inputGroup: {
    marginBottom: 20,
  },

  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginRight: 8,
  },

  aiBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },

  aiBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },

  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#ffffff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },

  inputError: {
    borderColor: '#ef4444',
  },

  textArea: {
    textAlignVertical: 'top',
    minHeight: 100,
    paddingRight: 48, // Make space for the icon
  },

  descriptionContainer: {
    position: 'relative',
  },

  dictationContainer: {
    position: 'absolute',
    right: 8,
    top: 8,
  },

  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
  },

  characterCount: {
    color: '#888888',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },

  helpText: {
    color: '#888888',
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },

  analysisDetails: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },

  analysisTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },

  analysisItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  analysisLabel: {
    color: '#888888',
    fontSize: 14,
  },

  analysisValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },

  segmentsPreview: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },

  segmentsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },

  segmentItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#0f0f0f',
    borderRadius: 8,
  },

  segmentTime: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },

  segmentDescription: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 20,
  },

  moreSegments: {
    color: '#888888',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },

  cancelButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },

  cancelButtonText: {
    color: '#888888',
    fontSize: 16,
    fontWeight: '600',
  },

  saveButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },

  saveButtonDisabled: {
    backgroundColor: '#444',
    opacity: 0.6,
  },

  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VideoMetadataEditor;
