/**
 * Moment of a round
 * @type {Record<string, string>}
 */

export const BaccalaureatPhases = {
  Countdown: 'countdown',
  Writing: 'writing',
  Review: 'review',
  Scored: 'scored',
} as const

export type BaccalaureatPhase = (typeof BaccalaureatPhases)[keyof typeof BaccalaureatPhases]

/**
 * Dates a round's phase reads from
 * @typedef {Object} RoundClock
 */

export interface RoundClock {
  startsAt: Date
  closedAt: Date | null
  scoredAt: Date | null
}

/**
 * Phase of a round right now
 * @param {RoundClock} round - Round dates
 * @param {Date} [now] - Reference time
 * @return {BaccalaureatPhase} - Phase
 */

export const roundPhase = (round: RoundClock, now = new Date()): BaccalaureatPhase => {
  if (round.scoredAt) return BaccalaureatPhases.Scored
  if (round.closedAt) return BaccalaureatPhases.Review

  return now < round.startsAt ? BaccalaureatPhases.Countdown : BaccalaureatPhases.Writing
}
