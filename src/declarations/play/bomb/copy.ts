/**
 * Copy of the Bomb Party table
 * @type {Record<string, string>}
 */

export const BOMB_BOARD_COPY = {
  yourTurn: 'À toi ! Un mot avec',
  theirTurn: '{name} cherche un mot avec',
  placeholder: 'Ton mot…',
  submit: 'Valider',
  letters: 'Lettres bonus',
  lettersHint: 'Utilise-les toutes pour gagner un cœur.',
  out: 'Éliminé',
  lives: '{count} vies',
  words: '{count} mots',
  ranking: 'Classement',
  spectating: 'Tu regardes la partie.',
} as const

/**
 * Why a word was refused
 * @type {Record<string, string>}
 */

export const BOMB_MISS_COPY = {
  prompt: 'Il manque « {prompt} »',
  unknown: 'Pas dans le dictionnaire',
  used: 'Déjà joué',
} as const

export type BombMissReason = keyof typeof BOMB_MISS_COPY

/**
 * Feed lines of a Bomb Party game
 * @type {Record<string, string>}
 */

export const BOMB_FEED_COPY = {
  WORD: 'a joué {word}',
  BLAST: 'a explosé sur {prompt}',
  LIFE: 'a gagné un cœur',
} as const

/**
 * Setup drawer of a new Bomb Party game
 * @type {Record<string, string>}
 */

export const BOMB_SETUP_COPY = {
  title: 'Nouvelle partie de Bomb Party',
  tabs: 'Réglages de la partie',
  tabWords: 'Mots',
  tabLives: 'Vies',
  tabTurns: 'Tours',
  dictionary: 'Dictionnaire',
  dictionaryValue: 'Français',
  dictionaryHint: 'Les mots sont vérifiés dans le dictionnaire français, accents ignorés.',
  difficulty: 'Difficulté des syllabes',
  difficultyHint: 'Nombre de mots du dictionnaire qui contiennent au moins la syllabe tirée.',
  beginner: 'Débutant',
  medium: 'Moyen',
  hard: 'Difficile',
  custom: 'Personnalisé',
  wordsPerPrompt: '{count}+ mots',
  customCount: 'Mots par syllabe',
  startLives: 'Vies au départ',
  maxLives: 'Vies au maximum',
  maxLivesHint: 'Un cœur gagné ne dépasse jamais ce plafond.',
  minTurn: 'Durée minimale d’un tour',
  minTurnHint: 'Chaque joueur garde au moins ce temps avant que la bombe puisse exploser.',
  promptAge: 'Âge maximal d’une syllabe',
  promptAgeHint: 'Nombre de tours sans réponse avant que la syllabe change.',
  bonus: 'Alphabet bonus',
  bonusHint: 'Les lettres à utiliser pour gagner un cœur.',
  bonusCount: '{count} / {total}',
  seconds: '{seconds} s',
  turns: '{count} tours',
  less: 'Moins',
  more: 'Plus',
  all: 'Tout cocher',
  none: 'Tout décocher',
  create: 'Créer la partie',
  cancel: 'Annuler',
} as const

/**
 * Rules drawer of a Bomb Party game
 * @type {Record<string, string>}
 */

export const BOMB_RULES_COPY = {
  title: 'Règles de la partie',
  dictionary: 'Dictionnaire',
  difficulty: 'Difficulté',
  lives: 'Vies',
  livesValue: '{start} au départ, {max} au maximum',
  minTurn: 'Tour minimal',
  promptAge: 'Âge d’une syllabe',
  bonus: 'Alphabet bonus',
} as const

/**
 * Syllables drifting up the hub like embers
 * @type {Object}
 */

export const BOMB_EMBERS = {
  ground: 'play-fuse',
  syllables: ['ON', 'TRA', 'ENT', 'QU', 'ER', 'ILL', 'CH', 'OU', 'ANT', 'ES', 'PR', 'AIN'],
  // Seconds of one rise, and the gap between two embers
  rise: 14,
  gap: 1.2,
} as const
