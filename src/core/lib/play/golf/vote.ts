import type { Prisma } from '@prisma/client'

import { GOLF_COURSES, GOLF_RANDOM_COURSE } from '@/declarations/play/golf/courses'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import { GOLF_VOTE_TIMING, GolfVoteSteps } from '@/declarations/play/golf/vote'
import type { GolfVoteStep } from '@/declarations/play/golf/vote'
import { GolfModes } from '@/utils/constants/play'
import { holeRange } from '@/core/lib/play/golf/settings'
import type { GolfGameSettings } from '@/core/lib/play/golf/settings'

/**
 * Vote of a lobby about to launch, kept in its settings
 * @typedef {Object} GolfVoteState
 * @property {GolfVoteStep} step - Step on screen
 * @property {number} endsAt - Server ms the step closes
 * @property {Record<string, string>} picks - Card of each voter on this step
 * @property {Partial<Record<GolfVoteStep, string>>} chosen - Winners of the closed steps
 */

export interface GolfVoteState {
  step: GolfVoteStep
  endsAt: number
  picks: Record<string, string>
  chosen: Partial<Record<GolfVoteStep, string>>
}

/**
 * Steps a format goes through
 * @param {string} [mode] - Format
 * @return {GolfVoteStep[]} - Steps in order
 */

export const golfVoteSteps = (mode?: string): GolfVoteStep[] =>
  mode === GolfModes.Tournament
    ? [GolfVoteSteps.Mode, GolfVoteSteps.Rounds, GolfVoteSteps.Course]
    : [GolfVoteSteps.Mode, GolfVoteSteps.Course]

// Card keys of each step, in card order
const OPTIONS: Record<GolfVoteStep, () => string[]> = {
  [GolfVoteSteps.Mode]: () => Object.values(GolfModes),
  [GolfVoteSteps.Rounds]: () => GOLF_SETTINGS.tournament.maps.map(String),
  [GolfVoteSteps.Course]: () => [...GOLF_COURSES.keys, GOLF_RANDOM_COURSE],
}

/**
 * Cards a step offers
 * @param {GolfVoteStep} step - Step
 * @return {string[]} - Card keys
 */

export const golfVoteOptions = (step: GolfVoteStep): string[] => OPTIONS[step]()

// Card the rules already hold, kept when nobody votes
const FALLBACKS: Record<GolfVoteStep, (settings: GolfGameSettings) => string> = {
  [GolfVoteSteps.Mode]: (settings) => settings.mode,
  [GolfVoteSteps.Rounds]: (settings) => String(settings.maps),
  [GolfVoteSteps.Course]: (settings) => settings.course,
}

/**
 * Card most picked, the host's on a tie, the first of the tie otherwise
 * @param {GolfVoteStep} step - Step
 * @param {Record<string, string>} picks - Card of each voter
 * @param {string} hostId - Host
 * @param {GolfGameSettings} settings - Rules held, the answer when nobody voted
 * @return {string} - Card key
 */

export const winningCard = (
  step: GolfVoteStep,
  picks: Record<string, string>,
  hostId: string,
  settings: GolfGameSettings
): string => {
  const options = golfVoteOptions(step)
  const votes = Object.values(picks).filter((key) => options.includes(key))
  if (!votes.length) {
    const held = FALLBACKS[step](settings)

    return options.includes(held) ? held : options[0]
  }
  const count = (key: string) => votes.filter((vote) => vote === key).length
  const top = Math.max(...options.map(count))
  const tied = options.filter((key) => count(key) === top)

  return tied.includes(picks[hostId]) ? picks[hostId] : tied[0]
}

/**
 * Vote opened at a step
 * @param {GolfVoteStep} step - Step
 * @param {number} now - Server ms
 * @param {GolfVoteState['chosen']} [chosen] - Winners so far
 * @return {GolfVoteState} - Vote
 */

export const golfVoteAt = (
  step: GolfVoteStep,
  now: number,
  chosen: GolfVoteState['chosen'] = {}
): GolfVoteState => ({ step, endsAt: now + GOLF_VOTE_TIMING.limit, picks: {}, chosen })

/**
 * Open vote of stored settings
 * @param {Prisma.JsonValue} stored - Stored settings
 * @return {GolfVoteState | null} - Vote, none when closed
 */

export const golfVoteOf = (stored: Prisma.JsonValue): GolfVoteState | null => {
  const vote = (stored as { vote?: GolfVoteState } | null)?.vote

  return vote && typeof vote.endsAt === 'number' ? vote : null
}

/**
 * Raw settings of the choices a vote ended on, holes cut to the course
 * @param {GolfVoteState['chosen']} chosen - Winners
 * @param {GolfGameSettings} settings - Rules held
 * @return {Record<string, unknown>} - Body for the settings reader
 */

export const golfVoteSettings = (
  chosen: GolfVoteState['chosen'],
  settings: GolfGameSettings
): Record<string, unknown> => ({
  mode: chosen.mode,
  course: chosen.course,
  holes: Math.min(settings.holes, holeRange(chosen.course ?? settings.course).max),
  ...(chosen.rounds && { maps: Number(chosen.rounds) }),
})
