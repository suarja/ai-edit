import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  Heart, 
  MessageCircle,
  Crown,
  Zap,
  ChevronRight,
  Clock,
  Music,
  Video,
  Hash,
  Briefcase
} from 'lucide-react-native';
import { useRevenueCat } from '@/providers/RevenueCat';
import { useAuth } from '@clerk/clerk-expo';
import { API_ENDPOINTS } from '@/lib/config/api';
import { useAccountAnalysis } from '@/hooks/useAccountAnalysis';
import AnalysisHeader from '@/components/analysis/AnalysisHeader';
import ProPaywall from '@/components/analysis/ProPaywall';

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
  }
}

interface ComprehensiveContext {
  account: AccountData;
  stats: AccountStats;
  aggregates: AccountAggregates;
  insights: LlmInsights;
}

export default function AccountInsightsScreen() {
  const router = useRouter();
  const { isPro, goPro } = useRevenueCat();
  const { getToken } = useAuth();
  const { analysis, isLoading: isAnalysisLoading, refreshAnalysis } = useAccountAnalysis();

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
    console.log('🔄 loadAccountContext: Loading account context for accountId:', accountId);
    try {
      setLoading(true);
      const token = await getToken();
      
      const response = await fetch(API_ENDPOINTS.TIKTOK_ACCOUNT_CONTEXT(accountId), {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      console.log('🔄 data:', JSON.stringify(data, null, 2));
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch account context");
      }
      
      setContext(data);

    } catch (error) {
      console.error('Erreur lors du chargement des données de contexte:', error);
      Alert.alert("Erreur", "Impossible de charger les données du compte.");
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

  // Paywall is still relevant
  if (!isPro) {
    return (
      <ProPaywall
        title="Insights Pro"
        description="Débloquez des analyses avancées de votre compte TikTok avec des insights personnalisés alimentés par l'IA pour optimiser votre stratégie de contenu."
        features={[
          "Analyse complète de votre compte TikTok",
          "Recommandations personnalisées par IA",
          "Métriques d'engagement détaillées",
          "Meilleurs moments de publication",
          "Analyse des tendances de contenu",
          "Chat IA pour conseils stratégiques",
        ]}
        onUpgrade={goPro}
      />
    );
  }

  // Use the hook's loading state initially
  if (isAnalysisLoading || loading) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Chargement de vos insights...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // This screen should now only render if context is available,
  // because the guard handles the no-analysis case.
  if (!context) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <AnalysisHeader 
          title={'Insights'}
          onBack={() => router.back()}
        />
        <ScrollView 
          contentContainerStyle={styles.emptyStateContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >
          <BarChart3 size={64} color="#666" />
          <Text style={styles.emptyStateTitle}>Données non disponibles</Text>
          <Text style={styles.emptyStateDescription}>
            Nous n'avons pas pu charger les données pour ce compte. Veuillez réessayer.
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const { account, stats, aggregates, insights } = context;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <AnalysisHeader 
        title={'Insights'}
        onBack={() => router.back()}
      />
      <ScrollView 
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#fff" />}
      >
        {/* Header with profile pic and handle */}
        <View style={styles.profileHeader}>
            {/* Image component would go here */}
            <Image source={{ uri: account.profile_pic_url }} style={styles.profilePic} />
            <View style={styles.profileInfo}>
                <Text style={styles.profileHandle}>@{account.tiktok_handle}</Text>
                <Text style={styles.profileUsername}>{account.username}</Text>
            </View>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Vue d'ensemble</Text>
          <View style={styles.statsGrid}>
            <StatCard icon={<Users size={24} color="#007AFF" />} value={stats.followers_count?.toLocaleString() || 'N/A'} label="Abonnés" />
            <StatCard icon={<Eye size={24} color="#10b981" />} value={aggregates.avg_views?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || 'N/A'} label="Vues moy." />
            <StatCard icon={<Heart size={24} color="#ef4444" />} value={`${(aggregates.avg_views && aggregates.avg_likes ? (aggregates.avg_likes / aggregates.avg_views * 100) : 0).toFixed(1)}%`} label="Taux de Likes" />
            <StatCard icon={<Video size={24} color="#f59e0b" />} value={stats.videos_count?.toLocaleString() || 'N/A'} label="Vidéos" />
          </View>
        </View>
        
        {/* EditIA Insights */}
        <View style={styles.analysisContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Analyse EditIA</Text>
            <TouchableOpacity style={styles.chatButton} onPress={navigateToAccountChat}>
              <MessageCircle size={20} color="#007AFF" />
              <Text style={styles.chatButtonText}>Chat IA</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.recommendationCard}>
            <Text style={styles.analysisSubtitle}>Forces Principales</Text>
            {(insights.profile_summary?.strengths || ["Analyse en cours..."]).map((strength, index) => (
              <View key={index} style={styles.recommendation}>
                <Text style={styles.recommendationText}>• {strength}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.recommendationCard, styles.marginTop]}>
            <Text style={styles.analysisSubtitle}>Axes d'Amélioration</Text>
            {(insights.profile_summary?.weaknesses || ["Analyse en cours..."]).map((weakness, index) => (
              <View key={index} style={styles.recommendation}>
                <Text style={styles.recommendationText}>• {weakness}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Performance Metrics */}
        <View style={styles.analysisContainer}>
          <Text style={styles.sectionTitle}>Métriques de Performance</Text>
          <View style={styles.metricsGrid}>
            <MetricCard
              icon={<Clock size={20} color="#fff" />}
              label="Meilleur moment de publication"
              value={aggregates.best_posting_time || 'N/A'}
              description="Horaire optimal pour l'engagement"
            />
            <MetricCard
              icon={<Music size={20} color="#fff" />}
              label="Musique Originale"
              value={`${((aggregates.music_usage_stats?.original_music_ratio || 0) * 100).toFixed(0)}%`}
              description="Ratio de sons originaux utilisés"
            />
          </View>
        </View>

        {/* Hashtag Analysis */}
        {aggregates.top_hashtags && aggregates.top_hashtags.length > 0 && (
          <View style={styles.analysisContainer}>
            <Text style={styles.sectionTitle}>Analyse des Hashtags</Text>
            <View style={styles.hashtagsContainer}>
              {aggregates.top_hashtags.map((hashtag, index) => (
                <View key={index} style={styles.hashtagPill}>
                  <Hash size={16} color="#007AFF" />
                  <Text style={styles.hashtagText}>{hashtag}</Text>
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
const StatCard = ({ icon, value, label }: { icon: React.ReactNode, value: string, label: string }) => (
    <View style={styles.statCard}>
        {icon}
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const MetricCard = ({ icon, label, value, description }: { 
  icon: React.ReactNode, 
  label: string, 
  value: string,
  description: string 
}) => (
  <View style={styles.metricCard}>
    <View style={styles.metricHeader}>
      <View style={styles.metricIcon}>{icon}</View>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
    <Text style={styles.metricValue}>{value}</Text>
    <Text style={styles.metricDescription}>{description}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
  },
  // Profile Header
  profileHeader: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 16,
    backgroundColor: '#000',
  },
  profilePicPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#333',
  },
  profilePic: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  profileHandle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileUsername: {
      color: '#888',
      fontSize: 14,
  },
  profileInfo: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Common
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  // Stats Grid
  statsContainer: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: -6, // To counteract card margins
  },
  statCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexGrow: 1,
    flexBasis: '40%', // Roughly 2 per row
    margin: 6,
    gap: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  // Aggregates
  analysisContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  chatButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  marginTop: {
    marginTop: 16,
  },
  recommendationCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  analysisSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  recommendation: {
    paddingLeft: 8,
  },
  recommendationText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  // Metrics
  metricsGrid: {
    gap: 12,
  },
  metricCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  metricIcon: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 8,
    borderRadius: 8,
  },
  metricLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  metricDescription: {
    fontSize: 14,
    color: '#666',
  },
  // Hashtags
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hashtagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  hashtagText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  // Empty State
  emptyStateContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  // Paywall Styles (Restored)
  paywallContainer: {
    padding: 20,
  },
  paywallHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  paywallTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
  },
  paywallDescription: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 22,
  },
  featuresList: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkmark: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 12,
  },
  featureText: {
    color: '#fff',
    fontSize: 16,
  },
  upgradeButton: {
    backgroundColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  upgradeButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  paywallFooter: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
}); 