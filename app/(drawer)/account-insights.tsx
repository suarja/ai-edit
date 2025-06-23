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
import { DebugRevenueCat } from '@/components/DebugRevenueCat';

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
      // TODO: Charger les données d'analyse depuis l'API
      // Données simulées pour l'instant
      setAnalyses([
        {
          id: '1',
          account_handle: '@mon_compte',
          engagement_rate: 4.2,
          followers_growth: 15.8,
          best_posting_times: ['18:00-20:00', '21:00-23:00'],
          top_content_themes: ['Tutoriels', 'Behind the scenes', 'Tendances'],
          recommendations: [
            'Publier plus de contenu en soirée',
            'Utiliser plus de hashtags tendance',
            'Créer plus de contenu interactif'
          ],
          created_at: new Date().toISOString(),
        }
      ]);

      setStats({
        followers_count: 12500,
        following_count: 890,
        likes_count: 156000,
        videos_count: 45,
        avg_views: 8500,
        avg_engagement: 4.2,
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      Alert.alert('Erreur', 'Impossible de charger les données d\'analyse');
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
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Insights Compte</Text>
        </View>
        
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
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Insights Compte</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Chargement de vos insights...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Insights Compte</Text>
        <TouchableOpacity 
          onPress={handleRefresh}
          style={styles.refreshButton}
          disabled={refreshing}
        >
          <RefreshCw 
            size={20} 
            color="#007AFF" 
            style={[refreshing && styles.rotating]} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
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
      
      {/* Debug component - only shows in development */}
      <DebugRevenueCat />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  refreshButton: {
    padding: 8,
  },
  rotating: {
    transform: [{ rotate: '360deg' }],
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
}); 