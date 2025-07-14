import { StyleSheet } from 'react-native';

export const colors = {
  background: '#9ca3af', // Dark blue-gray
  backgroundSecondary: '#1a1a1a', // Lighter blue-gray
  primary: '#10b981', // Emerald green
  secondary: '#3b82f6', // Blue
  accent: '#f59e0b', // Amber
  text: '#f9fafb', // Almost white
  textSecondary: '#9ca3af', // Lighter gray
  border: '#374151', // Gray
  error: '#ef4444', // Red
  warning: '#f59e0b', // Amber
  success: '#10b981', // Emerald green
};

export const sharedStyles = StyleSheet.create({
  // Containers
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  sectionContainer: {
    backgroundColor: colors.backgroundSecondary,
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
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 24,
    width: '90%',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },

  // Text
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  bodyText: {
    fontSize: 16,
    color: colors.text,
  },
  secondaryText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
  },

  // Buttons
  primaryButton: {
    backgroundColor: colors.primary,
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
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.6,
  },

  // Inputs
  input: {
    color: colors.text,
    fontSize: 16,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    padding: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    alignSelf: 'flex-start',
    marginBottom: 8,
    fontWeight: '500',
  },

  // Misc
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: colors.border,
  },
});
