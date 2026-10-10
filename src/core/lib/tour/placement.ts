import type { TourRect } from '@/types/tour'

/**
 * Size of an area
 * @typedef {Object} TourSize
 * @property {number} width - Width
 * @property {number} height - Height
 */

export interface TourSize {
  width: number
  height: number
}

/**
 * Where a bubble sits beside a lit part: right of it, else under, else over, else at the bottom
 * @param {TourRect} rect - Lit part
 * @param {TourSize} viewport - Screen
 * @param {TourSize} bubble - Bubble
 * @param {number} gap - Room around the bubble
 * @return {{ left: number, top?: number, bottom?: number }} - Bubble anchor
 */

export const placeBubble = (
  rect: TourRect,
  viewport: TourSize,
  bubble: TourSize,
  gap: number
): { left: number; top?: number; bottom?: number } => {
  const right = rect.left + rect.width
  const bottom = rect.top + rect.height
  const clampLeft = (value: number) =>
    Math.min(Math.max(value, gap), viewport.width - bubble.width - gap)
  const clampTop = (value: number) =>
    Math.min(Math.max(value, gap), viewport.height - bubble.height - gap)

  // Beside it
  if (right + gap + bubble.width <= viewport.width - gap) {
    return { top: clampTop(rect.top), left: right + gap }
  }

  // Under it
  if (bottom + gap + bubble.height <= viewport.height - gap) {
    return { top: bottom + gap, left: clampLeft(rect.left) }
  }

  // Over it
  if (rect.top - gap - bubble.height >= gap) {
    return { top: rect.top - gap - bubble.height, left: clampLeft(rect.left) }
  }

  // Too big for either: the bottom of the screen, whatever the bubble's real height
  return { bottom: gap, left: clampLeft(rect.left) }
}
