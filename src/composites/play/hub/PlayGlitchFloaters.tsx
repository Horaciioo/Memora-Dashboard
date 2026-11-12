import type { CSSProperties } from 'react'

import { GlitchMarkArt } from '@/composites/play/glitch/GlitchShapes'
import { GLITCH_HUB } from '@/declarations/play/glitch/copy'
import { GLITCH_SHAPES } from '@/declarations/play/glitch/symbols'
import { PlayHubScenery } from '@/composites/play/hub/scenery/PlayHubScenery'
import { PLAY_HUB } from '@/declarations/ui/variants'

// Spread of the floaters across the width, a prime step
const SPREAD = 31
// Sizes cycled, in rem
const SIZES = [3, 4.2, 2.6, 3.6, 3.2]
// Palette indexes cycled
const COLORS = [0, 3, 1, 4, 2, 5]

/**
 * Shapes and figures rising from the bottom like bubbles, spinning as they fade
 * @return {JSX.Element}
 */

export const PlayGlitchFloaters = () => (
  <div className={PLAY_HUB.embers} aria-hidden="true">
    <PlayHubScenery set="glitch" />
    {GLITCH_HUB.floaters.map((key, index) => (
      <svg
        key={key}
        viewBox="-12 -12 24 24"
        className={PLAY_HUB.glitchFloat}
        style={
          {
            fill: `var(--glitch-c${COLORS[index % COLORS.length]})`,
            '--x': `${(index * SPREAD) % 100}%`,
            '--size': `${SIZES[index % SIZES.length]}rem`,
            '--rise': `${GLITCH_HUB.rise + (index % 3) * 2}s`,
            '--delay': `${-index * GLITCH_HUB.gap}s`,
            '--drift': `${index % 2 ? 1 : -1}${2 + (index % 4)}rem`,
            '--tilt': `${(index % 2 ? 1 : -1) * (8 + (index % 3) * 6)}deg`,
          } as CSSProperties
        }
      >
        <GlitchMarkArt
          shape={(GLITCH_SHAPES as readonly string[]).includes(key) ? key : ''}
          label={(GLITCH_SHAPES as readonly string[]).includes(key) ? '' : key}
        />
      </svg>
    ))}
  </div>
)
