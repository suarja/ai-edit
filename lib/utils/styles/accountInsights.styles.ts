import { StyleSheet } from 'react-native';
import { SHARED_STYLE_COLORS } from '@/lib/constants/sharedStyles';

export const accountInsightsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SHARED_STYLE_COLORS.background,
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
    color: SHARED_STYLE_COLORS.textMuted,
    fontSize: 16,
  },
  // Profile Header
  profileHeader: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 16,
    backgroundColor: SHARED_STYLE_COLORS.background,
  },
  profilePicPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: SHARED_STYLE_COLORS.backgroundTertiary,
  },
  profilePic: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  profileHandle: {
    color: SHARED_STYLE_COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileUsername: {
    color: SHARED_STYLE_COLORS.textMuted,
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
    color: SHARED_STYLE_COLORS.text,
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
    backgroundColor: SHARED_STYLE_COLORS.backgroundSecondary,
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
    color: SHARED_STYLE_COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: SHARED_STYLE_COLORS.textMuted,
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
    backgroundColor: SHARED_STYLE_COLORS.primaryOverlay,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  chatButtonText: {
    color: SHARED_STYLE_COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  marginTop: {
    marginTop: 16,
  },
  recommendationCard: {
    backgroundColor: SHARED_STYLE_COLORS.backgroundSecondary,
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  analysisSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: SHARED_STYLE_COLORS.primary,
    marginBottom: 4,
  },
  recommendation: {
    paddingLeft: 8,
  },
  recommendationText: {
    color: SHARED_STYLE_COLORS.text,
    fontSize: 14,
    lineHeight: 20,
  },
  // Metrics
  metricsGrid: {
    gap: 12,
  },
  metricCard: {
    backgroundColor: SHARED_STYLE_COLORS.backgroundSecondary,
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
    color: SHARED_STYLE_COLORS.text,
    flex: 1,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: SHARED_STYLE_COLORS.text,
    marginBottom: 8,
  },
  metricDescription: {
    fontSize: 14,
    color: SHARED_STYLE_COLORS.textMuted,
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
    backgroundColor: SHARED_STYLE_COLORS.primaryOverlay,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  hashtagText: {
    color: SHARED_STYLE_COLORS.primary,
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
    color: SHARED_STYLE_COLORS.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 16,
    color: SHARED_STYLE_COLORS.textMuted,
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
    color: SHARED_STYLE_COLORS.text,
    marginTop: 12,
  },
  paywallDescription: {
    color: SHARED_STYLE_COLORS.text,
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
    color: SHARED_STYLE_COLORS.success,
    marginRight: 12,
  },
  featureText: {
    color: SHARED_STYLE_COLORS.text,
    fontSize: 16,
  },
  upgradeButton: {
    backgroundColor: SHARED_STYLE_COLORS.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  upgradeButtonText: {
    color: SHARED_STYLE_COLORS.background,
    fontSize: 16,
    fontWeight: '600',
  },
  paywallFooter: {
    color: SHARED_STYLE_COLORS.textMuted,
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});