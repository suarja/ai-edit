import React from 'react';
import { Slot } from 'expo-router';
import { AnalysisProvider } from '@/contexts/AnalysisContext';

/**
 * Layout pour les routes d'analyse avec le contexte centralisé.
 * Plus de guard global - chaque route gère ses propres requirements.
 */
export default function AnalysisLayout() {
  return (
    <AnalysisProvider>
      <Slot />
    </AnalysisProvider>
  );
}
