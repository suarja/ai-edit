import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { BarChart3, MessageCircle, Clock, TrendingUp, Crown, Plus } from 'lucide-react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useRevenueCat } from '@/providers/RevenueCat';

interface AccountInsight {
  id: string;
  tiktok_handle: string;
  analysis_date: string;
  status: 'completed' | 'processing' | 'failed';
  insights_summary?: string;
  metrics?: {
    followers: number;
    engagement_rate: number;
    videos_analyzed: number;
  };
}

export default function AccountInsightsScreen() {
  const { isSignedIn } = useAuth();
  const { isPro, isReady } = useRevenueCat();
  const [insights, setInsights] = useState<AccountInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulated data for now
  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Replace with real API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulated data
      const mockInsights: AccountInsight[] = [
        {
          id: '1',
          tiktok_handle: '@example_creator',
          analysis_date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          status: 'completed',
          insights_summary: 'Contenu lifestyle avec forte engagement. Audience 18-24 ans principalement.',
          metrics: {
            followers: 125000,
            engagement_rate: 4.2,
            videos_analyzed: 50,
          },
        },
        {
          id: '2',
          tiktok_handle: '@tech_reviewer',
          analysis_date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          status: 'completed',
          insights_summary: 'Reviews tech avec audience masculine 25-35 ans. Croissance constante.',
          metrics: {
            followers: 89000,
            engagement_rate: 3.8,
            videos_analyzed: 32,
          },
        },
      ];
      
      setInsights(mockInsights);
    } catch (err) {
      console.error('Error loading insights:', err);
      setError('Impossible de charger les analyses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewAnalysis = () => {
    if (!isPro) {
      Alert.alert(
        'Fonctionnalité PRO',
        'L\'analyse de compte TikTok nécessite un abonnement PRO.',
        [
          { text: 'Plus tard' },
          { text: 'Voir les plans', onPress: () => router.push('/subscription') },
        ]
      );
      return;
    }
    
    router.push(`/account-chat?new=${Date.now()}`);
  };

  const handleViewInsight = (insight: AccountInsight) => {
    // Navigate to chat with this analysis loaded
    router.push({
      pathname: '/account-chat',
      params: { analysisId: insight.id },
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#4CD964';
      case 'processing':
        return '#FF9500';
      case 'failed':
        return '#FF3B30';
      default:
        return '#888';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Terminé';
      case 'processing':
        return 'En cours';
      case 'failed':
        return 'Échec';
      default:
        return 'Inconnu';
    }
  };

  if (!isSignedIn) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.centeredContainer}>
          <MessageCircle size={48} color="#888" />
          <Text style={styles.centeredText}>Connectez-vous pour voir vos analyses</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isReady) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.centeredText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <BarChart3 size={24} color="#007AFF" />
          <Text style={styles.headerTitle}>Mes Analyses</Text>
        </View>
        {!isPro && (
          <View style={styles.proRequired}>
            <Crown size={16} color="#FFD700" />
            <Text style={styles.proText}>PRO</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadInsights}
            tintColor="#007AFF"
          />
        }
      >
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>❌ {error}</Text>
          </View>
        )}

        {/* Empty State */}
        {!isLoading && (!insights || insights.length === 0) && (
          <View style={styles.emptyState}>
            <TrendingUp size={64} color="#666" />
            <Text style={styles.emptyTitle}>Aucune analyse disponible</Text>
            <Text style={styles.emptyDescription}>
              {!isPro 
                ? 'Passez PRO pour analyser des comptes TikTok'
                : 'Commencez par analyser votre premier compte TikTok'
              }
            </Text>
            <TouchableOpacity
              style={[
                styles.emptyButton,
                !isPro && styles.emptyButtonDisabled
              ]}
              onPress={handleCreateNewAnalysis}
            >
              <Plus size={20} color={isPro ? "#007AFF" : "#666"} />
              <Text style={[
                styles.emptyButtonText,
                !isPro && styles.emptyButtonTextDisabled
              ]}>
                {!isPro ? 'PRO Requis' : 'Analyser un compte'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading State */}
        {isLoading && insights.length === 0 && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Chargement des analyses...</Text>
          </View>
        )}

        {/* Insights List */}
        {insights.map((insight) => (
          <TouchableOpacity
            key={insight.id}
            style={styles.insightCard}
            onPress={() => handleViewInsight(insight)}
          >
            <View style={styles.insightHeader}>
              <View style={styles.insightIcon}>
                <BarChart3 size={20} color="#007AFF" />
              </View>
              <View style={styles.insightInfo}>
                <Text style={styles.insightHandle} numberOfLines={1}>
                  {insight.tiktok_handle}
                </Text>
                <View style={styles.insightMeta}>
                  <Clock size={12} color="#888" />
                  <Text style={styles.insightDate}>
                    {formatDate(insight.analysis_date)}
                  </Text>
                </View>
              </View>
              <View style={styles.insightStatus}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor(insight.status) },
                  ]}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(insight.status) },
                  ]}
                >
                  {getStatusText(insight.status)}
                </Text>
              </View>
            </View>

            {insight.insights_summary && (
              <Text style={styles.insightSummary} numberOfLines={2}>
                {insight.insights_summary}
              </Text>
            )}

            {insight.metrics && (
              <View style={styles.insightMetrics}>
                <View style={styles.metric}>
                  <Text style={styles.metricValue}>
                    {formatNumber(insight.metrics.followers)}
                  </Text>
                  <Text style={styles.metricLabel}>Followers</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricValue}>
                    {insight.metrics.engagement_rate}%
                  </Text>
                  <Text style={styles.metricLabel}>Engagement</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricValue}>
                    {insight.metrics.videos_analyzed}
                  </Text>
                  <Text style={styles.metricLabel}>Vidéos</Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[
          styles.floatingButton,
          !isPro && styles.floatingButtonDisabled
        ]}
        onPress={handleCreateNewAnalysis}
      >
        {!isPro ? (
          <Crown size={24} color="#666" />
        ) : (
          <Plus size={24} color="#fff" />
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  centeredText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  proRequired: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  proText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 60,
  },
  loadingText: {
    color: '#888',
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  emptyButtonDisabled: {
    backgroundColor: 'rgba(102, 102, 102, 0.1)',
    borderColor: '#666',
  },
  emptyButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyButtonTextDisabled: {
    color: '#666',
  },
  insightCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  insightInfo: {
    flex: 1,
  },
  insightHandle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  insightMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  insightDate: {
    fontSize: 12,
    color: '#888',
  },
  insightStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  insightSummary: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
    marginBottom: 12,
  },
  insightMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 12,
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 12,
    color: '#888',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#007AFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  floatingButtonDisabled: {
    backgroundColor: '#333',
  },
}); 