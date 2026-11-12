import type { CSSProperties } from 'react'

import { PlayHubScenery } from '@/composites/play/hub/scenery/PlayHubScenery'
import { SUSPENS_HUB } from '@/declarations/play'
import { PLAY_HUB } from '@/declarations/ui/variants'

// Spread of the letters across the width, a prime step
const SPREAD = 31
// Sizes cycled, in rem
const SIZES = [2.4, 3.4, 2, 3, 2.6]

/**
 * Chalk letters rising from the bottom like bubbles, spinning as they fade
 * @return {JSX.Element}
 */

export const PlaySuspensLetters = () => (
  <div className={PLAY_HUB.embers} aria-hidden="true">
    <PlayHubScenery set="suspens" />
    {SUSPENS_HUB.letters.map((letter, index) => (
      <span
        // Letters repeat, the slot is the identity
        key={`${letter}-${index}`}
        className={PLAY_HUB.suspensFloat}
        style={
          {
            '--x': `${(index * SPREAD) % 100}%`,
            '--size': `${SIZES[index % SIZES.length]}rem`,
            '--rise': `${SUSPENS_HUB.rise + (index % 3) * 2}s`,
            '--delay': `${-index * SUSPENS_HUB.gap}s`,
            '--drift': `${index % 2 ? 1 : -1}${2 + (index % 4)}rem`,
            '--tilt': `${(index % 2 ? 1 : -1) * (8 + (index % 3) * 5)}deg`,
          } as CSSProperties
        }
      >
        {letter}
      </span>
    ))}
  </div>
)
