import type { ReactNode } from 'react'

import { CONCORDAT_LAND } from '@/composites/play/brand/logo/concordatLand'
import { STOPGO_MARK } from '@/composites/play/stopgo/art/StopGoMark'

/**
 * Fill from a colour token
 * @param {string} token - Colour token
 * @return {object} - Style prop
 */

const tint = (token: string) => ({ style: { fill: `var(${token})` } })

/**
 * Stroke from a colour token
 * @param {string} token - Colour token
 * @return {object} - Style prop
 */

const line = (token: string) => ({ fill: 'none', style: { stroke: `var(${token})` } })

/**
 * Logos drawn in each game's own direction, on a 64 grid, never animated
 * @type {Record<string, ReactNode>}
 */

export const DIRECTION_MARKS: Record<string, ReactNode> = {
  // Two glass lenses sharing a gold star
  playEcho: (
    <>
      <circle cx="24" cy="26" r="18" {...tint('--play-echo-dusk')} />
      <circle cx="24" cy="26" r="18" {...line('--play-echo-glow')} strokeWidth="1.6" />
      <circle cx="41" cy="40" r="19" {...tint('--play-echo')} opacity="0.85" />
      <circle cx="41" cy="40" r="19" {...line('--play-echo-glow')} strokeWidth="1.6" />
      <path
        d="M17 18c3-4 8-5 12-4"
        {...line('--play-echo-glow')}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M14 30a3 3 0 0 0 6 0c0-3-3-6-3-6s-3 3-3 6z"
        {...line('--echo-etch')}
        strokeWidth="1.4"
      />
      <path
        d="M46 48l-4-4 6-1-2-5"
        {...line('--play-echo-glow')}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
      <circle cx="33" cy="33" r="9" {...line('--echo-rim-center')} strokeWidth="1" opacity="0.6" />
      <path
        d="M33 25.5l2.2 4.8 5.2.6-3.9 3.5 1.1 5.1-4.6-2.6-4.6 2.6 1.1-5.1-3.9-3.5 5.2-.6z"
        {...tint('--echo-rim-center')}
      />
    </>
  ),
  // Globe on its stand
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
      <ellipse cx="32" cy="58" rx="22" ry="3" fill="black" opacity="0.28" />
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
            d={CONCORDAT_LAND}
            fill="none"
            strokeWidth="3"
            strokeLinejoin="round"
            style={{ stroke: 'var(--play-concordat-sea-light)' }}
            opacity="0.5"
          />
          <path d={CONCORDAT_LAND} fill="url(#concordat-land)" />
          <path d={CONCORDAT_LAND} fill="none" stroke="black" strokeWidth="0.6" opacity="0.25" />
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
  // Seyès slip with a red circled letter and a written stroke
  playBaccalaureat: (
    <>
      <rect x="9" y="6" width="46" height="52" rx="4" {...tint('--bac-paper')} />
      <g strokeWidth="1">
        {[18, 26, 34, 42, 50].map((rule) => (
          <path key={rule} d={`M9 ${rule}h46`} {...line('--bac-rule-strong')} />
        ))}
      </g>
      <path d="M19 6v52" {...line('--bac-margin')} strokeWidth="1.6" />
      <ellipse
        cx="36"
        cy="27"
        rx="11"
        ry="10"
        {...line('--bac-margin')}
        strokeWidth="2.4"
        transform="rotate(-10 36 27)"
      />
      <text
        x="36"
        y="34"
        textAnchor="middle"
        fontSize="20"
        fontWeight="800"
        style={{ fill: 'var(--play-baccalaureat-ink)', fontFamily: 'var(--font-hand)' }}
      >
        B
      </text>
      <path
        d="M24 47c4-3 7 2 10-1s6 1 9-1 5 1 7 0"
        {...line('--play-baccalaureat')}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </>
  ),
  // Brass compass rose with a sonar trace and a hull
  playNaval: (
    <>
      <circle cx="32" cy="32" r="26" {...tint('--play-naval-night')} />
      <circle cx="32" cy="32" r="26" {...line('--naval-brass')} strokeWidth="1.8" />
      <circle
        cx="32"
        cy="32"
        r="21"
        {...line('--naval-brass')}
        strokeWidth="0.8"
        strokeDasharray="1 2.4"
      />
      <path d="M32 32L56 32A24 24 0 0 0 49 15Z" {...tint('--naval-sonar')} opacity="0.35" />
      <path
        d="M32 8l3 21-3 3-3-3zM32 56l-3-21 3-3 3 3zM8 32l21-3 3 3-3 3zM56 32l-21 3-3-3 3-3z"
        {...tint('--naval-brass')}
      />
      <path d="M38 22h7l3 2.5-3 2.5h-7z" {...line('--naval-sonar')} strokeWidth="1.4" />
      <circle cx="32" cy="32" r="2.4" {...tint('--play-naval-night')} />
    </>
  ),
  // Sketchbook corner, spiral wire and a pencil mid stroke
  playCroquis: (
    <>
      <rect x="8" y="10" width="44" height="46" rx="4" {...tint('--croquis-paper')} />
      {[16, 26, 36, 46].map((x) => (
        <path
          key={x}
          d={`M${x} 14c-2 -8 4 -10 4 -2`}
          {...line('--croquis-wire')}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      ))}
      <path
        d="M16 46c6-12 14-16 22-8"
        {...line('--croquis-graphite')}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M17 47c6-11 13-14 21-7"
        {...line('--croquis-graphite')}
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.4"
      />
      <g transform="rotate(38 46 34)">
        <rect x="42" y="8" width="9" height="32" rx="1.5" {...tint('--play-croquis')} />
        <rect x="42" y="6" width="9" height="5" rx="1.5" {...tint('--croquis-red')} />
        <path d="M42 40h9l-4.5 9z" {...tint('--croquis-desk')} />
        <path d="M45.3 46.5h2.4l-1.2 2.5z" {...tint('--croquis-graphite')} />
      </g>
    </>
  ),
  // Tube screen, scanlines and a torn band split in two colours
  playGlitch: (
    <>
      <rect x="6" y="10" width="52" height="42" rx="10" {...tint('--play-glitch-deep')} />
      <rect x="11" y="15" width="42" height="32" rx="6" {...tint('--glitch-screen')} />
      <rect x="9" y="27" width="30" height="7" {...tint('--glitch-cyan')} opacity="0.8" />
      <rect x="23" y="27" width="32" height="7" {...tint('--glitch-red')} opacity="0.8" />
      <path d="M16 42l8-9 6 5 7-8 11 12z" {...tint('--play-glitch')} />
      <circle cx="44" cy="21" r="3" {...tint('--play-gold')} />
      {[18, 22, 38, 42, 46].map((y) => (
        <path key={y} d={`M11 ${y}h42`} stroke="black" strokeOpacity="0.35" />
      ))}
      <rect x="22" y="52" width="20" height="5" rx="2" {...tint('--play-glitch-deep')} />
    </>
  ),
  // Sunset disc over dunes, the shot arc landing by the flag
  playGolf: (
    <>
      <defs>
        <clipPath id="golf-mark-disc">
          <circle cx="32" cy="32" r="26" />
        </clipPath>
        <linearGradient id="golf-mark-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--golf-dusk-top)' }} />
          <stop offset="0.55" style={{ stopColor: 'var(--golf-dusk-mid)' }} />
          <stop offset="0.8" style={{ stopColor: 'var(--golf-dusk-low)' }} />
        </linearGradient>
      </defs>
      <g clipPath="url(#golf-mark-disc)">
        <rect x="6" y="6" width="52" height="52" fill="url(#golf-mark-sky)" />
        <circle cx="40" cy="38" r="9" {...tint('--golf-sun')} />
        <path d="M6 40c8-3 14-1 20-3s12-4 20-1 10 2 12 1V58H6z" {...tint('--golf-dune-mid')} />
        <path d="M6 48c10-3 18 0 28-2s16-2 24 0V58H6z" {...tint('--golf-dune-front')} />
        <path
          d="M10 56Q22 10 44 38"
          {...line('--golf-tracer')}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
      <rect x="45" y="24" width="1.6" height="15" {...tint('--golf-dune-front')} />
      <path d="M46.6 24l7 2.4-7 2.4z" {...tint('--play-alert')} />
      <circle cx="32" cy="32" r="26" {...line('--golf-sun')} strokeWidth="1.6" />
    </>
  ),
  // Lead sort with its nick, the J raised on the face
  playJumble: (
    <>
      <rect
        x="22"
        y="14"
        width="30"
        height="40"
        rx="3"
        {...tint('--jumble-metal-deep')}
        transform="rotate(10 37 34)"
      />
      <rect x="12" y="10" width="32" height="42" rx="3" {...tint('--jumble-metal-deep')} />
      <rect x="12" y="8" width="32" height="42" rx="3" {...tint('--jumble-metal')} />
      <rect x="12" y="40" width="32" height="3" {...tint('--jumble-metal-deep')} />
      <text
        x="28"
        y="35"
        textAnchor="middle"
        fontSize="28"
        fontWeight="900"
        style={{ fill: 'var(--jumble-metal-ink)', fontFamily: 'Georgia, serif' }}
      >
        J
      </text>
    </>
  ),
  // Lacquered board corner in isometric and a pawn on it
  playLudo: (
    <>
      <path d="M32 14L58 29L32 44L6 29Z" {...tint('--ludo-lacquer')} />
      <path d="M6 29L32 44V50L6 35Z" {...tint('--ludo-board-side')} />
      <path d="M58 29L32 44V50L58 35Z" {...tint('--ludo-board-side')} opacity="0.7" />
      <path d="M32 14L45 21.5L32 29L19 21.5Z" {...tint('--play-ludo-red')} />
      <path d="M45 21.5L58 29L45 36.5L32 29Z" {...tint('--play-ludo-blue')} />
      <path d="M19 21.5L32 29L19 36.5L6 29Z" {...tint('--play-ludo-green')} />
      <path d="M32 29L45 36.5L32 44L19 36.5Z" {...tint('--play-ludo-yellow')} />
      <ellipse cx="32" cy="30" rx="6" ry="3" fill="black" opacity="0.25" />
      <path
        d="M27 30c0-4 3-10 3.5-14h3c.5 4 3.5 10 3.5 14-3 2-7 2-10 0z"
        {...tint('--play-ludo-red')}
      />
      <circle cx="32" cy="14" r="4.5" {...tint('--play-ludo-red')} />
      <circle cx="30.5" cy="12.5" r="1.4" fill="white" opacity="0.5" />
    </>
  ),
  // Lone red single-seater
  playStopGo: STOPGO_MARK,
  // Neon gallows, the head lit red
  playSuspens: (
    <>
      <rect x="4" y="4" width="56" height="56" rx="12" {...tint('--suspens-brick')} />
      <g {...line('--suspens-neon')} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 52h24M20 52V12h22v6" />
      </g>
      <g {...line('--suspens-neon-red')} strokeWidth="3" strokeLinecap="round">
        <circle cx="42" cy="24" r="5.5" />
        <path d="M42 30v12M42 34l-6 5M42 34l6 5" />
      </g>
      <g stroke="white" strokeOpacity="0.7" strokeWidth="1" fill="none" strokeLinecap="round">
        <path d="M20 52V12h22v6" />
        <circle cx="42" cy="24" r="5.5" />
      </g>
    </>
  ),
}
