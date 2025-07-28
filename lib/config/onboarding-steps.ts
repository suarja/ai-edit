import { StepContent } from '../types/onboarding.types';

/**
 * Configuration des étapes d'onboarding
 * Messages optimisés pour la conversion et le marketing
 */
export const ONBOARDING_STEPS: StepContent[] = [
  {
    id: 'welcome',
    title: "Bienvenue 🚀",
    message: "90% des créateurs TikTok perdent du temps en édition. Editia fait le travail pour vous en 30 secondes.",
    highlight: "Rejoignez 10,000+ créateurs qui ont 10x leur productivité",
    showProButton: false,
    // videoUrl: 'https://editia.app/onboarding/welcome.mp4' // Pour le futur
  },
  {
    id: 'account_analysis',
    title: "Votre Analyse TikTok Offerte 🎁",
    message: "Découvrez ce qui fonctionne vraiment sur votre compte. Vos meilleures vidéos, votre audience, vos tendances.",
    highlight: "Valeur: 49€ - 29,99€ aujourd'hui seulement",
    subtext: "Les créateurs Pro analysent leur compte chaque semaine pour rester viraux",
    showProButton: true,
    route: '/(drawer)/(analysis)/account-insights',
  },
  {
    id: 'voice_cloning',
    title: "Votre Voix = Votre Marque 🎤",
    message: "Les vidéos avec votre vraie voix ont 3x plus d'engagement. Clonez-la en 2 minutes.",
    highlight: "Exclusif Pro: Générez 100+ vidéos avec votre voix",
    stats: "87% des top créateurs utilisent le voice cloning",
    showProButton: true,
    route: '/(settings)/voice-clone',
  },
  {
    id: 'editorial_profile',
    title: "Un Profil qui Convertit 🎯",
    message: "L'IA apprend votre style unique. Chaque script sera parfaitement adapté à votre audience.",
    highlight: "Scripts personnalisés = 5x plus de vues",
    example: "Ex: @fashionista → scripts mode tendance, @techguru → reviews produits viraux",
    showProButton: true,
    route: '/(settings)/editorial-profile',
  },
  {
    id: 'video_upload',
    title: "Vos Vidéos Sources = Votre Or 📹",
    message: "10-15 secondes suffisent. L'IA transforme vos clips en dizaines de variations virales.",
    highlight: "Pro: Description automatique par IA vision",
    tip: "Les gros plans et les mouvements dynamiques performent 40% mieux",
    showProButton: true,
    route: '/(drawer)/source-videos',
  },
  {
    id: 'settings_tour',
    title: "Votre Centre de Contrôle 🎆",
    message: "Tout est prêt! Gérez vos préférences, votre voix, vos styles de sous-titres.",
    highlight: "Accès prioritaire au support 24/7 pour les Pro",
    cta: "Commencez à créer maintenant →",
    showProButton: true,
    isFinal: true,
    route: '/(drawer)/settings',
  }
];

/**
 * Configuration des routes par étape
 * Correspondance avec les vraies routes de l'app
 */
export const STEP_ROUTES: Record<number, string | null> = {
  0: null, // Welcome - pas de navigation
  1: '/(drawer)/(analysis)/account-insights', // Vraie route d'analyse
  2: '/(settings)/voice-clone', // Page voice cloning
  3: '/(settings)/editorial-profile', // Page profil éditorial corrigée
  4: '/(drawer)/source-videos', // Page upload/source videos
  5: '/(drawer)/settings', // Page settings
};

/**
 * Messages de conversion contextuels
 * Affichés après certaines actions pour pousser vers Pro
 */
export const CONVERSION_MESSAGES = {
  firstAnalysisComplete: {
    title: "Analyse terminée! 🎉",
    message: "Vous venez de débloquer des insights précieux. Les utilisateurs Pro obtiennent des analyses automatiques chaque semaine.",
    cta: "Passer Pro pour des analyses régulières",
    urgency: "Offre limitée: -50% les 7 premiers jours",
  },
  
  scriptLimitReached: {
    title: "Script gratuit utilisé ✨",
    message: "Vous avez créé votre premier script! Les créateurs Pro génèrent jusqu'à 50 scripts/jour.",
    cta: "Débloquer tous les scripts",
    stats: "En moyenne, +300% de vues avec des scripts personnalisés",
  },
  
  videoWithWatermark: {
    title: "Vidéo générée avec succès! 🎬",
    message: "Votre vidéo est prête, avec le filigrane Editia. Passez Créateur pour des vidéos sans marque.",
    cta: "Retirer le filigrane définitivement",
    highlight: "Vos vidéos paraîtront 100% authentiques",
  },
  
  voiceCloneTease: {
    title: "Votre voix unique vous attend 🎙️",
    message: "Le voice cloning transforme complètement vos vidéos. 93% des utilisateurs Pro disent que c'est leur fonctionnalité préférée.",
    cta: "Cloner ma voix maintenant",
    social_proof: "Rejoint par 5,000+ créateurs ce mois-ci",
  },
};

/**
 * Obtient le contenu d'une étape par son index
 */
export function getStepContent(stepIndex: number): StepContent | null {
  return ONBOARDING_STEPS[stepIndex] || null;
}

/**
 * Obtient la route d'une étape
 */
export function getStepRoute(stepIndex: number): string | null {
  return STEP_ROUTES[stepIndex] || null;
}

/**
 * Obtient le nombre total d'étapes
 */
export function getTotalSteps(): number {
  return ONBOARDING_STEPS.length;
}