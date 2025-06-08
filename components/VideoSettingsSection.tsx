import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { CaptionConfiguration } from '@/types/video';
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
  const cardWidth = width * 0.8;

  const handlePresetSelect = (presetId: string) => {
    // If no caption config exists yet, create one with defaults
    if (!captionConfig) {
      onCaptionConfigChange({
        presetId,
        placement: 'bottom',
        highlightColor: '#04f827',
      });
      return;
    }

    console.log('Caption config:', captionConfig);
    onCaptionConfigChange({
      ...captionConfig,
      presetId,
      highlightColor: CaptionConfigStorage.getPreset(presetId).highlightColor,
    });
  };

  const handlePlacementChange = (placement: 'top' | 'center' | 'bottom') => {
    // Ensure we have a preset ID before updating
    if (!captionConfig || !captionConfig.presetId) {
      // Select first preset if none is selected
      onCaptionConfigChange({
        presetId: VIDEO_PRESETS[0].id,
        placement,
        highlightColor: captionConfig?.highlightColor || '#04f827',
      });
      return;
    }

    onCaptionConfigChange({
      ...captionConfig,
      placement,
    });
  };

  // const handleLinesChange = (lines: 1 | 3) => {
  //   // Ensure we have a preset ID before updating
  //   if (!captionConfig || !captionConfig.presetId) {
  //     // Select first preset if none is selected
  //     onCaptionConfigChange({
  //       presetId: VIDEO_PRESETS[0].id,
  //       lines,
  //     });
  //     return;
  //   }

  //   onCaptionConfigChange({
  //     ...captionConfig,
  //     lines,
  //   });
  // };

  // Find the selected preset
  const selectedPreset = VIDEO_PRESETS.find(
    (preset) => preset.id === captionConfig?.presetId
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Style des Sous-titres</Text>
      <Text style={styles.sectionDescription}>
        Choisissez un style pour vos sous-titres
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.presetScroll}
        snapToInterval={cardWidth + 16}
        decelerationRate="fast"
      >
        {VIDEO_PRESETS.map((preset) => (
          <TouchableOpacity
            key={preset.id}
            style={[
              styles.presetCard,
              { width: cardWidth },
              captionConfig?.presetId === preset.id &&
                styles.selectedPresetCard,
            ]}
            onPress={() => handlePresetSelect(preset.id)}
          >
            <View style={styles.presetHeader}>
              <Text style={styles.presetName}>{preset.name}</Text>
            </View>
            <View style={styles.presetPreview}>
              <Text
                style={[
                  styles.previewText,
                  {
                    fontFamily: preset.font_family || 'System',
                    fontSize: 16,
                    fontWeight: (preset.font_weight || '400') as any,
                    color: preset.fill_color,
                  },
                ]}
              >
                {preset.transcript_effect === 'karaoke' ? (
                  <Text>
                    <Text style={{ color: preset.transcript_color }}>TO </Text>
                    <Text>GET STARTED</Text>
                  </Text>
                ) : preset.transcript_effect === 'highlight' ? (
                  <Text>
                    CHOOSE A{' '}
                    <Text style={{ color: preset.transcript_color }}>
                      STYLE
                    </Text>
                  </Text>
                ) : (
                  'CAPTION STYLE'
                )}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {captionConfig && captionConfig.presetId && (
        <>
          <View style={styles.optionSection}>
            <Text style={styles.optionTitle}>Position</Text>
            <View style={styles.optionButtons}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  captionConfig.placement === 'top' &&
                    styles.selectedOptionButton,
                ]}
                onPress={() => handlePlacementChange('top')}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    captionConfig.placement === 'top' &&
                      styles.selectedOptionButtonText,
                  ]}
                >
                  Haut
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  captionConfig.placement === 'center' &&
                    styles.selectedOptionButton,
                ]}
                onPress={() => handlePlacementChange('center')}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    captionConfig.placement === 'center' &&
                      styles.selectedOptionButtonText,
                  ]}
                >
                  Milieu
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  captionConfig.placement === 'bottom' &&
                    styles.selectedOptionButton,
                ]}
                onPress={() => handlePlacementChange('bottom')}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    captionConfig.placement === 'bottom' &&
                      styles.selectedOptionButtonText,
                  ]}
                >
                  Bas
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/*    <View style={styles.optionSection}>
            <Text style={styles.optionTitle}>Lignes</Text>
            <View style={styles.optionButtons}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  captionConfig.lines === 3 && styles.selectedOptionButton,
                ]}
                onPress={() => handleLinesChange(3)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    captionConfig.lines === 3 &&
                      styles.selectedOptionButtonText,
                  ]}
                >
                  Trois lignes
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  captionConfig.lines === 1 && styles.selectedOptionButton,
                ]}
                onPress={() => handleLinesChange(1)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    captionConfig.lines === 1 &&
                      styles.selectedOptionButtonText,
                  ]}
                >
                  Une ligne
                </Text>
              </TouchableOpacity>
            </View>
          </View> */}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
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
    marginBottom: 16,
    lineHeight: 22,
  },
  presetScroll: {
    paddingHorizontal: 0,
    paddingBottom: 8,
    gap: 16,
  },
  presetCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPresetCard: {
    borderColor: '#007AFF',
  },
  presetHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  presetName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  presetPreview: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  previewText: {
    textAlign: 'center',
  },
  optionSection: {
    marginTop: 24,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  optionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  selectedOptionButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedOptionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default VideoSettingsSection;
