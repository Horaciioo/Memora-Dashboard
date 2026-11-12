import type { CSSProperties } from 'react'

import { JUMBLE_HUB } from '@/declarations/play/jumble/copy'
import { PlayHubScenery } from '@/composites/play/hub/scenery/PlayHubScenery'
import { PLAY_HUB } from '@/declarations/ui/variants'

// Spread of the letters across the width, a prime step
const SPREAD = 29
// Sizes cycled, in rem
const SIZES = [2.2, 3.2, 1.8, 2.8, 2.4]

/**
 * Letter tiles rising from the bottom like bubbles, spinning as they fade
 * @return {JSX.Element}
 */

export const PlayJumbleLetters = () => (
  <div className={PLAY_HUB.embers} aria-hidden="true">
    <PlayHubScenery set="jumble" />
    {JUMBLE_HUB.letters.map((letter, index) => (
      <span
        // Letters repeat, the slot is the identity
        key={`${letter}-${index}`}
        className={PLAY_HUB.jumbleFloat}
        style={
          {
            '--x': `${(index * SPREAD) % 100}%`,
            '--size': `${SIZES[index % SIZES.length]}rem`,
            '--rise': `${JUMBLE_HUB.rise + (index % 3) * 2}s`,
            '--delay': `${-index * JUMBLE_HUB.gap}s`,
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
