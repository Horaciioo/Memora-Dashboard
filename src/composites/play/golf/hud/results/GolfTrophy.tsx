import { useId } from 'react'

import { GOLF_TROPHY_STARS } from '@/declarations/play/golf/ornament'
import { GOLF_SCORECARD } from '@/declarations/ui/variants'

const CUP = 'M16 9H48V24C48 34 41 41 32 41C23 41 16 34 16 24Z'
const HANDLE_LEFT = 'M16 13H9V19C9 25 12 28 17 29'
const HANDLE_RIGHT = 'M48 13H55V19C55 25 52 28 47 29'
const STAR = 'M0 -6Q1 -1 6 0Q1 1 0 6Q-1 1 -6 0Q-1 -1 0 -6Z'
const EMBLEM = 'M32 14L34.4 19.2L40 19.8L35.8 23.6L37 29L32 26.2L27 29L28.2 23.6L24 19.8L29.6 19.2Z'

const paint = (token: string) => ({ stopColor: `var(--play-golf-gold-${token})` })

/**
 * Gold trophy gleaming
 * @param {Object} props - Trophy
 * @param {string} [props.className] - Placement, over the scorecard by default
 * @return {JSX.Element}
 */

export const GolfTrophy = ({ className = GOLF_SCORECARD.trophy }: { className?: string }) => {
  const id = useId()
  const body = `${id}-body`
  const clip = `${id}-clip`

  return (
    <svg className={className} viewBox="-14 -8 92 76" role="presentation" aria-hidden="true">
      <defs>
        <linearGradient id={body} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" style={paint('deep')} />
          <stop offset="0.3" style={paint('light')} />
          <stop offset="0.6" style={paint('base')} />
          <stop offset="1" style={paint('deep')} />
        </linearGradient>
        <clipPath id={clip}>
          <path d={CUP} />
          <rect x="28" y="40" width="8" height="9" />
          <rect x="22" y="48" width="20" height="6" rx="1" />
          <rect x="17" y="53" width="30" height="7" rx="1.5" />
        </clipPath>
      </defs>
      {/* Handles */}
      <g fill="none" strokeWidth="4" strokeLinejoin="round" stroke="var(--play-golf-gold-deep)">
        <path d={HANDLE_LEFT} />
        <path d={HANDLE_RIGHT} />
      </g>
      {/* Stem and base */}
      <g fill={`url(#${body})`}>
        <rect x="28" y="40" width="8" height="9" />
        <rect x="22" y="48" width="20" height="6" rx="1" />
        <rect x="17" y="53" width="30" height="7" rx="1.5" />
      </g>
      <rect x="17" y="58" width="30" height="2" fill="var(--play-golf-gold-rim)" />
      {/* Cup */}
      <path d={CUP} fill={`url(#${body})`} />
      <rect x="14" y="6" width="36" height="5" rx="1.5" fill="var(--play-golf-gold-light)" />
      <path d={EMBLEM} fill="var(--play-golf-gold-rim)" opacity="0.55" />
      <path
        d="M21 14V24C21 29 24 33 28 35"
        fill="none"
        stroke="var(--play-golf-gold-shine)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />
      {/* Sheen sweep */}
      <g clipPath={`url(#${clip})`}>
        <g transform="skewX(-20)">
          <rect
            className={GOLF_SCORECARD.trophySheen}
            x="0"
            y="0"
            width="7"
            height="64"
            fill="var(--play-golf-gold-shine)"
          />
        </g>
      </g>
      {/* Twinkling stars */}
      {GOLF_TROPHY_STARS.map((star) => (
        <g
          key={`${star.x}-${star.y}`}
          transform={`translate(${star.x} ${star.y}) scale(${star.scale})`}
        >
          <path
            className={GOLF_SCORECARD.trophyStar}
            d={STAR}
            fill="var(--play-golf-gold-light)"
            style={{ animationDelay: star.delay }}
          />
        </g>
      ))}
    </svg>
  )
}
