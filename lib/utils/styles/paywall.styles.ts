import { StyleSheet } from 'react-native';
import { SHARED_STYLE_COLORS } from '@/lib/constants/sharedStyles';

export const paywallStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SHARED_STYLE_COLORS.background,
  },
  background: {
    flex: 1,
    backgroundColor: SHARED_STYLE_COLORS.background,
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  closeButton: {
    padding: 8,
    marginTop: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: SHARED_STYLE_COLORS.text,
    fontSize: 16,
    marginTop: 16,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: SHARED_STYLE_COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: SHARED_STYLE_COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  billingToggleContainer: {
    marginBottom: 30,
  },
  billingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: SHARED_STYLE_COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  billingToggle: {
    flexDirection: 'row',
    backgroundColor: SHARED_STYLE_COLORS.backgroundSecondary,
    borderRadius: 12,
    padding: 4,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    position: 'relative',
  },
  toggleOptionActive: {
    backgroundColor: SHARED_STYLE_COLORS.primary,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: SHARED_STYLE_COLORS.textMuted,
  },
  toggleTextActive: {
    color: SHARED_STYLE_COLORS.text,
  },
  savingsBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: SHARED_STYLE_COLORS.accent,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  savingsText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: SHARED_STYLE_COLORS.backgroundSecondary,
  },
  plansContainer: {
    marginBottom: 30,
  },
  planCard: {
    backgroundColor: SHARED_STYLE_COLORS.backgroundSecondary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    position: 'relative',
    borderWidth: 1,
    borderColor: SHARED_STYLE_COLORS.border,
  },
  featuredPlan: {
    backgroundColor: SHARED_STYLE_COLORS.backgroundSecondary,
    borderWidth: 2,
    borderColor: SHARED_STYLE_COLORS.primary,
  },
  currentPlan: {
    backgroundColor: SHARED_STYLE_COLORS.primaryOverlay,
    borderWidth: 2,
    borderColor: SHARED_STYLE_COLORS.primary,
  },
  featuredBadge: {
    position: 'absolute',
    top: -12,
    left: 20,
    backgroundColor: SHARED_STYLE_COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  featuredText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: SHARED_STYLE_COLORS.text,
  },
  currentPlanBadge: {
    position: 'absolute',
    top: -12,
    right: 20,
    backgroundColor: SHARED_STYLE_COLORS.accent,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  currentPlanText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: SHARED_STYLE_COLORS.backgroundSecondary,
  },
  planTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: SHARED_STYLE_COLORS.text,
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: SHARED_STYLE_COLORS.text,
    marginBottom: 4,
  },
  priceContainer: {
    marginBottom: 20,
  },
  periodText: {
    fontSize: 14,
    color: SHARED_STYLE_COLORS.textMuted,
    marginBottom: 4,
  },
  pricePerMonth: {
    fontSize: 12,
    color: SHARED_STYLE_COLORS.textMuted,
    fontStyle: 'italic',
  },
  featuresList: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    marginRight: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 16,
    color: SHARED_STYLE_COLORS.text,
    lineHeight: 22,
  },
  selectButton: {
    backgroundColor: SHARED_STYLE_COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  currentPlanButton: {
    backgroundColor: SHARED_STYLE_COLORS.primaryOverlay,
  },
  selectButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: SHARED_STYLE_COLORS.text,
  },
  freeButton: {
    backgroundColor: SHARED_STYLE_COLORS.backgroundSecondary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: SHARED_STYLE_COLORS.border,
  },
  freeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: SHARED_STYLE_COLORS.text,
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 20,
  },
  restoreButtonText: {
    fontSize: 16,
    color: SHARED_STYLE_COLORS.textMuted,
    textDecorationLine: 'underline',
  },
  termsText: {
    fontSize: 12,
    color: SHARED_STYLE_COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 20,
  },
  policiesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  policyLink: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  policyLinkText: {
    fontSize: 12,
    color: SHARED_STYLE_COLORS.primary,
    textDecorationLine: 'underline',
  },
  policySeparator: {
    fontSize: 12,
    color: SHARED_STYLE_COLORS.textMuted,
    marginHorizontal: 8,
  },
}); 