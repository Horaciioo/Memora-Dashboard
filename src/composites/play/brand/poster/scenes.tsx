import type { ReactNode } from 'react'

import { Sheen, Sparks, tint } from '@/composites/play/brand/poster/stage'

// Five on a die, cell units
const PIPS = [
  [-1, -1],
  [1, -1],
  [0, 0],
  [-1, 1],
  [1, 1],
]

// Dimples of the golf ball
const DIMPLES = [
  [-40, -20],
  [-10, -46],
  [24, -30],
  [-34, 18],
  [0, -4],
  [36, 6],
  [-6, 38],
  [30, 44],
  [58, -20],
  [-62, -4],
]

// Fanned word tiles
const FAN = [
  { letter: 'J', angle: -18, dx: -96, dy: 22, fill: '--play-jumble-tile' },
  { letter: 'M', angle: 16, dx: 96, dy: 22, fill: '--play-jumble-glow' },
  { letter: 'U', angle: 0, dx: 0, dy: -30, fill: '--play-gold' },
]

/**
 * Square letter tile with its thickness
 * @param {object} props - Letter, size and colours
 * @return {JSX.Element}
 */

const Tile = ({
  letter,
  size,
  fill,
  ink,
}: {
  letter: string
  size: number
  fill: string
  ink: string
}) => (
  <g>
    <rect
      x={-size / 2}
      y={-size / 2 + 12}
      width={size}
      height={size}
      rx={size / 5}
      {...tint(ink, 0.55)}
    />
    <rect x={-size / 2} y={-size / 2} width={size} height={size} rx={size / 5} {...tint(fill)} />
    <rect
      x={-size / 2 + 10}
      y={-size / 2 + 8}
      width={size - 20}
      height={size / 6}
      rx={size / 12}
      fill="white"
      opacity="0.35"
    />
    <text
      y={size * 0.24}
      textAnchor="middle"
      fontSize={size * 0.66}
      fontWeight="900"
      {...tint(ink)}
    >
      {letter}
    </text>
  </g>
)

