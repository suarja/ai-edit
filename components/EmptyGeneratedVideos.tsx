import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Film, Sparkles, Plus } from 'lucide-react-native';
import { SHARED_STYLE_COLORS } from '@/lib/constants/sharedStyles';

type EmptyGeneratedVideosProps = {
  onCreateVideo: () => void;
};

export default function EmptyGeneratedVideos({
  onCreateVideo,
}: EmptyGeneratedVideosProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <View style={styles.iconBackground}>
          <Film size={48} color={SHARED_STYLE_COLORS.primary} />
        </View>
        <View style={styles.sparkleIcon}>
          <Sparkles size={20} color={SHARED_STYLE_COLORS.primary} />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Aucune vidéo générée</Text>
        <Text style={styles.description}>
          Créez votre première vidéo IA en utilisant vos clips sources et votre
          profil éditorial personnalisé
        </Text>
      </View>

      <View style={styles.features}>
        <View style={styles.featureItem}>
          <View style={styles.featureDot} />
          <Text style={styles.featureText}>
            Génération automatique de script
          </Text>
        </View>
        <View style={styles.featureItem}>
          <View style={styles.featureDot} />
          <Text style={styles.featureText}>Voix clonée personnalisée</Text>
        </View>
        <View style={styles.featureItem}>
          <View style={styles.featureDot} />
          <Text style={styles.featureText}>Montage intelligent des clips</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.createButton} onPress={onCreateVideo}>
          <Plus size={20} color={SHARED_STYLE_COLORS.background} />
        <Text style={styles.createButtonText}>Créer ma première vidéo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 32,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBackground: {
    backgroundColor: SHARED_STYLE_COLORS.primaryOverlay,
    borderRadius: 40,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
        borderColor: SHARED_STYLE_COLORS.primaryBorder,
  },
  sparkleIcon: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: SHARED_STYLE_COLORS.primaryOverlay,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
      borderColor: SHARED_STYLE_COLORS.primaryBorder,
  },
  content: {
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: SHARED_STYLE_COLORS.text,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: SHARED_STYLE_COLORS.text,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  features: {
    gap: 12,
    alignSelf: 'stretch',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: SHARED_STYLE_COLORS.primary,
  },
  featureText: {
    fontSize: 15,
    color: SHARED_STYLE_COLORS.text,
    fontWeight: '500',
  },
  createButton: {
    backgroundColor: SHARED_STYLE_COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: SHARED_STYLE_COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 200,
  },
  createButtonText: {
    color: SHARED_STYLE_COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
