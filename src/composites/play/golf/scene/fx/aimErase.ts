import { fxStage, tickPowers } from '@/composites/play/golf/scene/fx/stage'
import type { GolfPowerClock } from '@/composites/play/golf/scene/fx/stage'
import { fxTimingOf } from '@/declarations/play/golf/fx'
import { GolfPowers } from '@/utils/constants/play'
import type { GolfPowerName } from '@/utils/constants/play'

/**
 * Share of the aim wiped by the blind pencil, drawn back once it wears off
 * @param {GolfPowerClock} clock - Power times of the own ball
 * @param {Set<GolfPowerName>} powers - Running powers
 * @param {boolean} isFirst - First frame seen
 * @param {number} now - Local ms
 * @param {boolean} isReduced - Reduced motion asked
 * @return {number} - Zero whole, one gone
 */

export const aimErased = (
  clock: GolfPowerClock,
  powers: Set<GolfPowerName>,
  isFirst: boolean,
  now = performance.now(),
  isReduced = false
): number => {
  tickPowers(clock, powers, now, isFirst)
  const { stage, t } = fxStage(
    clock.get(GolfPowers.Blind),
    now,
    fxTimingOf(GolfPowers.Blind, isReduced)
  )
  if (stage === 'cast') return t
  if (stage === 'aura') return 1
  if (stage === 'end') return 1 - t

  return 0
}
