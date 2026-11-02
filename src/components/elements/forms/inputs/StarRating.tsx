import { useState } from 'react'
import type { CSSProperties } from 'react'

import { FavoriteStar } from '@/components/elements/display/FavoriteStar'
import { STAR_RATING } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface StarRatingProps {
  value: number
  count: number
  label: string
  disabled?: boolean
  isSmall?: boolean
  onCommit?: (value: number) => void
}

// Colour by share of full stars
const toneOf = (value: number, count: number) => {
  const share = value / count
  if (share >= 1) return STAR_RATING.tones.full
  if (share >= 0.75) return STAR_RATING.tones.good
  if (share >= 0.5) return STAR_RATING.tones.medium

  return STAR_RATING.tones.low
}

/**
 * Stars picked by click
 * @param {number} value - Lit stars
 * @param {number} count - Stars shown
 * @param {string} label - Accessible name
 * @param {boolean} [disabled] - Blocks the stars
 * @param {boolean} [isSmall] - Compact glyphs
 * @param {(value: number) => void} [onCommit] - Called with the picked count
 * @return {JSX.Element}
 */

export const StarRating = ({
  value,
  count,
  label,
  disabled,
  isSmall,
  onCommit,
}: StarRatingProps) => {
  const tone = toneOf(value, count)
  const isFull = value === count

  // Hops only once picked here
  const [justFilled, setJustFilled] = useState(false)

  const pick = (rank: number) => {
    const next = rank === value ? 0 : rank
    setJustFilled(next === count)
    onCommit?.(next)
  }

  return (
    <span role="radiogroup" aria-label={label} className={STAR_RATING.root}>
      {Array.from({ length: count }, (_, index) => {
        const rank = index + 1
        const isLit = rank <= value

        return (
          <button
            key={rank}
            type="button"
            role="radio"
            aria-checked={rank === value}
            aria-label={`${rank}/${count}`}
            disabled={disabled}
            // Same star again clears
            onClick={() => pick(rank)}
            style={
              {
                '--star-i': index,
                '--star-step': STAR_RATING.step,
              } as CSSProperties
            }
            className={cn(
              STAR_RATING.star,
              !isLit && STAR_RATING.idle,
              isLit && isFull && justFilled && STAR_RATING.hop
            )}
          >
            <FavoriteStar
              isOutline={!isLit}
              color={tone}
              isGleaming={isLit && isFull}
              className={isSmall ? STAR_RATING.small : STAR_RATING.glyph}
            />
          </button>
        )
      })}
    </span>
  )
}
