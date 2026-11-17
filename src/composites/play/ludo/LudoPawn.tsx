import { useId } from 'react'

import type { LudoCornerName } from '@/declarations/play/ludo/board'
import { LUDO_PIECES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * Pawn drawn on a 40 × 44 grid, for any svg
 * @param {Object} props - Pawn
 * @param {LudoCornerName} props.colour - Colour
 * @param {string | null} [props.avatarUrl] - Face on the top, white when absent
 * @return {JSX.Element}
 */

export const LudoPawnShape = ({
  colour,
  avatarUrl,
}: {
  colour: LudoCornerName
  avatarUrl?: string | null
}) => {
  const clipId = useId()

  return (
    <>
      {/* Shadow on the board */}
      <ellipse cx="23" cy="31" rx="17" ry="12" fill="var(--play-ludo-shadow)" />
      {/* Body side */}
      <path
        d="M3 18v8a17 13 0 0 0 34 0v-8z"
        fill={`var(--play-ludo-${colour}-deep)`}
        stroke="var(--play-ludo-pawn-rim)"
        strokeWidth="0.6"
      />
      {/* Top face in the player's colour */}
      <ellipse cx="20" cy="18" rx="17" ry="13" fill={`var(--play-ludo-${colour})`} />
      {/* Face of the player, white when none */}
      <ellipse cx="20" cy="17.4" rx="11.6" ry="9" fill="var(--play-ludo-pawn)" />
      {avatarUrl && (
        <>
          <clipPath id={clipId}>
            <ellipse cx="20" cy="17.4" rx="11.6" ry="9" />
          </clipPath>
          <image
            href={avatarUrl}
            x="8.4"
            y="8.4"
            width="23.2"
            height="18"
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#${clipId})`}
          />
        </>
      )}
    </>
  )
}

/**
 * Coloured draughtsman with the player's face, seen from above at an angle
 * @param {Object} props - Pawn
 * @param {LudoCornerName} props.colour - Colour
 * @param {string | null} [props.avatarUrl] - Face on the top
 * @param {string} [props.className] - Extra classes
 * @return {JSX.Element}
 */

export const LudoPawn = ({
  colour,
  avatarUrl,
  className,
}: {
  colour: LudoCornerName
  avatarUrl?: string | null
  className?: string
}) => (
  <svg viewBox="0 0 40 44" className={cn(LUDO_PIECES.pawnArt, className)} aria-hidden="true">
    <LudoPawnShape colour={colour} avatarUrl={avatarUrl} />
  </svg>
)
