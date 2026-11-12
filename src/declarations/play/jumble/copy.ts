import type { JumbleLevel } from '@/declarations/play/jumble/settings'

/**
 * Copy of the Jumble table
 * @type {Record<string, string>}
 */

export const JUMBLE_BOARD_COPY = {
  round: 'Manche {round} sur {total}',
  lead: 'Remets les lettres dans l’ordre',
  placeholder: 'Ton mot…',
  submit: 'Valider',
  letters: '{count} lettres',
  hint: 'Indice',
  solvedBy: '{name} a trouvé',
  solvedIn: 'en {seconds} s',
  mine: 'Tu as trouvé',
  flash: 'Éclair',
  streak: '{count} d’affilée',
  points: '+{points}',
  timeout: 'Temps écoulé, personne n’a trouvé',
  itWas: 'C’était',
  last: 'Dernière manche',
  score: '{score} pts',
  ranking: 'Classement',
  rounds: '{count} manches',
  watching: 'Tu regardes la partie',
} as const

/**
 * Feed lines of a Jumble game
 * @type {Record<string, string>}
 */

export const JUMBLE_FEED_COPY = {
  SOLVED: 'a trouvé {word} en {seconds} s, +{points}',
  MISSED: 'Personne n’a trouvé {word}',
} as const

/**
 * Setup drawer of a new Jumble game
 * @type {Record<string, string>}
 */

export const JUMBLE_SETUP_COPY = {
  title: 'Nouvelle partie de Jumble',
  tabs: 'Réglages de la partie',
  tabSpeed: 'Rythme',
  roundSeconds: 'Temps par manche',
  roundSecondsHint: 'Plus la réponse est rapide, plus elle rapporte.',
  hintOn: 'Avec indice',
  hintOff: 'Sans indice',
  seconds: '{seconds} s',
  count: '{count} manches',
  less: 'Moins',
  more: 'Plus',
  create: 'Créer la partie',
  cancel: 'Annuler',
} as const

/**
 * Name of each word length level
 * @type {Record<JumbleLevel, string>}
 */

export const JUMBLE_LEVEL_COPY: Record<JumbleLevel, string> = {
  easy: 'Facile',
  medium: 'Moyen',
  hard: 'Difficile',
  extreme: 'Extrême',
}

/**
 * Rules drawer of a Jumble game
 * @type {Record<string, string>}
 */

export const JUMBLE_RULES_COPY = {
  title: 'Règles de la partie',
  rounds: 'Manches',
  difficulty: 'Difficulté',
  roundSeconds: 'Temps par manche',
  hint: 'Indice',
  scoring: 'Points',
  scoringValue: '{base} de base, jusqu’à {speed} de rapidité, {flash} pour un éclair',
  streak: 'Série',
  streakValue: '+{step} par manche gagnée d’affilée, jusqu’à +{max}',
} as const

/**
 * Letters rising up the hub like bubbles
 * @type {Object}
 */

export const JUMBLE_HUB = {
  ground: 'play-jumble',
  letters: ['J', 'U', 'M', 'B', 'L', 'E', 'M', 'O', 'T', 'S', 'Q', 'R', 'A', 'I'],
  // Seconds of one rise, and the gap between two letters
  rise: 13,
  gap: 1,
} as const

/**
 * Sound files of Jumble, borrowed from Bomb Party
 * @type {Record<string, string>}
 */

export const JUMBLE_SOUNDS = {
  solved: '/play/sons/bomb/mot.mp3',
  mine: '/play/sons/bomb/vie.mp3',
  missed: '/play/sons/bomb/rate.mp3',
  hint: '/play/sons/bomb/ton-tour.mp3',
  over: '/play/sons/bomb/victoire.mp3',
} as const

export type JumbleSoundName = keyof typeof JUMBLE_SOUNDS
