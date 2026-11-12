/**
 * Copy of Play on a phone
 * @type {Record<string, string>}
 */

export const PLAY_MOBILE_COPY = {
  tabs: 'Navigation de Play',
  tabGroup: 'Groupe',
  tabFeed: 'Feed',
  tabHome: 'Jeux',
  tabLounge: 'Salon',
  tabMe: 'Mon compte',
  meSettings: 'Paramètres Memora Play',
  tabRanking: 'Classement',
  tabStats: 'Stats',
  tabStatsFull: 'Statistiques',
  soon: 'Bientôt',
  live: 'Sessions en cours',
  rankingTitle: 'Classement',
  rankingGames: 'Choisir un jeu',
  rankingGame: 'Jeu',
  feedOpen: 'Ouvrir le fil',
  feedTabHistory: 'Dernières parties',
  feedTabInvites: 'Sessions',
  feedTabs: 'Rubriques du feed',
  feedInvitesEmpty: 'Aucune session ni invitation pour le moment.',
  online: 'Joueurs en ligne',
  onlineEmpty: 'Personne d’autre n’est dans Memora Play pour le moment.',
  onlineIdle: 'Dans le hub',
  onlineIn: 'Joue à {game}',
  onlinePlaying: 'Est en partie',
  onlineWatching: 'Regarde une partie',
  join: 'Rejoindre la partie',
  watch: 'Regarder la partie',
  seeProfile: 'Voir son profil',
  privateGame: 'Créer une partie privée',
  settings: 'Paramètres',
  sound: 'Son',
  heavyMotion: 'Animations lourdes',
  heavyMotionHint: 'Décors animés, braises et ciel. Coupe-les si ton téléphone rame.',
  statsFigures: 'Chiffres',
  historyEmpty: 'Aucune partie terminée pour l’instant.',
  historyRank: '{rank}e sur {players}',
  historyXp: '+{xp} XP',
  outcomeWIN: 'Victoire',
  outcomeDRAW: 'Égalité',
  outcomeLOSS: 'Défaite',
  hubTabs: 'Sections du jeu',
  hubStats: 'Stats',
  hubPlay: 'Créer une partie',
  hubSessions: 'Sessions',
  hubBack: 'Tous les jeux',
  hubRanking: 'Classement',
  hubConcept: 'Le concept',
  hubConceptShort: 'Concept',
  gameMenu: 'Menu de la partie',
  gameLobby: 'Retourner au Hub',
  gameAll: 'Tous les jeux',
  gameLeave: 'Quitter la partie',
  gameLeaveTitle: 'Abandonner la partie ?',
  gameLeaveText: 'Ta place sera libérée et tu ne pourras plus jouer cette manche.',
  gameLeaveConfirm: 'Abandonner',
  gameLeaveKeep: 'Rester',
  gameSettings: 'Réglages',
  chatBubbles: 'Afficher les bulles du chat',
  chatFeed: 'Ouvrir le feed et le chat',
} as const

/**
 * Chat bubbles over a phone game
 * @type {{ max: number, ttlMs: number }}
 */

export const PLAY_BUBBLES = { max: 3, ttlMs: 7000 } as const

/**
 * Copy of the profile sidebar
 * @type {Record<string, string>}
 */

export const PLAY_ME_COPY = {
  open: 'Voir mon profil',
  allStats: 'Mes stats',
  settings: 'Réglages',
} as const
