import type { ReactNode } from 'react'

import { GOLF_BANNER } from '@/declarations/play/golf/banner'

/**
 * Sunset links: sky, sun, haze and dune ridges, the flag on the near green
 * @param {object} props - Id prefix and the tracer layer
 * @return {JSX.Element}
 */

export const GolfLinks = ({ id, tracer }: { id: string; tracer?: ReactNode }) => {
  const { sun, dunes, tufts, flag } = GOLF_BANNER

  return (
    <g>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--golf-dusk-top)' }} />
          <stop offset="0.5" style={{ stopColor: 'var(--golf-dusk-mid)' }} />
          <stop offset="0.7" style={{ stopColor: 'var(--golf-dusk-low)' }} />
        </linearGradient>
        <radialGradient id={`${id}-halo`}>
          <stop offset="0" style={{ stopColor: 'var(--golf-sun)' }} stopOpacity="0.55" />
          <stop offset="1" style={{ stopColor: 'var(--golf-sun)' }} stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}-glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="soft" />
          <feMerge>
            <feMergeNode in="soft" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="1600" height="900" fill={`url(#${id}-sky)`} />
      <circle cx={sun.x} cy={sun.y} r={sun.r * 3} fill={`url(#${id}-halo)`} />
      <circle cx={sun.x} cy={sun.y} r={sun.r} style={{ fill: 'var(--golf-sun)' }} />
      {[0.82, 0.9].map((share) => (
        <rect
          key={share}
          x={sun.x - sun.r}
          y={sun.y - sun.r * (1 - share * 2)}
          width={sun.r * 2}
          height="5"
          style={{ fill: 'var(--golf-dusk-low)' }}
        />
      ))}
      {dunes.slice(0, 3).map((dune) => (
        <path key={dune.token} d={dune.d} style={{ fill: `var(${dune.token})` }} />
      ))}
      <g transform={`translate(${flag.x} ${flag.y})`}>
        <ellipse rx="70" ry="9" style={{ fill: 'var(--golf-dune-mid)' }} />
        <rect x="-2" y="-110" width="4" height="110" style={{ fill: 'var(--golf-dune-front)' }} />
        <path d="M2 -110L52 -96L2 -82Z" style={{ fill: 'var(--play-alert)' }} />
      </g>
      {tracer}
      <path d={dunes[3].d} style={{ fill: `var(${dunes[3].token})` }} />
      <g
        style={{ stroke: 'var(--golf-dune-front)' }}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      >
        {tufts.map((x) => (
          <path key={x} d={`M${x} 800q-6 -26 -14 -40M${x} 800q2 -30 6 -46M${x} 800q8 -22 18 -32`} />
        ))}
      </g>
    </g>
  )
}
