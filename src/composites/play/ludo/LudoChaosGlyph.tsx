import type { ReactNode } from 'react'

import { LUDO_CHAOS_GLYPHS } from '@/declarations/play/ludo/chaosGlyphs'
import type { LudoGlyphName } from '@/declarations/play/ludo/chaosGlyphs'
import { cn } from '@/utils/classnames'

export interface LudoChaosGlyphProps {
  name: LudoGlyphName
  className?: string
}

/**
 * Line glyph of a Chaos effect or of the joker
 * @param {LudoChaosGlyphProps} props - Glyph
 * @return {JSX.Element}
 */

export const LudoChaosGlyph = ({ name, className }: LudoChaosGlyphProps): ReactNode => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn('size-full', className)}
    aria-hidden="true"
  >
    {LUDO_CHAOS_GLYPHS[name].map((path) => (
      <path key={path} d={path} />
    ))}
  </svg>
)
