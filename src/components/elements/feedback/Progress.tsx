import { PROGRESS_STYLES } from '@/declarations/ui/variants'
import { TONES, type Tone } from '@/declarations/ui/theme'
import { cn } from '@/utils/classnames'

export interface ProgressProps {
  value: number
  max?: number
  tone?: Tone
  label?: string
  // Halves the track height and drops the caption row
  compact?: boolean
  className?: string
}

/**
 * Horizontal completion bar, its ratio always announced so colour is never the only carrier
 * @param {number} value - Current progress
 * @param {number} [max] - Upper bound, defaults to a percentage
 * @param {Tone} [tone] - Colour tone, defaults to brand
 * @param {string} [label] - Caption shown above the track
 * @param {boolean} [compact] - Thin track without the caption row
 * @param {string} [className] - Extra classes merged onto the frame
 * @return {JSX.Element}
 */

export const Progress = ({
  value,
  max = 100,
  tone = 'brand',
  label,
  compact,
  className,
}: ProgressProps) => {
  // A malformed bound never renders a broken bar
  const bound = max > 0 ? max : 100
  const current = Math.min(Math.max(value, 0), bound)
  const ratio = Math.round((current / bound) * 100)

  return (
    <div className={cn(PROGRESS_STYLES.frame, className)}>
      {!compact && label && (
        <span className={PROGRESS_STYLES.label}>
          {label}
          <span className={PROGRESS_STYLES.value}>{`${ratio}%`}</span>
        </span>
      )}
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={bound}
        className={cn(PROGRESS_STYLES.track, compact && PROGRESS_STYLES.trackCompact)}
      >
        <span
          className={cn(PROGRESS_STYLES.fill, TONES[tone].dot)}
          style={{ width: `${ratio}%` }}
        />
      </div>
    </div>
  )
}
