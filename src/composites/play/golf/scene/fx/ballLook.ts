import { fxStage, sizeAt, squashAt } from '@/composites/play/golf/scene/fx/stage'
import type { GolfPowerClock } from '@/composites/play/golf/scene/fx/stage'
import { fxTimingOf } from '@/declarations/play/golf/fx'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import { GolfPowers } from '@/utils/constants/play'
import type { GolfPowerName } from '@/utils/constants/play'

const { powers } = GOLF_SETTINGS
const { ball, ballFx } = GOLF_SCENE

// Powers changing the ball size, their factor and growth steps
const SIZES: Partial<Record<GolfPowerName, { scale: number; steps: number }>> = {
  [GolfPowers.Giant]: { scale: powers.giant.scale, steps: ballFx.giantSteps },
  [GolfPowers.Mini]: { scale: powers.mini.scale, steps: 1 },
  [GolfPowers.BumperMan]: { scale: powers.bumperMan.scale, steps: 1 },
  [GolfPowers.BoingBoing]: { scale: powers.boingBoing.scale, steps: 1 },
}

/**
 * Look of a ball under its powers
 * @typedef {Object} GolfBallLook
 */

export interface GolfBallLook {
  // Size factor, the hitbox one once settled
  size: number
  // Height stretch of a size change
  stretch: number
  // Turn while shrinking, radians
  spin: number
  opacity: number
  // Anti-collision bubble size and opacity, zero hidden
  bubble: number
  bubbleOpacity: number
}

/**
 * Size of a ball, animated toward its power factor
 * @param {GolfPowerClock} clock - Power times
 * @param {number} now - Local ms
 * @param {boolean} isReduced - Reduced motion asked
 * @return {{ size: number, stretch: number, spin: number }} - Size and motion
 */

const sizeOf = (clock: GolfPowerClock, now: number, isReduced: boolean) => {
  for (const [power, times] of clock) {
    const sized = SIZES[power]
    if (!sized) continue
    const { stage, t } = fxStage(times, now, fxTimingOf(power, isReduced))
    if (stage === 'off') continue
    const steps = isReduced ? 1 : sized.steps
    const size = stage === 'end' ? sizeAt(sized.scale, 1, t) : sizeAt(1, sized.scale, t, steps)
    const isMoving = stage === 'cast' || stage === 'end'
    const breathe =
      stage === 'aura' && power === GolfPowers.Giant
        ? 1 + Math.sin(now / ballFx.breatheMs) * ballFx.breathe
        : 1

    return {
      size: size * breathe,
      stretch: isMoving && !isReduced ? squashAt(t, ballFx.squash) : 1,
      spin: stage === 'cast' && power === GolfPowers.Mini ? t * ballFx.spin : 0,
    }
  }

  return { size: 1, stretch: 1, spin: 0 }
}

/**
 * Ghost fade, in and out
 * @param {GolfPowerClock} clock - Power times
 * @param {number} now - Local ms
 * @param {boolean} isReduced - Reduced motion asked
 * @return {number} - Opacity
 */

const opacityOf = (clock: GolfPowerClock, now: number, isReduced: boolean): number => {
  const { stage, t } = fxStage(
    clock.get(GolfPowers.Ghost),
    now,
    fxTimingOf(GolfPowers.Ghost, isReduced)
  )
  if (stage === 'cast') return 1 + (ball.ghost - 1) * t
  if (stage === 'aura') return ball.ghost + Math.sin(now / ballFx.vapourMs) * ballFx.vapour
  if (stage === 'end') return ball.ghost + (1 - ball.ghost) * t

  return 1
}

/**
 * Anti-collision bubble closing, waving, then bursting
 * @param {GolfPowerClock} clock - Power times
 * @param {number} now - Local ms
 * @param {boolean} isReduced - Reduced motion asked
 * @return {{ bubble: number, bubbleOpacity: number }} - Size and opacity
 */

const bubbleOf = (clock: GolfPowerClock, now: number, isReduced: boolean) => {
  const { stage, t } = fxStage(
    clock.get(GolfPowers.AntiCollision),
    now,
    fxTimingOf(GolfPowers.AntiCollision, isReduced)
  )
  if (stage === 'cast') return { bubble: sizeAt(ballFx.bubbleFrom, 1, t), bubbleOpacity: t }
  if (stage === 'aura') {
    return { bubble: 1 + Math.sin(now / ballFx.waveMs) * ballFx.wave, bubbleOpacity: 1 }
  }
  if (stage === 'end') return { bubble: 1 + ballFx.burst * t, bubbleOpacity: 1 - t }

  return { bubble: 0, bubbleOpacity: 0 }
}

/**
 * Whole look of a ball under its powers
 * @param {GolfPowerClock} clock - Power times
 * @param {number} now - Local ms
 * @param {boolean} isReduced - Reduced motion asked
 * @return {GolfBallLook} - Look
 */

export const ballLook = (clock: GolfPowerClock, now: number, isReduced: boolean): GolfBallLook => ({
  ...sizeOf(clock, now, isReduced),
  opacity: opacityOf(clock, now, isReduced),
  ...bubbleOf(clock, now, isReduced),
})
