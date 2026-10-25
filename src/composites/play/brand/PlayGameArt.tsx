import type { ReactNode } from 'react'

import { PLAY_GAMES } from '@/declarations/play'
import { PLAY_BRAND } from '@/declarations/ui/variants'
import type { PlayGameName } from '@/utils/constants/play'
import { cn } from '@/utils/classnames'

/**
 * Fill from a colour token
 * @param {string} token - Colour token
 * @param {number} [opacity] - Opacity
 * @return {object} - Style prop
 */

const tint = (token: string, opacity = 1) => ({ style: { fill: `var(${token})`, opacity } })

// Letter tiles thrown on the notebook
const TILES = [
  { x: 360, y: 70, r: -12, letter: 'A', size: 74 },
  { x: 470, y: 130, r: 9, letter: 'M', size: 92 },
  { x: 560, y: 40, r: -4, letter: 'Z', size: 60 },
  { x: 410, y: 210, r: 14, letter: 'R', size: 64 },
  { x: 540, y: 220, r: -10, letter: 'E', size: 54 },
]

// Sparks around the fuse
const SPARKS = [
  [600, 66, 11],
  [624, 92, 6],
  [584, 40, 6],
  [628, 46, 5],
  [566, 64, 4],
]

// Pawns on the board
const PAWNS = [
  { x: 420, y: 150, tone: '--play-ludo' },
  { x: 500, y: 110, tone: '--play-baccalaureat' },
  { x: 560, y: 190, tone: '--play-gold' },
  { x: 460, y: 230, tone: '--play-golf' },
]

// Scene of each backdrop key, drawn on a 640 × 320 canvas
const SCENES: Record<string, (tone: string) => ReactNode> = {
  'double-grid': (tone) => (
    <>
      <g {...tint(`${tone}-glow`, 0.16)}>
        {Array.from({ length: 16 }, (_, index) => (
          <rect key={`v${index}`} x={index * 40} y="0" width="1.5" height="320" />
        ))}
        {Array.from({ length: 8 }, (_, index) => (
          <rect key={`h${index}`} x="0" y={index * 40} width="640" height="1.5" />
        ))}
      </g>
      {TILES.map((tile) => (
        <g key={tile.letter} transform={`rotate(${tile.r} ${tile.x} ${tile.y})`}>
          <rect
            x={tile.x - tile.size / 2}
            y={tile.y - tile.size / 2 + 8}
            width={tile.size}
            height={tile.size}
            rx={tile.size / 5}
            {...tint(`${tone}-deep`, 0.6)}
          />
          <rect
            x={tile.x - tile.size / 2}
            y={tile.y - tile.size / 2}
            width={tile.size}
            height={tile.size}
            rx={tile.size / 5}
            fill="white"
          />
          <text
            x={tile.x}
            y={tile.y + tile.size * 0.22}
            textAnchor="middle"
            fontSize={tile.size * 0.62}
            fontWeight="800"
            {...tint(`${tone}-deep`)}
          >
            {tile.letter}
          </text>
        </g>
      ))}
    </>
  ),
  turf: (tone) => (
    <>
      <circle cx="520" cy="70" r="46" {...tint('--play-gold', 0.9)} />
      <path
        d="M0 230C120 170 240 200 340 180s220-60 300-30v170H0z"
        {...tint(`${tone}-glow`, 0.5)}
      />
      <path d="M0 260c140-50 260-20 380-40s180-30 260-10v110H0z" {...tint(tone)} />
      <ellipse cx="470" cy="244" rx="40" ry="10" {...tint(`${tone}-deep`)} />
      <path d="M472 244V120" stroke="white" strokeWidth="5" strokeLinecap="round" />
      <path d="M474 122h56l-16 18 16 18h-56z" {...tint('--play-ludo')} />
      <circle cx="380" cy="262" r="11" fill="white" />
    </>
  ),
  fuse: (tone) => (
    <>
      <circle cx="470" cy="210" r="210" {...tint(`${tone}-glow`, 0.18)} />
      <circle cx="470" cy="210" r="96" {...tint('--play-night')} />
      <circle cx="430" cy="172" r="22" fill="white" opacity="0.18" />
      <rect
        x="490"
        y="96"
        width="44"
        height="34"
        rx="8"
        {...tint('--play-night')}
        transform="rotate(30 512 113)"
      />
      <path
        d="M528 98c20-40 60-50 70-26"
        stroke="white"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      {SPARKS.map(([x, y, r]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={r} {...tint('--play-gold')} />
      ))}
    </>
  ),
  board: (tone) => (
    <g transform="translate(330 30) rotate(-10 150 130)">
      <rect x="20" y="20" width="280" height="240" rx="34" {...tint(`${tone}-deep`)} />
      <rect x="10" y="10" width="280" height="240" rx="34" fill="white" />
      <rect x="10" y="10" width="140" height="120" rx="34" {...tint('--play-ludo')} />
      <rect x="150" y="10" width="140" height="120" rx="34" {...tint('--play-baccalaureat')} />
      <rect x="150" y="130" width="140" height="120" rx="34" {...tint('--play-gold')} />
      <rect x="10" y="130" width="140" height="120" rx="34" {...tint('--play-golf')} />
      <rect x="110" y="90" width="80" height="80" rx="18" fill="white" />
      {PAWNS.map((pawn) => (
        <g key={pawn.tone} transform={`translate(${pawn.x - 330} ${pawn.y - 30})`}>
          <ellipse cx="0" cy="28" rx="14" ry="5" fill="black" opacity="0.2" />
          <path d="M-12 26 -6 2h12l6 24z" fill="white" />
          <circle cx="0" cy="-4" r="10" fill="white" />
          <path d="M-9 24 -4 4h8l5 20z" {...tint(pawn.tone)} />
          <circle cx="0" cy="-4" r="7" {...tint(pawn.tone)} />
        </g>
      ))}
    </g>
  ),
}

