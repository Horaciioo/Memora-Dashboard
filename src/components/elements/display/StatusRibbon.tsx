import { RIBBON_STYLES } from '@/declarations/ui/variants'
import { TONES, type Tone } from '@/declarations/ui/theme'
import { cn } from '@/utils/classnames'

export interface StatusRibbonProps {
  label: string
  tone?: Tone
  className?: string
}

/**
 * Corner ribbon spotlighting a record's status, folded edges for a touch of depth
 * @param {string} label - Ribbon text
 * @param {Tone} [tone] - Colour tone, defaults to neutral
 * @param {string} [className] - Extra classes merged onto the clipping corner
 * @return {JSX.Element}
 */

export const StatusRibbon = ({ label, tone = 'neutral', className }: StatusRibbonProps) => (
  <span className={cn(RIBBON_STYLES.wrap, className)}>
    <span className={cn(RIBBON_STYLES.band, TONES[tone].dot, 'text-[var(--color-on-brand)]')}>
      {label}
      <span className={RIBBON_STYLES.sheen} aria-hidden="true" />
      <span className={cn(RIBBON_STYLES.fold, RIBBON_STYLES.foldLeft)} aria-hidden="true" />
      <span className={cn(RIBBON_STYLES.fold, RIBBON_STYLES.foldRight)} aria-hidden="true" />
    </span>
  </span>
)
