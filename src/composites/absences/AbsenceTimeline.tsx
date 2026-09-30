import { StepTimeline, type TimelineStep } from '@/components/structures/StepTimeline'
import { ABSENCE_COPY } from '@/declarations/absences/copy'
import { SECTION_STYLES } from '@/declarations/ui/variants'

import type { MemberAbsence } from '@/types/members'
import { AbsenceStatuses } from '@/utils/constants/workflow'
import { cn } from '@/utils/classnames'
import { absenceReasonText } from '@/utils/format/absences'
import { formatDayRange } from '@/utils/format/dates'

export interface AbsenceTimelineProps {
  absence: MemberAbsence
}

/**
 * Horizontal progress of one request, informative only — never an authorisation
 * @param {MemberAbsence} absence - Most recent request
 * @return {JSX.Element}
 */

export const AbsenceTimeline = ({ absence }: AbsenceTimelineProps) => {
  const acknowledged = absence.status !== AbsenceStatuses.Pending

  const steps: TimelineStep[] = [
    { id: 'declared', label: ABSENCE_COPY.timelineDeclared, state: 'done' },
    {
      id: 'acknowledged',
      label: ABSENCE_COPY.timelineAcknowledged,
      state: acknowledged ? 'done' : 'current',
    },
  ]
  const reasonText = absenceReasonText(absence)

  return (
    <div className={cn(SECTION_STYLES.panel, SECTION_STYLES.panelPadded, 'flex flex-col gap-6')}>
      <span className="font-semibold">{formatDayRange(absence.startDate, absence.endDate)}</span>

      <div className="mx-auto w-full max-w-sm">
        <StepTimeline steps={steps} label={ABSENCE_COPY.timelineLabel} />
      </div>

      {reasonText && (
        <p
          className={cn(
            SECTION_STYLES.panel,
            'bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-ink-subtle)]'
          )}
        >
          {reasonText}
        </p>
      )}
    </div>
  )
}
