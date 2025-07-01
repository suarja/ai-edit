import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useAccountAnalysis } from '@/hooks/useAccountAnalysis';
import StartAnalysisScreen from '../analysis/StartAnalysisScreen';
import AnalysisInProgressScreen from '../analysis/AnalysisInProgressScreen';
import { router } from 'expo-router';

interface AccountAnalysisGuardProps {
  children: React.ReactNode;
}

const AccountAnalysisGuard: React.FC<AccountAnalysisGuardProps> = ({ children }) => {
  const { analysis, activeJob, isLoading, error, refreshAnalysis } = useAccountAnalysis();

  useEffect(() => {
    // Optional: handle errors, e.g., show a toast message
    if (error) {
      console.error("AccountAnalysisGuard Error:", error);
    }
  }, [error]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 🆕 If there is an active job, show the progress screen
  if (activeJob) {
    return <AnalysisInProgressScreen initialJob={activeJob} onAnalysisComplete={refreshAnalysis} />;
  }

  // If there's no analysis, show the start screen
  if (!analysis) {
    return <StartAnalysisScreen onAnalysisStart={refreshAnalysis} />;
  }
  
  // If analysis exists, let user see the content
  return <>{children}</>;
};

export default AccountAnalysisGuard;

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