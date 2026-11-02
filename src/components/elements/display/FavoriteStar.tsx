import { useId } from 'react'

export interface FavoriteStarProps {
  className?: string
  // Outline only, in the current text colour
  isOutline?: boolean
  // Base colour replacing the gold
  color?: string
  // Soft band of light crossing
  isGleaming?: boolean
}

// Five points
const STAR =
  'M12 2.2l2.82 5.72 6.31.92-4.57 4.45 1.08 6.29L12 16.53l-5.64 2.97 1.08-6.29-4.57-4.45 6.31-.92z'

/**
 * Gold star of the favorites
 * @param {FavoriteStarProps} props - Sizing class, outline, colour, sheen
 * @return {JSX.Element}
 */

export const FavoriteStar = ({
  className,
  isOutline = false,
  color,
  isGleaming = false,
}: FavoriteStarProps) => {
  const id = useId()
  const fillId = `${id}-fill`
  const clipId = `${id}-clip`

  if (isOutline) {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path d={STAR} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={fillId} x1="4" y1="3" x2="20" y2="21" gradientUnits="userSpaceOnUse">
          <stop
            offset="0"
            style={{
              stopColor: color
                ? `color-mix(in srgb, ${color} 40%, white)`
                : 'var(--color-gold-100)',
            }}
          />
          <stop offset="1" style={{ stopColor: color ?? 'var(--color-gold-400)' }} />
        </linearGradient>
      </defs>
      <path d={STAR} fill={`url(#${fillId})`} />
      <path
        d={STAR}
        fill={color ? `color-mix(in srgb, ${color} 75%, white)` : 'var(--color-gold-300)'}
        opacity="0.5"
        transform="translate(12 12) scale(0.5) translate(-12 -12)"
      />
      <circle cx="9.4" cy="8.6" r="1.1" fill="white" opacity="0.7" />
      {isGleaming && (
        <>
          <clipPath id={clipId}>
            <path d={STAR} />
          </clipPath>
          <g clipPath={`url(#${clipId})`}>
            <rect
              className="star-sheen"
              x="-6"
              y="0"
              width="4"
              height="24"
              fill="white"
              opacity="0.45"
              transform="skewX(-20)"
            />
          </g>
        </>
      )}
    </svg>
  )
}
