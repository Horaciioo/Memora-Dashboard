import type { ReactNode } from 'react'

import { tint } from '@/composites/play/brand/poster/stage'

export interface ScenerySet {
  // Blurred layer on the horizon
  far: ReactNode
  // Sharp layer at the screen corners
  near: ReactNode
}

/**
 * Letter tile with its thickness
 * @param {object} props - Place, letter, size and colour
 * @return {JSX.Element}
 */

const Tile = ({
  x,
  y,
  r = 0,
  size,
  letter,
  fill,
}: {
  x: number
  y: number
  r?: number
  size: number
  letter: string
  fill: string
}) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`}>
    <rect
      x={-size / 2}
      y={-size / 2 + size * 0.1}
      width={size}
      height={size}
      rx={size / 5}
      {...tint('--play-jumble-tile-deep')}
    />
    <rect x={-size / 2} y={-size / 2} width={size} height={size} rx={size / 5} {...tint(fill)} />
    <rect
      x={-size / 2 + size * 0.12}
      y={-size / 2 + size * 0.08}
      width={size * 0.76}
      height={size / 7}
      rx={size / 14}
      fill="white"
      opacity="0.4"
    />
    <text
      y={size * 0.24}
      textAnchor="middle"
      fontSize={size * 0.66}
      fontWeight="900"
      {...tint('--play-jumble-tile-ink')}
    >
      {letter}
    </text>
  </g>
)

/**
 * Round Echo card with symbols
 * @param {object} props - Centre and radius
 * @return {JSX.Element}
 */

const Card = ({ x, y, r }: { x: number; y: number; r: number }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r} {...tint('--echo-card-edge')} />
    <circle r={r * 0.94} cy={-r * 0.04} {...tint('--echo-card')} />
    <circle cx={-r * 0.38} cy={-r * 0.36} r={r * 0.22} {...tint('--play-gold')} />
    <circle cx={r * 0.3} cy={r * 0.16} r={r * 0.34} {...tint('--play-echo')} />
    <circle cx={-r * 0.32} cy={r * 0.4} r={r * 0.15} {...tint('--echo-pink')} />
    <path
      d={`M${r * 0.2} ${-r * 0.66}l${r * 0.16} ${r * 0.28}h${-r * 0.32}z`}
      {...tint('--echo-red')}
    />
    <circle cx={r * 0.62} cy={-r * 0.36} r={r * 0.1} {...tint('--echo-orange')} />
  </g>
)

/**
 * Spot-the-difference card
 * @param {object} props - Place, angle and the odd colour
 * @return {JSX.Element}
 */

const Spot = ({ x, y, r, odd }: { x: number; y: number; r: number; odd: string }) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`}>
    <rect x="-170" y="-110" width="340" height="220" rx="28" {...tint('--glitch-paper')} />
    <circle cx="-90" cy="-20" r="42" {...tint(odd)} />
    <path d="M-10 50l55-95 55 95z" {...tint('--glitch-c1')} />
    <rect x="-130" y="40" width="50" height="50" rx="12" {...tint('--glitch-c4')} />
    <circle cx="120" cy="-60" r="18" {...tint('--glitch-c2')} />
  </g>
)

/**
 * Drawing sheet with one doodle
 * @param {object} props - Place, angle, size and doodle colour
 * @return {JSX.Element}
 */

