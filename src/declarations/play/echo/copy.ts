/**
 * Copy of the Echo table
 * @type {Record<string, string>}
 */

export const ECHO_BOARD_COPY = {
  round: 'Manche {round} sur {total}',
  lead: 'Trouve le symbole que ta carte partage avec celle du centre',
  center: 'Carte du centre',
  mine: 'Ta carte',
  hands: 'Les cartes de la table',
  locked: 'Raté, patiente un instant',
  found: 'Trouvé !',
  foundBy: '{name} a trouvé',
  foundIn: 'en {seconds} s',
  points: '+{points}',
  first: 'Premier',
  nobody: 'Temps écoulé, personne n’a trouvé',
  answer: 'C’était {symbol}',
  score: '{score} pts',
  ranking: 'Classement',
  watching: 'Tu regardes la partie',
  done: 'Trouvé',
} as const

/**
 * Feed lines of an Echo game
 * @type {Record<string, string>}
 */

export const ECHO_FEED_COPY = {
  FOUND: 'a trouvé {symbol} en {seconds} s, +{points}',
} as const

/**
 * Setup drawer of a new Echo game
 * @type {Record<string, string>}
 */

export const ECHO_SETUP_COPY = {
  title: 'Nouvelle partie d’Écho',
  tabs: 'Réglages de la partie',
  tabRounds: 'Manches',
  tabSpeed: 'Rythme',
  rounds: 'Nombre de manches',
  roundsHint: 'Une nouvelle donne à chaque manche.',
  roundSeconds: 'Temps par manche',
  roundSecondsHint: 'Plus le symbole est trouvé vite, plus il rapporte.',
  seconds: '{seconds} s',
  count: '{count} manches',
  less: 'Moins',
  more: 'Plus',
  create: 'Créer la partie',
  cancel: 'Annuler',
} as const

/**
 * Rules drawer of an Echo game
 * @type {Record<string, string>}
 */

export const ECHO_RULES_COPY = {
  title: 'Règles de la partie',
  rounds: 'Manches',
  roundSeconds: 'Temps par manche',
  scoring: 'Points',
  scoringValue: '{base} de base, jusqu’à {speed} de rapidité, {first} pour le premier',
  miss: 'Erreur',
  missValue: 'Ta carte se verrouille {seconds} s',
} as const

/**
 * Cards drifting up the hub
 * @type {Object}
 */

export const ECHO_HUB = {
  ground: 'play-echo',
  // Symbols floating, by deck key
  floaters: ['star', 'heart', 'bolt', 'crown', 'gem', 'ghost', 'moon', 'shield', 'flame', 'bell'],
  rise: 14,
  gap: 1.4,
} as const

/**
 * Sound files of Echo, borrowed from Bomb Party
 * @type {Record<string, string>}
 */

export const ECHO_SOUNDS = {
  found: '/play/sons/bomb/mot.mp3',
  mine: '/play/sons/bomb/vie.mp3',
  missed: '/play/sons/bomb/rate.mp3',
  over: '/play/sons/bomb/victoire.mp3',
} as const

export type EchoSoundName = keyof typeof ECHO_SOUNDS
