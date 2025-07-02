const waitingMessages = [
  {
    title: "Le saviez-vous ?",
    message: "EditIA analyse les sous-titres, la musique et le rythme de vos vidéos pour des insights uniques.",
  },
  {
    title: "Optimisation en cours...",
    message: "Notre IA recherche les meilleurs moments pour poster vos futures vidéos.",
  },
  {
    title: "Un peu de patience...",
    message: "Le scraping des données peut prendre quelques minutes, c'est la partie la plus longue !",
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
    title: "Bientôt terminé !",
    message: "La génération de votre rapport personnalisé est la dernière étape.",
  },
  {
    title: "Analyse en cours...",
    message: "Notre IA analyse vos vidéos pour vous donner des insights sur votre audience et vos tendances.",
  },
  {
    title: "Si vous avez des questions, n'hésitez pas à nous contacter !",
    message: "Notre équipe est là pour vous aider.",
  },

  {
    title: "Bientôt disponible: Chat avec tes vidéos!",
    message: "Tu pourras discuter avec tes vidéos en direct et savoir si elles ont des chances de partir vraiment viral !",
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