import { NavalModes, NavalWeapons } from '@/utils/constants/play'
import type { NavalModeName, NavalWeaponName } from '@/utils/constants/play'

/**
 * Hub ground of the naval battle
 * @type {Record<string, string>}
 */

export const NAVAL_SEA = {
  ground: 'play-sea',
  photo: '/play/naval/mer-crepuscule.jpg',
} as const

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
  mine: 'Ton plateau',
  placeTitle: 'Place ta flotte',
  placeHelp: 'Glisse un navire sur la mer. Touche-le pour le tourner.',
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
  theirTurn: 'Tour de {name}',
  starting: 'La bataille commence',
  pickSquare: 'Touche une case de la mer ennemie',
  pickFoe: 'Choisis ta cible',
  aimAt: 'Cible {square}',
  fire: 'Feu',
  incoming: 'Tir en approche',
  miss: 'Dans l’eau',
  spotted: 'Navire repéré',
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
  statStrikes: 'Tirs',
  statAccuracy: 'Précision',
  statSunk: 'Navires coulés',
  statBest: 'Arme la plus efficace',
  statNone: 'Aucune',
  finalSea: 'Ta mer en fin de partie',
  fleets: 'Les flottes en fin de partie',
  tapToSeeFleet: 'Voir la flotte',
  you: 'Toi',
  bye: 'Qualifié d’office',
  seconds: '{seconds} s',
  turnHint: 'Touche pour tourner',
  aimFirst: 'Vise une case',
  map: 'Carte de la mer',
  turnWeapon: 'Tourner l’arme',
  dragHelp: 'Glisse tes navires sur la mer, touche-les pour les tourner.',
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
  map: 'Carte',
  turn: 'Temps de tir',
  placement: 'Temps de placement',
  on: 'Oui',
  off: 'Non',
} as const

/**
 * Name of each weapon
 * @type {Record<NavalWeaponName, string>}
 */

export const NAVAL_WEAPON_COPY: Record<NavalWeaponName, { label: string; note: string }> = {
  [NavalWeapons.Cannon]: { label: 'Canon', note: 'Une case, toujours là' },
  [NavalWeapons.Airstrike]: { label: 'Frappe aérienne', note: 'Une ligne de cases' },
  [NavalWeapons.Broadside]: { label: 'Bordée', note: 'Une croix de cases' },
  [NavalWeapons.Flare]: { label: 'Obus éclairant', note: 'Révèle une zone sans toucher' },
  [NavalWeapons.Torpedo]: { label: 'Sous-marin', note: 'Six torpilles en ligne' },
  [NavalWeapons.Gunship]: { label: 'Hélico de combat', note: 'Balaie toute une ligne' },
  [NavalWeapons.Pair]: { label: 'Tir double', note: 'Deux cases côte à côte' },
  [NavalWeapons.Volley]: { label: 'Salve', note: 'Trois cases en ligne' },
  [NavalWeapons.Grenade]: { label: 'Grenade', note: 'Une case et ses quatre voisines' },
}

/**
 * Display settings
 * @type {Record<string, string>}
 */

export const NAVAL_PREFS_COPY = {
  autoZoom: 'Zoom automatique',
  autoZoomHint:
    'La caméra se rapproche de la zone touchée puis recule. Coupe-le pour garder la vue fixe.',
} as const
