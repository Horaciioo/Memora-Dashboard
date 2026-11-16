/**
 * Copy of the end of game page
 * @type {Record<string, string>}
 */

export const PLAY_END_COPY = {
  title: 'Fin de partie',
  podium: 'Podium',
  stats: 'Statistiques',
  duration: 'Durée',
  players: 'Joueurs',
  bots: 'Bots',
  youFinish: 'Tu finis',
  ofTotal: 'sur {total}',
  first: '1er',
  nth: '{place}e',
  levelUp: 'Niveau {level} !',
  tableTitle: 'La table',
  awardsTitle: 'Distinctions',
  careerTitle: 'Ta carrière ici',
  wins: 'Victoires',
  played: 'Parties',
  winRate: 'Taux de victoire',
  streak: 'Série en cours',
  bestStreak: 'Meilleure série',
  percent: '{value} %',
  announce: 'remporte la partie',
  itsYou: "C'est toi",
  over: 'Terminé',
  margin: 'Écart du podium',
  top: 'Meilleur score',
  xpTable: 'XP distribuée',
  xpValue: '{xp} XP',
  clock: '{minutes} min {seconds} s',
} as const

/**
 * Sizes of the end page
 * @type {Record<string, number>}
 */

export const PLAY_END_LIMITS = {
  // Titles shown, the game's best counters first
  awards: 3,
} as const

// Wait before the page builds, the time of the announcement
const INTRO_MS = 2600

/**
 * Build-up of the end page, in milliseconds after the game ends
 * @type {Record<string, number>}
 */

export const PLAY_END_TIMING = {
  intro: INTRO_MS,
  // Third place rises first, the winner last
  third: INTRO_MS + 100,
  second: INTRO_MS + 550,
  first: INTRO_MS + 1100,
  // Cards of the side columns, one after the other
  card: INTRO_MS + 400,
  cardStep: 260,
  // Ranks 4 and after, then the buttons
  rest: INTRO_MS + 1700,
  actions: INTRO_MS + 2000,
  // Confetti falls once the winner stands
  confetti: INTRO_MS + 1600,
  // Count of the XP and fill of its bars
  count: INTRO_MS + 900,
} as const
