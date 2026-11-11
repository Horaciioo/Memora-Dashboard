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
  par: 'Par',
  parOf: 'Par {par}',
  // Name of a score against par
  parNames: {
    ace: 'Trou en un',
    albatross: 'Albatros',
    eagle: 'Eagle',
    birdie: 'Birdie',
    par: 'Par',
    bogey: 'Bogey',
    double: 'Double bogey',
    over: 'Au-dessus du par',
  },
  strokes: 'Coups',
  stroke: 'Coup',
  victory: 'Victoire',
  // Words floating over the cup, one picked per ball
  cupCheers: [
    '🏆 DANS LE MILLE !',
    '🏆 C’EST DANS LE TROU',
    '🏆 UNE VICTOIRE POUR {user} !',
    '🏆 UNE VISÉE PAR-FAITE',
  ],
  holedStatus: 'Dans le trou en {count} coups.',
  holedPar: '{name} ! Dans le trou en {count} coups, {par}.',
  cueGained: 'Nouveau pouvoir',
  cueUsed: 'Pouvoir lancé',
  cueEnded: 'Effet terminé',
  feedTitle: 'Journal',
  feedHole: '[Trou {hole}]',
  showPlayers: 'Voir les joueurs',
  switchOff: 'Non',
  switchOn: 'Oui',
  ranking: 'Classement',
  closeStats: 'Fermer',
  fullscreen: 'Plein écran',
  windowed: 'Quitter le plein écran',
  showChat: 'Afficher le chat',
  hideChat: 'Masquer le chat',
  collapse: 'Réduire la carte',
  expand: 'Déplier la carte',
  holeColumn: 'Trou',
  strokesLeft: '{count} restants',
  clock: 'Temps',
  power: 'Pouvoir',
  noPower: 'Aucun',
  handFull: 'Main pleine',
  use: 'Utiliser',
  place: 'Touche le parcours pour poser {power}',
  cancel: 'Annuler',
  onYou: 'Sur toi',
  armedRest: "Armé, agit à l'arrêt",
  armedHole: 'Agit au prochain trou',
  // Active column: states and tooltip
  activeArmed: "À l'arrêt",
  activeQueued: 'Prochain trou',
  activeBy: '{power}, lancé par {name}',
  activeMap: 'Sur le parcours',
  outOfStrokes: 'Plus de coups pour ce trou',
  waiting: 'Les autres finissent le trou.',
  spectating: 'Tu regardes la partie.',
  watchPrevious: 'Joueur précédent',
  watchNext: 'Joueur suivant',
  watchFollow: 'Suivre {name}',
  watchPlayer: 'Vue joueur',
  watchFree: 'Vue libre',
  flyRise: 'Monter',
  // Free flight over a whole map, from the hub
  flyOpen: 'Voler librement dans les maps',
  flyMap: 'Map',
  flyClose: 'Fermer',
  flyHint:
    'ZQSD ou flèches pour avancer, glisser pour regarder, Espace monte, Maj descend, molette pour la vitesse',
  flySink: 'Descendre',
  // Ground spot under the screen centre, admins only
  probe: 'x {x} · z {z}',
  overview: 'Vue d’ensemble',
  follow: 'Suivre ma balle',
  soundOn: 'Couper le son',
  soundOff: 'Remettre le son',
  sound: 'Son',
  volume: 'Volume',
  settings: 'Paramètres',
  trails: 'Sillage des balles',
  mist: 'Brume',
  specks: 'Particules',
  light: 'Mode léger',
  scorecard: 'Carte de score',
  total: 'Total',
  player: 'Joueur',
  pending: '-',
  nextHole: 'Trou suivant dans {seconds} s',
  results: 'Résultats dans {seconds} s',
  power3d: 'Puissance',
  strokesCount: '{count} coups',
} as const

/**
 * Feed lines of a golf game
 * @type {Record<string, string>}
 */

export const GOLF_FEED_COPY = {
  HOLED: 'a rentré sa balle en {count} coups',
  ACE: 'a fait un trou en un',
  POWER: 'a joué {power}',
  TELEPORT: 's’est téléporté',
  FALL: 'est tombé dans le vide',
} as const

/**
 * Setup drawer of a new golf game
 * @type {Record<string, string>}
 */

export const GOLF_SETUP_COPY = {
  title: 'Nouvelle partie de Golf',
  tabs: 'Réglages de la partie',
  tabGame: 'Partie',
  tabPowers: 'Pouvoirs',
  tabRules: 'Règles',
  mode: 'Format',
  modeCasual: 'Casual',
  modeTournament: 'Tournoi',
  modeChaos: 'Chaos jubilatoire',
  mapsCount: '{count} parcours',
  random: 'Aléatoire',
  randomHint: 'Un parcours tiré au hasard à chaque lancement, revanche comprise.',
  holes: 'Nombre de trous',
  holesHint: 'En Tournoi, chaque parcours compte six trous.',
  holeSeconds: 'Temps par trou',
  holeSecondsHint:
    'Quand le temps est écoulé, ceux qui n’ont pas fini prennent le maximum de coups.',
  maxStrokes: 'Coups au maximum par trou',
  maxStrokesHint: 'Sans rentrer la balle, le trou compte ce maximum plus {penalty}.',
  limited: 'Limités',
  unlimited: 'Illimités',
  unlimitedHint: 'Tire autant de coups que tu veux, seul le temps arrête le trou.',
  collisions: 'Collisions entre balles',
  collisionsHint: 'Les balles se percutent et se poussent.',
  on: 'Activées',
  off: 'Désactivées',
  powers: 'Pouvoirs',
  powersHint: 'Chaque orbe ramassée donne un de ces pouvoirs. Décoche tout pour jouer sans.',
  needsCollisions: 'Sans collisions, ce pouvoir n’a aucun effet : il ne sort pas des orbes.',
  powersCount: '{count} / {total}',
  seconds: '{seconds} s',
  holesCount: '{count} trous',
  strokes: '{count} coups',
  less: 'Moins',
  more: 'Plus',
  all: 'Tout cocher',
  none: 'Tout décocher',
  allKind: 'Tous les {kind}',
  noneKind: 'Aucun {kind}',
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
  mode: 'Format',
  course: 'Parcours',
  holes: 'Trous',
  holeSeconds: 'Temps par trou',
  maxStrokes: 'Coups au maximum',
  collisions: 'Collisions',
  powers: 'Pouvoirs',
  noPowers: 'Aucun',
} as const
