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
  { label: 'Bronze', from: 1, tone: '--play-tier-bronze' },
  { label: 'Argent', from: 10, tone: '--play-tier-silver' },
  { label: 'Or', from: 25, tone: '--play-tier-gold' },
  { label: 'Platine', from: 45, tone: '--play-tier-platinum' },
  { label: 'Diamant', from: 70, tone: '--play-tier-diamond' },
  { label: 'Légende', from: 100, tone: '--play-tier-legend' },
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
type TrophyStat = 'played' | 'wins' | 'bestStreak' | 'tournamentsWon' | 'playSeconds'

/**
 * Trophy earned on a global counter
 * @typedef {Object} PlayTrophy
 * @property {string} label - Name
 * @property {string} goal - What it asks
 * @property {TrophyStat} stat - Counter
 * @property {number} target - Value to reach
 * @property {IconName} icon - Glyph
 */

export interface PlayTrophy {
  label: string
  goal: string
  stat: TrophyStat
  target: number
  icon: IconName
}

/**
 * Trophies of Memora Play
 * @type {PlayTrophy[]}
 */

export const PLAY_TROPHIES: PlayTrophy[] = [
  { label: 'Premier pas', goal: 'Jouer une partie', stat: 'played', target: 1, icon: 'play' },
  { label: 'Habitué', goal: 'Jouer 25 parties', stat: 'played', target: 25, icon: 'play' },
  {
    label: 'Pilier du salon',
    goal: 'Jouer 100 parties',
    stat: 'played',
    target: 100,
    icon: 'play',
  },
  {
    label: 'Première victoire',
    goal: 'Gagner une partie',
    stat: 'wins',
    target: 1,
    icon: 'playStar',
  },
  { label: 'Conquérant', goal: 'Gagner 50 parties', stat: 'wins', target: 50, icon: 'playStar' },
  {
    label: 'En feu',
    goal: 'Enchaîner 3 victoires',
    stat: 'bestStreak',
    target: 3,
    icon: 'playFlame',
  },
  {
    label: 'Intouchable',
    goal: 'Enchaîner 7 victoires',
    stat: 'bestStreak',
    target: 7,
    icon: 'playFlame',
  },
  {
    label: 'Champion',
    goal: 'Gagner un tournoi',
    stat: 'tournamentsWon',
    target: 1,
    icon: 'playCrown',
  },
  {
    label: 'Marathonien',
    goal: 'Jouer 10 heures',
    stat: 'playSeconds',
    target: 36000,
    icon: 'playClock',
  },
]

/**
 * Trophies with their progress
 * @param {PlayProfileView['global']} global - Global totals
 * @return {object[]} - Trophy, share and reached flag
 */

export const trophiesOf = (global: PlayProfileView['global']) =>
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
