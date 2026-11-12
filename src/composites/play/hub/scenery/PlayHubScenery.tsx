import { tint } from '@/composites/play/brand/poster/stage'
import { SCENERY_SETS } from '@/composites/play/hub/scenery/sets'
import { PLAY_HUB } from '@/declarations/ui/variants'

// Rays behind the set
const RAYS = Array.from({ length: 18 }, (_, index) => index * 20)

export interface PlayHubSceneryProps {
  // Set key, also the tone suffix
  set: 'echo' | 'croquis' | 'glitch' | 'jumble'
}

/**
 * Painted ground of a game hub: rays, halo, a blurred horizon and the set at the corners
 * @param {PlayHubSceneryProps} props - Set
 * @return {JSX.Element}
 */

export const PlayHubScenery = ({ set }: PlayHubSceneryProps) => {
  const tone = `--play-${set}`
  const { far, near } = SCENERY_SETS[set]

  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMax slice"
      className={PLAY_HUB.scenery}
      aria-hidden="true"
    >
      <defs>
        <filter id={`play-scenery-far-${set}`}>
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <filter id={`play-scenery-near-${set}`} x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="18" stdDeviation="16" floodColor="black" floodOpacity="0.45" />
        </filter>
        <linearGradient id={`play-scenery-fog-${set}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: `var(${tone}-dusk)`, stopOpacity: 0 }} />
          <stop offset="1" style={{ stopColor: `var(${tone}-night)`, stopOpacity: 0.85 }} />
        </linearGradient>
      </defs>
      <g transform="translate(800 920)">
        <g className="play-scenery-rays" {...tint(`${tone}-glow`, 0.05)}>
          {RAYS.map((angle) => (
            <path key={angle} d="M0 0L-60 -1300H60z" transform={`rotate(${angle})`} />
          ))}
        </g>
      </g>
      <ellipse cx="800" cy="920" rx="760" ry="300" {...tint(tone, 0.28)} />
      <g filter={`url(#play-scenery-far-${set})`} opacity="0.4">
        {far}
      </g>
      <rect y="620" width="1600" height="280" fill={`url(#play-scenery-fog-${set})`} />
      <g filter={`url(#play-scenery-near-${set})`}>{near}</g>
    </svg>
  )
}
