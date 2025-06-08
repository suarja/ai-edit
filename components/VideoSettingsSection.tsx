import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Switch,
  Modal,
} from 'react-native';
import { ChevronDown, ChevronUp, Palette, Sparkles } from 'lucide-react-native';
import { CaptionConfiguration, TranscriptEffect } from '@/types/video';
import { VIDEO_PRESETS } from '@/lib/config/video-presets';
import { CaptionConfigStorage } from '@/lib/utils/caption-config-storage';

type VideoSettingsSectionProps = {
  captionConfig: CaptionConfiguration | null;
  onCaptionConfigChange: (config: CaptionConfiguration) => void;
};

const VideoSettingsSection: React.FC<VideoSettingsSectionProps> = ({
  captionConfig,
  onCaptionConfigChange,
}) => {
  const { width } = useWindowDimensions();

  // UI state
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Ensure we have a valid config object to work with
  const currentConfig = captionConfig || CaptionConfigStorage.getDefault();

  // Predefined color options for quick selection
  const colorOptions = [
    '#04f827', // Karaoke green
    '#FFFD03', // Beasty yellow
    '#ffffff', // White
    '#ff4081', // Pink
    '#00bcd4', // Cyan
    '#9c27b0', // Purple
    '#ff5722', // Orange
    '#2196f3', // Blue
  ];

  const effectOptions: {
    id: TranscriptEffect;
    name: string;
    description: string;
  }[] = [
    { id: 'karaoke', name: 'Karaoké', description: 'Progression mot par mot' },
    {
      id: 'highlight',
      name: 'Surbrillance',
      description: 'Surligne les mots actifs',
    },
    { id: 'fade', name: 'Fondu', description: 'Apparition en fondu' },
    { id: 'bounce', name: 'Rebond', description: 'Effet de rebond dynamique' },
    { id: 'slide', name: 'Glissement', description: 'Glissement des mots' },
    { id: 'enlarge', name: 'Agrandissement', description: 'Zoom progressif' },
  ];

  // Quick preset combinations for popular styles
  const quickPresets = [
    {
      id: 'karaoke-green',
      name: 'Karaoké Classique',
      icon: '🎤',
      description: 'Vert avec progression mot par mot',
      config: {
        transcriptColor: '#04f827' as `#${string}`,
        transcriptEffect: 'karaoke' as TranscriptEffect,
        placement: 'bottom' as const,
      },
    },
    {
      id: 'highlight-yellow',
      name: 'Surbrillance Tendance',
      icon: '✨',
      description: 'Jaune avec surlignage des mots',
      config: {
        transcriptColor: '#FFFD03' as `#${string}`,
        transcriptEffect: 'highlight' as TranscriptEffect,
        placement: 'bottom' as const,
      },
    },
    {
      id: 'fade-white',
      name: 'Élégant Blanc',
      icon: '🤍',
      description: 'Blanc avec apparition en fondu',
      config: {
        transcriptColor: '#ffffff' as `#${string}`,
        transcriptEffect: 'fade' as TranscriptEffect,
        placement: 'center' as const,
      },
    },
  ];

  const handleToggleChange = (enabled: boolean) => {
    if (enabled) {
      // When enabling, ensure we have a complete config
      const enabledConfig: CaptionConfiguration = {
        enabled: true,
        presetId: currentConfig.presetId || 'karaoke',
        placement: currentConfig.placement || 'bottom',
        transcriptColor: currentConfig.transcriptColor || '#04f827',
        transcriptEffect: currentConfig.transcriptEffect || 'karaoke',
      };
      onCaptionConfigChange(enabledConfig);
    } else {
      // When disabling, just set enabled to false but keep other settings
      onCaptionConfigChange({
        ...currentConfig,
        enabled: false,
      });
    }
  };

  const handleQuickPresetSelect = (preset: (typeof quickPresets)[0]) => {
    const updatedConfig: CaptionConfiguration = {
      ...currentConfig,
      enabled: true,
      presetId: preset.id, // Use preset ID for tracking
      ...preset.config,
    };

    onCaptionConfigChange(updatedConfig);
  };

  const handlePlacementChange = (placement: 'top' | 'center' | 'bottom') => {
    onCaptionConfigChange({
      ...currentConfig,
      enabled: true,
      presetId: 'custom', // Mark as custom when user changes individual settings
      placement,
    });
  };

  const handleColorChange = (color: string) => {
    onCaptionConfigChange({
      ...currentConfig,
      enabled: true,
      presetId: 'custom', // Mark as custom
      transcriptColor: color as `#${string}`,
    });
    setShowColorPicker(false);
  };

  const handleEffectChange = (effect: TranscriptEffect) => {
    onCaptionConfigChange({
      ...currentConfig,
      enabled: true,
      presetId: 'custom', // Mark as custom
      transcriptEffect: effect,
    });
  };

  // Check if current config matches any quick preset
  const isCustomConfig = !quickPresets.some(
    (preset) =>
      preset.id === currentConfig.presetId ||
      (preset.config.transcriptColor === currentConfig.transcriptColor &&
        preset.config.transcriptEffect === currentConfig.transcriptEffect &&
        preset.config.placement === currentConfig.placement)
  );

  const renderEffectPreview = () => {
    const effect = currentConfig.transcriptEffect || 'karaoke';
    const color = currentConfig.transcriptColor || '#04f827';

    switch (effect) {
      case 'karaoke':
        return (
          <View style={styles.previewContainer}>
            <Text style={[styles.previewText, { color: '#888' }]}>
              CRÉER UNE{' '}
            </Text>
            <Text style={[styles.previewText, { color }]}>VIDÉO </Text>
            <Text style={[styles.previewText, { color: '#888' }]}>
              PARFAITE
            </Text>
          </View>
        );
      case 'highlight':
        return (
          <View style={styles.previewContainer}>
            <Text style={[styles.previewText]}>CRÉER UNE </Text>
            <Text
              style={[
                styles.previewText,
                { backgroundColor: color, color: '#000', paddingHorizontal: 4 },
              ]}
            >
              VIDÉO
            </Text>
            <Text style={[styles.previewText]}> PARFAITE</Text>
          </View>
        );
      case 'fade':
        return (
          <View style={styles.previewContainer}>
            <Text style={[styles.previewText, { color, opacity: 0.6 }]}>
              CRÉER UNE VIDÉO
            </Text>
          </View>
        );
      case 'bounce':
        return (
          <View style={styles.previewContainer}>
            <Text
              style={[
                styles.previewText,
                { color, transform: [{ scale: 1.1 }] },
              ]}
            >
              CRÉER UNE VIDÉO!
            </Text>
          </View>
        );
      case 'slide':
        return (
          <View style={styles.previewContainer}>
            <Text style={[styles.previewText, { color }]}>
              CRÉER UNE VIDÉO →
            </Text>
          </View>
        );
      case 'enlarge':
        return (
          <View style={styles.previewContainer}>
            <Text
              style={[
                styles.previewText,
                { color, fontSize: 18, fontWeight: 'bold' },
              ]}
            >
              CRÉER UNE VIDÉO
            </Text>
          </View>
        );
      default:
        return (
          <View style={styles.previewContainer}>
            <Text style={[styles.previewText, { color }]}>CRÉER UNE VIDÉO</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      {/* Main Toggle */}
      <View style={styles.toggleSection}>
        <View style={styles.toggleContent}>
          <View>
            <Text style={styles.sectionTitle}>Sous-titres</Text>
            <Text style={styles.sectionDescription}>
              {currentConfig.enabled
                ? 'Personnalisez le style de vos sous-titres'
                : 'Activez les sous-titres pour votre vidéo'}
            </Text>
          </View>
          <Switch
            value={currentConfig.enabled}
            onValueChange={handleToggleChange}
            trackColor={{ false: '#333', true: '#007AFF' }}
            thumbColor={currentConfig.enabled ? '#fff' : '#888'}
            ios_backgroundColor="#333"
          />
        </View>
      </View>

      {/* Caption Configuration (shown when enabled) */}
      {currentConfig.enabled && (
        <View style={styles.configContent}>
          {/* Quick Presets */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Styles populaires</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.presetsContainer}
            >
              {quickPresets.map((preset) => (
                <TouchableOpacity
                  key={preset.id}
                  style={[
                    styles.quickPresetCard,
                    currentConfig.presetId === preset.id &&
                      styles.selectedQuickPreset,
                  ]}
                  onPress={() => handleQuickPresetSelect(preset)}
                >
                  <Text style={styles.presetIcon}>{preset.icon}</Text>
                  <Text style={styles.presetName}>{preset.name}</Text>
                  <Text style={styles.presetDescription}>
                    {preset.description}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* Custom indicator */}
              {isCustomConfig && (
                <View style={[styles.quickPresetCard, styles.customPresetCard]}>
                  <Sparkles size={20} color="#007AFF" />
                  <Text style={styles.presetName}>Personnalisé</Text>
                  <Text style={styles.presetDescription}>
                    Configuration sur mesure
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>

          {/* Live Preview */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Aperçu</Text>
            <View style={styles.previewBox}>{renderEffectPreview()}</View>
          </View>

          {/* Main Controls */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Personnalisation</Text>

            {/* Effect Selector */}
            <View style={styles.controlGroup}>
              <Text style={styles.controlLabel}>Effet d&apos;animation</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.effectButtons}>
                  {effectOptions.map((effect) => (
                    <TouchableOpacity
                      key={effect.id}
                      style={[
                        styles.effectButton,
                        currentConfig.transcriptEffect === effect.id &&
                          styles.selectedEffectButton,
                      ]}
                      onPress={() => handleEffectChange(effect.id)}
                    >
                      <Text
                        style={[
                          styles.effectButtonText,
                          currentConfig.transcriptEffect === effect.id &&
                            styles.selectedEffectButtonText,
                        ]}
                      >
                        {effect.name}
                      </Text>
                      <Text
                        style={[
                          styles.effectDescription,
                          currentConfig.transcriptEffect === effect.id &&
                            styles.selectedEffectDescription,
                        ]}
                      >
                        {effect.description}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Color Picker */}
            <View style={styles.controlGroup}>
              <Text style={styles.controlLabel}>Couleur du texte</Text>
              <TouchableOpacity
                style={styles.colorButton}
                onPress={() => setShowColorPicker(true)}
              >
                <View
                  style={[
                    styles.colorPreview,
                    {
                      backgroundColor:
                        currentConfig.transcriptColor || '#04f827',
                    },
                  ]}
                />
                <Text style={styles.colorButtonText}>
                  {currentConfig.transcriptColor || '#04f827'}
                </Text>
                <Palette size={16} color="#888" />
              </TouchableOpacity>
            </View>

            {/* Position Controls */}
            <View style={styles.controlGroup}>
              <Text style={styles.controlLabel}>Position</Text>
              <View style={styles.positionButtons}>
                {(['top', 'center', 'bottom'] as const).map((position) => (
                  <TouchableOpacity
                    key={position}
                    style={[
                      styles.positionButton,
                      currentConfig.placement === position &&
                        styles.selectedPositionButton,
                    ]}
                    onPress={() => handlePlacementChange(position)}
                  >
                    <Text
                      style={[
                        styles.positionButtonText,
                        currentConfig.placement === position &&
                          styles.selectedPositionButtonText,
                      ]}
                    >
                      {position === 'top'
                        ? 'Haut'
                        : position === 'center'
                        ? 'Milieu'
                        : 'Bas'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Color Picker Modal */}
      <Modal
        visible={showColorPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowColorPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowColorPicker(false)}
        >
          <View style={styles.colorPickerModal}>
            <Text style={styles.colorPickerTitle}>Choisir une couleur</Text>
            <View style={styles.colorGrid}>
              {colorOptions.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    currentConfig.transcriptColor === color &&
                      styles.selectedColorOption,
                  ]}
                  onPress={() => handleColorChange(color)}
                />
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  toggleSection: {
    marginBottom: 20,
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  sectionDescription: {
    fontSize: 15,
    color: '#888',
    lineHeight: 22,
  },
  configContent: {
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

  // Quick Presets
  presetsContainer: {
    gap: 12,
    paddingHorizontal: 4,
  },
  quickPresetCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    width: 140,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 8,
  },
  selectedQuickPreset: {
    borderColor: '#007AFF',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  customPresetCard: {
    borderColor: '#007AFF',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  presetIcon: {
    fontSize: 24,
  },
  presetName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  presetDescription: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
    lineHeight: 14,
  },

  // Preview
  previewBox: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  previewText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

  // Controls
  controlGroup: {
    gap: 8,
  },
  controlLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },

  // Effect Buttons
  effectButtons: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  effectButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    minWidth: 100,
    borderWidth: 1,
    borderColor: '#333',
  },
  selectedEffectButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  effectButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  selectedEffectButtonText: {
    color: '#fff',
  },
  effectDescription: {
    color: '#888',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
  selectedEffectDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
  },

  // Color Button
  colorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#555',
  },
  colorButtonText: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },

  // Position Buttons
  positionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  positionButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  selectedPositionButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  positionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  selectedPositionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },

  // Color Picker Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorPickerModal: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    width: '80%',
  },
  colorPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#333',
  },
  selectedColorOption: {
    borderColor: '#007AFF',
    borderWidth: 3,
  },
});

export default VideoSettingsSection;
