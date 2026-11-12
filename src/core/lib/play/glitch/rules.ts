import { GLITCH_SETTINGS } from '@/declarations/play'
import { SECOND_MS } from '@/utils/constants/time'

/**
 * Points of a difference found
 * @return {number} - Points
 */

export const findPoints = (): number => GLITCH_SETTINGS.scoring.perFind

/**
 * Bonus of closing the picture, paying the first most and the quick more
 * @param {Object} input - Finish
 * @param {number} input.elapsedMs - Time since the round opened
 * @param {number} input.totalMs - Time of the round
 * @param {number} input.rank - Place among those who found everything, from one
 * @return {number} - Points
 */

export const finishPoints = ({
  elapsedMs,
  totalMs,
  rank,
}: {
  elapsedMs: number
  totalMs: number
  rank: number
}): number => {
  const { finishBonus, finishStep, finishFloor, speedBonus } = GLITCH_SETTINGS.scoring
  const left = Math.min(1, Math.max(0, 1 - elapsedMs / totalMs))
  const place = Math.max(finishFloor, finishBonus - (rank - 1) * finishStep)

  return place + Math.round(speedBonus * left)
}

/**
 * Time with one decimal, French style
 * @param {number} ms - Milliseconds
 * @return {string} - Seconds
 */

export const secondsLabel = (ms: number): string =>
  (ms / SECOND_MS).toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
