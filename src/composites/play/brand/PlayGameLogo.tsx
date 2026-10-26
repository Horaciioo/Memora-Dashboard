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
      <rect x="12" y="12" width="40" height="40" rx="9" fill="white" />
      <path d="M12 21a9 9 0 0 1 9-9h11v20H12z" {...tint('--play-ludo')} />
      <path d="M32 12h11a9 9 0 0 1 9 9v11H32z" {...tint('--play-baccalaureat')} />
      <path d="M32 32h20v11a9 9 0 0 1-9 9H32z" {...tint('--play-gold')} />
      <path d="M12 32h20v20H21a9 9 0 0 1-9-9z" {...tint('--play-golf')} />
      <rect x="24" y="24" width="16" height="16" rx="4" fill="white" />
      <circle cx="28.5" cy="28.5" r="1.8" {...tint('--play-night')} />
      <circle cx="35.5" cy="35.5" r="1.8" {...tint('--play-night')} />
      <circle cx="32" cy="32" r="1.8" {...tint('--play-night')} />
    </>
  ),
}

// Logos drawn bare, without their tile
const BARE = new Set(['playBaccalaureat', 'playBomb', 'playGolf'])

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
