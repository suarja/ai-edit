import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Upload, Video as VideoIcon } from 'lucide-react-native';
import { Chips } from 'react-native-material-chips';

import { VideoType } from '@/types/video';
import { VideoChipItem, VideoChipConfig } from '@/types/video-chips';
import {
  transformVideosToChips,
  getChipDisplayText,
} from '@/lib/utils/video-chip-adapter';

interface VideoSelectionChipsProps {
  videos: VideoType[];
  selectedVideoIds: string[];
  onVideoToggle: (videoId: string) => void;
  config?: VideoChipConfig;
}

export default function VideoSelectionChips({
  videos,
  selectedVideoIds,
  onVideoToggle,
  config = {
    variant: 'outlined',
    allowMultipleSelection: true,
    showTags: false,
    showDuration: true,
    showStatus: true,
  },
}: VideoSelectionChipsProps) {
  const [chipItems, setChipItems] = useState<VideoChipItem[]>([]);

  // Transform videos to chips when videos change
  useEffect(() => {
    const chips = transformVideosToChips(videos);
    setChipItems(chips);
  }, [videos]);

  // Handle empty state
  if (videos.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>Vidéos Sources</Text>
          <Text style={styles.sectionSubtitle}>
            Sélectionnez les clips à utiliser
          </Text>
        </View>

        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <VideoIcon size={48} color="#666" />
          </View>
          <Text style={styles.emptyText}>Aucune vidéo disponible</Text>
          <Text style={styles.emptySubtext}>
            Uploadez d'abord des vidéos pour pouvoir les utiliser dans vos
            créations
          </Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => router.push('/source-videos')}
          >
            <Upload size={16} color="#007AFF" />
            <Text style={styles.uploadButtonText}>Uploader des vidéos</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Handle chip selection changes
  const handleChipSelection = (selectedValues: string[]) => {
    console.log('Chip selection changed:', selectedValues);

    // Find which chip was toggled
    const newSelection = selectedValues.find(
      (id) => !selectedVideoIds.includes(id)
    );
    const removedSelection = selectedVideoIds.find(
      (id) => !selectedValues.includes(id)
    );

    if (newSelection) {
      console.log('New selection:', newSelection);
      onVideoToggle(newSelection);
    } else if (removedSelection) {
      console.log('Removed selection:', removedSelection);
      onVideoToggle(removedSelection);
    }
  };

  // Transform chip items for display
  const displayChips = chipItems.map((chip) => ({
    ...chip,
    label: getChipDisplayText(chip, {
      showDuration: config.showDuration,
      showStatus: config.showStatus,
    }),
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.sectionTitle}>Vidéos Sources</Text>
          {selectedVideoIds.length > 0 && (
            <View style={styles.selectionBadge}>
              <Text style={styles.selectionBadgeText}>
                {selectedVideoIds.length} sélectionnée
                {selectedVideoIds.length > 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.sectionSubtitle}>
          Sélectionnez les clips à utiliser pour votre création
        </Text>
      </View>

      {/* Enhanced chips with better visual feedback */}
      <View style={styles.chipsWrapper}>
        {displayChips.map((chip, index) => {
          const isSelected = selectedVideoIds.includes(chip.value);
          return (
            <TouchableOpacity
              key={chip.value}
              style={[
                styles.enhancedChip,
                isSelected && styles.enhancedChipSelected,
              ]}
              onPress={() => onVideoToggle(chip.value)}
            >
              <View style={styles.chipContent}>
                <View
                  style={[
                    styles.chipIcon,
                    isSelected && styles.chipIconSelected,
                  ]}
                >
                  <Text style={styles.chipIconText}>
                    {isSelected ? '✓' : '📹'}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.chipLabel,
                    isSelected && styles.chipLabelSelected,
                  ]}
                  numberOfLines={1}
                >
                  {chip.label}
                </Text>
                {chip.status && chip.status !== 'processed' && (
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor:
                          chip.status === 'processing' ? '#f59e0b' : '#ef4444',
                      },
                    ]}
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 
      Original Chips component - keeping as fallback
      <Chips
        type="filter"
        itemVariant={config.variant || 'outlined'}
        items={displayChips}
        selectedValues={selectedVideoIds}
        setSelectedValues={handleChipSelection}
        containerStyle={styles.chipsContainer}
        itemContainerStyle={styles.chipItem}
        itemLabelStyle={styles.chipLabel}
      />
      */}

      {selectedVideoIds.length > 0 && (
        <View style={styles.selectionSummary}>
          <Text style={styles.selectionSummaryText}>
            {selectedVideoIds.length} vidéo
            {selectedVideoIds.length > 1 ? 's' : ''} sélectionnée
            {selectedVideoIds.length > 1 ? 's' : ''} pour la génération
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  header: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  selectionBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectionBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionSubtitle: {
    fontSize: 15,
    color: '#888',
    lineHeight: 20,
  },
  chipsWrapper: {
    marginHorizontal: 4,
    marginVertical: 8,
  },
  enhancedChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  enhancedChipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  chipIconSelected: {
    backgroundColor: '#fff',
  },
  chipIconText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  chipLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  chipLabelSelected: {
    color: '#fff',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  emptyState: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 16,
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'dashed',
  },
  emptyIconContainer: {
    backgroundColor: '#333',
    borderRadius: 32,
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#888',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  uploadButtonText: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '600',
  },
  selectionSummary: {
    marginTop: 16,
    paddingHorizontal: 4,
  },
  selectionSummaryText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
