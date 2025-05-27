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

type GeneratedVideoCardProps = {
  video: VideoRequest;
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
          color: '#10b981',
          bgColor: 'rgba(16, 185, 129, 0.1)',
          borderColor: 'rgba(16, 185, 129, 0.3)',
          label: 'Terminé',
          description: 'Vidéo prête à regarder',
        };
      case 'rendering':
        return {
          icon: Loader,
          color: '#f59e0b',
          bgColor: 'rgba(245, 158, 11, 0.1)',
          borderColor: 'rgba(245, 158, 11, 0.3)',
          label: 'En cours',
          description: 'Génération en cours...',
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: '#ef4444',
          bgColor: 'rgba(239, 68, 68, 0.1)',
          borderColor: 'rgba(239, 68, 68, 0.3)',
          label: 'Erreur',
          description: 'Échec de la génération',
        };
      default:
        return {
          icon: Clock,
          color: '#6b7280',
          bgColor: 'rgba(107, 114, 128, 0.1)',
          borderColor: 'rgba(107, 114, 128, 0.3)',
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

  const truncatePrompt = (
    prompt: string | undefined,
    maxLength: number = 120
  ) => {
    if (!prompt) return 'Vidéo sans description';
    return prompt.length > maxLength
      ? prompt.substring(0, maxLength) + '...'
      : prompt;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          borderColor: statusConfig.borderColor,
          backgroundColor:
            video.render_status === 'done'
              ? 'rgba(16, 185, 129, 0.02)'
              : '#1a1a1a',
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Film size={24} color="#007AFF" />
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
              <MoreVertical size={16} color="#888" />
            </TouchableOpacity>
          </View>

          <Text style={styles.statusDescription}>
            {statusConfig.description}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.prompt} numberOfLines={3}>
          {truncatePrompt(video.script?.raw_prompt)}
        </Text>

        <View style={styles.metadata}>
          <View style={styles.dateContainer}>
            <Clock size={12} color="#888" />
            <Text style={styles.dateText}>{formatDate(video.created_at)}</Text>
          </View>

          {video.render_status === 'done' && video.render_url && (
            <TouchableOpacity style={styles.actionButton} onPress={onDownload}>
              <Download size={14} color="#007AFF" />
              <Text style={styles.actionButtonText}>Télécharger</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {video.render_status === 'done' && (
        <View style={styles.playOverlay}>
          <View style={styles.playButton}>
            <Play size={16} color="#fff" fill="#fff" />
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
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
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
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
    color: '#888',
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
    color: '#fff',
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
    color: '#888',
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  playOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  playButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