const Sheet = ({
  x,
  y,
  r,
  w,
  stroke,
}: {
  x: number
  y: number
  r: number
  w: number
  stroke: string
}) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`}>
    <rect
      x={-w / 2}
      y={-w * 0.38}
      width={w}
      height={w * 0.76}
      rx={w / 16}
      {...tint('--croquis-paper')}
    />
    <path
      d={`M${-w * 0.36} ${w * 0.16}c${w * 0.1}-${w * 0.3} ${w * 0.2}-${w * 0.3} ${w * 0.3} 0s${w * 0.2} ${w * 0.16} ${w * 0.4}-${w * 0.2}`}
      fill="none"
      strokeWidth={w / 22}
      strokeLinecap="round"
      style={{ stroke: `var(${stroke})` }}
    />
    <circle cx={w * 0.26} cy={-w * 0.18} r={w / 12} {...tint('--croquis-yellow')} />
    <rect
      x={-w * 0.44}
      y={-w * 0.44}
      width={w * 0.14}
      height={w * 0.1}
      rx="4"
      {...tint('--play-gold', 0.8)}
    />
  </g>
)

// Fixed tile piles, letters chosen to read as jumbled words
const FAR_TILES = 'MOTSENVRACLETTRE'.split('')
const PILE_LEFT = [
  { x: 90, y: 860, r: -8, size: 150, letter: 'J', fill: '--play-jumble-tile' },
  { x: 250, y: 880, r: 10, size: 130, letter: 'U', fill: '--play-gold' },
  { x: 150, y: 720, r: 6, size: 120, letter: 'M', fill: '--play-jumble-glow' },
]
const PILE_RIGHT = [
  { x: 1510, y: 860, r: 9, size: 150, letter: 'B', fill: '--play-jumble-glow' },
  { x: 1350, y: 890, r: -12, size: 120, letter: 'L', fill: '--play-jumble-tile' },
  { x: 1450, y: 720, r: -6, size: 110, letter: 'E', fill: '--play-gold' },
]

// Set of each hub ground, on a 1600 × 900 canvas
export const SCENERY_SETS: Record<string, ScenerySet> = {
  echo: {
    far: [200, 520, 820, 1110, 1400].map((x, index) => (
      <Card key={x} x={x} y={830 - (index % 2) * 50} r={110 + (index % 3) * 20} />
    )),
    near: (
      <>
        <g className="play-scenery-bob">
          <Card x={150} y={880} r={230} />
        </g>
        <g className="play-scenery-bob play-scenery-late">
          <Card x={1460} y={860} r={200} />
        </g>
      </>
    ),
  },
  croquis: {
    far: [180, 470, 800, 1120, 1420].map((x, index) => (
      <Sheet
        key={x}
        x={x}
        y={800 - (index % 2) * 60}
        r={(index % 2 ? 1 : -1) * 7}
        w={260}
        stroke={index % 2 ? '--croquis-red' : '--croquis-blue'}
      />
    )),
    near: (
      <>
        <Sheet x={190} y={860} r={-10} w={460} stroke="--croquis-blue" />
        <g className="play-scenery-sway" transform="translate(1360 560) rotate(38)">
          <rect width="70" height="420" rx="14" {...tint('--play-croquis')} />
          <rect width="24" height="420" rx="10" fill="white" opacity="0.3" />
          <path d="M0 420h70l-35 90z" {...tint('--croquis-paper')} />
          <path d="M22 474h26l-13 36z" {...tint('--croquis-black')} />
          <rect width="70" height="56" rx="14" {...tint('--play-gold')} />
        </g>
        {['--croquis-red', '--croquis-blue', '--croquis-yellow'].map((color, index) => (
          <rect
            key={color}
            x={1180 + index * 70}
            y={850 - index * 6}
            width="40"
            height="180"
            rx="12"
            transform={`rotate(${70 + index * 8} ${1200 + index * 70} 870)`}
            {...tint(color)}
          />
        ))}
      </>
    ),
  },
  glitch: {
    far: [220, 620, 1000, 1380].map((x, index) => (
      <Spot
        key={x}
        x={x}
        y={800 - (index % 2) * 60}
        r={(index % 2 ? 1 : -1) * 6}
        odd={index % 2 ? '--glitch-c3' : '--glitch-c0'}
      />
    )),
    near: (
      <>
        <Spot x={170} y={840} r={-8} odd="--glitch-c3" />
        <Spot x={1430} y={840} r={8} odd="--glitch-c0" />
        <g className="play-scenery-sway" transform="translate(1340 780)">
          <path
            d="M60 60l110 110"
            strokeWidth="44"
            strokeLinecap="round"
            style={{ stroke: 'var(--play-night)' }}
          />
          <circle r="120" {...tint('--play-night')} />
          <circle r="94" {...tint('--play-glitch-glow', 0.35)} />
          <circle
            r="94"
            fill="none"
            strokeWidth="8"
            opacity="0.8"
            style={{ stroke: 'var(--play-gold)' }}
          />
          <path
            d="M-70 -10A72 72 0 0 1 -20 -70"
            stroke="white"
            strokeWidth="14"
            strokeLinecap="round"
            fill="none"
            opacity="0.4"
          />
        </g>
      </>
    ),
  },
  jumble: {
    far: FAR_TILES.map((letter, index) => (
      <Tile
        // Letters repeat, the slot is the identity
        key={`${letter}-${index}`}
        x={60 + index * 100}
        y={820 - Math.abs(7.5 - index) * 12 + (index % 2) * 30}
        r={(index % 3) * 8 - 8}
        size={86}
        letter={letter}
        fill={index % 3 ? '--play-jumble-tile' : '--play-jumble-glow'}
      />
    )),
    near: (
      <>
        {PILE_LEFT.map((tile) => (
          <Tile key={tile.letter} {...tile} />
        ))}
        <g className="play-scenery-bob">
          {PILE_RIGHT.map((tile) => (
            <Tile key={tile.letter} {...tile} />
          ))}
        </g>
      </>
    ),
  },
}