// Hero of each backdrop key, drawn around 0 0
export const SCENES: Record<string, (tone: string) => ReactNode> = {
  'double-grid': (tone) => (
    <>
      <g transform="translate(84 -100) rotate(14)">
        <Tile letter="Z" size={84} fill="--play-gold" ink={`${tone}-deep`} />
      </g>
      <g transform="rotate(-8)">
        <Tile letter="A" size={178} fill="--echo-white" ink={`${tone}-deep`} />
      </g>
      <g transform="translate(-20 96) rotate(-36)">
        <rect x="-74" y="-10" width="128" height="20" rx="4" {...tint('--play-gold')} />
        <path d="M-74 -10L-102 0L-74 10z" {...tint('--play-jumble-tile')} />
        <path d="M-90 -4L-102 0L-90 4z" {...tint(`${tone}-deep`)} />
        <rect x="46" y="-10" width="20" height="20" rx="5" {...tint('--play-alert')} />
      </g>
      <Sparks />
    </>
  ),
  turf: (tone) => (
    <>
      <path d="M40 -150V-40" stroke="white" strokeWidth="7" strokeLinecap="round" />
      <path d="M43 -148h70l-20 22 20 22h-70z" {...tint('--play-ludo')} />
      <circle r="104" {...tint('--echo-white')} />
      <circle
        r="104"
        fill="none"
        strokeWidth="18"
        opacity="0.18"
        style={{ stroke: `var(${tone}-deep)` }}
      />
      {DIMPLES.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="9" {...tint(`${tone}-deep`, 0.12)} />
      ))}
      <Sheen radius={104} />
      <Sparks />
    </>
  ),
  fuse: () => (
    <>
      <circle r="118" {...tint('--play-night')} />
      <Sheen radius={118} />
      <path d="M56 62l-24-30 18 4-12-28 26 32-18-4z" {...tint('--play-gold', 0.9)} />
      <g transform="rotate(28 34 -118)">
        <rect x="6" y="-140" width="56" height="44" rx="10" {...tint('--play-night')} />
        <rect x="0" y="-134" width="64" height="12" rx="6" fill="white" opacity="0.22" />
      </g>
      <path
        d="M56 -134C80 -190 126 -202 142 -168"
        stroke="white"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
      />
      <Sparks />
    </>
  ),
  cards: (tone) => (
    <>
      <circle cx="74" cy="-74" r="64" {...tint('--echo-card-edge')} />
      <circle cx="74" cy="-74" r="56" {...tint('--echo-card')} />
      <circle cx="96" cy="-90" r="16" {...tint('--echo-pink')} />
      <circle r="112" {...tint('--echo-card-edge')} />
      <circle r="102" {...tint('--echo-card')} />
      <circle cx="-38" cy="-34" r="26" {...tint('--play-gold')} />
      <circle cx="34" cy="20" r="40" {...tint(tone)} />
      <circle cx="-34" cy="44" r="16" {...tint('--echo-pink')} />
      <path d="M22 -66l14 24h-28z" {...tint('--echo-red')} />
      <Sheen radius={112} />
      <Sparks />
    </>
  ),
  sketch: (tone) => (
    <>
      <g transform="rotate(-8)">
        <rect x="-118" y="-96" width="236" height="192" rx="18" {...tint('--croquis-paper')} />
        <path
          d="M-90 50c26-64 52-64 78 0s52 36 70-26 34-44 52-8"
          fill="none"
          strokeWidth="12"
          strokeLinecap="round"
          style={{ stroke: 'var(--croquis-blue)' }}
        />
        <circle cx="-50" cy="-40" r="24" {...tint('--croquis-yellow')} />
        <path
          d="M50 -50l22 40h-44z"
          fill="none"
          strokeWidth="9"
          strokeLinejoin="round"
          style={{ stroke: 'var(--croquis-red)' }}
        />
      </g>
      <g transform="translate(74 -150) rotate(32)">
        <rect width="30" height="140" rx="6" {...tint(tone)} />
        <rect width="10" height="140" rx="5" fill="white" opacity="0.3" />
        <path d="M0 140h30l-15 36z" {...tint('--croquis-paper')} />
        <path d="M9 162h12l-6 14z" {...tint('--croquis-black')} />
        <rect width="30" height="20" rx="6" {...tint('--play-gold')} />
      </g>
      <Sparks />
    </>
  ),
  twins: (tone) => (
    <>
      <g transform="rotate(42)">
        <rect x="88" y="-16" width="96" height="32" rx="14" {...tint('--play-night')} />
        <rect x="96" y="-14" width="80" height="8" rx="4" fill="white" opacity="0.2" />
      </g>
      <circle r="104" {...tint('--play-night')} />
      <circle r="84" {...tint('--glitch-paper')} />
      <circle cx="-28" cy="-20" r="24" {...tint('--glitch-c3')} />
      <path d="M8 34l30-52 30 52z" {...tint('--glitch-c1')} />
      <rect x="-44" y="22" width="34" height="34" rx="8" {...tint(`${tone}-deep`)} />
      <circle
        r="84"
        fill="none"
        strokeWidth="6"
        opacity="0.5"
        style={{ stroke: `var(${tone}-glow)` }}
      />
      <Sheen radius={104} />
      <Sparks />
    </>
  ),
  tiles: () => (
    <>
      {FAN.map((tile) => (
        <g key={tile.letter} transform={`translate(${tile.dx} ${tile.dy}) rotate(${tile.angle})`}>
          <Tile
            letter={tile.letter}
            size={tile.letter === 'U' ? 140 : 116}
            fill={tile.fill}
            ink="--play-jumble-tile-ink"
          />
        </g>
      ))}
      <Sparks />
    </>
  ),
  board: (tone) => (
    <>
      <g transform="rotate(-12)">
        <rect x="-86" y="-74" width="172" height="172" rx="34" {...tint(`${tone}-deep`)} />
        <rect x="-86" y="-86" width="172" height="172" rx="34" {...tint('--echo-white')} />
        {PIPS.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x * 44} cy={y * 44} r="15" {...tint('--play-night')} />
        ))}
        <rect x="-66" y="-78" width="132" height="16" rx="8" fill="white" opacity="0.6" />
      </g>
      <g transform="translate(-112 52)">
        <ellipse cy="40" rx="34" ry="10" fill="black" opacity="0.25" />
        <path d="M-30 40C-26 6-14-8 0-8s26 14 30 48z" {...tint('--play-ludo')} />
        <circle cy="-24" r="22" {...tint('--play-ludo')} />
        <circle cx="-7" cy="-31" r="7" fill="white" opacity="0.45" />
      </g>
      <Sparks />
    </>
  ),
  sea: (tone) => (
    <>
      <circle r="114" {...tint('--play-naval-night')} />
      {[84, 56, 28].map((r) => (
        <circle
          key={r}
          r={r}
          fill="none"
          strokeWidth="2"
          opacity="0.4"
          style={{ stroke: `var(${tone}-glow)` }}
        />
      ))}
      <path
        d="M-114 0H114M0-114V114"
        strokeWidth="2"
        opacity="0.3"
        style={{ stroke: `var(${tone}-glow)` }}
      />
      <path d="M0 0L0 -114A114 114 0 0 1 98 -58z" {...tint(`${tone}-glow`, 0.3)} />
      <circle cx="48" cy="-40" r="12" {...tint('--play-naval-hit')} />
      <circle cx="48" cy="-40" r="5" fill="white" />
      <circle cx="-44" cy="36" r="8" {...tint(`${tone}-glow`, 0.8)} />
      <Sheen radius={114} />
      <Sparks />
    </>
  ),
}

// Hero of a game kept secret
export const MYSTERY_SCENE = (
  <>
    <circle r="110" {...tint('--play-night')} />
    <text y="56" textAnchor="middle" fontSize="170" fontWeight="900" fill="white" opacity="0.9">
      ?
    </text>
    <Sheen radius={110} />
  </>
)
