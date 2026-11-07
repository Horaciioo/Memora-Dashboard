'use client'

import { useId } from 'react'
import type { ReactNode } from 'react'

// Dark navy outline, like the game's chunky borders
const INK = '#14213d'

// Raised height of a face over its lip
const LIFT = 2.2

export type PlayTabGlyphName = 'group' | 'feed' | 'home' | 'ranking' | 'stats'

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

const Chunk = ({ d, face, lip, border = 5 }: ChunkProps) => {
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

// Clan shield with a star
const Group = () => (
  <>
    <Chunk
      d="M24 5 38 9.500v12c0 9-5.500 15-14 19-8.500-4-14-10-14-19v-12z"
      face="#4d8dff"
      lip="#2455c9"
    />
    <Gleam d="M15 12.500v6" />
    <Chunk
      d="M24 14l2.600 5.300 5.800.8-4.200 4.100 1 5.800L24 27.200l-5.200 2.800 1-5.800-4.200-4.100 5.800-.8z"
      face="#ffd23f"
      lip="#e29a0b"
      border={3}
    />
  </>
)

// Invitation envelope
const Feed = () => (
  <>
    <Chunk
      d="M7 13a3 3 0 0 1 3-3h28a3 3 0 0 1 3 3v21a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3z"
      face="#fff6d6"
      lip="#e8c566"
    />
    <path
      d="M9 13.500 24 26 39 13.500"
      fill="none"
      stroke={INK}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Chunk d={dot(24, 27, 5.5)} face="#ff5468" lip="#c92a45" border={3} />
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
    <path d="M13 22.500v6M10 25.500h6" stroke={INK} strokeWidth="3.200" strokeLinecap="round" />
    <Chunk d={dot(33.5, 23, 2.2)} face="#ffd23f" lip="#e29a0b" border={2} />
    <Chunk d={dot(37.5, 27.5, 2.2)} face="#ff5f98" lip="#d02f6e" border={2} />
  </>
)

const Home = () => <Pad face="#b57bff" lip="#7a3fe0" />

// Tables being played
const Live = () => <Pad face="#3fd38a" lip="#17995c" />

// Three players, the front one in gold
const Online = () => (
  <>
    <Chunk d={dot(12, 17, 5)} face="#4d8dff" lip="#2455c9" border={4} />
    <Chunk d="M3 37v-3c0-5 4-8 9-8s9 3 9 8v3z" face="#4d8dff" lip="#2455c9" border={4} />
    <Chunk d={dot(36, 17, 5)} face="#ff7aa8" lip="#d02f6e" border={4} />
    <Chunk d="M27 37v-3c0-5 4-8 9-8s9 3 9 8v3z" face="#ff7aa8" lip="#d02f6e" border={4} />
    <Chunk d={dot(24, 15, 6.5)} face="#ffd23f" lip="#e29a0b" />
    <Chunk d="M11 43v-4c0-6 5-10 13-10s13 4 13 10v4z" face="#ffd23f" lip="#e29a0b" />
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
    <Chunk d={`M${GEAR.join('L')}z`} face="#9aa4b8" lip="#5b6578" />
    <Chunk d={dot(24, 24, 7)} face="#e9edf5" lip="#b6bfd0" border={4} />
  </>
)

// Gold trophy
const Ranking = () => (
  <>
    <path
      d="M14 12c-6 0-6.500 9 1.500 10.500M34 12c6 0 6.500 9-1.500 10.500"
      fill="none"
      stroke={INK}
      strokeWidth="6.500"
      strokeLinecap="round"
    />
    <path
      d="M14 12c-6 0-6.500 9 1.500 10.500M34 12c6 0 6.500 9-1.500 10.500"
      fill="none"
      stroke="#ffd23f"
      strokeWidth="2.200"
      strokeLinecap="round"
    />
    <Chunk
      d="M13 6h22v10c0 7.500-4.500 12.500-11 12.500S13 23.500 13 16z"
      face="#ffd23f"
      lip="#e29a0b"
    />
    <Gleam d="M17 10v6" />
    <Chunk d="M21 28h6l1 6h-8z" face="#ffd23f" lip="#e29a0b" border={3} />
    <Chunk
      d="M14 34h20a1 1 0 0 1 1 1v4a2 2 0 0 1-2 2H15a2 2 0 0 1-2-2v-4a1 1 0 0 1 1-1z"
      face="#b57bff"
      lip="#7a3fe0"
    />
  </>
)

// Podium of three steps
const Stats = () => (
  <>
    <Chunk d="M4 25h10v16H4z" face="#ff7aa8" lip="#d02f6e" border={4.5} />
    <Chunk d="M19 14h10v27H19z" face="#ffd23f" lip="#e29a0b" border={4.5} />
    <Chunk d="M34 29h10v12H34z" face="#4d8dff" lip="#2455c9" border={4.5} />
  </>
)

const ART: Record<PlayTabGlyphName | PlayKeyGlyphName, () => ReactNode> = {
  group: Group,
  feed: Feed,
  home: Home,
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
