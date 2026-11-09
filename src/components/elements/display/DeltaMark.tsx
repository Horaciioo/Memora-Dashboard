import { ClimbGlyph } from '@/components/elements/display/glyphs/Glyphs'
import { MODVIEW_DELTA } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface DeltaMarkProps {
  // Rise to print, nothing for zero
  value: number
  tone: 'good' | 'bad'
  className?: string
}

/**
 * Rise of a figure over the live, set right of it
 * @param {number} value - Gap printed after the glyph
 * @param {'good' | 'bad'} tone - Green for a good rise, red for a bad one
 * @param {string} [className] - Extra classes
 * @return {JSX.Element | null}
 */

export const DeltaMark = ({ value, tone, className }: DeltaMarkProps) =>
  value > 0 ? (
    <span className={cn(MODVIEW_DELTA.wrap, MODVIEW_DELTA[tone], className)}>
      <ClimbGlyph className={MODVIEW_DELTA.glyph} />
      {value}
    </span>
  ) : null
