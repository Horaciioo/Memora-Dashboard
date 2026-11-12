import { useId } from 'react'

import { PLAY_CAREER } from '@/declarations/ui/variants'

// Star centre, size and beat on a 24 grid
const STARS: ReadonlyArray<readonly [number, number, number, number]> = [
  [21, 3, 1.5, 0],
  [3.5, 6, 1, 1],
  [20, 20, 1.1, 2],
]

/**
 * Crown-like shine sweep and twinkling stars over a gold tile
 * @return {JSX.Element}
 */

export const PlayGoldSparkles = () => {
  const clip = useId()

  return (
    <svg viewBox="0 0 24 24" className={PLAY_CAREER.sparkles} aria-hidden="true">
      <defs>
        <clipPath id={clip}>
          <rect width="24" height="24" rx="5" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <path className="glyph-shine" d="M3 -2h5L3 26h-5z" fill="white" />
      </g>
      {STARS.map(([x, y, size, beat]) => (
        <g key={`${x}-${y}`} className="glyph-twinkle" data-beat={beat}>
          <path
            transform={`translate(${x} ${y}) scale(${size})`}
            d="M0-2.4Q.4-.4 2.4 0 .4.4 0 2.4-.4.4-2.4 0-.4-.4 0-2.4z"
            fill="white"
            stroke="var(--play-gold-deep)"
            strokeWidth="0.35"
            strokeLinejoin="round"
          />
        </g>
      ))}
    </svg>
  )
}
