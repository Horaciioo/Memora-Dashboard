import type { LudoCornerName } from '@/declarations/play/ludo/board'

/**
 * Copy of the Ludo table
 * @type {Record<string, string>}
 */

export const LUDO_BOARD_COPY = {
  board: 'Plateau de Ludo',
  roll: 'Lancer le dé',
  yourRoll: 'À toi, lance le dé',
  yourMove: 'Choisis un pion',
  theirRoll: '{name} lance le dé',
  theirMove: '{name} choisit un pion',
  starting: 'La partie commence',
  sixAgain: 'Six, tu rejoues',
  bonus: 'Tour bonus',
  noMove: 'Aucun pion ne peut bouger',
  penalty: 'Trois six de suite, tour perdu',
  spectating: 'Tu regardes la partie.',
  host: 'Hôte',
  left: 'A quitté',
  done: 'Arrivé',
  place: '{place}e',
  firstPlace: '1er',
  pawn: 'Pion {number}',
  home: '{count} / {total} à la maison',
  seconds: '{seconds} s',
  winner: 'Victoire',
} as const

/**
 * Name of each colour
 * @type {Record<LudoCornerName, string>}
 */

export const LUDO_CORNER_COPY: Record<LudoCornerName, string> = {
  blue: 'Bleu',
  red: 'Rouge',
  green: 'Vert',
  yellow: 'Jaune',
}

/**
 * Feed lines of a Ludo game
 * @type {Record<string, string>}
 */

export const LUDO_FEED_COPY = {
  CAPTURE: 'a mangé un pion {colour}',
  HOME: 'a ramené un pion à la maison',
  SKIP: 'a laissé filer le temps',
  PENALTY: 'a fait trois six de suite',
  FINISH: 'a fini {place}',
} as const

/**
 * Setup drawer of a new Ludo game
 * @type {Record<string, string>}
 */

export const LUDO_SETUP_COPY = {
  title: 'Nouvelle partie de Ludo',
  tabs: 'Réglages de la partie',
  tabGame: 'Partie',
  tabRules: 'Règles',
  pawns: 'Pions par joueur',
  pawnsHint: 'Moins de pions, une partie plus courte.',
  turn: 'Temps par tour',
  turnHint: 'Le dé se lance et le meilleur pion avance tout seul quand le temps est écoulé.',
  exit: 'Sortir un pion',
  exitHint: 'Les faces du dé qui font sortir un pion de sa base.',
  six: 'Sur un 6',
  oneOrSix: 'Sur un 1 ou un 6',
  fiveOrSix: 'Sur un 5 ou un 6',
  ending: 'Fin de partie',
  first: 'Au premier arrivé',
  firstNote: 'Les autres sont classés par avancée',
  podium: 'Jusqu’au podium',
  podiumNote: 'On joue jusqu’à la dernière place',
  seconds: '{seconds} s',
  less: 'Moins',
  more: 'Plus',
  create: 'Créer la partie',
  cancel: 'Annuler',
} as const

/**
 * Name and hint of each house rule
 * @type {Record<string, { label: string, hint: string }>}
 */

export const LUDO_RULE_COPY = {
  sixReplay: { label: 'Rejouer sur un 6', hint: 'Un 6 donne un lancer de plus.' },
  threeSixes: {
    label: 'Trois 6 de suite',
    hint: 'Le troisième 6 d’affilée fait perdre le tour.',
  },
  captureReplay: {
    label: 'Rejouer après une prise',
    hint: 'Manger un pion adverse donne un lancer de plus.',
  },
  homeReplay: {
    label: 'Rejouer à l’arrivée',
    hint: 'Ramener un pion à la maison donne un lancer de plus.',
  },
  forcedCapture: {
    label: 'Prise obligatoire',
    hint: 'Si un pion peut en manger un autre, il doit le faire.',
  },
  barriers: {
    label: 'Barrières',
    hint: 'Deux pions de la même couleur sur une case forment un mur infranchissable.',
  },
  safeSquares: {
    label: 'Cases protégées',
    hint: 'Personne ne se fait manger sur une étoile ni sur une case de départ.',
  },
  exactFinish: {
    label: 'Arrivée exacte',
    hint: 'Il faut le nombre juste pour entrer à la maison.',
  },
} as const

/**
 * Rules drawer of a Ludo game
 * @type {Record<string, string>}
 */

export const LUDO_RULES_COPY = {
  title: 'Règles de la partie',
  pawns: 'Pions par joueur',
  turn: 'Temps par tour',
  exit: 'Sortir un pion',
  ending: 'Fin de partie',
  on: 'Oui',
  off: 'Non',
} as const

/**
 * Hub ground of the Ludo game
 * @type {Object}
 */

export const LUDO_FELT = {
  ground: 'play-ludo',
  // Little companions peeking in from an edge, place along it in percent
  peekers: [
    { edge: 'left', at: 22, size: 1.3, colour: 'blue', delay: 0 },
    { edge: 'bottom', at: 18, size: 1.5, colour: 'green', delay: 3.5 },
    { edge: 'right', at: 38, size: 1.2, colour: 'red', delay: 7 },
    { edge: 'bottom', at: 72, size: 1.4, colour: 'yellow', delay: 10.5 },
    { edge: 'left', at: 64, size: 1.2, colour: 'red', delay: 14 },
    { edge: 'right', at: 76, size: 1.4, colour: 'green', delay: 17.5 },
  ],
  // Seconds of one peek, out and back
  cycle: 21,
  // Mark popping over a surprised pawn
  surprise: '!',
  // Seconds of one hop
  hop: 0.55,
} as const

/**
 * Place in words
 * @param {number} place - Place
 * @return {string} - First, second...
 */

export const ludoPlaceLabel = (place: number): string =>
  place === 1 ? LUDO_BOARD_COPY.firstPlace : LUDO_BOARD_COPY.place.replace('{place}', String(place))
