import { GLYPH_STYLES, type GlyphSize } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface GlyphProps {
  value: string | null
  size?: GlyphSize
  className?: string
}

/**
 * Emoji of a record, drawn bare beside its title and never inside a frame
 * @param {string | null} value - Stored glyph
 * @param {GlyphSize} [size] - Text size, card by default
 * @param {string} [className] - Extra classes merged onto the glyph
 * @return {JSX.Element | null}
 */

export const Glyph = ({ value, size = 'card', className }: GlyphProps) => {
  if (!value) return null

  return (
    <span aria-hidden="true" className={cn(GLYPH_STYLES.base, GLYPH_STYLES[size], className)}>
      {value}
    </span>
  )
}
