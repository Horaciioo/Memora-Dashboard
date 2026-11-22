import type { ReactNode } from 'react'

import { DIRECTION_MARKS } from '@/composites/play/brand/logo/directionMarks'
import { PLAY_GAMES } from '@/declarations/play/games'
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
  playBomb: (
    <>
      <circle cx="31" cy="40" r="18" {...tint('--play-bomb')} />
      <circle cx="29" cy="38" r="18" {...tint('--play-bomb-stock')} />
      <g {...tint('--play-bomb-cream')}>
        <circle cx="21" cy="30" r="2.6" />
        <circle cx="27" cy="27" r="1.9" />
        <circle cx="19" cy="37" r="1.9" />
        <circle cx="25" cy="33" r="1.4" />
        <circle cx="31" cy="25" r="1.1" />
        <circle cx="17" cy="43" r="1.1" />
      </g>
      <circle
        cx="29"
        cy="38"
        r="18"
        fill="none"
        stroke="var(--play-bomb-cream)"
        strokeWidth="1.2"
      />
      <g transform="rotate(35 38 19)">
        <rect x="34" y="15" width="11" height="8" rx="2" {...tint('--play-bomb')} />
        <rect
          x="33"
          y="14"
          width="11"
          height="8"
          rx="2"
          {...tint('--play-bomb-stock')}
          stroke="var(--play-bomb-cream)"
          strokeWidth="1.2"
        />
      </g>
      <path
        d="M42 14c3-6 8-8 12-5"
        stroke="var(--play-bomb-cord)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="55" cy="8" r="7" {...tint('--play-bomb')} opacity="0.45" />
      <path d="M55 0l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" {...tint('--play-bomb-glow')} />
    </>
  ),
  ...DIRECTION_MARKS,
}

// Logos drawn bare, without their tile
const BARE = new Set([
  'playBaccalaureat',
  'playBomb',
  'playCroquis',
  'playEcho',
  'playGlitch',
  'playGolf',
  'playSuspens',
  'playStopGo',
  'playConcordat',
  'playJumble',
  'playLudo',
  'playNaval',
])

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
