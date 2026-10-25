/**
 * Ground of the golf hub
 * @type {Object}
 */

export const GOLF_TURF = {
  ground: 'play-turf',
} as const

/**
 * Copy of the golf course screen
 * @type {Record<string, string>}
 */

export const GOLF_BOARD_COPY = {
  hole: 'Trou {index}',
  holeOf: 'Trou {index} sur {total}',
  par: 'Par {par}',
  strokes: 'Coups',
  strokesLeft: '{count} restants',
  clock: 'Temps',
  power: 'Pouvoir',
  noPower: 'Aucun',
  use: 'Utiliser',
  place: 'Touche le parcours pour poser {power}',
  cancel: 'Annuler',
  bonus: 'Bonus',
  malus: 'Malus',
  onYou: 'Sur toi',
  outOfStrokes: 'Plus de coups pour ce trou',
  waiting: 'Les autres finissent le trou.',
  spectating: 'Tu regardes la partie.',
  overview: 'Vue d’ensemble',
  follow: 'Suivre ma balle',
  soundOn: 'Couper le son',
  soundOff: 'Remettre le son',
  scorecard: 'Carte de score',
  total: 'Total',
  player: 'Joueur',
  parRow: 'Par',
  pending: '-',
  nextHole: 'Trou suivant dans {seconds} s',
  results: 'Résultats dans {seconds} s',
  power3d: 'Puissance',
  strokesCount: '{count} coups',
  loading: 'Le parcours se prépare.',
} as const

/**
 * Name of a hole score against par
 * @type {Record<string, string>}
 */

export const GOLF_SCORE_NAMES: Record<string, string> = {
  ace: 'Trou en un',
  '-3': 'Albatros',
  '-2': 'Eagle',
  '-1': 'Birdie',
  '0': 'Par',
  '1': 'Bogey',
  '2': 'Double bogey',
  worse: '+{count}',
}

/**
 * Feed lines of a golf game
 * @type {Record<string, string>}
 */

export const GOLF_FEED_COPY = {
  HOLED: 'a rentré sa balle en {count} coups',
  ACE: 'a fait un trou en un',
  POWER: 'a joué {power}',
  FALL: 'est tombé dans le vide',
} as const

/**
 * Setup drawer of a new golf game
 * @type {Record<string, string>}
 */

export const GOLF_SETUP_COPY = {
  title: 'Nouvelle partie de Golf',
  tabs: 'Réglages de la partie',
  tabCourse: 'Parcours',
  tabRules: 'Règles',
  tabPowers: 'Pouvoirs',
  course: 'Parcours',
  random: 'Aléatoire',
  randomHint: 'Un parcours tiré au hasard à chaque lancement, revanche comprise.',
  holes: 'Nombre de trous',
  holeSeconds: 'Temps par trou',
  holeSecondsHint:
    'Quand le temps est écoulé, ceux qui n’ont pas fini prennent le maximum de coups.',
  maxStrokes: 'Coups au maximum par trou',
  maxStrokesHint: 'Sans rentrer la balle, le trou compte ce maximum plus {penalty}.',
  collisions: 'Collisions entre balles',
  collisionsHint: 'Les balles se percutent et se poussent.',
  on: 'Activées',
  off: 'Désactivées',
  powers: 'Pouvoirs des orbes',
  powersHint: 'Les orbes du parcours donnent un de ces pouvoirs. Décoche tout pour jouer sans.',
  powersCount: '{count} / {total}',
  seconds: '{seconds} s',
  holesCount: '{count} trous',
  strokes: '{count} coups',
  less: 'Moins',
  more: 'Plus',
  all: 'Tout cocher',
  none: 'Tout décocher',
  create: 'Créer la partie',
  cancel: 'Annuler',
} as const

/**
 * Rules drawer of a golf game
 * @type {Record<string, string>}
 */

export const GOLF_RULES_COPY = {
  title: 'Règles de la partie',
  victory: 'Victoire',
  victoryValue: 'Le moins de coups sur l’ensemble des trous',
  drawn: '{random}, {course}',
  course: 'Parcours',
  holes: 'Trous',
  holeSeconds: 'Temps par trou',
  maxStrokes: 'Coups au maximum',
  collisions: 'Collisions',
  powers: 'Pouvoirs',
  noPowers: 'Aucun',
} as const
