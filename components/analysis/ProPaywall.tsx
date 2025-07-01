import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Crown, Zap } from 'lucide-react-native';

interface ProPaywallProps {
  title: string;
  description: string;
  features: string[];
  onUpgrade: () => void;
}

function FeatureItem({ text }: { text: string }) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.checkmark}>✓</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

export default function ProPaywall({ title, description, features, onUpgrade }: ProPaywallProps) {
  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.paywallContainer}>
        <View style={styles.paywallHeader}>
          <Crown size={48} color="#FFD700" />
          <Text style={styles.paywallTitle}>{title}</Text>
        </View>
        
        <Text style={styles.paywallDescription}>
          {description}
        </Text>
        
        <View style={styles.featuresList}>
          {features.map((feature, index) => (
            <FeatureItem key={index} text={feature} />
          ))}
        </View>

        <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
          <Zap size={20} color="#000" />
          <Text style={styles.upgradeButtonText}>Passer Pro</Text>
        </TouchableOpacity>
        
        <Text style={styles.paywallFooter}>
          Déverrouillez cette fonctionnalité avec votre abonnement Pro.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  paywallContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '90%',
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
    marginBottom: 24,
    lineHeight: 22,
    textAlign: 'center',
  },
  featuresList: {
    marginBottom: 24,
    alignSelf: 'stretch',
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
    alignSelf: 'stretch',
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
}); 