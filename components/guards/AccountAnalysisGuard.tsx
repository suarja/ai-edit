import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { JobType, useAccountAnalysis } from '@/hooks/useAccountAnalysis';
import StartAnalysisScreen from '../analysis/StartAnalysisScreen';
import AnalysisInProgressScreen from '../analysis/AnalysisInProgressScreen';

interface AccountAnalysisGuardProps {
  children: React.ReactNode;
}

const AccountAnalysisGuard: React.FC<AccountAnalysisGuardProps> = ({
  children,
}) => {
  const { analysis, activeJob, isLoading, error, refreshAnalysis } =
    useAccountAnalysis();

  const handleAnalysisStart = (job: JobType) => {
    refreshAnalysis(job);
  };

  const handleRetry = () => {
    // To retry, we can simply call refreshAnalysis without arguments.
    // It will clear the current job and re-evaluate,
    // likely showing the StartAnalysisScreen again.
    // A more sophisticated retry would re-trigger the last failed job.
    // For now, let's reset.
    refreshAnalysis();
  };

  useEffect(() => {
    // Optional: handle errors, e.g., show a toast message
    if (error) {
      console.error('AccountAnalysisGuard Error:', error);
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
    return (
      <AnalysisInProgressScreen
        initialJob={activeJob}
        onAnalysisComplete={refreshAnalysis}
        onRetry={handleRetry}
      />
    );
  }

  // If there's no analysis, show the start screen
  if (!analysis) {
    return <StartAnalysisScreen onAnalysisStart={handleAnalysisStart} />;
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
