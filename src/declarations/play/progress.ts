import type { IconName } from '@/declarations/ui/icons'
import type { PlayProfileView } from '@/types/play'

/**
 * Rank band of a level
 * @typedef {Object} PlayTier
 * @property {string} label - Band name
 * @property {number} from - First level
 * @property {string} tone - Colour token
 */

export interface PlayTier {
  label: string
  from: number
  tone: string
}

/**
 * Bands of the level ladder, lowest first
 * @type {PlayTier[]}
 */

export const PLAY_TIERS: PlayTier[] = [
  { label: 'Découverte', from: 1, tone: '--play-tier-discovery' },
  { label: 'En progression', from: 10, tone: '--play-tier-progress' },
  { label: 'Maîtrisé', from: 30, tone: '--play-tier-mastered' },
  { label: 'Expert', from: 60, tone: '--play-tier-expert' },
  { label: 'Légendaire', from: 100, tone: '--play-tier-legend' },
]

/**
 * Band of a level and the next one
 * @param {number} level - Level
 * @return {{ tier: PlayTier, next: PlayTier | null }} - Current and next band
 */

export const tierOf = (level: number): { tier: PlayTier; next: PlayTier | null } => {
  const index = PLAY_TIERS.filter((tier) => level >= tier.from).length - 1

  return { tier: PLAY_TIERS[Math.max(0, index)], next: PLAY_TIERS[index + 1] ?? null }
}

// Global counters a trophy can watch
export type TrophyStat =
  | 'played'
  | 'wins'
  | 'draws'
  | 'losses'
  | 'bestStreak'
  | 'tournamentsPlayed'
  | 'tournamentsWon'
  | 'playSeconds'

/**
 * Trophy earned on a global counter
 * @typedef {Object} PlayTrophy
 * @property {string} key - Stable id kept in the database
 * @property {string} label - Name
 * @property {string} goal - What it asks
 * @property {TrophyStat} stat - Counter
 * @property {number} target - Value to reach
 * @property {IconName} icon - Glyph
 */

export interface PlayTrophy {
  key: string
  label: string
  goal: string
  stat: TrophyStat
  target: number
  icon: IconName
}

/**
 * Trophies of Memora Play, each pays the XP of one full level
 * @type {PlayTrophy[]}
 */