// Question marks scattered over a secret game
const MYSTERY_MARKS = [
  { x: 380, y: 120, size: 110, r: -12 },
  { x: 520, y: 210, size: 150, r: 10 },
  { x: 600, y: 80, size: 70, r: 18 },
  { x: 300, y: 260, size: 60, r: -6 },
]

/**
 * Scene of a game not announced yet
 * @return {JSX.Element}
 */

const mysteryScene = () => (
  <>
    {MYSTERY_MARKS.map((mark) => (
      <text
        key={`${mark.x}-${mark.y}`}
        x={mark.x}
        y={mark.y}
        textAnchor="middle"
        fontSize={mark.size}
        fontWeight="800"
        fill="white"
        opacity="0.16"
        transform={`rotate(${mark.r} ${mark.x} ${mark.y})`}
      >
        ?
      </text>
    ))}
  </>
)

export interface PlayGameArtProps {
  game: PlayGameName
  // Keeps the game a secret
  isHidden?: boolean
  className?: string
}

/**
 * Banner illustration of a game
 * @param {PlayGameArtProps} props - Game, secrecy and frame
 * @return {JSX.Element}
 */

export const PlayGameArt = ({ game, isHidden, className }: PlayGameArtProps) => {
  const meta = PLAY_GAMES.get(game)
  const tone = isHidden ? '--play-mystery' : meta.tone
  const id = isHidden ? 'play-art-mystery' : `play-art-${meta.slug}`

  return (
    <svg
      viewBox="0 0 640 320"
      preserveAspectRatio="xMaxYMid slice"
      className={cn(PLAY_BRAND.art, className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: `var(${tone}-deep)` }} />
          <stop offset="0.6" style={{ stopColor: `var(${tone})` }} />
          <stop offset="1" style={{ stopColor: `var(${tone}-glow)` }} />
        </linearGradient>
      </defs>
      <rect width="640" height="320" fill={`url(#${id})`} />
      {isHidden ? mysteryScene() : SCENES[meta.backdrop]?.(meta.tone)}
    </svg>
  )
}
