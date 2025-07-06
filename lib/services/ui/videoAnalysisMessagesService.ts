/**
 * Video Analysis Messages Service
 *
 * Provides engaging waiting messages during video analysis
 * Inspired by WaitingMessagesService for consistency
 */

const videoAnalysisMessages = [
  // Initial analysis messages
  {
    title: 'Analyse en cours...',
    message: 'Notre IA examine votre vidéo pour extraire les métadonnées.',
  },
  {
    title: 'Détection des segments',
    message:
      'Identification des moments clés et de la structure de votre vidéo.',
  },
  {
    title: 'Génération des tags',
    message: 'Création de tags pertinents pour faciliter la recherche.',
  },
  {
    title: 'Analyse de la structure',
    message: "Détection des hooks, transitions et appels à l'action.",
  },
  {
    title: 'Presque terminé...',
    message: "Finalisation de l'analyse et préparation des métadonnées.",
  },

  // Educational messages about the process
  {
    title: 'Le saviez-vous ?',
    message:
      'Notre IA analyse chaque segment de votre vidéo pour comprendre sa structure narrative.',
  },
  {
    title: 'Segmentation intelligente',
    message:
      "L'IA identifie automatiquement les intro, transitions et conclusions de votre vidéo.",
  },
  {
    title: 'Tags intelligents',
    message:
      'Les tags générés vous aideront à organiser et retrouver facilement vos vidéos.',
  },

  // Encouraging messages
  {
    title: 'Analyse approfondie',
    message:
      "Plus l'analyse prend du temps, plus les métadonnées seront précises !",
  },
  {
    title: 'Optimisation en cours',
    message:
      'Nous analysons les éléments visuels pour une meilleure compréhension.',
  },
  {
    title: 'Dernière étape',
    message: 'Préparation de vos métadonnées personnalisées...',
  },

  // Value proposition messages
  {
    title: 'Gain de temps',
    message:
      'Ces métadonnées vous feront gagner du temps lors de la création de contenu.',
  },
  {
    title: 'Organisation automatique',
    message:
      'Vos vidéos seront automatiquement organisées et facilement retrouvables.',
  },
  {
    title: "Prêt pour l'édition",
    message:
      "Les segments identifiés faciliteront l'édition future de vos vidéos.",
  },
];

export class VideoAnalysisMessagesService {
  private static currentIndex = -1;

  /**
   * Gets the next message in a sequential but looping order.
   * This avoids showing the same message twice in a row.
   */
  static getNextMessage(): { title: string; message: string } {
    this.currentIndex = (this.currentIndex + 1) % videoAnalysisMessages.length;
    return videoAnalysisMessages[this.currentIndex];
  }

  /**
   * Gets a random message for variety
   */
  static getRandomMessage(): { title: string; message: string } {
    const randomIndex = Math.floor(
      Math.random() * videoAnalysisMessages.length
    );
    return videoAnalysisMessages[randomIndex];
  }

  /**
   * Gets the initial message
   */
  static getInitialMessage(): { title: string; message: string } {
    return videoAnalysisMessages[0];
  }

  /**
   * Gets a completion message
   */
  static getCompletionMessage(): { title: string; message: string } {
    return {
      title: 'Analyse terminée !',
      message:
        'Vos métadonnées sont prêtes. Vous pouvez les modifier si nécessaire.',
    };
  }

  /**
   * Gets an error message
   */
  static getErrorMessage(): { title: string; message: string } {
    return {
      title: 'Analyse échouée',
      message:
        "L'analyse automatique n'a pas fonctionné. Vous pouvez remplir les métadonnées manuellement.",
    };
  }
}
