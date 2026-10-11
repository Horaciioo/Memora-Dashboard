import { ABSENCE_COPY } from '@/declarations/absences/copy'
import { ABSENCE_REASON } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface AbsenceReasonProps {
  reason: string | null
  className?: string
}

/**
 * Reason of an absence, italic in a small box
 * @param {string | null} reason - Reason written, if any
 * @param {string} [className] - Extra classes
 * @return {JSX.Element}
 */

export const AbsenceReason = ({ reason, className }: AbsenceReasonProps) => (
  <span
    className={cn(
      ABSENCE_REASON.box,
      reason ? ABSENCE_REASON.filled : ABSENCE_REASON.empty,
      className
    )}
  >
    {reason ?? ABSENCE_COPY.noReason}
  </span>
)
