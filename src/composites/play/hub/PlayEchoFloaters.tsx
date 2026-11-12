import type { CSSProperties } from 'react'

import { ECHO_ART } from '@/composites/play/echo/EchoSymbols'
import { ECHO_HUB } from '@/declarations/play/echo/copy'
import { PlayHubScenery } from '@/composites/play/hub/scenery/PlayHubScenery'
import { PLAY_HUB } from '@/declarations/ui/variants'

// Spread of the symbols across the width, a prime step
const SPREAD = 31
// Sizes cycled, in rem
const SIZES = [3, 4.2, 2.6, 3.6, 3.2]

/**
 * Symbols rising from the bottom like bubbles, spinning as they fade
 * @return {JSX.Element}
 */

export const PlayEchoFloaters = () => (
  <div className={PLAY_HUB.embers} aria-hidden="true">
    <PlayHubScenery set="echo" />
    {ECHO_HUB.floaters.map((key, index) => (
      <svg
        key={key}
        viewBox="0 0 64 64"
        className={PLAY_HUB.echoFloat}
        style={
          {
            '--x': `${(index * SPREAD) % 100}%`,
            '--size': `${SIZES[index % SIZES.length]}rem`,
            '--rise': `${ECHO_HUB.rise + (index % 3) * 2}s`,
            '--delay': `${-index * ECHO_HUB.gap}s`,
            '--drift': `${index % 2 ? 1 : -1}${2 + (index % 4)}rem`,
            '--tilt': `${(index % 2 ? 1 : -1) * (8 + (index % 3) * 6)}deg`,
          } as CSSProperties
        }
      >
        {ECHO_ART[key]}
      </svg>
    ))}
  </div>
)
