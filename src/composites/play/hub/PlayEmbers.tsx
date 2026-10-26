import type { CSSProperties } from 'react'

import { BOMB_EMBERS } from '@/declarations/play'
import { PLAY_HUB } from '@/declarations/ui/variants'

// Spread of the embers across the width, a prime step
const SPREAD = 37
// Sizes cycled, in rem
const SIZES = [1.4, 2.2, 1.1, 3, 1.7]

/**
 * Syllables rising from the bottom like embers, glowing then burning out
 * @return {JSX.Element}
 */

export const PlayEmbers = () => (
  <div className={PLAY_HUB.embers} aria-hidden="true">
    <svg viewBox="0 0 400 400" className={PLAY_HUB.bombBanner}>
      <circle cx="190" cy="230" r="190" fill="var(--play-bomb)" opacity="0.22" />
      <circle cx="190" cy="230" r="140" fill="var(--play-night)" />
      <circle cx="140" cy="180" r="30" fill="white" opacity="0.12" />
      <rect
        x="170"
        y="62"
        width="52"
        height="40"
        rx="10"
        fill="var(--play-night)"
        transform="rotate(24 196 82)"
      />
      <path
        d="M214 66c24-44 76-56 90-26"
        stroke="var(--play-bomb-glow)"
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="306" cy="38" r="14" fill="var(--play-gold)" className="play-bomb-spark-glow" />
      <circle cx="330" cy="66" r="7" fill="var(--play-gold)" opacity="0.8" />
      <circle cx="286" cy="14" r="6" fill="var(--play-gold)" opacity="0.8" />
    </svg>
    {BOMB_EMBERS.syllables.map((syllable, index) => (
      <span
        key={syllable}
        className={PLAY_HUB.ember}
        style={
          {
            '--x': `${(index * SPREAD) % 100}%`,
            '--size': `${SIZES[index % SIZES.length]}rem`,
            '--rise': `${BOMB_EMBERS.rise + (index % 3) * 2}s`,
            '--delay': `${-index * BOMB_EMBERS.gap}s`,
            '--drift': `${index % 2 ? 1 : -1}${2 + (index % 4)}rem`,
          } as CSSProperties
        }
      >
        {syllable}
      </span>
    ))}
  </div>
)
