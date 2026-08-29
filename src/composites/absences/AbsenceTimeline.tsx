import { Badge } from '@/components/elements/display/Badge'
import { StepTimeline, type TimelineStep } from '@/components/structures/StepTimeline'
import { ABSENCE_COPY } from '@/declarations/absences/copy'
import { ABSENCE_STATUS_REGISTRY } from '@/declarations/reference/registries'
import { SECTION_STYLES } from '@/declarations/ui/variants'

import type { MemberAbsence } from '@/types/members'
import { AbsenceStatuses } from '@/utils/constants/workflow'
import { cn } from '@/utils/classnames'
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
  const status = ABSENCE_STATUS_REGISTRY.get(absence.status)
  const acknowledged = absence.status !== AbsenceStatuses.Pending

  const steps: TimelineStep[] = [
    { id: 'drafting', label: ABSENCE_COPY.timelineDrafting, state: 'done' },
    { id: 'declared', label: ABSENCE_COPY.timelineDeclared, state: 'done' },
    {
      id: 'acknowledged',
      label: ABSENCE_COPY.timelineAcknowledged,
      state: acknowledged ? 'done' : 'current',
    },
  ]

  return (
    <div className={cn(SECTION_STYLES.panel, SECTION_STYLES.panelPadded, 'flex flex-col gap-6')}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="flex flex-col gap-0.5">
          <span className="font-semibold">
            {formatDayRange(absence.startDate, absence.endDate)}
          </span>
          {absence.reason && (
            <span className="text-sm text-[var(--color-ink-subtle)]">{absence.reason}</span>
          )}
        </span>
        <Badge label={status.label} accent={status.accent} dot />
      </div>

      <StepTimeline steps={steps} label={ABSENCE_COPY.timelineLabel} />
    </div>
  )
}
