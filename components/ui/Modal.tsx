/**
 * 🎨 Modal Component - Design System v2.0 avec Palette Editia
 * 
 * Composant modal générique utilisant la palette Editia
 * Variants: default, premium, success, error
 * Supports: bottom sheet, center, full screen
 */

import React from 'react';
import { 
  Modal as RNModal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  TouchableWithoutFeedback,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { COLORS } from '../../lib/constants/colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  variant?: 'default' | 'premium' | 'success' | 'error';
  presentation?: 'bottomSheet' | 'center' | 'fullScreen';
  closable?: boolean;
  closeOnBackdrop?: boolean;
  scrollable?: boolean;
  testID?: string;
}

const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  children,
  variant = 'default',
  presentation = 'bottomSheet',
  closable = true,
  closeOnBackdrop = true,
  scrollable = false,
  testID,
}) => {
  const getModalStyle = () => {
    const baseStyle = [styles.modal];
    
    switch (presentation) {
      case 'bottomSheet':
        baseStyle.push(styles.modalBottomSheet);
        break;
      case 'center':
        baseStyle.push(styles.modalCenter);
        break;
      case 'fullScreen':
        baseStyle.push(styles.modalFullScreen);
        break;
    }
    
    return baseStyle;
  };

  const getContainerStyle = () => {
    const baseStyle = [styles.container];
    
    switch (variant) {
      case 'default':
        baseStyle.push(styles.containerDefault);
        break;
      case 'premium':
        baseStyle.push(styles.containerPremium);
        break;
      case 'success':
        baseStyle.push(styles.containerSuccess);
        break;
      case 'error':
        baseStyle.push(styles.containerError);
        break;
    }
    
    return baseStyle;
  };

  const getTitleStyle = () => {
    const baseStyle = [styles.title];
    
    switch (variant) {
      case 'premium':
        baseStyle.push(styles.titlePremium);
        break;
      case 'success':
        baseStyle.push(styles.titleSuccess);
        break;
      case 'error':
        baseStyle.push(styles.titleError);
        break;
    }
    
    return baseStyle;
  };

  const renderHeader = () => {
    if (!title && !closable) return null;
    
    return (
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          {title && <Text style={getTitleStyle()}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {closable && (
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Fermer"
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderContent = () => {
    const content = (
      <View style={styles.content}>
        {children}
      </View>
    );
    
    if (scrollable && presentation !== 'fullScreen') {
      return (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      );
    }
    
    return content;
  };

  const handleBackdropPress = () => {
    if (closeOnBackdrop && closable) {
      onClose();
    }
  };

  if (presentation === 'fullScreen') {
    return (
      <RNModal
        visible={visible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={onClose}
        testID={testID}
      >
        <SafeAreaView style={[styles.fullScreenContainer, getContainerStyle()]}>
          {renderHeader()}
          {renderContent()}
        </SafeAreaView>
      </RNModal>
    );
  }

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      testID={testID}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={getModalStyle()}>
              <View style={getContainerStyle()}>
                {/* Handle bar pour bottom sheet */}
                {presentation === 'bottomSheet' && (
                  <View style={styles.handleBar} />
                )}
                {renderHeader()}
                {renderContent()}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  // ✅ Backdrop
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  
  // ✅ Modal presentations
  modal: {
    justifyContent: 'flex-end',
  },
  
  modalBottomSheet: {
    maxHeight: SCREEN_HEIGHT * 0.9,
  },
  
  modalCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  
  modalFullScreen: {
    flex: 1,
  },
  
  fullScreenContainer: {
    flex: 1,
  },
  
  // ✅ Container styles avec variants Editia
  container: {
    backgroundColor: COLORS.background.primary, // #000000
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 40, // Safe area bottom
    maxHeight: SCREEN_HEIGHT * 0.9,
  },
  
  containerDefault: {
    backgroundColor: COLORS.background.primary,
    borderColor: COLORS.surface.border,
    borderWidth: 1,
  },
  
  containerPremium: {
    backgroundColor: COLORS.background.primary,
    borderTopWidth: 3,
    borderTopColor: COLORS.brand.gold, // #FFD700 (Or Editia!)
  },
  
  containerSuccess: {
    backgroundColor: COLORS.background.primary,
    borderTopWidth: 3,
    borderTopColor: COLORS.status.success, // #00FF88 (Vert Editia!)
  },
  
  containerError: {
    backgroundColor: COLORS.background.primary,
    borderTopWidth: 3,
    borderTopColor: COLORS.status.error, // #FF3B30
  },
  
  // ✅ Handle bar pour bottom sheet
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.surface.divider, // #333333
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  
  // ✅ Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface.border,
    marginBottom: 16,
  },
  
  titleContainer: {
    flex: 1,
    paddingRight: 16,
  },
  
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.primary, // #FFFFFF
    lineHeight: 26,
    marginBottom: 4,
  },
  
  // ✅ Title colors par variant
  titlePremium: {
    color: COLORS.brand.gold, // #FFD700
    fontWeight: 'bold',
  },
  
  titleSuccess: {
    color: COLORS.status.success, // #00FF88
    fontWeight: '700',
  },
  
  titleError: {
    color: COLORS.status.error, // #FF3B30
  },
  
  subtitle: {
    fontSize: 14,
    color: COLORS.text.tertiary, // #B0B0B0
    lineHeight: 18,
  },
  
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background.secondary, // #1a1a1a
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surface.border,
  },
  
  closeButtonText: {
    fontSize: 16,
    color: COLORS.text.disabled, // #808080
    fontWeight: '600',
  },
  
  // ✅ Content
  content: {
    flex: 1,
  },
  
  scrollView: {
    flex: 1,
    marginHorizontal: -20, // Compensate container padding
  },
  
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});

export default Modal;

/**
 * 🎨 EXEMPLES D'USAGE:
 * 
 * // Modal bottom sheet basique
 * <Modal
 *   visible={showModal}
 *   onClose={() => setShowModal(false)}
 *   title="Configuration"
 * >
 *   <Text>Contenu de la modal</Text>
 * </Modal>
 * 
 * // Modal premium avec Or
 * <Modal
 *   visible={showUpgrade}
 *   onClose={() => setShowUpgrade(false)}
 *   title="Débloquer Premium"
 *   subtitle="Accédez à toutes les fonctionnalités"
 *   variant="premium"
 * >
 *   <Button title="Upgrade" variant="premium" />
 * </Modal>
 * 
 * // Modal succès
 * <Modal
 *   visible={showSuccess}
 *   onClose={() => setShowSuccess(false)}
 *   title="Vidéo générée!"
 *   variant="success"
 *   presentation="center"
 * >
 *   <Text>Votre vidéo est prête</Text>
 * </Modal>
 * 
 * // Modal plein écran
 * <Modal
 *   visible={showEditor}
 *   onClose={() => setShowEditor(false)}
 *   title="Éditeur de script"
 *   presentation="fullScreen"
 *   scrollable
 * >
 *   <ScriptEditor />
 * </Modal>
 */