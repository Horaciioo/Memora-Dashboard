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

// Sparkles around the notebook
const STARS = [
  [40, 60, 14],
  [330, 90, 10],
  [320, 330, 12],
  [30, 400, 9],
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
      <g transform="rotate(-6 180 250)">
        <rect
          x="46"
          y="64"
          width="268"
          height="360"
          rx="14"
          {...tint(`${tone}-deep`, 0.5)}
          transform="translate(0 10)"
        />
        <rect x="46" y="64" width="268" height="360" rx="14" fill="white" opacity="0.92" />
        {Array.from({ length: 11 }, (_, index) => (
          <rect
            key={`l${index}`}
            x="62"
            y={108 + index * 28}
            width="236"
            height="2"
            {...tint(`${tone}-glow`, 0.55)}
          />
        ))}
        <rect x="86" y="64" width="2.5" height="360" {...tint('--play-alert', 0.55)} />
        {[0, 1, 2, 3, 4, 5, 6].map((index) => (
          <circle
            key={`h${index}`}
            cx="58"
            cy={92 + index * 46}
            r="5"
            {...tint(`${tone}-deep`, 0.5)}
          />
        ))}
      </g>
      {STARS.map(([x, y, r]) => (
        <path
          key={`${x}-${y}`}
          d={`M${x} ${y - r}L${x + r * 0.3} ${y - r * 0.3}L${x + r} ${y}L${x + r * 0.3} ${y + r * 0.3}L${x} ${y + r}L${x - r * 0.3} ${y + r * 0.3}L${x - r} ${y}L${x - r * 0.3} ${y - r * 0.3}z`}
          {...tint('--play-gold', 0.9)}
        />
      ))}
      <g transform="rotate(38 300 372)">
        <rect x="236" y="362" width="128" height="22" rx="4" {...tint('--play-gold')} />
        <rect x="236" y="362" width="128" height="7" rx="3" fill="white" opacity="0.4" />
        <path d="M236 362L206 373L236 384z" fill="#f4d9b0" />
        <path d="M218 369L206 373L218 377z" {...tint(`${tone}-deep`)} />
        <rect x="350" y="362" width="22" height="22" rx="5" {...tint('--play-alert')} />
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
      <g fill="white" opacity="0.85">
        <ellipse cx="86" cy="86" rx="46" ry="15" />
        <ellipse cx="116" cy="74" rx="30" ry="16" />
        <ellipse cx="52" cy="76" rx="24" ry="12" />
        <ellipse cx="190" cy="164" rx="34" ry="10" opacity="0.7" />
      </g>
      <circle cx="270" cy="110" r="64" {...tint('--play-gold', 0.95)} />
      <circle cx="270" cy="110" r="96" {...tint('--play-gold', 0.18)} />
      <path d="M0 270C90 220 200 250 360 200V480H0z" {...tint(`${tone}-glow`, 0.55)} />
      {[28, 70, 118].map((x) => (
        <g key={x}>
          <rect x={x - 3} y={236 - x / 14} width="6" height="22" rx="2" {...tint(`${tone}-deep`)} />
          <circle cx={x} cy={228 - x / 14} r="18" {...tint(`${tone}-deep`, 0.9)} />
          <circle cx={x - 5} cy={222 - x / 14} r="7" {...tint(`${tone}-glow`, 0.5)} />
        </g>
      ))}
      <path d="M0 320C120 280 230 330 360 280V480H0z" {...tint(tone)} />
      <g {...tint(`${tone}-glow`, 0.22)}>
        <path d="M30 322L90 306L130 344L36 360z" />
        <path d="M150 316L214 330L240 372L130 388z" />
        <path d="M250 296L330 292L360 340L270 352z" />
      </g>
      <path d="M0 400C140 370 230 410 360 380V480H0z" {...tint(`${tone}-deep`, 0.7)} />
      <ellipse cx="236" cy="318" rx="52" ry="12" {...tint(`${tone}-deep`)} />
      <ellipse cx="236" cy="316" rx="40" ry="8" fill="black" opacity="0.45" />
      <path d="M238 318V150" stroke="white" strokeWidth="7" strokeLinecap="round" />
      <path d="M241 152h82l-24 26 24 26h-82z" {...tint('--play-ludo')} />
      <path d="M241 152h82l-8 8.7h-74z" fill="white" opacity="0.35" />
      <path d="M241 196l82 0-8 8h-74z" fill="black" opacity="0.18" />
      <circle cx="238" cy="148" r="5" {...tint('--play-gold')} />
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
      <circle cx="64" cy="354" r="5" fill="black" opacity="0.08" />
      <circle cx="76" cy="366" r="2.5" fill="black" opacity="0.14" />
      <circle cx="63" cy="353" r="4" fill="white" />
    </>
  ),
  sea: (tone) => (
    <>
      <circle cx="260" cy="170" r="150" {...tint('--play-naval-fire', 0.25)} />
      <circle cx="260" cy="170" r="52" {...tint('--play-naval-fire', 0.6)} />
      <path d="M0 270h360v210H0z" {...tint(`${tone}-deep`, 0.9)} />
      <path d="M0 270c50-10 90 8 140 0s100-8 160 0l60 4v12H0z" {...tint(`${tone}-glow`, 0.35)} />
      <g {...tint('--play-naval-night', 0.92)}>
        <path d="M90 268h200l-18 30H112z" />
        <rect x="160" y="236" width="70" height="32" rx="4" />
        <rect x="186" y="198" width="16" height="38" />
        <rect x="116" y="248" width="34" height="20" rx="3" />
      </g>
      <circle cx="110" cy="236" r="22" {...tint('--play-naval-hit', 0.9)} />
      <circle cx="110" cy="236" r="11" fill="white" opacity="0.85" />
      <path d="M270 330c6-44 3-76-8-98 26 20 40 58 32 98z" fill="white" opacity="0.7" />
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
      <ellipse cx="180" cy="440" rx="104" ry="14" fill="black" opacity="0.3" />
      <path
        d="M100 300A84 84 0 0 1 150 232"
        stroke="white"
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
        opacity="0.22"
      />
      <circle cx="136" cy="268" r="28" fill="white" opacity="0.16" />
      <path d="M236 372l-24-30 18 4-12-28 26 32-18-4z" {...tint('--play-gold', 0.9)} />
      <circle cx="180" cy="310" r="118" fill="none" stroke="white" strokeWidth="2" opacity="0.1" />
      <rect
        x="186"
        y="170"
        width="56"
        height="44"
        rx="10"
        {...tint('--play-night')}
        transform="rotate(28 214 192)"
      />
      <rect
        x="180"
        y="176"
        width="64"
        height="12"
        rx="6"
        transform="rotate(28 214 192)"
        fill="white"
        opacity="0.22"
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
  tiles: (tone) => (
    <>
      <circle cx="180" cy="300" r="150" {...tint(`${tone}-glow`, 0.2)} />
      {[
        { x: 70, y: 150, r: -14, letter: 'J', size: 112, fill: '--play-jumble-tile' },
        { x: 196, y: 108, r: 9, letter: 'U', size: 128, fill: '--play-gold' },
        { x: 120, y: 268, r: -5, letter: 'M', size: 120, fill: '--play-jumble-glow' },
        { x: 252, y: 250, r: 15, letter: 'B', size: 96, fill: '--play-jumble-tile' },
      ].map((tile) => (
        <g key={tile.letter} transform={`translate(${tile.x} ${tile.y}) rotate(${tile.r})`}>
          <rect
            width={tile.size}
            height={tile.size}
            rx={tile.size * 0.22}
            y="8"
            fill="black"
            opacity="0.28"
          />
          <rect width={tile.size} height={tile.size} rx={tile.size * 0.22} {...tint(tile.fill)} />
          <text
            x={tile.size / 2}
            y={tile.size * 0.72}
            textAnchor="middle"
            fontSize={tile.size * 0.62}
            fontWeight="900"
            {...tint('--play-jumble-tile-ink')}
          >
            {tile.letter}
          </text>
        </g>
      ))}
    </>
  ),
  cards: (tone) => (
    <>
      <circle cx="180" cy="300" r="150" {...tint(`${tone}-glow`, 0.2)} />
      {[
        { x: 40, y: 120, r: -12, size: 150, fill: '--echo-card' },
        { x: 170, y: 190, r: 9, size: 160, fill: '--echo-card' },
      ].map((card) => (
        <g key={card.x} transform={`translate(${card.x} ${card.y}) rotate(${card.r})`}>
          <circle
            cx={card.size / 2}
            cy={card.size / 2 + 8}
            r={card.size / 2}
            fill="black"
            opacity="0.28"
          />
          <circle cx={card.size / 2} cy={card.size / 2} r={card.size / 2} {...tint(card.fill)} />
          <circle
            cx={card.size * 0.3}
            cy={card.size * 0.35}
            r={card.size * 0.13}
            {...tint('--play-gold')}
          />
          <circle
            cx={card.size * 0.66}
            cy={card.size * 0.6}
            r={card.size * 0.2}
            {...tint('--play-echo')}
          />
          <circle
            cx={card.size * 0.38}
            cy={card.size * 0.72}
            r={card.size * 0.09}
            {...tint('--echo-pink')}
          />
        </g>
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
