import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Lock } from 'lucide-react-native';
import { useRevenueCat } from '@/contexts/providers/RevenueCat';

interface ProFeatureLockProps {
  featureTitle: string;
  featureDescription: string;
  onSkip?: () => void;
}

export const ProFeatureLock = ({
  featureTitle,
  featureDescription,
  onSkip,
}: ProFeatureLockProps) => {
  const { goPro } = useRevenueCat();

  const handleUpgrade = async () => {
    await goPro();
  };

  const handleSkip = onSkip || (() => router.push('/'));

  return (
    <View style={styles.container}>
      <Lock size={48} color="#007AFF" />
      <Text style={styles.title}>Fonctionnalité Pro : {featureTitle}</Text>
      <Text style={styles.description}>{featureDescription}</Text>
      <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
        <Text style={styles.upgradeButtonText}>Passer Pro</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleSkip}>
        <Text style={styles.skipText}>Passer pour le moment</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
    backgroundColor: '#111',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
  },
  skipText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 16,
  },
  upgradeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 16,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
