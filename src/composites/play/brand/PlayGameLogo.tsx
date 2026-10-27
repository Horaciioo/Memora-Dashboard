import type { ReactNode } from 'react'

import { PLAY_GAMES } from '@/declarations/play'
import { PLAY_BRAND } from '@/declarations/ui/variants'
import type { PlayGameName } from '@/utils/constants/play'
import { cn } from '@/utils/classnames'

/**
 * Fill from a colour token
 * @param {string} token - Colour token
 * @return {object} - Style prop
 */

const tint = (token: string) => ({ style: { fill: `var(${token})` } })

// Pictogram of each logo key, drawn on a 64 grid
const MARKS: Record<string, ReactNode> = {
  playBaccalaureat: (
    <g fontWeight="900" fontSize="30" textAnchor="middle">
      <text x="14" y="42" {...tint('--play-baccalaureat')} transform="rotate(-10 14 32)">
        A
      </text>
      <text x="32" y="38" {...tint('--play-gold')}>
        B
      </text>
      <text x="50" y="42" {...tint('--play-baccalaureat-deep')} transform="rotate(10 50 32)">
        C
      </text>
    </g>
  ),
  playGolf: (
    <>
      <ellipse
        className="play-bounce-shadow"
        cx="32"
        cy="55"
        rx="15"
        ry="4"
        fill="black"
        opacity="0.28"
      />
      <g className="play-bounce">
        <circle cx="32" cy="28" r="17" fill="white" />
        <circle
          cx="32"
          cy="28"
          r="17"
          fill="none"
          stroke="black"
          strokeOpacity="0.14"
          strokeWidth="2"
        />
        <g fill="black" opacity="0.13">
          <circle cx="26" cy="30" r="1.9" />
          <circle cx="34" cy="34" r="1.9" />
          <circle cx="38" cy="26" r="1.9" />
          <circle cx="30" cy="38" r="1.7" />
          <circle cx="40" cy="33" r="1.5" />
        </g>
        <ellipse cx="25" cy="20" rx="5" ry="3" fill="white" transform="rotate(-35 25 20)" />
        <path
          d="M23 18a11 11 0 0 1 6-4"
          stroke="black"
          strokeOpacity="0.1"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    </>
  ),
  playBomb: (
    <>
      <circle cx="29" cy="38" r="17" {...tint('--play-bomb-shell')} />
      <circle cx="23" cy="31" r="4.5" fill="white" opacity="0.4" />
      <rect
        x="33"
        y="14"
        width="11"
        height="8"
        rx="2.5"
        {...tint('--play-bomb-cap')}
        transform="rotate(35 38 19)"
      />
      <path
        d="M42 15c3-5 7-6 10-4"
        stroke="var(--play-bomb-cord)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="m54 4 1.8 4.8L60.6 10.6l-4.8 1.8L54 17.2l-1.8-4.8L47.4 10.6l4.8-1.8z"
        {...tint('--play-bomb-glow')}
      />
    </>
  ),
  playLudo: (
    <>
      <defs>
        <linearGradient id="play-ludo-trail" x1="0.1" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="white" stopOpacity="0" />
          <stop offset="1" stopColor="white" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      {/* Shadow waiting on the ground */}
      <ellipse cx="43" cy="58" rx="12" ry="2.6" fill="black" opacity="0.28" />
      {/* Bounce coming down from the top, widening as it falls */}
      <path d="M3 5Q30 0 44 36L34 40Q26 5 3 5Z" fill="url(#play-ludo-trail)" />
      {/* Speed lines along the fall */}
      <path
        d="M22 24l5 10M47 15l4 9"
        stroke="white"
        strokeOpacity="0.7"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M18 31l3 6"
        stroke="white"
        strokeOpacity="0.45"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* Pawn tipped by the fall */}
      <g transform="rotate(22 41 42)">
        <path d="M28 39v6a13 9.5 0 0 0 26 0v-6z" {...tint('--play-ludo-pawn-side')} />
        <path
          d="M28 39v6a13 9.5 0 0 0 26 0v-6"
          fill="none"
          stroke="var(--play-ludo-pawn-rim)"
          strokeWidth="0.8"
        />
        <ellipse cx="41" cy="39" rx="13" ry="9.5" {...tint('--play-ludo-pawn')} />
        <ellipse cx="41" cy="39" rx="7" ry="5.1" {...tint('--play-ludo-red-deep')} />
        <ellipse cx="41" cy="38.4" rx="6.3" ry="4.5" {...tint('--play-ludo-red')} />
        <ellipse cx="37.6" cy="36.6" rx="2.3" ry="1.2" fill="white" opacity="0.55" />
      </g>
    </>
  ),
}

// Logos drawn bare, without their tile
const BARE = new Set(['playBaccalaureat', 'playBomb', 'playGolf', 'playLudo'])

// Game not announced yet
const MYSTERY = {
  tone: '--play-mystery',
  mark: (
    <text x="32" y="45" textAnchor="middle" fontSize="38" fontWeight="800" fill="white">
      ?
    </text>
  ),
}

export interface PlayGameLogoProps {
  game: PlayGameName
  // Keeps the game a secret
  isHidden?: boolean
  className?: string
}

/**
 * Logo tile of a game
 * @param {PlayGameLogoProps} props - Game, secrecy and size
 * @return {JSX.Element}
 */

export const PlayGameLogo = ({ game, isHidden, className }: PlayGameLogoProps) => {
  const meta = PLAY_GAMES.get(game)
  const tone = isHidden ? MYSTERY.tone : meta.tone
  const isBare = !isHidden && BARE.has(meta.logo)

  return (
    <span
      className={cn(isBare ? PLAY_BRAND.bare : PLAY_BRAND.logo, className)}
      style={
        isBare
          ? undefined
          : {
              background: `linear-gradient(145deg, var(${tone}-glow) -40%, var(${tone}) 45%, var(${tone}-deep))`,
            }
      }
    >
      <svg
        viewBox="0 0 64 64"
        className={isBare ? PLAY_BRAND.bareMark : PLAY_BRAND.logoMark}
        aria-hidden="true"
      >
        {isHidden ? MYSTERY.mark : MARKS[meta.logo]}
      </svg>
    </span>
  )
}