export const PLAY_TROPHIES: PlayTrophy[] = [
  {
    key: 'firstSteps',
    label: 'Premier pas',
    goal: 'Jouer une partie',
    stat: 'played',
    target: 1,
    icon: 'play',
  },
  {
    key: 'regular',
    label: 'Habitué',
    goal: 'Jouer 25 parties',
    stat: 'played',
    target: 25,
    icon: 'play',
  },
  {
    key: 'fifty',
    label: 'Joueur assidu',
    goal: 'Jouer 50 parties',
    stat: 'played',
    target: 50,
    icon: 'play',
  },
  {
    key: 'lobbyPillar',
    label: 'Pilier du salon',
    goal: 'Jouer 100 parties',
    stat: 'played',
    target: 100,
    icon: 'play',
  },
  {
    key: 'veteran',
    label: 'Vétéran',
    goal: 'Jouer 250 parties',
    stat: 'played',
    target: 250,
    icon: 'play',
  },
  {
    key: 'addict',
    label: 'Increvable',
    goal: 'Jouer 500 parties',
    stat: 'played',
    target: 500,
    icon: 'play',
  },
  {
    key: 'lifeLong',
    label: 'Légende du salon',
    goal: 'Jouer 1 000 parties',
    stat: 'played',
    target: 1000,
    icon: 'play',
  },
  {
    key: 'firstWin',
    label: 'Première victoire',
    goal: 'Gagner une partie',
    stat: 'wins',
    target: 1,
    icon: 'playStar',
  },
  {
    key: 'tenWins',
    label: 'Sur la lancée',
    goal: 'Gagner 10 parties',
    stat: 'wins',
    target: 10,
    icon: 'playStar',
  },
  {
    key: 'twentyFiveWins',
    label: 'Redoutable',
    goal: 'Gagner 25 parties',
    stat: 'wins',
    target: 25,
    icon: 'playStar',
  },
  {
    key: 'conqueror',
    label: 'Conquérant',
    goal: 'Gagner 50 parties',
    stat: 'wins',
    target: 50,
    icon: 'playStar',
  },
  {
    key: 'hundredWins',
    label: 'Machine à gagner',
    goal: 'Gagner 100 parties',
    stat: 'wins',
    target: 100,
    icon: 'playStar',
  },
  {
    key: 'twoFiftyWins',
    label: 'Dominateur',
    goal: 'Gagner 250 parties',
    stat: 'wins',
    target: 250,
    icon: 'playStar',
  },
  {
    key: 'fiveHundredWins',
    label: 'Invincible',
    goal: 'Gagner 500 parties',
    stat: 'wins',
    target: 500,
    icon: 'playStar',
  },
  {
    key: 'onFire',
    label: 'En feu',
    goal: 'Enchaîner 3 victoires',
    stat: 'bestStreak',
    target: 3,
    icon: 'playFlame',
  },
  {
    key: 'fiveStreak',
    label: 'Sur un nuage',
    goal: 'Enchaîner 5 victoires',
    stat: 'bestStreak',
    target: 5,
    icon: 'playFlame',
  },
  {
    key: 'untouchable',
    label: 'Intouchable',
    goal: 'Enchaîner 7 victoires',
    stat: 'bestStreak',
    target: 7,
    icon: 'playFlame',
  },
  {
    key: 'tenStreak',
    label: 'Inarrêtable',
    goal: 'Enchaîner 10 victoires',
    stat: 'bestStreak',
    target: 10,
    icon: 'playFlame',
  },
  {
    key: 'fifteenStreak',
    label: 'Série légendaire',
    goal: 'Enchaîner 15 victoires',
    stat: 'bestStreak',
    target: 15,
    icon: 'playFlame',
  },
  {
    key: 'firstDraw',
    label: 'Chacun son tour',
    goal: 'Faire une égalité',
    stat: 'draws',
    target: 1,
    icon: 'playHeart',
  },
  {
    key: 'tenDraws',
    label: 'Maître du match nul',
    goal: 'Faire 10 égalités',
    stat: 'draws',
    target: 10,
    icon: 'playHeart',
  },
  {
    key: 'firstLoss',
    label: 'Bon perdant',
    goal: 'Perdre une partie',
    stat: 'losses',
    target: 1,
    icon: 'playPawn',
  },
  {
    key: 'tenLosses',
    label: 'Persévérant',
    goal: 'Perdre 10 parties',
    stat: 'losses',
    target: 10,
    icon: 'playPawn',
  },
  {
    key: 'fiftyLosses',
    label: 'Jamais découragé',
    goal: 'Perdre 50 parties',
    stat: 'losses',
    target: 50,
    icon: 'playPawn',
  },
  {
    key: 'firstTournament',
    label: 'Compétiteur',
    goal: 'Disputer un tournoi',
    stat: 'tournamentsPlayed',
    target: 1,
    icon: 'playBracket',
  },
  {
    key: 'fiveTournaments',
    label: 'Habitué des tournois',
    goal: 'Disputer 5 tournois',
    stat: 'tournamentsPlayed',
    target: 5,
    icon: 'playBracket',
  },
  {
    key: 'twentyTournaments',
    label: 'Pilier des tournois',
    goal: 'Disputer 20 tournois',
    stat: 'tournamentsPlayed',
    target: 20,
    icon: 'playBracket',
  },
  {
    key: 'champion',
    label: 'Champion',
    goal: 'Gagner un tournoi',
    stat: 'tournamentsWon',
    target: 1,
    icon: 'playCrown',
  },
  {
    key: 'threeTitles',
    label: 'Triple champion',
    goal: 'Gagner 3 tournois',
    stat: 'tournamentsWon',
    target: 3,
    icon: 'playCrown',
  },
  {
    key: 'tenTitles',
    label: 'Roi des tournois',
    goal: 'Gagner 10 tournois',
    stat: 'tournamentsWon',
    target: 10,
    icon: 'playTrophy',
  },
  {
    key: 'oneHour',
    label: 'Sans compter les minutes',
    goal: 'Jouer 1 heure',
    stat: 'playSeconds',
    target: 3600,
    icon: 'playClock',
  },
  {
    key: 'fiveHours',
    label: 'Accro',
    goal: 'Jouer 5 heures',
    stat: 'playSeconds',
    target: 18000,
    icon: 'playClock',
  },
  {
    key: 'marathon',
    label: 'Marathonien',
    goal: 'Jouer 10 heures',
    stat: 'playSeconds',
    target: 36000,
    icon: 'playClock',
  },
  {
    key: 'fiftyHours',
    label: 'Nuit blanche',
    goal: 'Jouer 50 heures',
    stat: 'playSeconds',
    target: 180000,
    icon: 'playClock',
  },
  {
    key: 'hundredHours',
    label: 'Résident du salon',
    goal: 'Jouer 100 heures',
    stat: 'playSeconds',
    target: 360000,
    icon: 'playClock',
  },
]

/**
 * Trophies with their progress
 * @param {Record<TrophyStat, number>} global - Global totals
 * @return {object[]} - Trophy, share and reached flag
 */

export const trophiesOf = (global: Record<TrophyStat, number>) =>
  PLAY_TROPHIES.map((trophy) => {
    const value = global[trophy.stat]

    return { ...trophy, share: Math.min(1, value / trophy.target), reached: value >= trophy.target }
  })

/**
 * Trophies still to win, closest first
 * @param {PlayProfileView['global']} global - Global totals
 * @param {number} count - How many
 * @return {object[]} - Closest trophies
 */

export const nextTrophies = (global: PlayProfileView['global'], count: number) =>
  trophiesOf(global)
    .filter((trophy) => !trophy.reached)
    .sort((left, right) => right.share - left.share)
    .slice(0, count)

/**
 * Box announcing the trophies paid back
 * @type {Record<string, string>}
 */

export const PLAY_TROPHY_NOTICE = {
  title: 'Changement sur les trophées',
  text: 'Tes trophées sont désormais payés en XP et en niveaux. Voilà ce que ça te rapporte.',
  xp: 'XP',
  trophy: 'trophée',
  trophies: 'trophées',
  level: 'niveau',
  levels: 'niveaux',
  confirm: 'Super',
} as const
