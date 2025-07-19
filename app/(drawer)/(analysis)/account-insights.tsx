import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  BarChart3,
  Users,
  Eye,
  Heart,
  MessageCircle,
  Clock,
  Music,
  Video,
  Hash,
} from 'lucide-react-native';
import { useRevenueCat } from '@/contexts/providers/RevenueCat';
import { useAuth } from '@clerk/clerk-expo';
import { API_ENDPOINTS } from '@/lib/config/api';
import { useAccountAnalysis } from '@/components/hooks/useAccountAnalysis';
import AnalysisHeader from '@/components/analysis/AnalysisHeader';
import { accountInsightsStyles } from '@/lib/utils/styles/accountInsights.styles';

// Updated types to match the new comprehensive context
interface AccountData {
  tiktok_handle: string;
  username?: string;
  profile_pic_url?: string;
}

interface AccountStats {
  followers_count: number;
  following_count: number;
  likes_count: number;
  videos_count: number;
}

interface AccountAggregates {
  avg_views?: number;
  avg_likes?: number;
  avg_comments?: number;
  best_posting_time?: string;
  top_hashtags?: string[];
  video_length_distribution?: {
    short: { count: number };
    medium: { count: number };
    long: { count: number };
  };
  music_usage_stats?: {
    original_music_ratio?: number;
  };
  sponsored_ratio?: number;
}

interface LlmInsights {
  profile_summary?: {
    overview?: string;
    strengths?: string[];
    weaknesses?: string[];
  };
  recommendations?: {
    content_strategy?: any[];
  };
}

interface ComprehensiveContext {
  account: AccountData;
  stats: AccountStats;
  aggregates: AccountAggregates;
  insights: LlmInsights;
}

