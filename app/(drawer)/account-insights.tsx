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
  followers_growth: number;
  best_posting_times: string[];
  top_content_themes: string[];
  recommendations: string[];
  created_at: string;
}

interface AccountStats {
  followers_count: number;
  following_count: number;
  likes_count: number;
  videos_count: number;
  avg_views: number;
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
      
      // Check for existing completed analysis
      const token = await getToken();
      
      const response = await fetch(API_ENDPOINTS.TIKTOK_ANALYSIS_EXISTING(), {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success && data.data) {
        const analysis = data.data;
        
        // Transform API data to component format
        setAnalyses([{
          id: analysis.id,
          account_handle: analysis.tiktok_handle,
          engagement_rate: analysis.result?.account_analysis?.engagement_rate || 0,
          followers_growth: 0, // Not available from current API
          best_posting_times: ['18:00-20:00', '21:00-23:00'], // Static for now
          top_content_themes: ['Contenu analysé'], // Could be extracted from analysis
          recommendations: analysis.result?.insights?.recommendations || [],
          created_at: analysis.created_at,
        }]);

      setStats({
          followers_count: analysis.result?.account_analysis?.followers || 0,
          following_count: 0, // Not available from current API
          likes_count: 0, // Not available from current API
          videos_count: analysis.result?.account_analysis?.videos_count || 0,
          avg_views: 0, // Not available from current API
          avg_engagement: analysis.result?.account_analysis?.engagement_rate || 0,
      });
      } else {
        // No analysis available - show empty state
        setAnalyses([]);
        setStats(null);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      // Don't show error for missing analysis - it's expected for new users
      setAnalyses([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAccountData();
    setRefreshing(false);
  };

  const navigateToAccountChat = () => {
    router.push('/(drawer)/account-chat');
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
              <Text style={styles.startAnalysisButtonText}>Commencer l'analyse</Text>
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
                <Text style={styles.statValue}>{stats.followers_count.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Abonnés</Text>
              </View>
              <View style={styles.statCard}>
                <Eye size={24} color="#10b981" />
                <Text style={styles.statValue}>{stats.avg_views.toLocaleString()}</Text>
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
                    {analysis.best_posting_times.map((time, index) => (
                      <View key={index} style={styles.timeSlot}>
                        <Text style={styles.timeSlotText}>{time}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.analysisSection}>
                  <Text style={styles.analysisSubtitle}>Thèmes populaires</Text>
                  <View style={styles.themes}>
                    {analysis.top_content_themes.map((theme, index) => (
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
                <Text style={styles.actionTitle}>Chat Stratégique</Text>
                <Text style={styles.actionSubtitle}>
                  Discutez avec l'IA pour des conseils personnalisés
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