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
  full: 'La partie est complète.',
  notInLobby: 'La partie a déjà commencé.',
  notRunning: 'La partie n’est pas en cours.',
  kicked: 'L’hôte t’a retiré de cette partie.',
  tooFewPlayers: 'Il manque des joueurs pour lancer la partie.',
  selfKick: 'Utilise « Quitter » pour sortir toi-même.',
  unknownAction: 'Action inconnue.',
  noVote: 'Aucun vote en cours.',
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
  notFinished: 'La partie n’est pas terminée.',
  rematchTournament: 'Un tournoi enchaîne déjà ses parties.',
  notScored: 'La manche n’est pas encore comptée.',
  emptyMessage: 'Écris un message.',
  longMessage: 'Ton message dépasse {max} caractères.',
  inviteRole: 'Choisis joueur ou spectateur.',
  inviteMissing: 'Cette invitation n’existe plus.',
  botLevel: 'Choisis un niveau de bot.',
  botsOff: 'Les bots de ce jeu sont en pause pour l’instant.',
  botsSeated: 'Les bots sont en pause, retire-les de la table pour lancer.',
  botsFull: 'Cette partie a déjà son maximum de bots.',
  codeUnknown: 'Aucune partie ne porte ce code.',
  privateGame: 'Cette partie est privée, il faut une invitation.',
  sessionClosed: 'Cette partie est terminée.',
  notYourTurn: 'Ce n’est pas ton tour.',
  tooLate: 'La bombe a explosé avant ton mot.',
  emptyWord: 'Écris un mot.',
  bonusEmpty: 'Garde au moins une lettre bonus.',
  badStroke: 'Ce tir n’est pas valable.',
  holeClosed: 'Le trou n’est pas ouvert.',
  holeDone: 'Tu as fini ce trou.',
  ballRolling: 'Ta balle roule encore.',
  noPower: 'Tu n’as aucun pouvoir en main.',
  badSpot: 'Pose-le sur le parcours, loin du départ et du trou.',
  badTarget: 'Choisis un joueur encore en jeu, balle arrêtée.',
  lastHoleBonus: 'C’est le dernier trou : garde ce bonus, il n’a plus de trou où agir.',
  laidBonusDone: 'Un pouvoir à poser se joue sur le trou en cours.',
  badTeleport: 'Choisis un point libre du parcours, dans le carré autour de ta balle.',
  alreadyRolled: 'Tu as déjà lancé le dé, choisis un pion.',
  rollFirst: 'Lance le dé d’abord.',
  badPawn: 'Ce pion ne peut pas bouger.',
  badSquare: 'Tu as déjà tiré sur cette case.',
  badWeapon: 'Cette arme n’est pas disponible.',
  badFleet: 'Cette flotte n’est pas valable.',
  notPlacing: 'Le placement est terminé.',
  notFighting: 'Aucun combat en cours pour toi.',
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
