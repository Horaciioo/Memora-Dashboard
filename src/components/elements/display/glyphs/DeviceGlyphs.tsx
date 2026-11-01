import { useId } from 'react'

import type { GlyphProps } from '@/components/elements/display/glyphs/BrandGlyphs'
import { APP_ASSETS } from '@/declarations/app'

/**
 * Phone whose screen shows the Memora brain
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const PhoneGlyph = ({ className }: GlyphProps) => {
  const scope = useId()
  const screenId = `${scope}-screen`
  const clipId = `${scope}-clip`

  return (
    <svg viewBox="0 0 24 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={screenId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="var(--color-brand-soft)" />
        </linearGradient>
        <clipPath id={clipId}>
          <rect x="3.2" y="3.2" width="17.6" height="25.6" rx="2.6" />
        </clipPath>
      </defs>
      <rect x="1" y="1" width="22" height="30" rx="4.6" fill="currentColor" />
      <rect x="3.2" y="3.2" width="17.6" height="25.6" rx="2.6" fill={`url(#${screenId})`} />
      <image
        href={APP_ASSETS.brain}
        x="4.6"
        y="8.2"
        width="14.8"
        height="16.6"
        preserveAspectRatio="xMidYMid meet"
        clipPath={`url(#${clipId})`}
      />
      <rect x="9" y="4.4" width="6" height="1.6" rx="0.8" fill="currentColor" opacity="0.85" />
    </svg>
  )
}
