import type { ReactNode } from 'react'

import { StopGoCarShape } from '@/composites/play/stopgo/art/StopGoCarShape'

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

// Logos of the newer games
export const NEW_MARKS: Record<string, ReactNode> = {
  playConcordat: (
    <>
      <defs>
        <radialGradient id="concordat-sea" cx="0.32" cy="0.28" r="0.9">
          <stop offset="0" style={{ stopColor: 'var(--play-concordat-sea-light)' }} />
          <stop offset="0.5" style={{ stopColor: 'var(--play-concordat-sea)' }} />
          <stop offset="1" style={{ stopColor: 'var(--play-concordat-deep)' }} />
        </radialGradient>
        <radialGradient id="concordat-air" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.8" style={{ stopColor: 'var(--play-concordat-glow)', stopOpacity: 0 }} />
          <stop offset="1" style={{ stopColor: 'var(--play-concordat-glow)', stopOpacity: 0.3 }} />
        </radialGradient>
        <linearGradient id="concordat-land" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--play-concordat-land-light)' }} />
          <stop offset="0.55" style={{ stopColor: 'var(--play-concordat-land)' }} />
          <stop offset="1" style={{ stopColor: 'var(--play-concordat-sand)' }} />
        </linearGradient>
        <linearGradient id="concordat-base" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--play-concordat-glow)' }} />
          <stop offset="1" style={{ stopColor: 'var(--play-concordat-dusk)' }} />
        </linearGradient>
        <linearGradient id="concordat-shade" x1="0.25" y1="0.1" x2="0.9" y2="1">
          <stop offset="0.4" stopColor="black" stopOpacity="0" />
          <stop offset="1" stopColor="black" stopOpacity="0.55" />
        </linearGradient>
        <clipPath id="concordat-globe">
          <circle cx="32" cy="28" r="23" />
        </clipPath>
      </defs>
      <Ground width={22} />
      {/* Stand */}
      <path d="M22 61h20l-4-5H26Z" fill="url(#concordat-base)" />
      <rect x="29" y="49" width="6" height="8" rx="1.5" fill="url(#concordat-base)" />
      {/* Atmosphere and ocean */}
      <circle cx="32" cy="28" r="26" fill="url(#concordat-air)" />
      <circle cx="32" cy="28" r="23" fill="url(#concordat-sea)" />
      <g clipPath="url(#concordat-globe)">
        <g fill="none" stroke="white" strokeWidth="0.6" opacity="0.16">
          <ellipse cx="32" cy="28" rx="11" ry="23" />
          <path d="M8 18h48M8 38h48M32 4v48" />
        </g>
        <g transform="translate(6.4 4) scale(0.8)">
          {/* Shallows, land, relief */}
          <path
            d="M6 17C6.5 15.3 8.2 12.5 10 11C11.8 9.5 14.7 8.3 17 8C19.3 7.7 22.2 8.2 24 9C25.8 9.8 27.8 11.7 28 13C28.2 14.3 25.3 15.7 25 17C24.7 18.3 26.5 19.7 26 21C25.5 22.3 23.2 23.5 22 25C20.8 26.5 20.0 29.3 19 30C18.0 30.7 16.8 30.0 16 29C15.2 28.0 15.0 25.0 14 24C13.0 23.0 11.2 23.5 10 23C8.8 22.5 7.7 22.0 7 21C6.3 20.0 5.5 18.7 6 17Z M27 5C27.8 4.2 30.8 4.5 32 5C33.2 5.5 34.2 6.8 34 8C33.8 9.2 32.2 11.7 31 12C29.8 12.3 27.7 11.2 27 10C26.3 8.8 26.2 5.8 27 5Z M15 31C16.2 29.8 19.0 29.5 21 30C23.0 30.5 25.8 32.3 27 34C28.2 35.7 28.5 37.8 28 40C27.5 42.2 25.3 44.8 24 47C22.7 49.2 21.2 52.5 20 53C18.8 53.5 17.5 51.8 17 50C16.5 48.2 17.5 44.2 17 42C16.5 39.8 14.3 38.8 14 37C13.7 35.2 13.8 32.2 15 31Z M35 15C35.5 13.7 35.7 12.0 37 11C38.3 10.0 41.3 8.8 43 9C44.7 9.2 45.5 11.7 47 12C48.5 12.3 51.0 10.2 52 11C53.0 11.8 53.8 15.7 53 17C52.2 18.3 48.5 18.2 47 19C45.5 19.8 45.5 21.7 44 22C42.5 22.3 39.7 21.5 38 21C36.3 20.5 34.5 20.0 34 19C33.5 18.0 34.5 16.3 35 15Z M34 25C35.3 24.0 38.0 23.2 40 23C42.0 22.8 44.3 23.3 46 24C47.7 24.7 49.0 25.8 50 27C51.0 28.2 52.2 29.3 52 31C51.8 32.7 50.0 35.0 49 37C48.0 39.0 47.0 40.8 46 43C45.0 45.2 44.2 49.0 43 50C41.8 51.0 40.0 50.3 39 49C38.0 47.7 37.7 44.5 37 42C36.3 39.5 35.8 36.2 35 34C34.2 31.8 32.2 30.5 32 29C31.8 27.5 32.7 26.0 34 25Z M54 19C55.0 17.7 56.7 17.2 58 18C59.3 18.8 61.3 21.3 62 24C62.7 26.7 62.8 32.0 62 34C61.2 36.0 58.5 36.3 57 36C55.5 35.7 53.8 33.7 53 32C52.2 30.3 51.8 28.2 52 26C52.2 23.8 53.0 20.3 54 19Z"
            fill="none"
            strokeWidth="3"
            strokeLinejoin="round"
            style={{ stroke: 'var(--play-concordat-sea-light)' }}
            opacity="0.5"
          />
          <path
            d="M6 17C6.5 15.3 8.2 12.5 10 11C11.8 9.5 14.7 8.3 17 8C19.3 7.7 22.2 8.2 24 9C25.8 9.8 27.8 11.7 28 13C28.2 14.3 25.3 15.7 25 17C24.7 18.3 26.5 19.7 26 21C25.5 22.3 23.2 23.5 22 25C20.8 26.5 20.0 29.3 19 30C18.0 30.7 16.8 30.0 16 29C15.2 28.0 15.0 25.0 14 24C13.0 23.0 11.2 23.5 10 23C8.8 22.5 7.7 22.0 7 21C6.3 20.0 5.5 18.7 6 17Z M27 5C27.8 4.2 30.8 4.5 32 5C33.2 5.5 34.2 6.8 34 8C33.8 9.2 32.2 11.7 31 12C29.8 12.3 27.7 11.2 27 10C26.3 8.8 26.2 5.8 27 5Z M15 31C16.2 29.8 19.0 29.5 21 30C23.0 30.5 25.8 32.3 27 34C28.2 35.7 28.5 37.8 28 40C27.5 42.2 25.3 44.8 24 47C22.7 49.2 21.2 52.5 20 53C18.8 53.5 17.5 51.8 17 50C16.5 48.2 17.5 44.2 17 42C16.5 39.8 14.3 38.8 14 37C13.7 35.2 13.8 32.2 15 31Z M35 15C35.5 13.7 35.7 12.0 37 11C38.3 10.0 41.3 8.8 43 9C44.7 9.2 45.5 11.7 47 12C48.5 12.3 51.0 10.2 52 11C53.0 11.8 53.8 15.7 53 17C52.2 18.3 48.5 18.2 47 19C45.5 19.8 45.5 21.7 44 22C42.5 22.3 39.7 21.5 38 21C36.3 20.5 34.5 20.0 34 19C33.5 18.0 34.5 16.3 35 15Z M34 25C35.3 24.0 38.0 23.2 40 23C42.0 22.8 44.3 23.3 46 24C47.7 24.7 49.0 25.8 50 27C51.0 28.2 52.2 29.3 52 31C51.8 32.7 50.0 35.0 49 37C48.0 39.0 47.0 40.8 46 43C45.0 45.2 44.2 49.0 43 50C41.8 51.0 40.0 50.3 39 49C38.0 47.7 37.7 44.5 37 42C36.3 39.5 35.8 36.2 35 34C34.2 31.8 32.2 30.5 32 29C31.8 27.5 32.7 26.0 34 25Z M54 19C55.0 17.7 56.7 17.2 58 18C59.3 18.8 61.3 21.3 62 24C62.7 26.7 62.8 32.0 62 34C61.2 36.0 58.5 36.3 57 36C55.5 35.7 53.8 33.7 53 32C52.2 30.3 51.8 28.2 52 26C52.2 23.8 53.0 20.3 54 19Z"
            fill="url(#concordat-land)"
          />
          <path
            d="M6 17C6.5 15.3 8.2 12.5 10 11C11.8 9.5 14.7 8.3 17 8C19.3 7.7 22.2 8.2 24 9C25.8 9.8 27.8 11.7 28 13C28.2 14.3 25.3 15.7 25 17C24.7 18.3 26.5 19.7 26 21C25.5 22.3 23.2 23.5 22 25C20.8 26.5 20.0 29.3 19 30C18.0 30.7 16.8 30.0 16 29C15.2 28.0 15.0 25.0 14 24C13.0 23.0 11.2 23.5 10 23C8.8 22.5 7.7 22.0 7 21C6.3 20.0 5.5 18.7 6 17Z M27 5C27.8 4.2 30.8 4.5 32 5C33.2 5.5 34.2 6.8 34 8C33.8 9.2 32.2 11.7 31 12C29.8 12.3 27.7 11.2 27 10C26.3 8.8 26.2 5.8 27 5Z M15 31C16.2 29.8 19.0 29.5 21 30C23.0 30.5 25.8 32.3 27 34C28.2 35.7 28.5 37.8 28 40C27.5 42.2 25.3 44.8 24 47C22.7 49.2 21.2 52.5 20 53C18.8 53.5 17.5 51.8 17 50C16.5 48.2 17.5 44.2 17 42C16.5 39.8 14.3 38.8 14 37C13.7 35.2 13.8 32.2 15 31Z M35 15C35.5 13.7 35.7 12.0 37 11C38.3 10.0 41.3 8.8 43 9C44.7 9.2 45.5 11.7 47 12C48.5 12.3 51.0 10.2 52 11C53.0 11.8 53.8 15.7 53 17C52.2 18.3 48.5 18.2 47 19C45.5 19.8 45.5 21.7 44 22C42.5 22.3 39.7 21.5 38 21C36.3 20.5 34.5 20.0 34 19C33.5 18.0 34.5 16.3 35 15Z M34 25C35.3 24.0 38.0 23.2 40 23C42.0 22.8 44.3 23.3 46 24C47.7 24.7 49.0 25.8 50 27C51.0 28.2 52.2 29.3 52 31C51.8 32.7 50.0 35.0 49 37C48.0 39.0 47.0 40.8 46 43C45.0 45.2 44.2 49.0 43 50C41.8 51.0 40.0 50.3 39 49C38.0 47.7 37.7 44.5 37 42C36.3 39.5 35.8 36.2 35 34C34.2 31.8 32.2 30.5 32 29C31.8 27.5 32.7 26.0 34 25Z M54 19C55.0 17.7 56.7 17.2 58 18C59.3 18.8 61.3 21.3 62 24C62.7 26.7 62.8 32.0 62 34C61.2 36.0 58.5 36.3 57 36C55.5 35.7 53.8 33.7 53 32C52.2 30.3 51.8 28.2 52 26C52.2 23.8 53.0 20.3 54 19Z"
            fill="none"
            stroke="black"
            strokeWidth="0.6"
            opacity="0.25"
          />
        </g>
        <ellipse cx="32" cy="4.5" rx="13" ry="5" fill="white" opacity="0.85" />
        <circle cx="32" cy="28" r="23" fill="url(#concordat-shade)" />
      </g>
      {/* Glints */}
      <ellipse
        cx="22"
        cy="14"
        rx="7"
        ry="3.2"
        transform="rotate(-35 22 14)"
        fill="white"
        opacity="0.45"
      />
      <path d="M10 6l1.2 3 3 1.2-3 1.2L10 14.4l-1.2-3-3-1.2 3-1.2Z" fill="white" opacity="0.9" />
    </>
  ),
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
  playStopGo: (
    <>
      {/* Lone single-seater, nose up-right */}
      <g transform="translate(32 32) rotate(28) scale(0.66)">
        <StopGoCarShape color="red" />
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
