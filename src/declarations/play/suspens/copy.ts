/**
 * Copy of the Suspens table
 * @type {Record<string, string>}
 */

export const SUSPENS_BOARD_COPY = {
  round: 'Manche {round} sur {total}',
  setterPicks: '{name} choisit un mot',
  setterPicksWait: 'Il a {seconds} s pour le trouver',
  youPick: 'Choisis un mot à faire deviner',
  pickHint: 'De {min} à {max} lettres, un mot du dictionnaire, sans espace ni tiret.',
  pickPlaceholder: 'Ton mot secret',
  pickSubmit: 'Valider',
  pickDraw: 'Tirer au sort',
  yourWord: 'Ton mot secret',
  youSet: 'Ils cherchent ton mot, retiens ton souffle',
  yourTurn: 'À toi de jouer : une lettre ou le mot entier',
  theirTurn: 'C’est au tour de {name}',
  letters: '{count} lettres',
  errors: 'Erreurs {count} sur {max}',
  wrong: 'Lettres ratées',
  keyboard: 'Lettres',
  guessWord: 'Proposer le mot',
  guessPlaceholder: 'Le mot entier',
  guessSubmit: 'Proposer',
  guessHint: 'Un mot faux compte comme une erreur.',
  solved: '{name} complète le mot',
  hanged: 'Le bonhomme est pendu',
  itWas: 'C’était',
  setterGain: '{name} gagne {points} pts pour son mot',
  score: '{score} pts',
  ranking: 'Classement',
  watching: 'Tu regardes la partie',
  setter: 'Meneur',
  onTurn: 'Son tour',
  gallows: 'Potence : {count} erreurs sur {max}',
  word: 'Mot à trouver',
  hit: '+{points}',
} as const

/**
 * Feed lines of a Suspens game
 * @type {Record<string, string>}
 */

export const SUSPENS_FEED_COPY = {
  LETTER_HIT: 'a trouvé {letter}, +{points}',
  LETTER_MISS: 'a raté {letter}',
  WORD_HIT: 'a deviné le mot, +{points}',
  WORD_MISS: 'a proposé « {word} », raté',
  TIMEOUT: 'a laissé filer son tour',
  SOLVED: 'a vu son mot {word} complété, +{points}',
  HANGED: 'a pendu le bonhomme avec {word}, +{points}',
} as const

/**
 * Setup drawer of a new Suspens game
 * @type {Record<string, string>}
 */

export const SUSPENS_SETUP_COPY = {
  title: 'Nouvelle partie de Suspens',
  tabs: 'Réglages de la partie',
  tabRules: 'Règles',
  turnSeconds: 'Temps par tour',
  turnSecondsHint: 'Un tour dépassé compte comme une erreur.',
  pickSeconds: 'Temps pour choisir le mot',
  pickSecondsHint: 'Sans mot à temps, le jeu en tire un au sort.',
  seconds: '{seconds} s',
  count: '{count} tours',
  less: 'Moins',
  more: 'Plus',
  create: 'Créer la partie',
  cancel: 'Annuler',
} as const

/**
 * Rules drawer of a Suspens game
 * @type {Record<string, string>}
 */

export const SUSPENS_RULES_COPY = {
  title: 'Règles de la partie',
  laps: 'Tours de table',
  errors: 'Erreurs permises',
  turnSeconds: 'Temps par tour',
  pickSeconds: 'Temps pour choisir le mot',
  guess: 'Mot entier',
  guessValue: 'Un mot faux compte comme une erreur',
  timeout: 'Tour dépassé',
  timeoutValue: 'Compte comme une erreur',
  scoring: 'Points des devineurs',
  scoringValue: '{cell} par lettre dévoilée, {solve} pour celui qui complète le mot',
  setter: 'Points du meneur',
  setterValue: '{error} par erreur provoquée, {hang} si le bonhomme est pendu',
} as const

/**
 * Chalk letters drifting up the hub
 * @type {Object}
 */

export const SUSPENS_HUB = {
  ground: 'play-suspens',
  letters: ['S', 'U', 'S', 'P', 'E', 'N', 'S', 'A', 'B', 'C', 'T', 'L', 'M', 'R'],
  // Seconds of one rise, and the gap between two letters
  rise: 14,
  gap: 1.2,
} as const

/**
 * Sound files of Suspens, borrowed from Bomb Party
 * @type {Record<string, string>}
 */

export const SUSPENS_SOUNDS = {
  hit: '/play/sons/bomb/mot.mp3',
  miss: '/play/sons/bomb/rate.mp3',
  turn: '/play/sons/bomb/ton-tour.mp3',
  solved: '/play/sons/bomb/vie.mp3',
  hanged: '/play/sons/bomb/rate.mp3',
  over: '/play/sons/bomb/victoire.mp3',
} as const

export type SuspensSoundName = keyof typeof SUSPENS_SOUNDS
