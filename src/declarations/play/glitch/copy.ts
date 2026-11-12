/**
 * Copy of the Glitch table
 * @type {Record<string, string>}
 */

export const GLITCH_BOARD_COPY = {
  round: 'Manche {round} sur {total}',
  lead: 'Trouve ce qui change entre les deux images, clique dessus',
  left: 'Modèle',
  right: 'Copie',
  progress: '{found} sur {total}',
  locked: 'Raté, patiente un instant',
  waiting: 'Tout est trouvé, les autres cherchent encore',
  watching: 'Tu regardes la partie',
  score: '{score} pts',
  points: '+{points}',
  ranking: 'Classement',
  done: 'Tout trouvé',
  first: 'Premier',
  allFound: 'Tu as tout trouvé en {seconds} s',
  someFound: 'Tu en as trouvé {found} sur {total}',
  noneFound: 'Tu n’as rien trouvé cette fois',
  nobody: 'Personne n’a tout trouvé',
  missed: 'Les différences manquées sont cerclées',
  rank: 'Place {rank}',
  rounds: '{count} manches',
} as const

/**
 * Feed lines of a Glitch game
 * @type {Record<string, string>}
 */

export const GLITCH_FEED_COPY = {
  DONE: 'a trouvé les {total} différences en {seconds} s, +{points}',
} as const

/**
 * Setup drawer of a new Glitch game
 * @type {Record<string, string>}
 */

export const GLITCH_SETUP_COPY = {
  title: 'Nouvelle partie de Glitch',
  tabs: 'Réglages de la partie',
  tabRounds: 'Manches',
  tabSpeed: 'Rythme',
  rounds: 'Nombre de manches',
  roundsHint: 'Une paire d’images par manche, avec un décor différent.',
  differences: 'Différences par image',
  differencesHint: 'Plus il y en a, plus il faut chercher.',
  roundSeconds: 'Temps par manche',
  roundSecondsHint: 'Le temps de tout repérer, la rapidité rapporte des points.',
  seconds: '{seconds} s',
  count: '{count} manches',
  differenceCount: '{count} différences',
  less: 'Moins',
  more: 'Plus',
  create: 'Créer la partie',
  cancel: 'Annuler',
} as const

/**
 * Rules drawer of a Glitch game
 * @type {Record<string, string>}
 */

export const GLITCH_RULES_COPY = {
  title: 'Règles de la partie',
  rounds: 'Manches',
  differences: 'Différences par image',
  roundSeconds: 'Temps par manche',
  scoring: 'Points',
  scoringValue: '{find} par différence, {first} pour finir premier, jusqu’à {speed} de rapidité',
  lock: 'Faux clic',
  lockValue: 'L’image se fige {seconds} s',
} as const

/**
 * Shapes and figures rising up the hub like bubbles
 * @type {Object}
 */

export const GLITCH_HUB = {
  ground: 'play-glitch',
  floaters: [
    '7',
    'star',
    'A',
    'hexagon',
    '42',
    'heart',
    'Z',
    'triangle',
    '3',
    'diamond',
    'K',
    'arrow',
  ],
  rise: 14,
  gap: 1.2,
} as const

/**
 * Sound files of Glitch, borrowed from Bomb Party
 * @type {Record<string, string>}
 */

export const GLITCH_SOUNDS = {
  found: '/play/sons/bomb/mot.mp3',
  mine: '/play/sons/bomb/vie.mp3',
  missed: '/play/sons/bomb/rate.mp3',
  over: '/play/sons/bomb/victoire.mp3',
} as const

export type GlitchSoundName = keyof typeof GLITCH_SOUNDS
