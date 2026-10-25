import { useId } from 'react'

import { BOMB_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * Colour stop from a token
 * @param {string} token - Colour token
 * @return {object} - Style prop
 */

const stop = (token: string) => ({ style: { stopColor: `var(${token})` } })

export interface BombDrawingProps {
  // Syllable written on the shell
  prompt: string
  // Bomb went off just now
  isBlasting: boolean
  className?: string
}

/**
 * Round iron bomb, brass cap, curled cord and a live spark, the syllable on its belly
 * @param {BombDrawingProps} props - Prompt and blast
 * @return {JSX.Element}
 */

export const BombDrawing = ({ prompt, isBlasting, className }: BombDrawingProps) => {
  const id = useId()
  const shell = `${id}-shell`
  const cap = `${id}-cap`
  const glow = `${id}-glow`

  return (
    <div className={cn(BOMB_BOARD.bomb, isBlasting && BOMB_BOARD.bombBlast, className)}>
      <svg viewBox="0 0 200 200" className={BOMB_BOARD.bombArt} aria-hidden="true">
        <defs>
          <radialGradient id={shell} cx="0.36" cy="0.32" r="0.75">
            <stop offset="0" {...stop('--play-bomb-cap')} />
            <stop offset="0.45" {...stop('--play-bomb-shell')} />
            <stop offset="1" {...stop('--play-bomb-shell-deep')} />
          </radialGradient>
          <linearGradient id={cap} x1="0" x2="1">
            <stop offset="0" {...stop('--play-bomb-cap')} />
            <stop offset="1" {...stop('--play-bomb-cap-deep')} />
          </linearGradient>
          <radialGradient id={glow}>
            <stop offset="0" {...stop('--play-bomb-glow')} />
            <stop offset="1" {...stop('--play-bomb')} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ground shadow */}
        <ellipse cx="100" cy="186" rx="56" ry="8" fill="var(--play-track)" />

        {/* Cord curling out of the cap */}
        <path
          d="M132 52c6-14 18-22 30-18s14 16 6 22"
          fill="none"
          stroke="var(--play-bomb-cord)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="7 4"
        />

        {/* Cap */}
        <g transform="rotate(38 128 62)">
          <rect x="112" y="46" width="34" height="26" rx="5" fill={`url(#${cap})`} />
          <rect x="108" y="66" width="42" height="8" rx="3" fill="var(--play-bomb-cap-deep)" />
        </g>

        {/* Shell */}
        <circle cx="96" cy="118" r="66" fill={`url(#${shell})`} />
        <ellipse
          cx="70"
          cy="88"
          rx="20"
          ry="12"
          fill="var(--play-bomb-shine)"
          transform="rotate(-35 70 88)"
        />
        <circle
          cx="96"
          cy="118"
          r="66"
          fill="none"
          stroke="var(--play-bomb-shell-deep)"
          strokeWidth="3"
        />

        {/* Spark at the cord tip */}
        <g className={BOMB_BOARD.spark}>
          <circle cx="168" cy="54" r="16" fill={`url(#${glow})`} />
          <path d="m168 40 3 9 9 3-9 3-3 9-3-9-9-3 9-3z" fill="var(--play-bomb-glow)" />
        </g>
      </svg>

      <span className={BOMB_BOARD.prompt}>{prompt}</span>
    </div>
  )
}
