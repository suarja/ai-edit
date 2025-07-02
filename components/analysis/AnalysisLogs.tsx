import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import {
  AlertCircle,
  ArrowRightCircle,
  CheckCircle2,
  ChevronsRight,
  FileText,
  Database,
  Search,
  Cpu,
  PlayCircle,
  MessageSquare,
  Sparkles,
  Zap,
} from 'lucide-react-native';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Based on the provided log structure
interface LogEvent {
  event: string;
  timestamp: string;
  message?: string;
  [key: string]: any;
}

interface AnalysisLogsProps {
  events: LogEvent[];
}

// NEW: More descriptive and flexible event configuration
const EVENT_CONFIG: {
  [key: string]: { icon: React.ElementType<any>; color: string };
} = {
  // Scraping Phase
  apify_started: { icon: PlayCircle, color: '#34D399' },
  phase_transition: { icon: ChevronsRight, color: '#60A5FA' },
  
  // Data Fetching & Storing
  fetch_videos_start: { icon: Search, color: '#A78BFA' },
  fetch_videos_complete: { icon: Database, color: '#A78BFA' },
  
  // Analysis Phase
  identify_top_videos_start: { icon: Search, color: '#FBBF24' },
  identify_top_videos_complete: { icon: Sparkles, color: '#FBBF24' },
  llm_analysis_start: { icon: Cpu, color: '#FBBF24'},
  llm_analysis_complete: { icon: Sparkles, color: '#FBBF24'},
  
  // Job Status
  job_completed: { icon: CheckCircle2, color: '#34D399' },
  job_failed: { icon: AlertCircle, color: '#F87171' },

  // Generic Levels
  info: { icon: MessageSquare, color: '#9CA3AF' },
  warn: { icon: AlertCircle, color: '#FBBF24'}, // Warning color
  default: { icon: FileText, color: '#9CA3AF' },
};

// NEW: Flexible title generation
const getLogTitle = (item: LogEvent): string => {
  if (item.message) {
    return item.message;
  }
  // Fallback titles for events without a message
  switch (item.event) {
    case 'apify_started':
      return `Démarrage du scraping pour @${item.tiktok_handle}`;
    case 'phase_transition':
      return `Changement de phase: ${item.from} -> ${item.to}`;
    case 'job_failed':
      return `Erreur: ${item.error || 'Inconnue'}`;
    default:
      return item.event.replace(/_/g, ' '); // Format event name nicely
  }
};

const LogItem: React.FC<{ item: LogEvent }> = ({ item }) => {
  // Use event for config, but level for 'warn' and 'info' events
  const configKey = item.level || item.event || 'default';
  const config = EVENT_CONFIG[configKey] || EVENT_CONFIG.default;
  const IconComponent = config.icon;

  const formattedTimestamp = item.timestamp
    ? format(new Date(item.timestamp), 'HH:mm:ss', { locale: fr })
    : '';

  return (
    <View style={styles.logItem}>
      <View style={[styles.iconContainer, { backgroundColor: `${config.color}20` }]}>
        <IconComponent size={16} color={config.color} />
      </View>
      <View style={styles.logContent}>
        <Text style={styles.logTitle}>{getLogTitle(item)}</Text>
        <Text style={styles.logTimestamp}>{formattedTimestamp}</Text>
      </View>
    </View>
  );
};

const AnalysisLogs: React.FC<AnalysisLogsProps> = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Logs</Text>
        <View style={styles.noLogsContainer}>
            <FileText size={24} color="#4B5563" />
            <Text style={styles.noLogsText}>No detailed logs available for this run.</Text>
        </View>
      </View>
    );
  }

  // Sort events by timestamp descending
  const sortedEvents = [...events].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Logs Détaillés</Text>
      <View style={styles.logsList}>
        {sortedEvents.map((event, index) => (
          <LogItem key={index} item={event} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    width: '100%',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  logsList: {
    gap: 12,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logContent: {
    flex: 1,
  },
  logTitle: {
    fontSize: 14,
    color: '#E5E7EB', // Gray 200
    lineHeight: 20,
  },
  logTimestamp: {
    fontSize: 12,
    color: '#6B7280', // Gray 500
    marginTop: 2,
  },
  noLogsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
    backgroundColor: '#111827', // Gray 900
    borderRadius: 12,
  },
  noLogsText: {
    fontSize: 14,
    color: '#9CA3AF', // Gray 400
  }
});

export default AnalysisLogs; 