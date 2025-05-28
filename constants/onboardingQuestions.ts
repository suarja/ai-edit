export interface SurveyOption {
  id: string;
  text: string;
}

export interface SurveyQuestion {
  id: string;
  question: string;
  options: SurveyOption[];
}

export const surveyQuestions: SurveyQuestion[] = [
  {
    id: 'content_goals',
    question: "What's your main goal?",
    options: [
      { id: 'grow_audience', text: 'Grow my audience' },
      { id: 'monetize', text: 'Monetize my content' },
      { id: 'save_time', text: 'Save time creating content' },
      { id: 'improve_quality', text: 'Improve content quality' },
    ],
  },
  {
    id: 'pain_points',
    question: "What's your biggest challenge?",
    options: [
      { id: 'time', text: 'Time constraints' },
      { id: 'editing', text: 'Lack of editing skills' },
      { id: 'ideas', text: 'Coming up with ideas' },
      { id: 'presence', text: 'Voice/on-camera presence' },
    ],
  },
  {
    id: 'content_style',
    question: 'What style of content do you create?',
    options: [
      { id: 'educational', text: 'Educational' },
      { id: 'entertainment', text: 'Entertainment' },
      { id: 'informational', text: 'Informational' },
      { id: 'promotional', text: 'Promotional' },
    ],
  },
  {
    id: 'platform_focus',
    question: 'Which platform do you focus on?',
    options: [
      { id: 'youtube', text: 'YouTube' },
      { id: 'instagram_tiktok', text: 'Instagram/TikTok' },
      { id: 'linkedin', text: 'LinkedIn' },
      { id: 'website', text: 'Website/Blog' },
    ],
  },
  {
    id: 'content_frequency',
    question: 'How often do you create content?',
    options: [
      { id: 'daily', text: 'Daily' },
      { id: 'weekly', text: 'Weekly' },
      { id: 'monthly', text: 'Monthly' },
      { id: 'occasionally', text: 'Occasionally' },
    ],
  },
];

// French localized questions
export const frenchSurveyQuestions: SurveyQuestion[] = [
  {
    id: 'content_goals',
    question: 'Quel est votre objectif principal ?',
    options: [
      { id: 'grow_audience', text: 'Développer mon audience' },
      { id: 'monetize', text: 'Monétiser mon contenu' },
      { id: 'save_time', text: 'Gagner du temps lors de la création' },
      { id: 'improve_quality', text: 'Améliorer la qualité du contenu' },
    ],
  },
  {
    id: 'pain_points',
    question: 'Quel est votre plus grand défi ?',
    options: [
      { id: 'time', text: 'Contraintes de temps' },
      { id: 'editing', text: 'Manque de compétences en montage' },
      { id: 'ideas', text: 'Trouver des idées' },
      { id: 'presence', text: "Présence vocale/à l'écran" },
    ],
  },
  {
    id: 'content_style',
    question: 'Quel style de contenu créez-vous ?',
    options: [
      { id: 'educational', text: 'Éducatif' },
      { id: 'entertainment', text: 'Divertissement' },
      { id: 'informational', text: 'Informatif' },
      { id: 'promotional', text: 'Promotionnel' },
    ],
  },
  {
    id: 'platform_focus',
    question: 'Sur quelle plateforme vous concentrez-vous ?',
    options: [
      { id: 'youtube', text: 'YouTube' },
      { id: 'instagram_tiktok', text: 'Instagram/TikTok' },
      { id: 'linkedin', text: 'LinkedIn' },
      { id: 'website', text: 'Site web/Blog' },
    ],
  },
  {
    id: 'content_frequency',
    question: 'À quelle fréquence créez-vous du contenu ?',
    options: [
      { id: 'daily', text: 'Quotidiennement' },
      { id: 'weekly', text: 'Hebdomadairement' },
      { id: 'monthly', text: 'Mensuellement' },
      { id: 'occasionally', text: 'Occasionnellement' },
    ],
  },
];
