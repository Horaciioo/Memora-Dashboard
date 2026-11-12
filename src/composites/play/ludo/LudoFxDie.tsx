import { LUDO_PIPS } from '@/declarations/play/ludo/board'

// Side of the pip grid, spacing in viewbox units
const SIDE = 3
const GAP = 25

export interface LudoFxDieProps {
  value: number
  className?: string
}

/**
 * Flat die drawn in svg, for the effects
 * @param {LudoFxDieProps} props - Die
 * @return {JSX.Element}
 */

export const LudoFxDie = ({ value, className }: LudoFxDieProps) => (
  <svg viewBox="0 0 100 106" className={className} aria-hidden="true">
    <rect x="4" y="12" width="92" height="92" rx="22" fill="var(--play-ludo-die-side)" />
    <rect x="4" y="4" width="92" height="92" rx="22" fill="var(--play-ludo-die)" />
    {LUDO_PIPS[value].map((cell) => (
      <circle
        key={cell}
        cx={GAP + ((cell - 1) % SIDE) * GAP}
        cy={GAP + Math.floor((cell - 1) / SIDE) * GAP}
        r="8.5"
        fill="var(--play-ludo-pip)"
      />
    ))}
  </svg>
)
