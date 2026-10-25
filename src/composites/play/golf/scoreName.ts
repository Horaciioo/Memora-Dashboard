import { fillPlayMessage } from '@/declarations/play/copy'
import { GOLF_SCORE_NAMES } from '@/declarations/play/golf/copy'

// Furthest names under and over par
const BEST = -3
const WORST = 2

/**
 * Name of a hole score against par
 * @param {number} strokes - Strokes
 * @param {number} par - Par
 * @return {string} - Birdie, par, bogey
 */

export const scoreName = (strokes: number, par: number): string => {
  if (strokes === 1) return GOLF_SCORE_NAMES.ace
  const gap = Math.max(BEST, strokes - par)

  return gap > WORST
    ? fillPlayMessage(GOLF_SCORE_NAMES.worse, { count: gap })
    : GOLF_SCORE_NAMES[String(gap)]
}
