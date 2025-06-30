import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
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
  RefreshCw
} from 'lucide-react-native';
import { useRevenueCat } from '@/providers/RevenueCat';
import { useAuth } from '@clerk/clerk-expo';
import { API_ENDPOINTS } from '@/lib/config/api';

// Types pour les données d'analyse
interface AccountAnalysis {
  id: string;
  account_handle: string;
  engagement_rate: number;
  followers_growth?: number; // Optional
  best_posting_times?: string[]; // Optional
  top_content_themes?: string[]; // Optional
  recommendations: string[];
  created_at: string;
}

interface AccountStats {
  followers_count: number;
  following_count?: number; // Optional
  likes_count?: number; // Optional
  videos_count: number;
  avg_views?: number; // Optional
  avg_engagement: number;
}

export default function AccountInsightsScreen() {
  const router = useRouter();
  const { isPro, goPro } = useRevenueCat();
  const { getToken } = useAuth();
  const [analyses, setAnalyses] = useState<AccountAnalysis[]>([]);
  const [stats, setStats] = useState<AccountStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAccountData();
  }, []);

  const loadAccountData = async () => {
    try {
      setLoading(true);
      
      const token = await getToken();
      
      // 🔧 FIX: First check for existing analysis
      const existingResponse = await fetch(API_ENDPOINTS.TIKTOK_ANALYSIS_EXISTING(), {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const existingData = await existingResponse.json();
      if (!existingData.success || !existingData.data) {
        // No analysis available - show empty state
        setAnalyses([]);
        setStats(null);
        return;
      }

      const analysis = existingData.data;
      
      // 🆕 NEW: Get rich account data using the /result endpoint
      try {
        const resultResponse = await fetch(API_ENDPOINTS.TIKTOK_ANALYSIS_RESULT(analysis.id), {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        const resultData = await resultResponse.json();
        if (resultData.success && resultData.results) {
          const { results } = resultData;
          
          // Transform rich analysis data to component format
          setAnalyses([{
            id: analysis.id,
            account_handle: results.account.handle,
            engagement_rate: results.video_analysis.avg_engagement_rate || 0,
            followers_growth: undefined, // Not available
            best_posting_times: results.video_analysis.top_hashtags?.slice(0, 3) || [], // Use top hashtags as placeholder
            top_content_themes: results.video_analysis.top_hashtags || [],
            recommendations: [
              `Taux d'engagement moyen: ${results.video_analysis.avg_engagement_rate?.toFixed(1)}%`,
              `${results.video_analysis.total_videos} vidéos analysées`,
              `Moyenne de ${results.video_analysis.avg_views?.toLocaleString()} vues par vidéo`
            ],
            created_at: analysis.created_at,
          }]);

          // 🆕 Set rich stats from video analysis
          setStats({
            followers_count: results.stats.followers || 0,
            following_count: results.stats.following || undefined,
            likes_count: results.stats.likes || undefined,
            videos_count: results.video_analysis.total_videos || 0,
            avg_views: results.video_analysis.avg_views || undefined,
            avg_engagement: results.video_analysis.avg_engagement_rate || 0,
          });
          
          console.log('✅ Rich account data loaded:', {
            handle: results.account.handle,
            followers: results.stats.followers,
            videos: results.video_analysis.total_videos,
            avgViews: results.video_analysis.avg_views,
            engagement: results.video_analysis.avg_engagement_rate
          });
          
        } else {
          // Fallback to basic analysis data
          console.log('⚠️ No rich data available, using basic analysis');
          setBasicAnalysisData(analysis);
        }
      } catch (error) {
        console.warn('⚠️ Could not fetch rich data, using basic analysis:', error);
        setBasicAnalysisData(analysis);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setAnalyses([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  // Helper function for basic data fallback
  const setBasicAnalysisData = (analysis: any) => {
    setAnalyses([{
      id: analysis.id,
      account_handle: analysis.tiktok_handle,
      engagement_rate: analysis.result?.account_analysis?.engagement_rate || 0,
      followers_growth: analysis.result?.insights?.followers_growth,
      best_posting_times: analysis.result?.insights?.best_posting_times || [],
      top_content_themes: analysis.result?.insights?.top_content_themes || [],
      recommendations: analysis.result?.insights?.recommendations || [],
      created_at: analysis.created_at,
    }]);

    setStats({
      followers_count: analysis.result?.account_analysis?.followers || 0,
      following_count: undefined,
      likes_count: undefined,
      videos_count: analysis.result?.account_analysis?.videos_count || 0,
      avg_views: undefined,
      avg_engagement: analysis.result?.account_analysis?.engagement_rate || 0,
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAccountData();
    setRefreshing(false);
  };

  const navigateToAccountChat = () => {
    router.push('/(drawer)/account-conversations');
  };

  // Show paywall for non-pro users
  if (!isPro) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        
        
        <ScrollView style={styles.scrollView}>
          <View style={styles.paywallContainer}>
            <View style={styles.paywallHeader}>
              <Crown size={48} color="#FFD700" />
              <Text style={styles.paywallTitle}>Insights Pro</Text>
            </View>
            
            <Text style={styles.paywallDescription}>
              Débloquez des analyses avancées de votre compte TikTok avec des insights 
              personnalisés alimentés par l'IA pour optimiser votre stratégie de contenu.
            </Text>
            
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.featureText}>Analyse complète de votre compte TikTok</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.featureText}>Recommandations personnalisées par IA</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.featureText}>Métriques d'engagement détaillées</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.featureText}>Meilleurs moments de publication</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.featureText}>Analyse des tendances de contenu</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.featureText}>Chat IA pour conseils stratégiques</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={goPro}
            >
              <Zap size={20} color="#fff" />
              <Text style={styles.upgradeButtonText}>Passer Pro</Text>
            </TouchableOpacity>
            
            <Text style={styles.paywallFooter}>
              Retournez ici après votre mise à niveau pour accéder à vos insights.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Chargement de vos insights...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView style={styles.scrollView}>
        {/* No Analysis State */}
        {!stats && !loading && (
          <View style={styles.emptyStateContainer}>
            <BarChart3 size={64} color="#666" />
            <Text style={styles.emptyStateTitle}>Aucune analyse disponible</Text>
            <Text style={styles.emptyStateDescription}>
              Lancez une analyse de votre compte TikTok pour voir vos insights personnalisés.
            </Text>
        <TouchableOpacity 
              style={styles.startAnalysisButton}
              onPress={navigateToAccountChat}
        >
              <MessageCircle size={20} color="#fff" />
              <Text style={styles.startAnalysisButtonText}>Chat TikTok</Text>
        </TouchableOpacity>
      </View>
        )}

        {/* Stats Overview */}
        {stats && (
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Vue d'ensemble</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Users size={24} color="#007AFF" />
                <Text style={styles.statValue}>{stats.followers_count?.toLocaleString() || 'N/A'}</Text>
                <Text style={styles.statLabel}>Abonnés</Text>
              </View>
              <View style={styles.statCard}>
                <Eye size={24} color="#10b981" />
                <Text style={styles.statValue}>{stats.avg_views?.toLocaleString() || 'N/A'}</Text>
                <Text style={styles.statLabel}>Vues moy.</Text>
              </View>
              <View style={styles.statCard}>
                <Heart size={24} color="#ef4444" />
                <Text style={styles.statValue}>{stats.avg_engagement.toFixed(1)}%</Text>
                <Text style={styles.statLabel}>Engagement</Text>
              </View>
              <View style={styles.statCard}>
                <BarChart3 size={24} color="#f59e0b" />
                <Text style={styles.statValue}>{stats.videos_count}</Text>
                <Text style={styles.statLabel}>Vidéos</Text>
              </View>
            </View>
          </View>
        )}

        {/* Latest Analysis */}
        {analyses.length > 0 && (
          <View style={styles.analysisContainer}>
            <Text style={styles.sectionTitle}>Dernière Analyse</Text>
            {analyses.map((analysis) => (
              <View key={analysis.id} style={styles.analysisCard}>
                <View style={styles.analysisHeader}>
                  <Text style={styles.analysisAccount}>{analysis.account_handle}</Text>
                  <View style={styles.engagementBadge}>
                    <TrendingUp size={16} color="#10b981" />
                    <Text style={styles.engagementRate}>
                      {analysis.engagement_rate}% engagement
                    </Text>
                  </View>
                </View>

                <View style={styles.analysisSection}>
                  <Text style={styles.analysisSubtitle}>Meilleurs moments</Text>
                  <View style={styles.timeSlots}>
                    {(analysis.best_posting_times || []).map((time, index) => (
                      <View key={index} style={styles.timeSlot}>
                        <Text style={styles.timeSlotText}>{time}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.analysisSection}>
                  <Text style={styles.analysisSubtitle}>Thèmes populaires</Text>
                  <View style={styles.themes}>
                    {(analysis.top_content_themes || []).map((theme, index) => (
                      <View key={index} style={styles.themeTag}>
                        <Text style={styles.themeText}>{theme}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.analysisSection}>
                  <Text style={styles.analysisSubtitle}>Recommandations</Text>
                  {analysis.recommendations.slice(0, 3).map((rec, index) => (
                    <View key={index} style={styles.recommendation}>
                      <Text style={styles.recommendationText}>• {rec}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={navigateToAccountChat}
          >
            <View style={styles.actionContent}>
              <MessageCircle size={24} color="#007AFF" />
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Chat TikTok</Text>
                <Text style={styles.actionSubtitle}>
                  Vos conversations avec l'expert IA TikTok
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => {
              // TODO: Navigation vers nouvelle analyse
              Alert.alert('Bientôt disponible', 'Fonctionnalité en cours de développement');
            }}
          >
            <View style={styles.actionContent}>
              <BarChart3 size={24} color="#10b981" />
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Nouvelle Analyse</Text>
                <Text style={styles.actionSubtitle}>
                  Lancer une analyse fraîche de votre compte
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
  statsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
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
  analysisContainer: {
    padding: 20,
    paddingTop: 0,
  },
  analysisCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  analysisAccount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  engagementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  engagementRate: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  analysisSection: {
    gap: 8,
  },
  analysisSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  timeSlots: {
    flexDirection: 'row',
    gap: 8,
  },
  timeSlot: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  timeSlotText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  themes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  themeTag: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  themeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  recommendation: {
    paddingLeft: 8,
  },
  recommendationText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  actionsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  actionCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  emptyStateContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 400,
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
  startAnalysisButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  startAnalysisButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 