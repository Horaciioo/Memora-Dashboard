import type { ReactNode } from 'react'

import { STOPGO_BANNER } from '@/declarations/play/stopgo/banner'

interface Place {
  x: number
  y: number
  size: number
}

/**
 * Dusk sky, grass and the road running to the horizon
 * @param {object} props - Id prefix, size, vanishing point and lane slot
 * @return {JSX.Element}
 */

export const StopGoRoad = ({
  id,
  width,
  height,
  vanish,
  lane,
}: {
  id: string
  width: number
  height: number
  vanish: number
  lane?: ReactNode
}) => {
  const horizon = height * STOPGO_BANNER.horizon
  const half = width * STOPGO_BANNER.spread

  return (
    <g>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--stopgo-dusk-top)' }} />
          <stop offset="1" style={{ stopColor: 'var(--stopgo-dusk-low)' }} />
        </linearGradient>
      </defs>
      <rect width={width} height={horizon} fill={`url(#${id}-sky)`} />
      <circle
        cx={vanish}
        cy={horizon}
        r={height * 0.12}
        style={{ fill: 'var(--stopgo-gold)' }}
        opacity="0.9"
      />
      <rect
        y={horizon}
        width={width}
        height={height - horizon}
        style={{ fill: 'var(--stopgo-grass-deep)' }}
      />
      <path
        d={`M${vanish - 2} ${horizon}L${vanish - half} ${height}H${vanish + half}L${vanish + 2} ${horizon}Z`}
        style={{ fill: 'var(--stopgo-asphalt)' }}
      />
      {[-1, 1].map((side) => (
        <path
          key={side}
          d={`M${vanish + side * 3} ${horizon}L${vanish + side * half * 0.94} ${height}`}
          style={{ stroke: 'var(--stopgo-line)' }}
          strokeWidth={width / 220}
        />
      ))}
      {lane ?? (
        <path
          d={`M${vanish} ${horizon}L${vanish} ${height}`}
          style={{ stroke: 'var(--stopgo-line)' }}
          strokeWidth={width / 160}
          strokeDasharray={`${height / 14} ${height / 14}`}
        />
      )}
    </g>
  )
}

/**
 * French kilometre stone: white body, red cap, road and distance
 * @param {object} props - Place
 * @return {JSX.Element}
 */

export const StopGoStone = ({ place }: { place: Place }) => (
  <g
    transform={`translate(${place.x} ${place.y}) scale(${place.size})`}
    textAnchor="middle"
    fontWeight="900"
  >
    <ellipse cy="96" rx="80" ry="14" fill="black" opacity="0.3" />
    <path d="M-60 96V-30C-60 -80 60 -80 60 -30V96Z" style={{ fill: 'var(--stopgo-sign)' }} />
    <path d="M-60 -24C-60 -86 60 -86 60 -24Z" style={{ fill: 'var(--play-stopgo)' }} />
    <text y="-36" fontSize="30" style={{ fill: 'var(--stopgo-sign)' }}>
      {STOPGO_BANNER.stone.road}
    </text>
    <text y="34" fontSize="44" style={{ fill: 'var(--stopgo-card-ink)' }}>
      {STOPGO_BANNER.stone.km}
    </text>
    <path d="M60 -30V96H44V-20Z" fill="black" opacity="0.12" />
  </g>
)

/**
 * Danger sign on its pole, a car skidding inside
 * @param {object} props - Place
 * @return {JSX.Element}
 */

export const StopGoSign = ({ place }: { place: Place }) => (
  <g transform={`translate(${place.x} ${place.y}) scale(${place.size})`}>
    <rect
      x="-6"
      y="0"
      width="12"
      height="230"
      style={{ fill: 'var(--stopgo-kerb-white)' }}
      opacity="0.8"
    />
    <path d="M0 -120L104 60H-104Z" style={{ fill: 'var(--play-stopgo)' }} strokeLinejoin="round" />
    <path d="M0 -84L76 46H-76Z" style={{ fill: 'var(--stopgo-sign)' }} />
    <path
      d="M-14 -38H14L22 -24H-22ZM-30 -24H30V-3Q30 0 27 0H-27Q-30 0 -30 -3ZM-32 -9H-24V4H-32ZM24 -9H32V4H24Z"
      style={{ fill: 'var(--stopgo-card-ink)' }}
    />
    <path d="M-10 -35H10L15 -27H-15Z" style={{ fill: 'var(--stopgo-sign)' }} />
    <path
      d="M-18 9C-4 17 -32 27 -18 36M18 9C32 17 4 27 18 36"
      fill="none"
      style={{ stroke: 'var(--stopgo-card-ink)' }}
      strokeWidth="5"
      strokeLinecap="round"
    />
  </g>
)

/**
 * Traffic light housing; lamps given as children so the banner can cycle them
 * @param {object} props - Place and lamp states
 * @return {JSX.Element}
 */

export const StopGoLight = ({ place, lamps }: { place: Place; lamps?: ReactNode }) => (
  <g transform={`translate(${place.x} ${place.y}) scale(${place.size})`}>
    <rect x="-8" y="150" width="16" height="320" style={{ fill: 'var(--stopgo-asphalt-deep)' }} />
    <rect
      x="-46"
      y="-20"
      width="92"
      height="190"
      rx="22"
      style={{ fill: 'var(--stopgo-asphalt-deep)' }}
    />
    {[20, 76, 132].map((y) => (
      <circle key={y} cy={y} r="22" fill="black" opacity="0.55" />
    ))}
    {lamps ?? <circle cy="132" r="22" style={{ fill: 'var(--stopgo-go)' }} />}
  </g>
)
