import type { ReactNode } from 'react'

import { LudoBoardArt } from '@/composites/play/brand/LudoBoardArt'
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

// Tiles piled on the notebook
const TILES = [
  { x: 108, y: 128, r: -14, letter: 'A', size: 104, fill: 'white' },
  { x: 244, y: 104, r: 10, letter: 'B', size: 120, fill: '--play-gold' },
  { x: 176, y: 250, r: -4, letter: 'C', size: 112, fill: 'white' },
  { x: 288, y: 236, r: 16, letter: 'Z', size: 64, fill: 'white' },
]

// Sparks around the fuse
const SPARKS = [
  [286, 70, 12],
  [320, 112, 7],
  [252, 44, 7],
  [332, 62, 5],
]

// Rays behind the bomb
const RAYS = Array.from({ length: 12 }, (_, index) => index * 30)

// Scene of each backdrop key, drawn on a 360 × 480 canvas
const SCENES: Record<string, (tone: string) => ReactNode> = {
  'double-grid': (tone) => (
    <>
      <g {...tint(`${tone}-glow`, 0.2)}>
        {Array.from({ length: 10 }, (_, index) => (
          <rect key={`v${index}`} x={index * 40} y="0" width="2" height="480" />
        ))}
        {Array.from({ length: 12 }, (_, index) => (
          <rect key={`h${index}`} x="0" y={index * 40} width="360" height="2" />
        ))}
      </g>
      {TILES.map((tile) => (
        <g key={tile.letter} transform={`rotate(${tile.r} ${tile.x} ${tile.y})`}>
          <rect
            x={tile.x - tile.size / 2}
            y={tile.y - tile.size / 2 + 10}
            width={tile.size}
            height={tile.size}
            rx={tile.size / 5}
            {...tint(`${tone}-deep`, 0.7)}
          />
          <rect
            x={tile.x - tile.size / 2}
            y={tile.y - tile.size / 2}
            width={tile.size}
            height={tile.size}
            rx={tile.size / 5}
            {...(tile.fill === 'white' ? { fill: 'white' } : tint(tile.fill))}
          />
          <text
            x={tile.x}
            y={tile.y + tile.size * 0.24}
            textAnchor="middle"
            fontSize={tile.size * 0.66}
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
      <circle cx="270" cy="110" r="64" {...tint('--play-gold', 0.95)} />
      <circle cx="270" cy="110" r="96" {...tint('--play-gold', 0.18)} />
      <path d="M0 270C90 220 200 250 360 200V480H0z" {...tint(`${tone}-glow`, 0.55)} />
      <path d="M0 320C120 280 230 330 360 280V480H0z" {...tint(tone)} />
      <path d="M0 400C140 370 230 410 360 380V480H0z" {...tint(`${tone}-deep`, 0.7)} />
      <ellipse cx="236" cy="318" rx="52" ry="12" {...tint(`${tone}-deep`)} />
      <path d="M238 318V150" stroke="white" strokeWidth="7" strokeLinecap="round" />
      <path d="M241 152h82l-24 26 24 26h-82z" {...tint('--play-ludo')} />
      <path
        d="M70 360Q120 200 220 312"
        stroke="white"
        strokeWidth="5"
        strokeDasharray="2 14"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />
      <ellipse cx="70" cy="378" rx="22" ry="6" fill="black" opacity="0.25" />
      <circle cx="70" cy="360" r="17" fill="white" />
    </>
  ),
  fuse: (tone) => (
    <>
      <g {...tint(`${tone}-glow`, 0.16)} transform="translate(180 290)">
        {RAYS.map((angle) => (
          <path key={angle} d="M0 0L-20 -330H20z" transform={`rotate(${angle})`} />
        ))}
      </g>
      <circle cx="180" cy="300" r="150" {...tint(`${tone}-glow`, 0.2)} />
      <circle cx="180" cy="310" r="118" {...tint('--play-night')} />
      <circle cx="136" cy="268" r="28" fill="white" opacity="0.16" />
      <rect
        x="186"
        y="170"
        width="56"
        height="44"
        rx="10"
        {...tint('--play-night')}
        transform="rotate(28 214 192)"
      />
      <path
        d="M236 176C260 120 306 108 322 142"
        stroke="white"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
      />
      {SPARKS.map(([x, y, r]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={r} {...tint('--play-gold')} />
      ))}
    </>
  ),
  board: (tone) => (
    <LudoBoardArt
      tone={tone}
      board={{ x: 176, y: 196, size: 250, angle: -10 }}
      die={{ x: 286, y: 78, size: 62, angle: 16 }}
    />
  ),
}

// Question marks over a secret game
const MYSTERY_MARKS = [
  { x: 180, y: 250, size: 260, r: -8, opacity: 0.2 },
  { x: 62, y: 130, size: 90, r: -18, opacity: 0.14 },
  { x: 300, y: 120, size: 70, r: 16, opacity: 0.14 },
]

export interface PlayPosterArtProps {
  game: PlayGameName
  // Keeps the game a secret
  isHidden?: boolean
  className?: string
}

/**
 * Tall poster illustration of a game, arcade box art
 * @param {PlayPosterArtProps} props - Game, secrecy and frame
 * @return {JSX.Element}
 */

export const PlayPosterArt = ({ game, isHidden, className }: PlayPosterArtProps) => {
  const meta = PLAY_GAMES.get(game)
  const tone = isHidden ? '--play-mystery' : meta.tone
  const id = isHidden ? 'play-poster-mystery' : `play-poster-${meta.slug}`

  return (
    <svg
      viewBox="0 0 360 480"
      preserveAspectRatio="xMidYMid slice"
      className={cn(PLAY_BRAND.art, className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" style={{ stopColor: `var(${tone}-glow)` }} />
          <stop offset="0.45" style={{ stopColor: `var(${tone})` }} />
          <stop offset="1" style={{ stopColor: `var(${tone}-deep)` }} />
        </linearGradient>
      </defs>
      <rect width="360" height="480" fill={`url(#${id})`} />
      {isHidden
        ? MYSTERY_MARKS.map((mark) => (
            <text
              key={mark.size}
              x={mark.x}
              y={mark.y}
              textAnchor="middle"
              fontSize={mark.size}
              fontWeight="800"
              fill="white"
              opacity={mark.opacity}
              transform={`rotate(${mark.r} ${mark.x} ${mark.y})`}
            >
              ?
            </text>
          ))
        : SCENES[meta.backdrop]?.(meta.tone)}
    </svg>
  )
}
