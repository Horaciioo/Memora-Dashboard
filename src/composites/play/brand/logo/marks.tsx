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

// Face drawn in the Glitch logo
const GlitchFace = () => (
  <g>
    <rect x="13" y="14" width="38" height="38" rx="11" {...tint('--glitch-paper')} />
    <rect x="21" y="25" width="6" height="8" rx="3" {...tint('--glitch-ink')} />
    <rect x="37" y="25" width="6" height="8" rx="3" {...tint('--glitch-ink')} />
    <path
      d="M22 40c5 5 15 5 20 0"
      stroke="var(--glitch-ink)"
      strokeWidth="3.4"
      fill="none"
      strokeLinecap="round"
    />
  </g>
)

// Star of the Echo logo
const STAR = 'M0 -17L4.7 -6.5L16.2 -5.3L7.6 2.5L10 13.8L0 8L-10 13.8L-7.6 2.5L-16.2 -5.3L-4.7 -6.5Z'

// Fading copies behind the star
const ECHOES = [
  { x: 14, y: 40, angle: -10, opacity: 0.35 },
  { x: 25, y: 36, angle: -2, opacity: 0.65 },
]

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
      <defs>
        <clipPath id="play-glitch-top">
          <rect x="0" y="0" width="64" height="31" />
        </clipPath>
        <clipPath id="play-glitch-band">
          <rect x="0" y="31" width="64" height="9" />
        </clipPath>
        <clipPath id="play-glitch-low">
          <rect x="0" y="40" width="64" height="24" />
        </clipPath>
      </defs>
      <Ground width={20} />
      {/* Colour channels pulled apart */}
      <rect x="9" y="12" width="38" height="38" rx="11" {...tint('--glitch-c5', 0.9)} />
      <rect x="17" y="16" width="38" height="38" rx="11" {...tint('--play-glitch', 0.9)} />
      {/* Face cut in three, middle slice slipped */}
      <g clipPath="url(#play-glitch-top)">
        <GlitchFace />
      </g>
      <g clipPath="url(#play-glitch-band)" transform="translate(7 0)">
        <GlitchFace />
      </g>
      <g clipPath="url(#play-glitch-low)" transform="translate(-2 0)">
        <GlitchFace />
      </g>
      <rect x="49" y="18" width="9" height="3" rx="1.5" {...tint('--glitch-c5')} />
      <rect x="5" y="44" width="7" height="3" rx="1.5" {...tint('--play-glitch')} />
      <rect x="52" y="47" width="5" height="2.4" rx="1.2" fill="white" opacity="0.8" />
    </>
  ),
  playSuspens: (
    <>
      <Ground x={26} width={20} />
      {/* Gallows: post, beam and brace */}
      <path
        d="M8 57H34M16 57V7H50M16 21L30 7"
        stroke="var(--suspens-wood)"
        strokeWidth="5.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Plate hanging by its rope, a chalk S on the slate */}
      <g transform="rotate(-7 44 7)">
        <path d="M44 8V22" stroke="var(--suspens-rope)" strokeWidth="3" strokeLinecap="round" />
        <circle cx="44" cy="22" r="2.4" {...tint('--suspens-rope')} />
        <rect x="29" y="23" width="30" height="34" rx="7" {...tint('--suspens-slate')} />
        <rect
          x="29"
          y="23"
          width="30"
          height="34"
          rx="7"
          fill="none"
          stroke="var(--suspens-wood)"
          strokeWidth="2.6"
        />
        <text
          x="44"
          y="50"
          textAnchor="middle"
          fontSize="30"
          fontWeight="900"
          {...tint('--play-suspens-glow')}
        >
          S
        </text>
      </g>
    </>
  ),
  playCroquis: (
    <>
      <Ground x={30} width={22} />
      {/* Scribble left by the pencil */}
      <path
        d="M6 46c2-14 14-20 20-12s-6 16-10 9 8-22 22-18"
        stroke="var(--croquis-blue)"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 46c2-14 14-20 20-12"
        stroke="white"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
        opacity="0.35"
        transform="translate(-1 -1.5)"
      />
      <circle cx="12" cy="18" r="3" {...tint('--croquis-red')} />
      <circle cx="20" cy="11" r="2" {...tint('--croquis-yellow')} />
      {/* Chunky pencil, tip on the line */}
      <g transform="rotate(45 38 30)">
        <rect x="31" y="-2" width="14" height="10" rx="3" {...tint('--croquis-red')} />
        <rect x="31" y="6" width="14" height="4" {...tint('--croquis-paper')} opacity="0.85" />
        <rect x="31" y="10" width="14" height="26" {...tint('--play-croquis')} />
        <rect x="31" y="10" width="4.5" height="26" fill="white" opacity="0.3" />
        <rect x="40.5" y="10" width="4.5" height="26" {...tint('--play-croquis-deep', 0.35)} />
        <path d="M31 36h14l-7 13z" {...tint('--play-croquis-glow')} />
        <path d="M35.2 44h5.6l-2.8 5z" {...tint('--croquis-blue')} />
      </g>
    </>
  ),
  playEcho: (
    <>
      <Ground x={34} width={18} />
      {/* Echoes trailing the symbol */}
      {ECHOES.map((echo) => (
        <g key={echo.x} className="play-echo-ghost">
          <path
            d={STAR}
            transform={`translate(${echo.x} ${echo.y}) rotate(${echo.angle})`}
            fill="none"
            stroke="var(--play-echo-glow)"
            strokeWidth="3"
            strokeLinejoin="round"
            opacity={echo.opacity}
          />
        </g>
      ))}
      <g className="play-echo-star">
        <path
          d={STAR}
          transform="translate(38 35) rotate(8)"
          stroke="var(--play-croquis-deep)"
          strokeWidth="5"
          strokeLinejoin="round"
          {...tint('--play-croquis-deep')}
        />
        <path
          d={STAR}
          transform="translate(38 32) rotate(8)"
          stroke="var(--play-gold)"
          strokeWidth="5"
          strokeLinejoin="round"
          {...tint('--play-gold')}
        />
      </g>
      <path d="M32 22l2.5-5" stroke="white" strokeWidth="2.6" strokeLinecap="round" opacity="0.6" />
      <path
        className="play-echo-twinkle"
        d="m55 9 1.4 3.6 3.6 1.4-3.6 1.4L55 19l-1.4-3.6-3.6-1.4 3.6-1.4z"
        fill="white"
      />
      <path
        className="play-echo-twinkle"
        d="m12 12 1 2.6 2.6 1-2.6 1-1 2.6-1-2.6-2.6-1 2.6-1z"
        fill="white"
      />
    </>
  ),
}
