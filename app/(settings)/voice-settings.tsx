import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Mic } from 'lucide-react-native';

export default function VoiceSettingsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Configuration de la Voix</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Mic size={48} color="#007AFF" />
        </View>
        <Text style={styles.heading}>Personnalisez votre voix</Text>
        <Text style={styles.description}>
          Enregistrez des échantillons de votre voix pour créer un clone vocal
          qui sera utilisé pour la narration de vos vidéos générées. Cette
          configuration vous aidera à maintenir une identité vocale cohérente à
          travers tout votre contenu.
        </Text>

        {/* Placeholder for voice configuration functionality */}
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>
            Configuration de la voix à implémenter
          </Text>
        </View>
      </View>
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
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  placeholderContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    marginTop: 20,
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
  },
});
