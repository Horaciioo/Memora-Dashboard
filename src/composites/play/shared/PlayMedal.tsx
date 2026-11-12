import { useId } from 'react'

import { PLAY_MEDAL } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Colour stops per place, light to deep
const TONES = {
  1: { light: 'var(--play-medal-first)', ribbon: 'var(--play-live)' },
  2: { light: 'var(--play-medal-second)', ribbon: 'var(--play-baccalaureat)' },
  3: { light: 'var(--play-medal-third)', ribbon: 'var(--play-golf)' },
} as const

const HEXAGON = 'M32 6 L52 17 L52 40 L32 51 L12 40 L12 17 Z'
const INNER = 'M32 11 L47.5 19.5 L47.5 37.5 L32 46 L16.5 37.5 L16.5 19.5 Z'

export interface PlayMedalProps {
  place: 1 | 2 | 3
  size?: keyof Omit<typeof PLAY_MEDAL, 'base'>
  className?: string
}

/**
 * Hexagon medal with its number and ribbon tails
 * @param {PlayMedalProps} props - Place and size
 * @return {JSX.Element}
 */

export const PlayMedal = ({ place, size = 'md', className }: PlayMedalProps) => {
  const id = useId()
  const tone = TONES[place]
  const deep = `color-mix(in srgb, ${tone.light} 55%, black)`

  return (
    <svg
      viewBox="0 0 64 64"
      className={cn(PLAY_MEDAL.base, PLAY_MEDAL[size], className)}
      role="img"
      aria-label={String(place)}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={`color-mix(in srgb, ${tone.light} 55%, white)`} />
          <stop offset="1" stopColor={tone.light} />
        </linearGradient>
      </defs>
      <path
        d="M20 40 L30 40 L30 60 L25 55 L20 60 Z"
        fill={tone.ribbon}
        stroke={deep}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M34 40 L44 40 L44 60 L39 55 L34 60 Z"
        fill={tone.ribbon}
        stroke={deep}
        strokeWidth="2"
        strokeLinejoin="round"
        opacity="0.8"
      />
      <path d={HEXAGON} fill={tone.light} stroke={deep} strokeWidth="3" strokeLinejoin="round" />
      <path
        d={INNER}
        fill={`url(#${id})`}
        stroke={`color-mix(in srgb, ${tone.light} 70%, white)`}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <text
        x="32"
        y="36"
        textAnchor="middle"
        fontSize="22"
        fontWeight="700"
        fill={deep}
        style={{ fontFamily: 'inherit' }}
      >
        {place}
      </text>
    </svg>
  )
}
