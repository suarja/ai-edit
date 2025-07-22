export type OnboardingStep = 
  | 'welcome'
  | 'account_analysis'
  | 'voice_cloning'
  | 'editorial_profile'
  | 'video_upload'
  | 'settings_tour';

export interface StepContent {
  id: OnboardingStep;
  title: string;
  message: string;
  highlight?: string;
  subtext?: string;
  stats?: string;
  example?: string;
  tip?: string;
  cta?: string;
  showProButton: boolean;
  isFinal?: boolean;
  videoUrl?: string; // Pour support futur
  imageUrl?: string; // Pour support futur
  route?: string; // Route à naviguer
}