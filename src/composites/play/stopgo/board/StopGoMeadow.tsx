import { memo, useMemo } from 'react'

import { meadowOf } from '@/core/lib/play/stopgo'
import type { StopGoMeadowItem, StopGoTrackPlan } from '@/core/lib/play/stopgo'
import { STOPGO_MEADOW } from '@/declarations/play/stopgo/track'

export interface StopGoMeadowProps {
  plan: StopGoTrackPlan
  seed: string
  map: number
}

/**
 * One drawn piece of meadow
 * @param {StopGoMeadowItem} item - Piece
 * @return {JSX.Element}
 */

const Piece = ({ kind, x, y, size, tilt }: StopGoMeadowItem) => {
  const place = `translate(${x.toFixed(1)} ${y.toFixed(1)})`

  // Darker, softer patch of grass
  if (kind === 'patch') {
    return (
      <ellipse
        transform={place}
        rx={size}
        ry={size * 0.55}
        style={{ fill: 'var(--stopgo-grass-deep)' }}
        opacity="0.22"
      />
    )
  }

  // Flower: petals around a gold heart
  if (kind === 'flower') {
    const petal = STOPGO_MEADOW.petals[Math.floor(tilt * STOPGO_MEADOW.petals.length)]

    return (
      <g transform={place}>
        {[0, 72, 144, 216, 288].map((angle) => (
          <circle
            key={angle}
            cx={Math.cos((angle * Math.PI) / 180) * size}
            cy={Math.sin((angle * Math.PI) / 180) * size}
            r={size * 0.75}
            fill={petal}
          />
        ))}
        <circle r={size * 0.7} style={{ fill: 'var(--stopgo-gold)' }} />
      </g>
    )
  }

  // Tuft: three curved blades
  const lean = (tilt - 0.5) * size * 0.8

  return (
    <g transform={place} fill="none" strokeLinecap="round" strokeWidth={size * 0.2}>
      <path
        d={`M${-size * 0.5} 0Q${-size * 0.5 + lean} ${-size * 0.6} ${-size * 0.7 + lean} ${-size}`}
        style={{ stroke: 'var(--stopgo-grass-deep)' }}
      />
      <path
        d={`M0 0Q${lean} ${-size * 0.7} ${lean * 1.3} ${-size * 1.25}`}
        style={{ stroke: 'var(--stopgo-grass-deep)' }}
      />
      <path
        d={`M${size * 0.5} 0Q${size * 0.5 + lean} ${-size * 0.6} ${size * 0.7 + lean} ${-size}`}
        style={{ stroke: 'color-mix(in srgb, var(--stopgo-grass) 60%, white)' }}
      />
    </g>
  )
}

/**
 * Hand-drawn meadow of one map: grass patches, tufts and little flowers
 * @param {StopGoMeadowProps} props - Track, seed and map
 * @return {JSX.Element}
 */

export const StopGoMeadow = memo(({ plan, seed, map }: StopGoMeadowProps) => {
  const items = useMemo(() => meadowOf(plan, seed, map), [plan, seed, map])

  return (
    <g>
      {items.map((item) => (
        <Piece key={item.id} {...item} />
      ))}
    </g>
  )
})

StopGoMeadow.displayName = 'StopGoMeadow'
