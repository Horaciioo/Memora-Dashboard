import { ticksOf } from '@/core/lib/play/concordat/sim/tables'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatState } from '@/types/concordat'

const { victory } = CONCORDAT

/**
 * How far the game has aged toward its end, 0 before the ramp starts and 1 at the end
 * @param {ConcordatState} state - Game
 * @return {number} - Progress, 0 to 1
 */

export const rampOf = (state: ConcordatState): number => {
  const start = ticksOf(victory.rampStartMinutes * 60)
  const finish =
    state.endTick > start ? state.endTick : start + ticksOf(victory.rampFallbackMinutes * 60)
  // The line reaches its floor before the clock runs out, the last stretch is a fight over it
  const end = start + (finish - start) * victory.rampShare

  return Math.min(1, Math.max(0, (state.tick - start) / (end - start)))
}

/**
 * Land share a side needs to dominate now: it falls as the game ages
 * @param {ConcordatState} state - Game
 * @return {number} - Share, 0 to 1
 */

export const dominationNeed = (state: ConcordatState): number =>
  victory.dominationShare - (victory.dominationShare - victory.dominationEndShare) * rampOf(state)

/**
 * Seconds a dominant side must hold the share, longer as the game ages
 * @param {ConcordatState} state - Game
 * @return {number} - Seconds
 */

export const dominationHold = (state: ConcordatState): number =>
  victory.dominationSeconds + victory.dominationHoldSeconds * rampOf(state)
