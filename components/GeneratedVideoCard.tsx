import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  Film,
  Clock,
  Play,
  Download,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Loader,
} from 'lucide-react-native';
import { SHARED_STYLE_COLORS } from '@/lib/constants/sharedStyles';

// Support both old VideoRequest and new DisplayVideo formats
type VideoRequest = {
  id: string;
  script_id: string;
  render_status: 'queued' | 'rendering' | 'done' | 'error';
  render_url: string | null;
  render_id?: string;
  created_at: string;
  script?: {
    id: string;
    raw_prompt: string;
  };
};

type DisplayVideo = {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  render_status: 'queued' | 'rendering' | 'done' | 'error';
  render_url: string | null;
  tags?: string[];
  script_id: string;
};

type GeneratedVideoCardProps = {
  video: VideoRequest | DisplayVideo;
  onPress: () => void;
  onDownload?: () => void;
  onMoreOptions?: () => void;
};

export default function GeneratedVideoCard({
  video,
  onPress,
  onDownload,
  onMoreOptions,
}: GeneratedVideoCardProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'done':
        return {
          icon: CheckCircle,
          color: SHARED_STYLE_COLORS.success,
          bgColor: 'rgba(76, 217, 100, 0.08)',
          borderColor: '#333',
          label: 'Terminé',
          description: 'Vidéo prête à regarder',
        };
      case 'rendering':
        return {
          icon: Loader,
          color: SHARED_STYLE_COLORS.primary,
          bgColor: 'rgba(255, 149, 0, 0.08)',
          borderColor: '#333',
          label: 'En cours',
          description: 'Génération en cours...',
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: SHARED_STYLE_COLORS.primary,
          bgColor: 'rgba(255, 59, 48, 0.08)',
          borderColor: '#333',
          label: 'Erreur',
          description: 'Échec de la génération',
        };
      default:
        return {
          icon: Clock,
          color: SHARED_STYLE_COLORS.text,
          bgColor: 'rgba(136, 136, 136, 0.08)',
          borderColor: '#333',
          label: 'En attente',
          description: "En file d'attente",
        };
    }
  };

  const statusConfig = getStatusConfig(video.render_status);
  const StatusIcon = statusConfig.icon;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return 'Il y a quelques minutes';
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  // Helper to get the title/prompt text
  const getVideoTitle = () => {
    // Check if it's DisplayVideo format (has title property)
    if ('title' in video) {
      return video.title;
    }
    // Otherwise it's VideoRequest format (has script.raw_prompt)
    return video.script?.raw_prompt || 'Vidéo sans description';
  };

  // Helper to get the description text
  const getVideoDescription = () => {
    // Check if it's DisplayVideo format (has description property)
    if ('description' in video) {
      return video.description || statusConfig.description;
    }
    // Otherwise use status description
    return statusConfig.description;
  };

  const truncateText = (text: string, maxLength: number = 120) => {
    if (!text) return 'Vidéo sans description';
    return text.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text;
  };

  const videoTitle = getVideoTitle();
  const videoDescription = getVideoDescription();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          borderColor: statusConfig.borderColor,
          backgroundColor: SHARED_STYLE_COLORS.backgroundSecondary,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Film size={24} color={SHARED_STYLE_COLORS.primary} />
        </View>

        <View style={styles.headerContent}>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusConfig.bgColor },
              ]}
            >
              {video.render_status === 'rendering' ? (
                <ActivityIndicator size={12} color={statusConfig.color} />
              ) : (
                <StatusIcon size={12} color={statusConfig.color} />
              )}
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.moreButton}
              onPress={onMoreOptions}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MoreVertical size={16} color={SHARED_STYLE_COLORS.text} />
            </TouchableOpacity>
          </View>

          <Text style={styles.statusDescription}>{videoDescription}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.prompt} numberOfLines={3}>
          {truncateText(videoTitle)}
        </Text>

        <View style={styles.metadata}>
          <View style={styles.dateContainer}>
            <Clock size={12} color={SHARED_STYLE_COLORS.text} />
            <Text style={styles.dateText}>{formatDate(video.created_at)}</Text>
          </View>

          {video.render_status === 'done' && video.render_url && (
            <TouchableOpacity style={styles.actionButton} onPress={onDownload}>
              <Download size={14} color={SHARED_STYLE_COLORS.background} />
              <Text style={styles.actionButtonText}>Télécharger</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {video.render_status === 'done' && (
        <View style={styles.playOverlay}>
          <View style={styles.playButton}>
            <Play
              size={16}
              color={SHARED_STYLE_COLORS.text}
              fill={SHARED_STYLE_COLORS.text}
            />
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: SHARED_STYLE_COLORS.backgroundSecondary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: SHARED_STYLE_COLORS.primaryBorder,
    position: 'relative',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  iconContainer: {
    backgroundColor: SHARED_STYLE_COLORS.primaryOverlay,
    borderRadius: 12,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    gap: 6,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statusDescription: {
    fontSize: 13,
    color: SHARED_STYLE_COLORS.text,
    fontWeight: '500',
  },
  moreButton: {
    padding: 4,
  },
  content: {
    gap: 16,
  },
  prompt: {
    fontSize: 15,
    color: SHARED_STYLE_COLORS.text,
    lineHeight: 22,
    fontWeight: '500',
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    color: SHARED_STYLE_COLORS.text,
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SHARED_STYLE_COLORS.accent,
    borderWidth: 1,
    borderColor: SHARED_STYLE_COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 12,
    color: SHARED_STYLE_COLORS.background,
    fontWeight: '600',
  },
  playOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  playButton: {
    backgroundColor: SHARED_STYLE_COLORS.primary,
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: SHARED_STYLE_COLORS.backgroundSecondary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
});
