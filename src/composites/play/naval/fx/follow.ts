import type { OceanStrike } from '@/composites/play/naval/fx/paintStrikes'
import { centreOf, clamp01 } from '@/composites/play/naval/ocean/paint/frame'
import type { OceanFrame } from '@/composites/play/naval/ocean/paint/frame'
import { NAVAL_DIRECTION } from '@/declarations/play/naval/choreographies'
import { easeOut } from '@/utils/motion'

/**
 * Camera lean toward a strike
 * @typedef {Object} OceanFollow
 * @property {number} zoom - Scale, one is still
 */

export interface OceanFollow {
  zoom: number
  x: number
  y: number
}

/**
 * Gentle zoom toward the zone struck, eased in then back out
 * @param {OceanFrame} frame - Frame
 * @param {OceanStrike | undefined} playing - First strike on screen
 * @return {OceanFollow | null} - Lean, none at rest
 */

export const followOf = (
  frame: OceanFrame,
  playing: OceanStrike | undefined
): OceanFollow | null => {
  const { zoom, inMs, outMs } = NAVAL_DIRECTION.follow
  if (!playing || !zoom) return null
  const age = frame.now - playing.startedAt
  const { total, isShort } = playing.timeline
  if (isShort || age < 0 || age > total) return null

  // Ease in, hold, ease out before the end
  const lean = Math.min(
    clamp01(age / Math.max(1, inMs)),
    clamp01((total - age) / Math.max(1, outMs))
  )
  const { cells } = playing.strike
  const middle = cells.reduce(
    (sum, cell) => {
      const at = centreOf(frame, cell.x, cell.y)

      return { x: sum.x + at.x / cells.length, y: sum.y + at.y / cells.length }
    },
    { x: 0, y: 0 }
  )

  return { zoom: 1 + zoom * easeOut(lean), ...middle }
}
