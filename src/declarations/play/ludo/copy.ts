import type { LudoCornerName } from '@/declarations/play/ludo/board'
import type { LudoEffectName } from '@/declarations/play/ludo/chaos'

/**
 * Copy of the Ludo table
 * @type {Record<string, string>}
 */

export const LUDO_BOARD_COPY = {
  board: 'Plateau de Ludo',
  roll: 'Lancer le dé',
  yourRoll: 'Touche le dé pour le lancer',
  yourMove: 'Touche un pion qui rebondit pour le jouer',
  yourTurn: 'À toi de jouer !',
  turnMine: 'Ton tour',
  homeCount: 'Pions rentrés',
  turnTheirs: 'Son tour',
  eaten: 'Mangé !',
  eating: '{name} a mangé un pion de {victim}',
  theirRoll: '{name} lance le dé',
  theirMove: '{name} choisit un pion',
  home: '{count} / {total} à la maison',
  starting: 'La partie commence',
  sixAgain: 'Six, tu rejoues',
  bonus: 'Tour bonus',
  noMove: 'Aucun pion ne peut bouger',
  penalty: 'Trois six de suite, tour perdu',
  host: 'Hôte',
  left: 'A quitté',
  done: 'Arrivé',
  place: '{place}e',
  firstPlace: '1er',
  pawn: 'Pion {number}',
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
  CAPTURE: 'a *mangé* {victim}',
  EXIT: 'a *sorti* un pion',
  HOME: 'a *terminé* un de ses pions',
  SKIP: 'a *laissé filer* le temps',
  PENALTY: 'a *fait* trois six de suite',
  FINISH: 'a *fini* {place}',
  EFFECT: 'a déclenché *{effect}*',
  JOKER: 'a joué son *Joker* contre {effect}',
} as const

/**
 * Setup drawer of a new Ludo game
 * @type {Record<string, string>}
 */

export const LUDO_SETUP_COPY = {
  title: 'Nouvelle partie de Ludo',
  tabs: 'Réglages de la partie',
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
  safeSquares: {
    label: 'Cases protégées',
    hint: 'Personne ne se fait manger sur une étoile ni sur une case de départ, et une case protégée déjà occupée est fermée aux autres pions.',
  },
  chaos: {
    label: 'Chaos Jubilatoire',
    hint: 'Des cases action cachent des bonus et des malus. Chaque joueur garde un Joker pour éviter un malus.',
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

/**
 * Name and rule of each Chaos effect
 * @type {Record<LudoEffectName, { name: string, text: string }>}
 */

export const LUDO_CHAOS_COPY: Record<LudoEffectName, { name: string; text: string }> = {
  // Bonuses
  ghost: {
    name: 'Pion fantôme',
    text: 'Ton pion se dédouble pendant {turns} tours. Toi seul sais lequel est le vrai.',
  },
  double: {
    name: 'Double lancer',
    text: 'Au prochain tour, tu lances deux dés et tu gardes celui que tu veux.',
  },
  boost: {
    name: 'Accélération',
    text: 'Ton prochain lancer ne peut pas être inférieur à {min}.',
  },
  chameleon: {
    name: 'Caméléon',
    text: 'Pendant {turns} tours, tu prends la couleur d’un autre. Personne ne sait qui est qui.',
  },

  // Maluses
  duel: {
    name: 'Duel de dés',
    text: 'Tout le monde lance un dé. Le plus haut te fait reculer.',
  },
  faulty: {
    name: 'Dé défectueux',
    text: 'Pendant {turns} tours, ton dé reste entre 1 et {max}.',
  },
  stall: {
    name: 'Panne de dé',
    text: 'Tu ne peux pas jouer pendant le prochain tour.',
  },
  blind: {
    name: 'À l’aveuglette',
    text: 'Pendant {turns} tours, tu ne vois plus jusqu’où ton pion ira.',
  },
}

/**
 * Chaos table words: joker, answers and tags
 * @type {Record<string, string>}
 */

export const LUDO_CHAOS_UI = {
  joker: 'Joker',
  jokerCount: 'Jokers',
  offerLead: 'Un malus arrive',
  play: 'Touche la carte pour jouer ton Joker',
  endure: 'Subir le malus',
  saved: 'Malus évité',
  yourDie: 'Ton pion',
  pickLead: 'Choisis ton dé',
  pickDie: 'Garder ce dé',
  stalled: '{name} passe son tour',
  duelWin: '{name} gagne le duel',
  duelRoll: 'Lance ton dé pour le duel',
  duelOthers: 'Les autres lancent leur dé',
  duelTheirs: 'Le duel attend les dés',
  duelDraw: 'Égalité, personne ne recule',
  recoil: '{name} recule de {steps}',
  bonus: 'Bonus',
  malus: 'Malus',
  expired: 'Effet terminé',
  blind: '?',
  theirOffer: '{name} peut jouer son Joker',
  theirPick: '{name} choisit un dé',
} as const
