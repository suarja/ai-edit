import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import {
  AlertCircle,
  ArrowRightCircle,
  CheckCircle2,
  ChevronsRight,
  FileText,
  Loader,
  PlayCircle,
  MessageSquare,
  Icon,
} from 'lucide-react-native';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Based on the provided log structure
interface LogEvent {
  event: string;
  timestamp: string;
  [key: string]: any;
}

interface AnalysisLogsProps {
  events: LogEvent[];
}

const EVENT_CONFIG: {
  [key: string]: { icon: React.ElementType<any>; color: string; getTitle: (e: LogEvent) => string };
} = {
  apify_started: {
    icon: PlayCircle,
    color: '#34D399', // Emerald 400
    getTitle: (e) => `Scraping started for @${e.tiktok_handle}`,
  },
  phase_transition: {
    icon: ChevronsRight,
    color: '#60A5FA', // Blue 400
    getTitle: (e) => `Phase changed from '${e.from}' to '${e.to}'`,
  },
  message: {
    icon: MessageSquare,
    color: '#A78BFA', // Violet 400
    getTitle: (e) => e.message,
  },
  job_failed: {
    icon: AlertCircle,
    color: '#F87171', // Red 400
    getTitle: (e) => `Error: ${e.error}`,
  },
  default: {
    icon: FileText,
    color: '#9CA3AF', // Gray 400
    getTitle: (e) => `Event: ${e.event}`,
  },
};

const LogItem: React.FC<{ item: LogEvent }> = ({ item }) => {
  const config = EVENT_CONFIG[item.event] || EVENT_CONFIG.default;
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
        <Text style={styles.logTitle}>{config.getTitle(item)}</Text>
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