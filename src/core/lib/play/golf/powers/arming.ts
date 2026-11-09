import type { GolfArming, GolfEffect, GolfHazard } from '@/core/lib/play/golf/types'
import { GOLF_POWERS } from '@/declarations/play/golf/powers'
import type { GolfPowerName } from '@/utils/constants/play'

/**
 * Ball a power is played from
 * @typedef {Object} GolfCastContext
 */

export interface GolfCastContext {
  // Server ms now, then the ball stops
  at: number
  restsAt: number
  isDone: boolean
  hole: number
  holes: number
}

// Played now, armed, or kept in hand
export type GolfCastOutcome =
  { kind: 'now' } | { kind: 'armed'; armsOn: GolfArming } | { kind: 'refused' }

/**
 * Power playable from the hand, a bonus needs a hole left
 * @param {GolfPowerName} power - Power
 * @param {boolean} isDone - Hole finished
 * @param {boolean} isLastHole - No hole after
 * @return {boolean} - Playable
 */

export const canCastPower = (power: GolfPowerName, isDone: boolean, isLastHole: boolean): boolean =>
  !isDone || !isLastHole || !GOLF_POWERS.get(power).isBonus

/**
 * When a power starts acting
 * @param {GolfPowerName} power - Power
 * @param {GolfCastContext} context - Ball state
 * @return {GolfCastOutcome} - Outcome
 */

export const armingOf = (power: GolfPowerName, context: GolfCastContext): GolfCastOutcome => {
  // Malus hits at once
  if (!GOLF_POWERS.get(power).isBonus) return { kind: 'now' }
  const isLastHole = context.hole + 1 >= context.holes
  if (!canCastPower(power, context.isDone, isLastHole)) return { kind: 'refused' }
  if (context.isDone) return { kind: 'armed', armsOn: { hole: context.hole + 1 } }

  return context.restsAt > context.at
    ? { kind: 'armed', armsOn: { at: context.restsAt } }
    : { kind: 'now' }
}

/**
 * Arming still waiting
 * @param {GolfArming | undefined} armsOn - Arming
 * @param {number} at - Server ms
 * @return {boolean} - Waiting
 */

export const isArmed = (armsOn: GolfArming | undefined, at: number): boolean =>
  armsOn !== undefined && ('hole' in armsOn || armsOn.at > at)

/**
 * Armed effects whose moment came
 * @param {T[]} effects - Effects
 * @param {Object} moment - Now
 * @param {number} moment.at - Server ms
 * @param {number} moment.hole - Hole opening
 * @return {T[]} - Effects
 */

export const releaseArmed = <T extends GolfEffect | GolfHazard>(
  effects: T[],
  { at, hole }: { at: number; hole: number }
): T[] =>
  effects.map((effect) => {
    const { armsOn } = effect
    if (!armsOn) return effect
    const isMet = 'hole' in armsOn ? hole >= armsOn.hole : armsOn.at <= at
    if (!isMet) return effect
    const released = { ...effect }
    delete released.armsOn

    return released
  })

/**
 * Effects carried to a new hole, only the ones queued for it, their clock restarted
 * @param {GolfEffect[]} effects - Effects
 * @param {number} hole - Hole opening
 * @param {number} startsAt - Server ms it starts
 * @return {GolfEffect[]} - Effects kept
 */

export const effectsForHole = (
  effects: GolfEffect[],
  hole: number,
  startsAt: number
): GolfEffect[] =>
  releaseArmed(
    effects.filter((effect) => effect.armsOn && 'hole' in effect.armsOn),
    { at: -Infinity, hole }
  )
    .filter((effect) => !effect.armsOn)
    .map((effect) =>
      effect.until === undefined || effect.castAt === undefined
        ? effect
        : { ...effect, until: startsAt + (effect.until - effect.castAt), castAt: startsAt }
    )
