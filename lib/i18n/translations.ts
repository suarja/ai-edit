export const translations = {
  fr: {
    // Auth
    welcome: 'Bienvenue',
    signIn: 'Connexion',
    signUp: 'Inscription',
    email: 'Email',
    password: 'Mot de passe',
    fullName: 'Nom complet',
    welcomeBack: 'Bon retour',
    createAccount: 'Créer un compte',
    dontHaveAccount: "Vous n'avez pas de compte ?",
    alreadyHaveAccount: 'Vous avez déjà un compte ?',
    signInToContinue: 'Connectez-vous pour continuer',
    joinUs: 'Rejoignez-nous pour créer des vidéos incroyables',

    // Tabs
    sources: 'Sources',
    create: 'Créer',
    generated: 'Générées',
    settings: 'Paramètres',

    // Source Videos
    sourceVideos: 'Vidéos Sources',
    uploadVideo: 'Télécharger une vidéo',
    selectVideo: 'Sélectionner une vidéo',
    videoTitle: 'Titre de la vidéo',
    description: 'Description',
    tags: 'Tags (séparés par des virgules)',
    upload: 'Télécharger',
    yourVideos: 'Vos Vidéos',

    // Video Generation
    requestVideo: 'Demander une vidéo',
    videoPrompt: 'Description de la vidéo',
    systemInstructions: 'Instructions système',
    sourceClips: 'Clips sources',
    selectClips: 'Sélectionner des clips',
    voiceClone: 'Clone vocal',
    editorialProfile: 'Profil éditorial',
    generateVideo: 'Générer la vidéo',

    // Editorial Profile
    contentCreatorPersona: 'Persona du créateur',
    toneOfVoice: 'Ton de voix',
    targetAudience: 'Public cible',
    styleNotes: 'Notes de style',
    contentExamples: 'Exemples de contenu',
    addExample: 'Ajouter un exemple',
    removeExample: 'Supprimer',
    saveProfile: 'Sauvegarder le profil',

    // Settings
    account: 'Compte',
    preferences: 'Préférences',
    support: 'Support',
    helpCenter: "Centre d'aide",
    language: 'Langue',
    notifications: 'Notifications',
    privacy: 'Confidentialité',
    logout: 'Déconnexion',

    // Status
    ready: 'Prêt',
    pending: 'En attente',
    processing: 'En cours',
    error: 'Erreur',
    success: 'Succès',
    loading: 'Chargement...',

    // Common
    save: 'Sauvegarder',
    cancel: 'Annuler',
    continue: 'Continuer',
    edit: 'Modifier',
    delete: 'Supprimer',
    create: 'Créer',
    update: 'Mettre à jour',
  },
};

export type TranslationKey = keyof typeof translations.fr;

export function t(key: TranslationKey): string {
  return translations.fr[key] || key;
}
