import { GolfModes } from '@/utils/constants/play'
import type { GolfModeName } from '@/utils/constants/play'
import type { IconName } from '@/declarations/ui/icons'

/**
 * Steps of the vote after the rules
 * @type {Record<string, string>}
 */

export const GolfVoteSteps = {
  Mode: 'mode',
  Rounds: 'rounds',
  Course: 'course',
} as const

export type GolfVoteStep = (typeof GolfVoteSteps)[keyof typeof GolfVoteSteps]

/**
 * Glyph of each format
 * @type {Record<GolfModeName, IconName>}
 */

export const GOLF_MODE_ICONS: Record<GolfModeName, IconName> = {
  [GolfModes.Casual]: 'golfFlag',
  [GolfModes.Tournament]: 'playTrophy',
  [GolfModes.Chaos]: 'golfTornado',
}

/**
 * Timings of the vote, ms
 * @type {Record<string, number>}
 */

export const GOLF_VOTE_TIMING = {
  // Confirm sound before the cards leave
  confirm: 140,
  // Cards leaving
  exit: 380,
  // Avatar lands on its card
  land: 330,
} as const

/**
 * Words of the vote screens
 * @type {Record<string, string>}
 */

export const GOLF_VOTE_COPY = {
  modeTitle: 'Format',
  modeLead: 'Choisis comment se joue la partie.',
  roundsTitle: 'Parcours',
  roundsLead: 'Combien de parcours dans le tournoi ?',
  roundsHint: '{count} parcours de six trous, les scores s’additionnent.',
  roundsUnit: 'parcours',
  courseTitle: 'Parcours',
  courseLead: 'Choisis le terrain de jeu.',
  courseLeadTournament: 'Choisis le premier parcours, les autres sont tirés au sort.',
  casualHint: 'Un seul parcours, le moins de coups gagne.',
  tournamentHint: 'Les parcours s’enchaînent et les scores s’additionnent.',
  chaosHint: '{orbs} fois plus d’orbes, {malus} fois plus de malus et {hand} pouvoirs en main.',
  confirm: 'Valider',
  back: 'Retour',
  you: 'Toi',
} as const
