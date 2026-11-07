import { NavalModes } from '@/utils/constants/play'
import type { NavalModeName } from '@/utils/constants/play'

/**
 * Hub ground of the naval battle
 * @type {Record<string, string>}
 */

export const NAVAL_SEA = {
  ground: 'play-sea',
} as const

// Column letters, as many as the largest sea
export const NAVAL_COLUMNS = 'ABCDEFGHIJKL'

/**
 * Name of each mode
 * @type {Record<NavalModeName, { title: string; note: string }>}
 */

export const NAVAL_MODE_COPY: Record<NavalModeName, { title: string; note: string }> = {
  [NavalModes.Duel]: { title: 'Duel', note: 'Deux capitaines, une flotte à couler.' },
  [NavalModes.Bracket]: {
    title: 'Tournoi',
    note: 'De 2 à 8 capitaines, des duels jusqu’à la finale. Le vainqueur gagne trois fois plus d’XP.',
  },
  [NavalModes.Melee]: {
    title: 'Chacun pour soi',
    note: 'De 3 à 8 capitaines, tout le monde tire sur tout le monde. Le vainqueur gagne deux fois plus d’XP.',
  },
}

/**
 * Ship names by length
 * @type {Record<number, string>}
 */

export const NAVAL_SHIP_NAMES: Record<number, string> = {
  1: 'Vedette',
  2: 'Torpilleur',
  3: 'Croiseur',
  4: 'Cuirassé',
  5: 'Porte-avions',
}

/**
 * Words of the table
 * @type {Record<string, string>}
 */

export const NAVAL_BOARD_COPY = {
  seaOf: 'Mer de {name}',
  yourSea: 'Ta flotte',
  placeTitle: 'Place ta flotte',
  placeHelp: 'Touche un navire, puis la mer. Touche un navire posé pour le reprendre.',
  placeLeft: '{count} à poser',
  placeCount: 'Flotte complète',
  rotate: 'Pivoter',
  random: 'Au hasard',
  clear: 'Tout reprendre',
  validate: 'Prête',
  edit: 'Modifier',
  waitOthers: 'En attente des autres capitaines',
  waitCount: '{count} sur {total} prêts',
  yourTurn: 'À toi de tirer',
  yourTurnAgain: 'Touché, tu rejoues',
  theirTurn: '{name} prend la mer en visée',
  starting: 'La bataille commence',
  pickSquare: 'Touche une case de la mer ennemie',
  pickFoe: 'Choisis ta cible',
  aimAt: 'Cible {square}',
  fire: 'Feu',
  incoming: 'Tir en approche',
  miss: 'Dans l’eau',
  hit: 'Touché',
  sunk: '{ship} coulé',
  youSunk: 'Ton {ship} est coulé',
  eliminated: 'Éliminé',
  youEliminated: 'Ta flotte est au fond',
  spectating: 'Tu regardes la bataille',
  waitingRound: 'Tu attends la fin du tour',
  yourMatch: 'Ton match',
  forfeit: 'Forfait',
  left: 'A quitté',
  shipsLeft: '{count} à flot',
  victory: 'Victoire',
  defeat: 'Défaite',
  wonBy: '{name} gagne la bataille',
  slow: 'Connexion lente, on rejoue le dernier tir',
  place: '{place}e',
  firstPlace: '1er',
  sunkNote: '{count} navires coulés',
  fleets: 'Les flottes en fin de partie',
  tapToSeeFleet: 'Voir la flotte',
  you: 'Toi',
  bye: 'Qualifié d’office',
  seconds: '{seconds} s',
  soundEffects: 'Effets sonores',
  soundAmbience: 'Ambiance et tension',
  fireKey: 'Tirer sur {square}',
  tapToAim: 'Touche une case, puis Feu',
  wreck: 'Épave',
  captainOut: '{name} est éliminé',
  standings: 'Classement',
  shotLine: '{shooter} {line}',
} as const

/**
 * Round names of a bracket
 * @type {Record<string, string>}
 */

export const NAVAL_ROUND_COPY = {
  final: 'Finale',
  semi: 'Demi-finale',
  quarter: 'Quart de finale',
  round: 'Tour {number}',
  bracket: 'Tableau',
  waiting: 'À venir',
  live: 'En cours',
  done: 'Terminé',
} as const

/**
 * Feed lines of a table
 * @type {Record<string, string>}
 */

export const NAVAL_FEED_COPY = {
  MISS: 'a *tiré* dans l’eau en {square}',
  HIT: 'a *touché* {victim} en {square}',
  SUNK: 'a *coulé* un navire de {victim} en {square}',
  OUT: 'a *éliminé* {victim}',
} as const

/**
 * Setup drawer of a new game
 * @type {Record<string, string>}
 */

export const NAVAL_SETUP_COPY = {
  title: 'Nouvelle bataille navale',
  tabs: 'Réglages de la partie',
  create: 'Ouvrir la partie',
  save: 'Enregistrer',
  cancel: 'Annuler',
  tabGame: 'Partie',
  tabRules: 'Règles',
  less: 'Moins',
  more: 'Plus',
  mode: 'Mode',
  format: 'Mer',
  compact: 'Compacte 8 x 8',
  classic: 'Classique 10 x 10',
  turn: 'Temps de tir',
  turnHint: 'Au bout du temps, un tir au hasard part à ta place.',
  placement: 'Temps de placement',
  placementHint: 'Les flottes incomplètes sont terminées au hasard.',
  seconds: '{seconds} s',
} as const

/**
 * House rules, label and hint
 * @type {Record<string, { label: string; hint: string }>}
 */

export const NAVAL_RULE_COPY = {
  hitReplay: {
    label: 'Touché, on rejoue',
    hint: 'Un tir qui touche un navire donne un tir de plus.',
  },
  spacedShips: {
    label: 'Navires espacés',
    hint: 'Deux navires ne peuvent pas se toucher, même par un coin.',
  },
} as const

/**
 * Read only rules window
 * @type {Record<string, string>}
 */

export const NAVAL_RULES_COPY = {
  title: 'Règles de la partie',
  mode: 'Mode',
  format: 'Mer',
  turn: 'Temps de tir',
  placement: 'Temps de placement',
  on: 'Oui',
  off: 'Non',
} as const
