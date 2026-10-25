/**
 * Play failure messages
 * @type {Record<string, string>}
 */

export const PLAY_ERRORS = {
  banned: 'L’Administration t’a retiré l’accès à Play.',
  banReason: 'Écris le motif.',
  unknownGame: 'Ce jeu n’existe pas.',
  unplayable: 'Ce jeu arrive bientôt.',
  sessionMissing: 'Cette partie n’existe plus.',
  notSeated: 'Tu ne fais pas partie de cette partie.',
  notHost: 'Seul l’hôte peut faire ça.',
  alreadyPlaying: 'Tu es déjà dans une autre partie, quitte-la d’abord.',
  full: 'La partie est complète.',
  notInLobby: 'La partie a déjà commencé.',
  notRunning: 'La partie n’est pas en cours.',
  kicked: 'L’hôte t’a retiré de cette partie.',
  tooFewPlayers: 'Il manque des joueurs pour lancer la partie.',
  selfKick: 'Utilise « Quitter » pour sortir toi-même.',
  unknownAction: 'Action inconnue.',
  invalidSettings: 'Réglages invalides.',
  categoryCount: 'Choisis entre {min} et {max} catégories.',
  customCount: 'Tu peux ajouter {max} catégories personnalisées au plus.',
  letterCount: 'Garde au moins autant de lettres que de manches.',
  roundClosed: 'La manche est terminée.',
  roundMissing: 'Aucune manche en cours.',
  notReviewing: 'Les votes sont fermés.',
  ownAnswer: 'Tu ne votes pas sur tes propres mots.',
  stopIncomplete: 'Remplis toutes les catégories avant de dire stop.',
  stopDisabled: 'Le stop est désactivé dans cette partie.',
  notCountdown: 'Le joker se joue pendant le compte à rebours.',
  noJoker: 'Tu as déjà utilisé ton joker.',
  jokerTaken: 'Quelqu’un a déjà changé cette lettre.',
  notFinished: 'La partie n’est pas terminée.',
  rematchTournament: 'Un tournoi enchaîne déjà ses parties.',
  notScored: 'La manche n’est pas encore comptée.',
} as const

/**
 * Fill a message template
 * @param {string} template - Message
 * @param {Record<string, number | string>} values - Placeholders
 * @return {string} - Filled message
 */

export const fillPlayMessage = (
  template: string,
  values: Record<string, number | string>
): string => template.replace(/\{(\w+)\}/g, (match, key: string) => String(values[key] ?? match))
