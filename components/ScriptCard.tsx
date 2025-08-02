import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  MessageCircle,
  Clock,
  MoreVertical,
} from 'lucide-react-native';
import { SHARED_STYLE_COLORS } from '@/lib/constants/sharedStyles';
import { ScriptService } from '@/lib/services/scriptService';

type Script = {
  id: string;
  title?: string;
  current_script?: string;
  updated_at: string;
  status?: string;
  word_count?: number;
  estimated_duration?: number;
};

type ScriptCardProps = {
  script: Script;
  onPress: () => void;
  onMorePress: () => void;
};

export default function ScriptCard({
  script,
  onPress,
  onMorePress,
}: ScriptCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getScriptPreview = (script: string) => {
    return script.length > 100 ? script.substring(0, 100) + '...' : script;
  };

  const getStatusConfig = (status?: string) => {
    switch (status) {
      case 'validated':
        return {
          color: SHARED_STYLE_COLORS.success,
          bgColor: 'rgba(76, 217, 100, 0.08)',
        };
      default:
        return {
          color: SHARED_STYLE_COLORS.warning,
          bgColor: 'rgba(255, 149, 0, 0.08)',
        };
    }
  };

  const statusConfig = getStatusConfig(script.status);
  const { wordCount, estimatedDuration } =
    ScriptService.calculateScriptDuration(script.current_script || '');
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <MessageCircle size={20} color={SHARED_STYLE_COLORS.primary} />
          </View>
          
          <View style={styles.headerContent}>
            <Text style={styles.title} numberOfLines={1}>
              {script.title || 'Script sans titre'}
            </Text>
            <View style={styles.metadata}>
              <Clock size={12} color="#888" />
              <Text style={styles.date}>
                {formatDate(script.updated_at)}
              </Text>
            </View>
          </View>

          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: statusConfig.color,
                },
              ]}
            />
          </View>

          <TouchableOpacity
            onPress={onMorePress}
            style={styles.moreButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MoreVertical size={20} color="#888" />
          </TouchableOpacity>
        </View>

        {script.current_script && (
          <Text style={styles.preview} numberOfLines={3}>
            {getScriptPreview(script.current_script)}
          </Text>
        )}

        <View style={styles.footer}>
          <Text style={styles.stats}>
              {wordCount} mots • {estimatedDuration}s
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: SHARED_STYLE_COLORS.backgroundSecondary,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: SHARED_STYLE_COLORS.primaryOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
  statusContainer: {
    marginRight: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  moreButton: {
    padding: 8,
    borderRadius: 6,
  },
  preview: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 8,
  },
  stats: {
    fontSize: 12,
    color: '#888',
  },
});