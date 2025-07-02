const waitingMessages = [
  // Educational messages about what's happening
  {
    title: "Le saviez-vous ?",
    message: "EditIA analyse les sous-titres, la musique et le rythme de vos vidéos pour des insights uniques.",
  },
  {
    title: "Analyse des tendances",
    message: "Nous étudions les hashtags et les sons qui ont fait le succès de vos contenus.",
  },
  {
    title: "Profil de l'audience",
    message: "Notre IA essaie de comprendre le type d'audience que vous attirez pour mieux la cibler.",
  },
  {
    title: "Optimisation en cours...",
    message: "Notre IA recherche les meilleurs moments pour poster vos futures vidéos.",
  },

  // Progress and reassurance messages
  {
    title: "Un peu de patience...",
    message: "Le scraping des données peut prendre quelques minutes, c'est la partie la plus longue !",
  },
  {
    title: "Bientôt terminé !",
    message: "La génération de votre rapport personnalisé est la dernière étape.",
  },
  {
    title: "Analyse en cours...",
    message: "Notre IA analyse vos vidéos pour vous donner des insights sur votre audience et vos tendances.",
  },

  // Encouraging exploration and multi-tasking
  {
    title: "💡 Pendant que vous attendez...",
    message: "Profitez-en pour explorer les autres fonctionnalités d'EditIA ! Vous pouvez revenir quand l'analyse sera terminée.",
  },
  {
    title: "☕ Prenez une pause !",
    message: "Cette analyse peut prendre 5-10 minutes. Le moment parfait pour prendre un café ou planifier votre prochaine vidéo !",
  },
  {
    title: "📱 Restez productif",
    message: "N'hésitez pas à fermer l'app et faire autre chose. Nous vous notifierons dès que votre analyse sera prête !",
  },
  {
    title: "🎯 Pendant ce temps...",
    message: "Que diriez-vous de parcourir vos anciennes vidéos et noter ce qui a le mieux fonctionné ?",
  },
  {
    title: "⏰ Temps d'attente optimal",
    message: "Une analyse approfondie prend du temps, mais c'est ce qui nous permet de vous donner des insights précis et actionables.",
  },

  // Future features and engagement
  {
    title: "🚀 Bientôt disponible: Chat avec tes vidéos!",
    message: "Tu pourras discuter avec tes vidéos en direct et savoir si elles ont des chances de partir vraiment viral !",
  },
  {
    title: "📊 Prochainement",
    message: "Comparaison avec les comptes similaires de votre niche pour des insights encore plus poussés !",
  },
  {
    title: "🎬 En développement",
    message: "Bientôt, analyse automatique de vos rushes pour prédire le potentiel viral avant même de publier !",
  },

  // Value proposition and benefits
  {
    title: "💰 Le saviez-vous ?",
    message: "Une analyse EditIA peut vous aider à doubler votre engagement en optimisant vos contenus selon votre audience.",
  },
  {
    title: "🎯 Insights personnalisés",
    message: "Contrairement aux autres outils, EditIA analyse spécifiquement VOTRE audience et VOS tendances uniques.",
  },
  {
    title: "⚡ Optimisation continue",
    message: "Chaque analyse vous donne des recommandations précises pour améliorer vos prochaines vidéos.",
  },

  // Support and community
  {
    title: "❓ Questions ?",
    message: "Notre équipe est là pour vous aider ! N'hésitez pas à nous contacter si vous avez des questions.",
  },
  {
    title: "💬 Communauté EditIA",
    message: "Rejoignez notre Discord pour échanger avec d'autres créateurs et partager vos succès !",
  },

  // Fun and motivational
  {
    title: "🎉 Moment d'anticipation",
    message: "Les meilleures découvertes valent l'attente ! Votre rapport personnalisé sera bientôt prêt.",
  },
  {
    title: "🔮 Préparez-vous...",
    message: "Vous allez découvrir des patterns dans vos vidéos que vous n'aviez jamais remarqués auparavant !",
  },
];

export class WaitingMessagesService {
  private static currentIndex = -1;

  /**
   * Gets the next message in a sequential but looping order.
   * This avoids showing the same message twice in a row.
   */
  static getNextMessage(): { title: string; message: string } {
    this.currentIndex = (this.currentIndex + 1) % waitingMessages.length;
    return waitingMessages[this.currentIndex];
  }
} 