export default function AccountInsightsScreen() {
  const router = useRouter();
  const { currentPlan, presentPaywall } = useRevenueCat();
  const { getToken } = useAuth();
  const {
    analysis,
    isLoading: isAnalysisLoading,
    refreshAnalysis,
  } = useAccountAnalysis();

  const [context, setContext] = useState<ComprehensiveContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (analysis) {
      loadAccountContext(analysis.account_id);
    } else if (!isAnalysisLoading) {
      // If analysis is done loading and it's null, we stop loading.
      // The guard should have redirected, but this is a safeguard.
      setLoading(false);
    }
  }, [analysis, isAnalysisLoading]);

  const loadAccountContext = async (accountId: string) => {
    console.log(
      '🔄 loadAccountContext: Loading account context for accountId:',
      accountId
    );
    try {
      setLoading(true);
      const token = await getToken();

      const response = await fetch(
        API_ENDPOINTS.TIKTOK_ACCOUNT_CONTEXT(accountId),
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      console.log('🔄 data:', JSON.stringify(data, null, 2));

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch account context');
      }

      setContext(data);
    } catch (error) {
      console.error(
        'Erreur lors du chargement des données de contexte:',
        error
      );
      Alert.alert('Erreur', 'Impossible de charger les données du compte.');
      setContext(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // First refresh the base analysis to get the latest ID if needed
    await refreshAnalysis();
    // The useEffect will then trigger loadAccountContext if analysis is found
    setRefreshing(false);
  };

  const navigateToAccountChat = () => {
    // Navigate to the list of conversations
    router.push('/(drawer)/(analysis)/account-conversations');
  };

  // Account Insights should be accessible to all users
  // No paywall gating for this feature

  // Use the hook's loading state initially
  if (isAnalysisLoading || loading) {
    return (
      <SafeAreaView style={accountInsightsStyles.container} edges={[]}>
        <View style={accountInsightsStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={accountInsightsStyles.loadingText}>
            Chargement de vos insights...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // This screen should now only render if context is available,
  // because the guard handles the no-analysis case.
  if (!context) {
    return (
      <SafeAreaView style={accountInsightsStyles.container} edges={['top']}>
        <AnalysisHeader title={'Insights'} onBack={() => router.back()} />
        <ScrollView
          contentContainerStyle={accountInsightsStyles.emptyStateContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <BarChart3 size={64} color="#666" />
          <Text style={accountInsightsStyles.emptyStateTitle}>
            Données non disponibles
          </Text>
          <Text style={accountInsightsStyles.emptyStateDescription}>
            Nous n&apos;avons pas pu charger les données pour ce compte.
            Veuillez réessayer.
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const { account, stats, aggregates, insights } = context;

  return (
    <SafeAreaView style={accountInsightsStyles.container} edges={['top']}>
      <AnalysisHeader title={'Insights'} onBack={() => router.back()} />
      <ScrollView
        style={accountInsightsStyles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#fff"
          />
        }
      >
        {/* Header with profile pic and handle */}
        <View style={accountInsightsStyles.profileHeader}>
          {/* Image component would go here */}
          <Image
            source={{ uri: account.profile_pic_url }}
            style={accountInsightsStyles.profilePic}
          />
          <View style={accountInsightsStyles.profileInfo}>
            <Text style={accountInsightsStyles.profileHandle}>
              @{account.tiktok_handle}
            </Text>
            <Text style={accountInsightsStyles.profileUsername}>
              {account.username}
            </Text>
          </View>
        </View>

        {/* Stats Overview */}
        <View style={accountInsightsStyles.statsContainer}>
          <Text style={accountInsightsStyles.sectionTitle}>
            Vue d&apos;ensemble
          </Text>
          <View style={accountInsightsStyles.statsGrid}>
            <StatCard
              icon={<Users size={24} color="#007AFF" />}
              value={stats.followers_count?.toLocaleString() || 'N/A'}
              label="Abonnés"
            />
            <StatCard
              icon={<Eye size={24} color="#10b981" />}
              value={
                aggregates.avg_views?.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                }) || 'N/A'
              }
              label="Vues moy."
            />
            <StatCard
              icon={<Heart size={24} color="#ef4444" />}
              value={`${(aggregates.avg_views && aggregates.avg_likes
                ? (aggregates.avg_likes / aggregates.avg_views) * 100
                : 0
              ).toFixed(1)}%`}
              label="Taux de Likes"
            />
            <StatCard
              icon={<Video size={24} color="#f59e0b" />}
              value={stats.videos_count?.toLocaleString() || 'N/A'}
              label="Vidéos"
            />
          </View>
        </View>

        {/* EditIA Insights */}
        <View style={accountInsightsStyles.analysisContainer}>
          <View style={accountInsightsStyles.sectionHeader}>
            <Text style={accountInsightsStyles.sectionTitle}>
              Analyse EditIA
            </Text>
            <TouchableOpacity
              style={accountInsightsStyles.chatButton}
              onPress={navigateToAccountChat}
            >
              <MessageCircle size={20} color="#007AFF" />
              <Text style={accountInsightsStyles.chatButtonText}>Chat IA</Text>
            </TouchableOpacity>
          </View>

          <View style={accountInsightsStyles.recommendationCard}>
            <Text style={accountInsightsStyles.analysisSubtitle}>
              Forces Principales
            </Text>
            {(
              insights.profile_summary?.strengths || ['Analyse en cours...']
            ).map((strength, index) => (
              <View key={index} style={accountInsightsStyles.recommendation}>
                <Text style={accountInsightsStyles.recommendationText}>
                  • {strength}
                </Text>
              </View>
            ))}
          </View>

          <View
            style={[
              accountInsightsStyles.recommendationCard,
              accountInsightsStyles.marginTop,
            ]}
          >
            <Text style={accountInsightsStyles.analysisSubtitle}>
              Axes d&apos;Amélioration
            </Text>
            {(
              insights.profile_summary?.weaknesses || ['Analyse en cours...']
            ).map((weakness, index) => (
              <View key={index} style={accountInsightsStyles.recommendation}>
                <Text style={accountInsightsStyles.recommendationText}>
                  • {weakness}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Performance Metrics */}
        <View style={accountInsightsStyles.analysisContainer}>
          <Text style={accountInsightsStyles.sectionTitle}>
            Métriques de Performance
          </Text>
          <View style={accountInsightsStyles.metricsGrid}>
            <MetricCard
              icon={<Clock size={20} color="#fff" />}
              label="Meilleur moment de publication"
              value={aggregates.best_posting_time || 'N/A'}
              description="Horaire optimal pour l'engagement"
            />
            <MetricCard
              icon={<Music size={20} color="#fff" />}
              label="Musique Originale"
              value={`${(
                (aggregates.music_usage_stats?.original_music_ratio || 0) * 100
              ).toFixed(0)}%`}
              description="Ratio de sons originaux utilisés"
            />
          </View>
        </View>

        {/* Hashtag Analysis */}
        {aggregates.top_hashtags && aggregates.top_hashtags.length > 0 && (
          <View style={accountInsightsStyles.analysisContainer}>
            <Text style={accountInsightsStyles.sectionTitle}>
              Analyse des Hashtags
            </Text>
            <View style={accountInsightsStyles.hashtagsContainer}>
              {aggregates.top_hashtags.map((hashtag, index) => (
                <View key={index} style={accountInsightsStyles.hashtagPill}>
                  <Hash size={16} color="#007AFF" />
                  <Text style={accountInsightsStyles.hashtagText}>
                    {hashtag}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper components for cards
const StatCard = ({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) => (
  <View style={accountInsightsStyles.statCard}>
    {icon}
    <Text style={accountInsightsStyles.statValue}>{value}</Text>
    <Text style={accountInsightsStyles.statLabel}>{label}</Text>
  </View>
);

const MetricCard = ({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
}) => (
  <View style={accountInsightsStyles.metricCard}>
    <View style={accountInsightsStyles.metricHeader}>
      <View style={accountInsightsStyles.metricIcon}>{icon}</View>
      <Text style={accountInsightsStyles.metricLabel}>{label}</Text>
    </View>
    <Text style={accountInsightsStyles.metricValue}>{value}</Text>
    <Text style={accountInsightsStyles.metricDescription}>{description}</Text>
  </View>
);
