import type { ReactNode } from 'react'

/**
 * Fill from a colour token
 * @param {string} token - Colour token
 * @param {number} [opacity] - Opacity
 * @return {object} - Style prop
 */

const tint = (token: string, opacity = 1) => ({ style: { fill: `var(${token})`, opacity } })

// Shadow on the ground
const Ground = ({ x = 32, width = 20 }: { x?: number; width?: number }) => (
  <ellipse cx={x} cy="58" rx={width} ry="3" fill="black" opacity="0.28" />
)

// Light on a round object
const Sheen = ({ x, y, r }: { x: number; y: number; r: number }) => (
  <path
    d={`M${x - r * 0.66} ${y - r * 0.1}A${r * 0.7} ${r * 0.7} 0 0 1 ${x - r * 0.24} ${y - r * 0.64}`}
    stroke="white"
    strokeWidth={r * 0.14}
    strokeLinecap="round"
    fill="none"
    opacity="0.4"
  />
)

// Fanned tiles of the Jumble logo
const TILES = [
  { letter: 'J', x: 15, y: 34, angle: -16, size: 20, fill: '--play-jumble-tile' },
  { letter: 'M', x: 49, y: 34, angle: 16, size: 20, fill: '--play-jumble-glow' },
  { letter: 'U', x: 32, y: 28, angle: 0, size: 25, fill: '--play-gold' },
]

// Logos of the newer games, drawn as objects like the posters
export const NEW_MARKS: Record<string, ReactNode> = {
  playJumble: (
    <>
      <Ground width={24} />
      {TILES.map((tile) => (
        <g key={tile.letter} transform={`translate(${tile.x} ${tile.y}) rotate(${tile.angle})`}>
          <rect
            x={-tile.size / 2}
            y={-tile.size / 2 + 3.5}
            width={tile.size}
            height={tile.size}
            rx={tile.size / 4.5}
            {...tint('--play-jumble-tile-deep')}
          />
          <rect
            x={-tile.size / 2}
            y={-tile.size / 2}
            width={tile.size}
            height={tile.size}
            rx={tile.size / 4.5}
            {...tint(tile.fill)}
          />
          <rect
            x={-tile.size / 2 + 3}
            y={-tile.size / 2 + 2.5}
            width={tile.size - 6}
            height={tile.size / 6}
            rx={tile.size / 12}
            fill="white"
            opacity="0.45"
          />
          <text
            y={tile.size * 0.25}
            textAnchor="middle"
            fontSize={tile.size * 0.7}
            fontWeight="900"
            {...tint('--play-jumble-tile-ink')}
          >
            {tile.letter}
          </text>
        </g>
      ))}
    </>
  ),
  playGlitch: (
    <>
      <Ground x={30} width={18} />
      <path d="M41 41l13 13" stroke="var(--play-night)" strokeWidth="8" strokeLinecap="round" />
      <path d="M43 43l9 9" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.25" />
      <circle cx="28" cy="28" r="21" {...tint('--play-night')} />
      <circle cx="28" cy="28" r="16" {...tint('--glitch-paper')} />
      <circle cx="22" cy="24" r="5" {...tint('--glitch-c3')} />
      <path d="M27 36l6-10 6 10z" {...tint('--glitch-c1')} />
      <rect x="16" y="31" width="7" height="7" rx="2" {...tint('--glitch-c4')} />
      <circle
        cx="28"
        cy="28"
        r="16"
        fill="none"
        stroke="var(--glitch-c0)"
        strokeWidth="1.5"
        opacity="0.45"
      />
      <Sheen x={28} y={28} r={21} />
    </>
  ),
  playCroquis: (
    <>
      <Ground x={29} width={22} />
      <g transform="rotate(-8 29 34)">
        <rect x="6" y="18" width="46" height="36" rx="5" {...tint('--play-croquis-deep')} />
        <rect x="6" y="15" width="46" height="36" rx="5" {...tint('--croquis-paper')} />
        <path
          d="M11 42c4-10 8-10 12 0s8 5 11-4 6-6 9-1"
          stroke="var(--croquis-blue)"
          strokeWidth="3.4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="17" cy="25" r="4.5" {...tint('--croquis-yellow')} />
        <path
          d="M32 21l5 8h-10z"
          fill="none"
          stroke="var(--croquis-red)"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
      </g>
      <g transform="rotate(36 48 22)">
        <rect x="43" y="0" width="10" height="30" rx="2" {...tint('--play-croquis')} />
        <rect x="43" y="0" width="3.5" height="30" rx="1.5" fill="white" opacity="0.35" />
        <path d="M43 30h10l-5 10z" {...tint('--croquis-paper')} />
        <path d="M46 36h4l-2 4z" {...tint('--croquis-black')} />
        <rect x="43" y="0" width="10" height="6" rx="2" {...tint('--play-gold')} />
      </g>
    </>
  ),
  playEcho: (
    <>
      <Ground x={30} width={20} />
      <circle cx="46" cy="18" r="13" {...tint('--echo-card-edge')} />
      <circle cx="46" cy="17" r="11.5" {...tint('--echo-card')} />
      <circle cx="49" cy="15" r="4" {...tint('--echo-pink')} />
      <circle cx="28" cy="35" r="21" {...tint('--echo-card-edge')} />
      <circle cx="28" cy="33" r="19.5" {...tint('--echo-card')} />
      <circle cx="21" cy="27" r="5" {...tint('--play-gold')} />
      <circle cx="33" cy="37" r="7.5" {...tint('--play-echo')} />
      <circle cx="20" cy="40" r="3.4" {...tint('--echo-pink')} />
      <path d="M33 21l3 5h-6z" {...tint('--echo-red')} />
      <Sheen x={28} y={33} r={21} />
    </>
  ),
}
