import type { LudoCornerName } from '@/declarations/play/ludo/board'
import { LUDO_PIECES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * Pawn drawn on a 40 × 44 grid, for any svg
 * @param {Object} props - Pawn
 * @param {LudoCornerName} props.colour - Colour
 * @return {JSX.Element}
 */

export const LudoPawnShape = ({ colour }: { colour: LudoCornerName }) => (
  <>
    {/* Shadow on the board */}
    <ellipse cx="23" cy="31" rx="17" ry="12" fill="var(--play-ludo-shadow)" />
    {/* Body side */}
    <path
      d="M3 18v8a17 13 0 0 0 34 0v-8z"
      fill="var(--play-ludo-pawn-side)"
      stroke="var(--play-ludo-pawn-rim)"
      strokeWidth="0.6"
    />
    {/* Top face */}
    <ellipse cx="20" cy="18" rx="17" ry="13" fill="var(--play-ludo-pawn)" />
    {/* Coloured cap */}
    <ellipse cx="20" cy="18" rx="9.5" ry="7.4" fill={`var(--play-ludo-${colour}-deep)`} />
    <ellipse cx="20" cy="17.2" rx="8.6" ry="6.5" fill={`var(--play-ludo-${colour})`} />
  </>
)

/**
 * White draughtsman with a coloured cap, seen from above at an angle
 * @param {Object} props - Pawn
 * @param {LudoCornerName} props.colour - Colour
 * @param {string} [props.className] - Extra classes
 * @return {JSX.Element}
 */

export const LudoPawn = ({ colour, className }: { colour: LudoCornerName; className?: string }) => (
  <svg viewBox="0 0 40 44" className={cn(LUDO_PIECES.pawnArt, className)} aria-hidden="true">
    <LudoPawnShape colour={colour} />
  </svg>
)
