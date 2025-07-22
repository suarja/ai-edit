/**
 * 🎨 VideoTagFilterSystem v2 - Migré vers la Palette Editia
 * 
 * MIGRATION PHASE 2:
 * ❌ Avant: 40 couleurs hardcodées avec palette de 12 couleurs de tags
 * ✅ Après: Système de tags cohérent avec palette Editia (#FF0050, #FFD700, #00FF88, #007AFF)
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { VideoType } from '@/lib/types/video.types';
import { COLORS } from '@/lib/constants/colors';

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

  // ✅ Get tag colors using Editia palette
  const getTagColor = (tag: string, index: number) => {
    // Special colors for special tags
    if (tag === 'Toutes') return COLORS.status.success; // #00FF88 (Vert Editia)
    if (tag === 'Sans tag') return COLORS.text.muted; // #666666

    // Palette de couleurs cohérente basée sur Editia
    const editiaTagColors = [
      COLORS.interactive.primary,     // #FF0050 (Rouge Editia)
      COLORS.interactive.secondary,   // #007AFF (Bleu Editia)
      COLORS.brand.gold,             // #FFD700 (Or Editia)
      COLORS.status.success,         // #00FF88 (Vert Editia)
      COLORS.brand.celebration,      // #FF6B35 (Orange Editia)
      COLORS.status.warning,         // #FF9500 (Orange système)
      '#8B5CF6', // Violet maintenu pour variété
      '#06B6D4', // Cyan maintenu pour variété
      '#84CC16', // Lime maintenu pour variété
      '#EC4899', // Rose maintenu pour variété
      '#6366F1', // Indigo maintenu pour variété
      '#14B8A6', // Teal maintenu pour variété
    ];
    return editiaTagColors[index % editiaTagColors.length];
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

      {/* Tag Filter Section avec palette Editia */}
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
                    isSelected && { 
                      backgroundColor: tagColor,
                      shadowColor: tagColor,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 4,
                    },
                  ]}
                  onPress={() => handleTagToggle(tag)}
                  activeOpacity={0.8}
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
                activeOpacity={0.8}
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
                  activeOpacity={0.8}
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
                                      '20', // Opacity 20%
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

      {/* Selection Summary avec couleur Editia */}
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
  // ✅ Container principal
  container: {
    marginBottom: 32,
  },
  
  // ✅ Header avec palette Editia
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
    color: COLORS.text.primary, // #FFFFFF
  },
  
  selectionBadge: {
    backgroundColor: COLORS.interactive.primary, // #FF0050 (Rouge Editia!)
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: COLORS.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  
  selectionBadgeText: {
    color: COLORS.text.primary, // #FFFFFF
    fontSize: 12,
    fontWeight: '600',
  },
  
  sectionSubtitle: {
    fontSize: 15,
    color: COLORS.text.tertiary, // #B0B0B0 (plus lisible que #888)
    lineHeight: 20,
  },

  // ✅ Tag Filter Styles avec palette Editia
  tagSection: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  
  tagSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  
  tagScrollContainer: {
    paddingRight: 20,
  },
  
  tagChip: {
    backgroundColor: COLORS.background.secondary, // #1a1a1a
    borderWidth: 1,
    borderColor: COLORS.surface.border, // rgba(255, 255, 255, 0.2)
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    minHeight: 36, // Touch target accessible
  },
  
  tagChipText: {
    color: COLORS.text.disabled, // #808080
    fontSize: 14,
    fontWeight: '500',
  },
  
  tagChipTextSelected: {
    color: COLORS.text.primary, // #FFFFFF
    fontWeight: '600',
  },
  
  activeFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    padding: 12,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12, // Radius plus moderne
    borderWidth: 1,
    borderColor: COLORS.surface.border,
  },
  
  activeFiltersText: {
    color: COLORS.text.tertiary, // #B0B0B0
    fontSize: 14,
    flex: 1,
  },
  
  clearFiltersButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    minHeight: 32, // Touch target
  },
  
  clearFiltersText: {
    color: COLORS.interactive.primary, // #FF0050 (Rouge Editia!)
    fontSize: 14,
    fontWeight: '600',
  },

  // ✅ Video Selection Styles
  videoSection: {
    paddingHorizontal: 4,
  },
  
  videoSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  
  videoGrid: {
    gap: 12,
  },
  
  videoChip: {
    backgroundColor: COLORS.background.secondary, // #1a1a1a
    borderWidth: 1,
    borderColor: COLORS.surface.border,
    borderRadius: 12,
    padding: 16,
    minHeight: 72, // Touch target accessible
  },
  
  videoChipSelected: {
    backgroundColor: COLORS.interactive.primaryBackground, // rgba(255, 0, 80, 0.12)
    borderColor: COLORS.interactive.primaryBorder, // rgba(255, 0, 80, 0.3)
    borderWidth: 2,
    shadowColor: COLORS.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  videoChipContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  
  videoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface.divider, // #333333
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  videoIconSelected: {
    backgroundColor: COLORS.interactive.primary, // #FF0050 (Rouge Editia!)
  },
  
  videoIconText: {
    fontSize: 16,
  },
  
  videoInfo: {
    flex: 1,
  },
  
  videoTitle: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 22,
  },
  
  videoTitleSelected: {
    color: COLORS.text.primary,
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
    borderRadius: 6, // Radius plus moderne
  },
  
  videoTagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  
  moreTagsText: {
    color: COLORS.text.disabled, // #808080
    fontSize: 10,
  },
  
  noTagsTag: {
    backgroundColor: 'rgba(102, 102, 102, 0.2)', // #666666 avec opacité
  },
  
  noTagsText: {
    color: COLORS.text.muted, // #666666
    fontSize: 10,
    fontWeight: '500',
  },

  // ✅ Empty State amélioré
  emptyState: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.surface.border,
    borderStyle: 'dashed',
  },
  
  emptyText: {
    color: COLORS.text.tertiary,
    fontSize: 16,
    textAlign: 'center',
  },
  
  emptySubtext: {
    color: COLORS.text.disabled,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 16,
  },

  // ✅ Selection Summary avec couleur success Editia
  selectionSummary: {
    marginTop: 16,
    paddingHorizontal: 4,
  },
  
  selectionSummaryText: {
    color: COLORS.status.success, // #00FF88 (Vert Editia!)
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

/**
 * 🎨 RÉSUMÉ DE LA MIGRATION VIDEO TAG FILTER SYSTEM:
 * 
 * ✅ COULEURS PRINCIPALES MIGRÉES:
 * • 12 couleurs de tags → Palette Editia centrée (#FF0050, #007AFF, #FFD700, #00FF88, #FF6B35)
 * • Badge de sélection en Rouge Editia avec shadow
 * • "Toutes" en Vert Editia, "Sans tag" en gris cohérent
 * • Chips sélectionnés avec backgrounds et bordures colorées
 * 
 * 🏷️ AMÉLIORATIONS SYSTÈME DE TAGS:
 * • Tags avec shadows colorées quand sélectionnés
 * • Palette cohérente avec variété visuelle maintenue
 * • Cards de vidéos avec highlight Rouge Editia
 * • Touch targets accessibles (36px minimum)
 * • Radius cohérent (6px, 8px, 12px)
 * 
 * 🚀 NOUVEAUTÉS:
 * • Sélection visuelle renforcée avec Rouge Editia
 * • Hiérarchie de couleurs respectée
 * • Summary en Vert Editia pour succès
 * • États interactifs améliorés
 * 
 * 40 couleurs hardcodées → Système de filtrage cohérent Editia ✨
 */