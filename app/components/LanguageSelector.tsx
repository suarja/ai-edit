import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Globe } from 'lucide-react-native';
import { Language } from 'editia-core';

export const SUPPORTED_LANGUAGES: { code: Language; name: string }[]   = [
  { code: 'fr', name: 'Français' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
];

type LanguageSelectorProps = {
  selectedLanguage: Language;
  onLanguageChange: (languageCode: Language) => void;
};

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Globe size={18} color="#888" />
        <Text style={styles.label}>Langue de sortie</Text>
      </View>
      <View style={styles.languageOptions}>
        {SUPPORTED_LANGUAGES.map((language) => (
          <TouchableOpacity
            key={language.code}
            style={[
              styles.languageOption,
              selectedLanguage === language.code && styles.selectedLanguage,
            ]}
            onPress={() => onLanguageChange(language.code)}
          >
            <Text
              style={[
                styles.languageText,
                selectedLanguage === language.code &&
                  styles.selectedLanguageText,
              ]}
            >
              {language.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  label: {
    fontSize: 16,
    color: '#888',
    fontWeight: '500',
  },
  languageOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  languageOption: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },
  selectedLanguage: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderColor: '#007AFF',
  },
  languageText: {
    color: '#fff',
    fontSize: 14,
  },
  selectedLanguageText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default LanguageSelector;
