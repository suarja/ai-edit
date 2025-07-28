import { StyleSheet } from 'react-native';

export const SHARED_STYLE_COLORS = {
  background: '#000000', // Pure black
  backgroundSecondary: '#1a1a1a', // Elevated surface
  backgroundTertiary: '#2a2a2a', // Tertiary surface
  primary: '#FF0050', // Editia red
  primaryLight: 'rgba(255, 0, 80, 0.6)',
  primaryOverlay: 'rgba(255, 0, 80, 0.12)',
  primaryBorder: 'rgba(255, 0, 80, 0.3)',
  secondary: '#007AFF', // System blue
  accent: '#FFD700', // Gold for premium
  text: '#FFFFFF', // Pure white
  textSecondary: '#E0E0E0', // Secondary text
  textTertiary: '#B0B0B0', // Tertiary text
  textMuted: '#666666', // Muted text
  border: 'rgba(255, 255, 255, 0.2)', // Light border
  borderMuted: 'rgba(255, 255, 255, 0.05)', // Very light border
  error: '#FF3B30', // System red
  warning: '#FF9500', // System orange
  success: '#00FF88', // Bright green
};

export const sharedStyles = StyleSheet.create({
  // Containers
  container: {
    flex: 1,
    backgroundColor: SHARED_STYLE_COLORS.background,
  },
  sectionContainer: {
    backgroundColor: SHARED_STYLE_COLORS.backgroundSecondary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: SHARED_STYLE_COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: SHARED_STYLE_COLORS.background,
    borderRadius: 20,
    padding: 24,
    width: '90%',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: SHARED_STYLE_COLORS.background,
  },

  // Text
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: SHARED_STYLE_COLORS.text,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: SHARED_STYLE_COLORS.text,
  },
  bodyText: {
    fontSize: 16,
    color: SHARED_STYLE_COLORS.text,
  },
  secondaryText: {
    fontSize: 14,
    color: SHARED_STYLE_COLORS.textSecondary,
  },
  errorText: {
    color: SHARED_STYLE_COLORS.error,
    fontSize: 14,
    textAlign: 'center',
  },

  // Buttons
  primaryButton: {
    backgroundColor: SHARED_STYLE_COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: SHARED_STYLE_COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  secondaryButtonText: {
    color: SHARED_STYLE_COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.6,
  },

  // Inputs
  input: {
    color: SHARED_STYLE_COLORS.text,
    fontSize: 16,
    backgroundColor: SHARED_STYLE_COLORS.backgroundSecondary,
    borderRadius: 8,
    padding: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: SHARED_STYLE_COLORS.border,
  },
  inputLabel: {
    color: SHARED_STYLE_COLORS.textSecondary,
    fontSize: 14,
    alignSelf: 'flex-start',
    marginBottom: 8,
    fontWeight: '500',
  },

  // Misc
  separator: {
    height: 1,
    backgroundColor: SHARED_STYLE_COLORS.border,
    marginVertical: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: SHARED_STYLE_COLORS.border,
  },
});
