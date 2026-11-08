'use client'

import { useId } from 'react'
import type { ReactNode } from 'react'

// Dark navy outline, like the game's chunky borders
const INK = '#14213d'

// Raised height of a face over its lip
const LIFT = 2

// One material, one accent: ivory pieces, violet details, a touch of gold
const IVORY = { face: '#f7f2e8', lip: '#c8bca7' }
const VIOLET = { face: '#9b7fe8', lip: '#6a4cc9' }
const GOLD = { face: '#f7c54f', lip: '#c98f1c' }

export type PlayTabGlyphName = 'group' | 'feed' | 'home' | 'lounge' | 'ranking' | 'stats'

// Header keys, same style
export type PlayKeyGlyphName = 'online' | 'live' | 'settings'

/**
 * Chunk props, one raised piece
 * @typedef {Object} ChunkProps
 */

interface ChunkProps {
  d: string
  // Face colour and the darker lip under it
  face: string
  lip: string
  border?: number
}

/**
 * Raised piece: thick border, solid lip below, bright face above
 * @param {ChunkProps} props - Shape
 * @return {JSX.Element}
 */

const Chunk = ({ d, face, lip, border = 3.6 }: ChunkProps) => {
  const id = useId().replace(/:/g, '')

  return (
    <>
      <defs>
        <clipPath id={`${id}c`}>
          <path d={d} />
        </clipPath>
      </defs>
      <path
        d={d}
        fill={INK}
        stroke={INK}
        strokeWidth={border}
        strokeLinejoin="round"
        transform="translate(0 1)"
      />
      <path d={d} fill={lip} />
      <g clipPath={`url(#${id}c)`}>
        <g transform={`translate(0 -${LIFT})`}>
          <path d={d} fill={face} />
        </g>
      </g>
    </>
  )
}

// White specular on a face
const Gleam = ({ d }: { d: string }) => (
  <path
    d={d}
    fill="none"
    stroke="#fff"
    strokeOpacity="0.75"
    strokeWidth="2"
    strokeLinecap="round"
  />
)

// Round dot as a path, for Chunk
const dot = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0z`

// Clan shield with a violet crest
const Group = () => (
  <>
    <Chunk d="M24 5 38 9.500v12c0 9-5.500 15-14 19-8.500-4-14-10-14-19v-12z" {...IVORY} />
    <Chunk
      d="M24 14 31.500 17v5c0 5-3 8-7.500 10.500-4.500-2.500-7.500-5.500-7.500-10.500v-5z"
      {...VIOLET}
      border={2.6}
    />
  </>
)

// Envelope sealed in violet
const Feed = () => (
  <>
    <Chunk d="M7 13a3 3 0 0 1 3-3h28a3 3 0 0 1 3 3v21a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3z" {...IVORY} />
    <path
      d="M9 13.500 24 26 39 13.500"
      fill="none"
      stroke={INK}
      strokeWidth="2.600"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Chunk d={dot(24, 26.5, 4.5)} {...VIOLET} border={2.6} />
  </>
)

// Game pad, tinted per use
const Pad = ({ face, lip }: { face: string; lip: string }) => (
  <>
    <Chunk
      d="M12 14h24c4 0 6.500 3 7.500 9.500l1 7c.5 4-1.500 6.500-4.500 6.500-2.500 0-4-1.500-5.500-4H13.500c-1.500 2.500-3 4-5.500 4-3 0-5-2.500-4.500-6.500l1-7C5.500 17 8 14 12 14z"
      face={face}
      lip={lip}
    />
    <path d="M13 22.500v6M10 25.500h6" stroke={INK} strokeWidth="2.800" strokeLinecap="round" />
    <Chunk d={dot(33.5, 23, 2.2)} {...VIOLET} border={2} />
    <Chunk d={dot(37.5, 27.5, 2.2)} {...GOLD} border={2} />
  </>
)

const Home = () => <Pad {...IVORY} />

// Tables being played
const Live = () => <Pad {...IVORY} />

// Three players, the front one in violet
const Online = () => (
  <>
    <Chunk d={dot(12, 17, 5)} {...IVORY} border={3} />
    <Chunk d="M3 37v-3c0-5 4-8 9-8s9 3 9 8v3z" {...IVORY} border={3} />
    <Chunk d={dot(36, 17, 5)} {...IVORY} border={3} />
    <Chunk d="M27 37v-3c0-5 4-8 9-8s9 3 9 8v3z" {...IVORY} border={3} />
    <Chunk d={dot(24, 15, 6.5)} {...VIOLET} />
    <Chunk d="M11 43v-4c0-6 5-10 13-10s13 4 13 10v4z" {...VIOLET} />
  </>
)

// Eight-tooth gear path around 24 24
const GEAR = Array.from({ length: 32 }, (_, i) => {
  const angle = (i * Math.PI) / 16
  const radius = Math.floor(i / 2) % 2 === 0 ? 19 : 14
  return `${(24 + radius * Math.cos(angle)).toFixed(2)} ${(24 + radius * Math.sin(angle)).toFixed(2)}`
})

// Steel gear with a hole
const Settings = () => (
  <>
    <Chunk d={`M${GEAR.join('L')}z`} {...IVORY} />
    <Chunk d={dot(24, 24, 6)} {...VIOLET} border={3} />
  </>
)

// Gold trophy on an ivory base
const Ranking = () => (
  <>
    <path
      d="M14 12c-6 0-6.500 9 1.500 10.500M34 12c6 0 6.500 9-1.500 10.500"
      fill="none"
      stroke={INK}
      strokeWidth="5.800"
      strokeLinecap="round"
    />
    <path
      d="M14 12c-6 0-6.500 9 1.500 10.500M34 12c6 0 6.500 9-1.500 10.500"
      fill="none"
      stroke={GOLD.face}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Chunk d="M13 6h22v10c0 7.500-4.500 12.500-11 12.500S13 23.500 13 16z" {...GOLD} />
    <Gleam d="M17 10v6" />
    <Chunk d="M21 28h6l1 6h-8z" {...GOLD} border={3} />
    <Chunk
      d="M14 34h20a1 1 0 0 1 1 1v4a2 2 0 0 1-2 2H15a2 2 0 0 1-2-2v-4a1 1 0 0 1 1-1z"
      {...IVORY}
    />
  </>
)

// Podium of three steps, winner in violet
const Stats = () => (
  <>
    <Chunk d="M4 25h10v16H4z" {...IVORY} border={3.6} />
    <Chunk d="M19 14h10v27H19z" {...VIOLET} border={3.6} />
    <Chunk d="M34 29h10v12H34z" {...IVORY} border={3.6} />
  </>
)

const ART: Record<PlayTabGlyphName | PlayKeyGlyphName, () => ReactNode> = {
  group: Group,
  feed: Feed,
  home: Home,
  lounge: Online,
  ranking: Ranking,
  stats: Stats,
  online: Online,
  live: Live,
  settings: Settings,
}

/**
 * Tab sprite of Play: chunky raised pieces on a dark border
 * @param {Object} props - Glyph
 * @param {PlayTabGlyphName | PlayKeyGlyphName} props.name - Which tab
 * @param {boolean} [props.isOn] - Open tab
 * @param {string} [props.className] - Size
 * @return {JSX.Element}
 */

export const PlayTabGlyph = ({
  name,
  className,
}: {
  name: PlayTabGlyphName | PlayKeyGlyphName
  isOn?: boolean
  className?: string
}) => {
  const Art = ART[name]

  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" overflow="visible">
      <Art />
    </svg>
  )
}
