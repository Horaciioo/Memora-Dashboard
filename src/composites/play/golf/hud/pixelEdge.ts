import type { CSSProperties } from 'react'

import { GOLF_PIXEL_EDGE } from '@/declarations/play/golf/ornament'

const SIDES = ['top', 'bottom', 'left', 'right'] as const

// Axis a side runs along
const ALONG = { top: 'left', bottom: 'left', left: 'top', right: 'top' } as const

/**
 * Stray squares along the edges
 * @return {CSSProperties[]} - Square styles
 */

export const pixelEdgeSquares = (): CSSProperties[] => {
  const { unit, counts, reach, span, margin, seed } = GOLF_PIXEL_EDGE
  // Seeded source
  let state = seed
  const random = () => {
    state = (state * 1664525 + 1013904223) % 4294967296

    return state / 4294967296
  }

  return SIDES.flatMap((side) =>
    Array.from({ length: counts[side] }, () => {
      const size = (span.min + Math.floor(random() * (span.max - span.min + 1))) * unit
      const offset = (reach.min + Math.floor(random() * (reach.max - reach.min + 1))) * unit

      return {
        [ALONG[side]]: `${margin.min + random() * (margin.max - margin.min)}%`,
        [side]: `${offset}rem`,
        width: `${size}rem`,
        height: `${size}rem`,
        '--tone': `${Math.round(random() * 100)}%`,
      } as CSSProperties
    })
  )
}
