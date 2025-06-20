import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { 
  MessageCircle, 
  Brain, 
  Cog, 
  CheckCircle,
  Sparkles 
} from 'lucide-react-native';

interface StreamingStatusProps {
  isStreaming: boolean;
  streamingStatus: string | null;
}

export default function StreamingStatus({ isStreaming, streamingStatus }: StreamingStatusProps) {
  if (!isStreaming || !streamingStatus) return null;

  const getStatusIcon = (status: string) => {
    if (status.includes('Initialisation')) {
      return <Cog size={16} color="#007AFF" />;
    }
    if (status.includes('profil')) {
      return <Brain size={16} color="#007AFF" />;
    }
    if (status.includes('contexte') || status.includes('Analyse')) {
      return <MessageCircle size={16} color="#007AFF" />;
    }
    if (status.includes('Génération')) {
      return <Sparkles size={16} color="#007AFF" />;
    }
    if (status.includes('Traitement') || status.includes('Mise à jour')) {
      return <CheckCircle size={16} color="#007AFF" />;
    }
    return <ActivityIndicator size="small" color="#007AFF" />;
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        {getStatusIcon(streamingStatus)}
        <Text style={styles.statusText}>{streamingStatus}</Text>
      </View>
      <View style={styles.progressBar}>
        <View style={styles.progressFill} />
      </View>
    </View>
  );
}

const styles = {
  container: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.2)',
  },
  statusRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 8,
  },
  statusText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500' as const,
    flex: 1,
  },
  progressBar: {
    height: 2,
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    borderRadius: 1,
    overflow: 'hidden' as const,
  },
  progressFill: {
    height: 2,
    backgroundColor: '#007AFF',
    width: '60%' as const, // Animated progress would be better
    borderRadius: 1,
  },
}; 