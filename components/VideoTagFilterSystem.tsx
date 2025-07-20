import React, { useState,  useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { VideoType } from '@/lib/types/video';

interface VideoTagFilterSystemProps {
  videos: VideoType[];
  selectedVideoIds: VideoType[];
  onVideoToggle: (video: VideoType) => void;
  clearSelectedVideos: () => void;
}

export default function VideoTagFilterSystem({
  videos,
  selectedVideoIds,
  onVideoToggle,
  clearSelectedVideos,
}: VideoTagFilterSystemProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Extract all unique tags from videos and add special tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    videos.forEach((video) => {
      video.tags?.forEach((tag) => tagSet.add(tag));
    });

    // Create array and add special tags at the beginning
    const regularTags = Array.from(tagSet).sort();
    const specialTags = [];

    // Add "Toutes" tag to show all videos
    specialTags.push('Toutes');

    // Add "Sans tag" only if there are videos without tags
    const hasUntaggedVideos = videos.some(
      (video) => !video.tags || video.tags.length === 0
    );
    if (hasUntaggedVideos) {
      specialTags.push('Sans tag');
    }

    return [...specialTags, ...regularTags];
  }, [videos]);

  // Get tag colors for visual appeal
  const getTagColor = (tag: string, index: number) => {
    // Special colors for special tags
    if (tag === 'Toutes') return '#10b981';
    if (tag === 'Sans tag') return '#6b7280';

    const colors = [
      '#007AFF',
      '#10b981',
      '#f59e0b',
      '#ef4444',
      '#8b5cf6',
      '#06b6d4',
      '#f97316',
      '#84cc16',
      '#ec4899',
      '#6366f1',
      '#14b8a6',
      '#f59e0b',
    ];
    return colors[index % colors.length];
  };

  // Filter videos based on selected tags
  const filteredVideos = useMemo(() => {
    // Show NO videos when no tags are selected
    if (selectedTags.length === 0) {
      return [];
    }

    return videos.filter((video) => {
      return selectedTags.some((selectedTag) => {
        // Handle special tags
        if (selectedTag === 'Toutes') {
          return true; // Show all videos
        }

        if (selectedTag === 'Sans tag') {
          return !video.tags || video.tags.length === 0; // Show untagged videos
        }

        // Regular tag filtering
        return video.tags?.includes(selectedTag);
      });
    });
  }, [videos, selectedTags]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

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
          Filtrez par catégories puis sélectionnez vos vidéos
        </Text>
      </View>

      {/* Tag Filter Section */}
      {allTags.length > 0 && (
        <View style={styles.tagSection}>
       
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagScrollContainer}
          >
            {allTags.map((tag, index) => {
              const isSelected = selectedTags.includes(tag);
              const tagColor = getTagColor(tag, index);

              return (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.tagChip,
                    isSelected && { backgroundColor: tagColor },
                  ]}
                  onPress={() => handleTagToggle(tag)}
                >
                  <Text
                    style={[
                      styles.tagChipText,
                      isSelected && styles.tagChipTextSelected,
                    ]}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {selectedTags.length > 0 && (
            <View style={styles.activeFilters}>
              <Text style={styles.activeFiltersText}>
                Montrant les vidéos avec: {selectedTags.join(' OU ')}
              </Text>
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={() => {
                  setSelectedTags([]);
                  clearSelectedVideos();
                }}
              >
                <Text style={styles.clearFiltersText}>Effacer</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Video Selection Section */}
      <View style={styles.videoSection}>
        <Text style={styles.videoSectionTitle}>
          📹 Vidéos disponibles ({filteredVideos.length})
        </Text>

        {filteredVideos.length === 0 ? (
          <View style={styles.emptyState}>
            
            {selectedTags.length === 0 && (
              <Text style={styles.emptySubtext}>
                👆 Choisissez vos catégories ci-dessus pour filtrer les vidéos
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.videoGrid}>
            {filteredVideos.map((video) => {
              const isSelected = selectedVideoIds.includes(video);

              return (
                <TouchableOpacity
                  key={video.id}
                  style={[
                    styles.videoChip,
                    isSelected && styles.videoChipSelected,
                  ]}
                  onPress={() => onVideoToggle(video)}
                >
                  <View style={styles.videoChipContent}>
                    <View
                      style={[
                        styles.videoIcon,
                        isSelected && styles.videoIconSelected,
                      ]}
                    >
                      <Text style={styles.videoIconText}>
                        {isSelected ? '✓' : '🎥'}
                      </Text>
                    </View>
                    <View style={styles.videoInfo}>
                      <Text
                        style={[
                          styles.videoTitle,
                          isSelected && styles.videoTitleSelected,
                        ]}
                        numberOfLines={2}
                      >
                        {video.title || 'Vidéo sans titre'}
                      </Text>
                      <View style={styles.videoTagsContainer}>
                        {video.tags && video.tags.length > 0 ? (
                          <>
                            {video.tags.slice(0, 3).map((tag, index) => (
                              <View
                                key={tag}
                                style={[
                                  styles.videoTag,
                                  {
                                    backgroundColor:
                                      getTagColor(tag, allTags.indexOf(tag)) +
                                      '20',
                                  },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.videoTagText,
                                    {
                                      color: getTagColor(
                                        tag,
                                        allTags.indexOf(tag)
                                      ),
                                    },
                                  ]}
                                >
                                  {tag}
                                </Text>
                              </View>
                            ))}
                            {video.tags.length > 3 && (
                              <Text style={styles.moreTagsText}>
                                +{video.tags.length - 3}
                              </Text>
                            )}
                          </>
                        ) : (
                          <View style={[styles.videoTag, styles.noTagsTag]}>
                            <Text style={styles.noTagsText}>Sans tag</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* Selection Summary */}
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

  // Tag Filter Styles
  tagSection: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  tagSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  tagScrollContainer: {
    paddingRight: 20,
  },
  tagChip: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  tagChipText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
  },
  tagChipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  activeFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
  },
  activeFiltersText: {
    color: '#888',
    fontSize: 14,
    flex: 1,
  },
  clearFiltersButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  clearFiltersText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Video Selection Styles
  videoSection: {
    paddingHorizontal: 4,
  },
  videoSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  videoGrid: {
    gap: 12,
  },
  videoChip: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 16,
  },
  videoChipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  videoChipContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  videoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  videoIconSelected: {
    backgroundColor: '#fff',
  },
  videoIconText: {
    fontSize: 16,
  },
  videoInfo: {
    flex: 1,
  },
  videoTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  videoTitleSelected: {
    color: '#fff',
  },
  videoTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 4,
  },
  videoTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  videoTagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  moreTagsText: {
    color: '#888',
    fontSize: 10,
  },
  noTagsTag: {
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
  },
  noTagsText: {
    color: '#6b7280',
    fontSize: 10,
    fontWeight: '500',
  },

  // Empty State
  emptyState: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    borderStyle: 'dashed',
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },

  // Selection Summary
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
