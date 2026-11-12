/**
 * Pens of the drawer, a token each, the paper first
 * @type {{ key: string, label: string, token: string }[]}
 */

export const CROQUIS_COLORS = [
  { key: 'paper', label: 'Gomme', token: '--croquis-paper' },
  { key: 'black', label: 'Noir', token: '--croquis-black' },
  { key: 'red', label: 'Rouge', token: '--croquis-red' },
  { key: 'orange', label: 'Orange', token: '--croquis-orange' },
  { key: 'yellow', label: 'Jaune', token: '--croquis-yellow' },
  { key: 'green', label: 'Vert', token: '--croquis-green' },
  { key: 'blue', label: 'Bleu', token: '--croquis-blue' },
  { key: 'purple', label: 'Violet', token: '--croquis-purple' },
  { key: 'brown', label: 'Marron', token: '--croquis-brown' },
] as const

// Place of the paper colour, the eraser draws with it
export const CROQUIS_PAPER = 0

// First pen of a new drawer
export const CROQUIS_FIRST_PEN = 1

/**
 * Nib sizes in drawing units, the eraser uses the same scale
 * @type {readonly number[]}
 */

export const CROQUIS_SIZES = [5, 11, 22] as const

/**
 * Copy of the Croquis table
 * @type {Record<string, string>}
 */

export const CROQUIS_BOARD_COPY = {
  round: 'Manche {round} sur {total}',
  drawing: '{name} dessine',
  youDraw: 'À toi de dessiner',
  wordIs: 'Ton mot',
  guessLead: 'Devine ce que {name} dessine',
  placeholder: 'Ton idée',
  submit: 'Proposer',
  found: 'Trouvé !',
  foundBy: '{name} a trouvé',
  foundIn: 'en {seconds} s',
  points: '+{points}',
  nobody: 'Temps écoulé, personne n’a trouvé',
  itWas: 'C’était',
  drawerGain: '{name} gagne {points} pts pour son dessin',
  score: '{score} pts',
  ranking: 'Classement',
  watching: 'Tu regardes la partie',
  blank: 'Le dessin arrive',
  toolPen: 'Crayon',
  toolEraser: 'Gomme',
  sizes: 'Épaisseur',
  undo: 'Annuler',
  clear: 'Tout effacer',
  palette: 'Couleurs',
  drawer: 'Dessinateur',
  done: 'Trouvé',
} as const

/**
 * Names of the difficulty levels
 * @type {Record<string, string>}
 */

export const CROQUIS_LEVEL_LABELS = {
  EASY: 'Facile',
  MEDIUM: 'Moyen',
  HARD: 'Difficile',
} as const

/**
 * Feed lines of a Croquis game
 * @type {Record<string, string>}
 */

export const CROQUIS_FEED_COPY = {
  FOUND: 'a trouvé le mot en {seconds} s, +{points}',
  DRAWN: 'a fait deviner « {word} » à {count}, +{points}',
  MISSED: 'n’a fait deviner « {word} » à personne',
} as const

/**
 * Setup drawer of a new Croquis game
 * @type {Record<string, string>}
 */

export const CROQUIS_SETUP_COPY = {
  title: 'Nouvelle partie de Croquis',
  tabs: 'Réglages de la partie',
  tabWords: 'Mots',
  count: '{count} tours',
  difficulty: 'Difficulté',
  difficultyHint:
    'Facile : des objets et des animaux. Moyen : des scènes et des métiers. Difficile : des idées à suggérer.',
  roundSeconds: 'Temps pour dessiner',
  roundSecondsHint: 'Plus le mot est trouvé vite, plus il rapporte.',
  seconds: '{seconds} s',
  hint: 'Indice',
  hintHint: 'La première lettre apparaît à la moitié du temps.',
  hintOn: 'Avec indice',
  hintOff: 'Sans indice',
  less: 'Moins',
  more: 'Plus',
  create: 'Créer la partie',
  cancel: 'Annuler',
} as const

/**
 * Rules drawer of a Croquis game
 * @type {Record<string, string>}
 */

export const CROQUIS_RULES_COPY = {
  title: 'Règles de la partie',
  laps: 'Tours de table',
  difficulty: 'Difficulté',
  roundSeconds: 'Temps pour dessiner',
  hint: 'Indice',
  scoring: 'Points pour trouver',
  scoringValue: '{base} de base, jusqu’à {speed} de rapidité, {first} pour le premier',
  drawer: 'Points du dessinateur',
  drawerValue: '{each} par joueur qui trouve, {all} si tout le monde trouve',
} as const

/**
 * Pencils drifting up the hub
 * @type {Object}
 */

export const CROQUIS_HUB = {
  ground: 'play-croquis',
  // Scribbles floating, by index of a color
  floaters: [2, 3, 4, 5, 6, 7, 2, 4, 6, 3],
  rise: 15,
  gap: 1.5,
} as const

/**
 * Sound files of Croquis, borrowed from Bomb Party
 * @type {Record<string, string>}
 */

export const CROQUIS_SOUNDS = {
  found: '/play/sons/bomb/mot.mp3',
  mine: '/play/sons/bomb/vie.mp3',
  missed: '/play/sons/bomb/rate.mp3',
  hint: '/play/sons/bomb/ton-tour.mp3',
  over: '/play/sons/bomb/victoire.mp3',
} as const

export type CroquisSoundName = keyof typeof CROQUIS_SOUNDS

/**
 * Feel of the pen on the paper
 * @type {Object}
 */

export const CROQUIS_PEN = {
  // Pixels per drawing unit, for a sharp line
  scale: 2,
  // Gap under which a new point is not worth keeping, in drawing units
  minStep: 3,
  // Gap between two sends of the stroke being drawn, in ms
  sendGapMs: 140,
} as const
