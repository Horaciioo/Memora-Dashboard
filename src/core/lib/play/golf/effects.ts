import { isArmed } from '@/core/lib/play/golf/arming'
import type { GolfEffect, GolfHazard } from '@/core/lib/play/golf/types'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import { GolfPowers } from '@/utils/constants/play'
import type { GolfPowerName } from '@/utils/constants/play'

/**
 * Effect running, not armed nor worn off
 * @param {GolfEffect | GolfHazard} effect - Effect
 * @param {number} at - Server ms
 * @return {boolean} - Running
 */

export const isEffectActive = (effect: GolfEffect | GolfHazard, at: number): boolean =>
  !isArmed(effect.armsOn, at) &&
  (effect.until === undefined || effect.until > at) &&
  (!('shots' in effect) || effect.shots === undefined || effect.shots > 0) &&
  (!('lives' in effect) || effect.lives === undefined || effect.lives > 0)

/**
 * Effect worth keeping, armed or running
 * @param {GolfEffect | GolfHazard} effect - Effect
 * @param {number} at - Server ms
 * @return {boolean} - Kept
 */

export const isEffectKept = (effect: GolfEffect | GolfHazard, at: number): boolean =>
  isArmed(effect.armsOn, at) || isEffectActive(effect, at)

/**
 * Powers acting on a ball
 * @param {GolfEffect[]} effects - Effects
 * @param {number} at - Server ms
 * @return {Set<GolfPowerName>} - Running powers
 */

export const activePowers = (effects: GolfEffect[], at: number): Set<GolfPowerName> =>
  new Set(effects.filter((effect) => isEffectActive(effect, at)).map((effect) => effect.power))

/**
 * Size factor of a ball
 * @param {Set<GolfPowerName>} powers - Running powers
 * @return {number} - Radius factor
 */

export const ballScale = (powers: Set<GolfPowerName>): number => {
  if (powers.has(GolfPowers.BumperMan)) return GOLF_SETTINGS.powers.bumperMan.scale
  if (powers.has(GolfPowers.BoingBoing)) return GOLF_SETTINGS.powers.boingBoing.scale
  if (powers.has(GolfPowers.Giant)) return GOLF_SETTINGS.powers.giant.scale
  if (powers.has(GolfPowers.Mini)) return GOLF_SETTINGS.powers.mini.scale

  return 1
}

/**
 * Effects kept after a shot, one ghost shot spent
 * @param {GolfEffect[]} effects - Effects
 * @param {number} at - Server ms
 * @return {GolfEffect[]} - Effects left
 */

export const spendShot = (effects: GolfEffect[], at: number): GolfEffect[] =>
  effects
    .filter((effect) => isEffectKept(effect, at))
    .map((effect) =>
      effect.shots === undefined || isArmed(effect.armsOn, at)
        ? effect
        : { ...effect, shots: effect.shots - 1 }
    )
    .filter((effect) => effect.shots === undefined || effect.shots > 0)

// Balls turned into a bumper
export const BOUNCE_POWERS: GolfPowerName[] = [GolfPowers.BumperMan, GolfPowers.BoingBoing]

/**
 * Bumper ball effects worn by its hits, all gone once holed
 * @param {GolfEffect[]} effects - Effects
 * @param {number} hits - Balls sent back
 * @param {boolean} isHoled - Ball holed
 * @return {GolfEffect[]} - Effects left
 */

export const wearBounces = (effects: GolfEffect[], hits: number, isHoled: boolean): GolfEffect[] =>
  effects
    .filter((effect) => !isHoled || !BOUNCE_POWERS.includes(effect.power))
    .map((effect) =>
      hits && BOUNCE_POWERS.includes(effect.power) && effect.lives !== undefined
        ? { ...effect, lives: effect.lives - hits }
        : effect
    )
    .filter((effect) => effect.lives === undefined || effect.lives > 0)

// Sizes replace each other
const SIZE_POWERS: GolfPowerName[] = [GolfPowers.Giant, GolfPowers.Mini, ...BOUNCE_POWERS]

/**
 * Add an effect, replacing the same power or size
 * @param {GolfEffect[]} effects - Effects
 * @param {GolfEffect} effect - New effect
 * @param {number} at - Server ms
 * @return {GolfEffect[]} - Effects
 */

export const withEffect = (effects: GolfEffect[], effect: GolfEffect, at: number): GolfEffect[] => {
  const replaced = SIZE_POWERS.includes(effect.power) ? SIZE_POWERS : [effect.power]

  return [
    ...effects.filter(
      (entry) =>
        isArmed(entry.armsOn, at) || (!replaced.includes(entry.power) && isEffectKept(entry, at))
    ),
    effect,
  ]
}
