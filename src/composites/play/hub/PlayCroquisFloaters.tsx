import type { CSSProperties } from 'react'

import { CROQUIS_COLORS, CROQUIS_HUB } from '@/declarations/play'
import { PLAY_HUB } from '@/declarations/ui/variants'

// Spread of the scribbles across the width, a prime step
const SPREAD = 23
// Sizes cycled, in rem
const SIZES = [3.2, 4.6, 2.8, 4, 3.4]

/**
 * Scribbles rising from the bottom like bubbles, spinning as they fade
 * @return {JSX.Element}
 */

export const PlayCroquisFloaters = () => (
  <div className={PLAY_HUB.embers} aria-hidden="true">
    {CROQUIS_HUB.floaters.map((color, index) => (
      <svg
        // Colours repeat, the slot is the identity
        key={`${color}-${index}`}
        viewBox="0 0 64 64"
        className={PLAY_HUB.croquisFloat}
        style={
          {
            '--x': `${(index * SPREAD) % 100}%`,
            '--size': `${SIZES[index % SIZES.length]}rem`,
            '--rise': `${CROQUIS_HUB.rise + (index % 3) * 2}s`,
            '--delay': `${-index * CROQUIS_HUB.gap}s`,
            '--drift': `${index % 2 ? 1 : -1}${2 + (index % 4)}rem`,
            '--tilt': `${(index % 2 ? 1 : -1) * (8 + (index % 3) * 6)}deg`,
          } as CSSProperties
        }
      >
        <path
          d={SCRIBBLES[index % SCRIBBLES.length]}
          fill="none"
          stroke={`var(${CROQUIS_COLORS[color].token})`}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ))}
  </div>
)

// Simple doodles: wave, spiral, zigzag, loop, star
const SCRIBBLES = [
  'M6 38c8-18 14-18 22 0s14 18 22 0 6-8 8-10',
  'M32 32m-3 0a3 3 0 1 1 6 0a9 9 0 1 1-12 0a15 15 0 1 1 24 0a21 21 0 1 1-30-4',
  'M8 46l12-28 12 28 12-28 12 28',
  'M10 40c0-20 30-28 34-10s-22 22-18 4 24-12 26 4',
  'M32 8l7 18 19 1-15 12 5 19-16-11-16 11 5-19L6 27l19-1z',
]
