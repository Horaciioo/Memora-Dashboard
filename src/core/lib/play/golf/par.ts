import type { GolfHoleLayout } from '@/core/lib/play/golf/types'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

/**
 * Name of a score against the par of its hole
 * @typedef {'ace' | 'albatross' | 'eagle' | 'birdie' | 'par' | 'bogey' | 'double' | 'over'} GolfParName
 */

export type GolfParName =
  | 'ace'
  | 'albatross'
  | 'eagle'
  | 'birdie'
  | 'par'
  | 'bogey'
  | 'double'
  | 'over'

/**
 * Par of a hole: drawn in the layout, else read from the distance tee to cup, none for points holes
 * @param {GolfHoleLayout} layout - Drawn hole
 * @return {number | null} - Strokes expected
 */

export const parOfLayout = (layout: GolfHoleLayout): number | null => {
  if (layout.cups) return null
  if (layout.par) return layout.par
  const { shortTo, mediumTo } = GOLF_SETTINGS.par
  const distance = Math.hypot(layout.cup[0] - layout.tee[0], layout.cup[1] - layout.tee[1])

  return distance <= shortTo ? 2 : distance <= mediumTo ? 3 : 4
}

/**
 * Name of a hole score
 * @param {number} strokes - Strokes played
 * @param {number} par - Par of the hole
 * @return {GolfParName} - Name
 */

export const parName = (strokes: number, par: number): GolfParName => {
  if (strokes === 1) return 'ace'
  const gap = strokes - par
  if (gap <= -3) return 'albatross'
  if (gap === -2) return 'eagle'
  if (gap === -1) return 'birdie'
  if (gap === 0) return 'par'
  if (gap === 1) return 'bogey'

  return gap === 2 ? 'double' : 'over'
}

/**
 * Card against the pars of the holes played
 * @param {number[]} card - Strokes of each finished hole
 * @param {(number | null)[]} pars - Par of each hole of the course
 * @return {number} - Strokes over par, negative when under
 */

export const cardVersusPar = (card: number[], pars: (number | null)[]): number =>
  card.reduce((sum, strokes, index) => {
    const par = pars[index]

    return par === null || par === undefined ? sum : sum + strokes - par
  }, 0)
