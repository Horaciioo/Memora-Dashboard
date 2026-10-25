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
