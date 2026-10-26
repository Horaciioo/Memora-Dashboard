import type { CSSProperties } from 'react'

import { GOLF_CHEER } from '@/declarations/play/golf/ornament'

/**
 * Squares flying out of the victory card, evenly around it
 * @return {CSSProperties[]} - Square styles
 */

export const cheerSparks = (): CSSProperties[] => {
  const { sparks, reach, size, delay, seed } = GOLF_CHEER
  // Seeded source
  let state = seed
  const random = () => {
    state = (state * 1664525 + 1013904223) % 4294967296

    return state / 4294967296
  }

  return Array.from({ length: sparks }, (_, index) => {
    const angle = ((index + random() * 0.6) / sparks) * Math.PI * 2
    const distance = reach.min + random() * (reach.max - reach.min)
    const side = size.min + random() * (size.max - size.min)

    return {
      width: `${side}rem`,
      height: `${side}rem`,
      '--dx': `${Math.cos(angle) * distance}rem`,
      '--dy': `${Math.sin(angle) * distance * 0.7}rem`,
      '--delay': `${Math.round(random() * delay)}ms`,
      '--tone': `${Math.round(random() * 100)}%`,
    } as CSSProperties
  })
}
