import { DELTA_MARK } from '@/declarations/ui/variants'
import { ICONS } from '@/declarations/ui/icons'
import { TONES } from '@/declarations/ui/theme'
import { cn } from '@/utils/classnames'

/**
 * Whether a rise is good
 * @type {'higherIsBetter' | 'lowerIsBetter'}
 */

export type DeltaSense = 'higherIsBetter' | 'lowerIsBetter'

export interface DeltaMarkProps {
  // Now minus before
  gap: number | null
  sense?: DeltaSense
  // Printed after the glyph
  figure?: string
  className?: string
}

/**
 * Rise or fall of a figure
 * @param {number | null} gap - Signed change
 * @param {DeltaSense} [sense] - Good direction
 * @param {string} [figure] - Printed gap
 * @param {string} [className] - Extra classes
 * @return {JSX.Element | null}
 */

export const DeltaMark = ({ gap, sense = 'higherIsBetter', figure, className }: DeltaMarkProps) => {
  if (gap === null || gap === 0) return null

  const isUp = gap > 0
  const isGood = isUp === (sense === 'higherIsBetter')
  const Glyph = isUp ? ICONS.climb : ICONS.drop

  return (
    <span className={cn(DELTA_MARK.wrap, TONES[isGood ? 'success' : 'danger'].text, className)}>
      <Glyph className={DELTA_MARK.glyph} aria-hidden="true" />
      {figure}
    </span>
  )
}
