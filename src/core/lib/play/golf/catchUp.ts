import { GOLF_POWERS } from '@/declarations/play/golf/powers'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import type { GolfPowerName } from '@/utils/constants/play'

/**
 * Standing of a player
 * @param {number[]} totals - Strokes of everyone
 * @param {number} own - Strokes of the player
 * @return {number} - 0 leads, 1 last
 */

export const standingShare = (totals: number[], own: number): number => {
  if (totals.length < 2) return 0

  return totals.filter((total) => total < own).length / (totals.length - 1)
}

/**
 * Power drawn from an orb
 * @param {GolfPowerName[]} pool - Powers of the game
 * @param {number} share - Standing share
 * @param {number} roll - Random in [0, 1[
 * @param {number} [malus] - Malus weight multiplier
 * @return {GolfPowerName} - Power
 */

export const drawPower = (
  pool: GolfPowerName[],
  share: number,
  roll: number,
  malus = 1
): GolfPowerName => {
  const { catchUp } = GOLF_SETTINGS.orbs

  // Trailing players draw malus more
  const weights = pool.map((power) => {
    const { isBonus } = GOLF_POWERS.get(power)

    return (1 + catchUp * (isBonus ? 1 - share : share)) * (isBonus ? 1 : malus)
  })
  let left = roll * weights.reduce((sum, weight) => sum + weight, 0)

  // Walk the weights
  for (const [index, weight] of weights.entries()) {
    left -= weight
    if (left < 0) return pool[index]
  }

  return pool[pool.length - 1]
}
