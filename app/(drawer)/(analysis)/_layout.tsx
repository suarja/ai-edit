import React from 'react';
import { Slot } from 'expo-router';
import AccountAnalysisGuard from '@/components/guards/AccountAnalysisGuard';

/**
 * This layout wraps all screens in the (analysis) group with the AccountAnalysisGuard.
 * It ensures that a user has a completed analysis before accessing the insights, chat,
 * or conversations screens. If no analysis exists, it redirects them to the
 * start-analysis screen.
 */
export default function AnalysisLayout() {
  return (
    <AccountAnalysisGuard>
      <Slot />
    </AccountAnalysisGuard>
  );
}
