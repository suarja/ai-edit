import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import {
  Mic,
  User,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react-native';
import { VIDEO_PRESETS } from '@/lib/config/video-presets';
import { CaptionConfiguration } from '@/types/video';

type ConfigurationCardsProps = {
  voiceConfigured: boolean;
  editorialConfigured: boolean;
  captionConfigured: boolean;
  captionConfig: CaptionConfiguration | null;
};

const ConfigurationCards: React.FC<ConfigurationCardsProps> = ({
  voiceConfigured,
  editorialConfigured,
  captionConfigured,
  captionConfig,
}) => {
  const navigateToVoice = () => {
    router.push('/(settings)/voice-clone');
  };

  const navigateToEditorial = () => {
    router.push('/(settings)/editorial');
  };

  const navigateToCaptions = () => {
    router.push('/(settings)/video-settings');
  };

  return (
    <View>
      <Text style={styles.configSectionTitle}>Configuration Avancée</Text>
      <Text style={styles.configSectionDescription}>
        Configurez des options supplémentaires pour personnaliser votre vidéo
      </Text>

      {/* Voice configuration card */}
      <TouchableOpacity
        style={[
          styles.configCard,
          !voiceConfigured && styles.configCardWarning,
        ]}
        onPress={navigateToVoice}
      >
        <View style={styles.configCardIcon}>
          <Mic size={24} color={voiceConfigured ? '#4CD964' : '#FF9500'} />
        </View>
        <View style={styles.configCardContent}>
          <Text style={styles.configCardTitle}>Voix Personnalisée</Text>
          <Text style={styles.configCardDescription}>
            {voiceConfigured
              ? "Voix personnalisée configurée et prête à l'emploi"
              : 'Configurez votre voix personnalisée pour vos vidéos'}
          </Text>
        </View>
        <View style={styles.configCardAction}>
          {voiceConfigured ? (
            <CheckCircle2 size={20} color="#4CD964" />
          ) : (
            <AlertCircle size={20} color="#FF9500" />
          )}
          <ArrowRight size={16} color="#888" />
        </View>
      </TouchableOpacity>

      {/* Editorial profile card */}
      <TouchableOpacity
        style={[
          styles.configCard,
          !editorialConfigured && styles.configCardWarning,
        ]}
        onPress={navigateToEditorial}
      >
        <View style={styles.configCardIcon}>
          <User size={24} color={editorialConfigured ? '#4CD964' : '#FF9500'} />
        </View>
        <View style={styles.configCardContent}>
          <Text style={styles.configCardTitle}>Profil Éditorial</Text>
          <Text style={styles.configCardDescription}>
            {editorialConfigured
              ? 'Profil éditorial configuré avec votre style personnel'
              : 'Définissez votre style éditorial pour vos vidéos'}
          </Text>
        </View>
        <View style={styles.configCardAction}>
          {editorialConfigured ? (
            <CheckCircle2 size={20} color="#4CD964" />
          ) : (
            <AlertCircle size={20} color="#FF9500" />
          )}
          <ArrowRight size={16} color="#888" />
        </View>
      </TouchableOpacity>

      {/* Caption settings card */}
      <TouchableOpacity
        style={[
          styles.configCard,
          !captionConfigured && styles.configCardWarning,
        ]}
        onPress={navigateToCaptions}
      >
        <View style={styles.configCardIcon}>
          <MessageSquare
            size={24}
            color={captionConfigured ? '#4CD964' : '#FF9500'}
          />
        </View>
        <View style={styles.configCardContent}>
          <Text style={styles.configCardTitle}>Style de Sous-titres</Text>
          <Text style={styles.configCardDescription}>
            {captionConfigured && captionConfig?.presetId
              ? `Style "${
                  VIDEO_PRESETS.find((p) => p.id === captionConfig.presetId)
                    ?.name
                }" configuré`
              : 'Choisissez un style de sous-titres pour vos vidéos'}
          </Text>
        </View>
        <View style={styles.configCardAction}>
          {captionConfigured ? (
            <CheckCircle2 size={20} color="#4CD964" />
          ) : (
            <AlertCircle size={20} color="#FF9500" />
          )}
          <ArrowRight size={16} color="#888" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  configSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  configSectionDescription: {
    fontSize: 15,
    color: '#888',
    marginBottom: 16,
    lineHeight: 22,
  },
  configCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  configCardWarning: {
    borderColor: '#FF9500',
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
  },
  configCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  configCardContent: {
    flex: 1,
  },
  configCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  configCardDescription: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
  configCardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

export default ConfigurationCards;
