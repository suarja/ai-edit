import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import useAccountAnalysis from '@/hooks/useAccountAnalysis';
import StartAnalysisScreen from '@/components/analysis/StartAnalysisScreen';

interface AccountAnalysisGuardProps {
  children: React.ReactNode;
}

export default function AccountAnalysisGuard({ children }: AccountAnalysisGuardProps) {
  const { analysis, isLoading, error, refreshAnalysis } = useAccountAnalysis();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.text}>Vérification de l'analyse...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Erreur: {error}</Text>
      </View>
    );
  }

  if (!analysis || analysis.status !== 'completed') {
    return <StartAnalysisScreen 
      isLoading={isLoading} 
      error={error} 
      refreshAnalysis={refreshAnalysis} 
    />;
  }

  // Analysis is found and completed, allow access to the protected route.
  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    gap: 16,
  },
  text: {
    color: '#888',
    fontSize: 16,
  },
}); 