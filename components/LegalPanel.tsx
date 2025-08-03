import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import {
  ChevronDown,
  Shield,
  FileText,
  BookUser,
} from 'lucide-react-native';
import { sharedStyles, SHARED_STYLE_COLORS } from '@/lib/constants/sharedStyles';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export type LegalItem = {
  label: string;
  icon: React.ReactNode;
  url: string;
};

type Props = {
  legalItems?: LegalItem[];
};

const defaultLegalItems: LegalItem[] = [
  {
    label: 'Privacy Policy',
    icon: <Shield size={24} color={SHARED_STYLE_COLORS.text} />,
    url: 'https://editia.app/privacy-policy',
  },
  {
    label: 'Terms of Service',
    icon: <FileText size={24} color={SHARED_STYLE_COLORS.text} />,
    url: 'https://editia.app/terms-of-service',
  },
  {
    label: 'Payment Policy',
    icon: <BookUser size={24} color={SHARED_STYLE_COLORS.text} />,
    url: 'https://editia.app/payment-policy',
  },
];

const LegalPanel: React.FC<Props> = ({ legalItems = defaultLegalItems }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSection = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  const openURL = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error('Failed to open URL:', err)
    );
  };

  return (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.header}
        onPress={toggleSection}
      >
        <Text style={styles.sectionTitle}>Legal</Text>
        <ChevronDown
          size={24}
          color={SHARED_STYLE_COLORS.textMuted}
          style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}
        />
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={styles.contentContainer}>
          {legalItems.map((item, index) => (
            <TouchableOpacity
              key={item.label + index}
              style={styles.settingItem}
              onPress={() => openURL(item.url)}
            >
              <View style={styles.settingInfo}>
                {item.icon}
                <Text style={styles.settingText}>{item.label}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: sharedStyles.sectionContainer.backgroundColor,
    color: SHARED_STYLE_COLORS.text,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: SHARED_STYLE_COLORS.text,
    textTransform: 'uppercase',
  },
  contentContainer: {
    paddingTop: 16,
    gap: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: sharedStyles.container.backgroundColor,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    color: SHARED_STYLE_COLORS.text,
    fontSize: 16,
  },
});

export default LegalPanel;