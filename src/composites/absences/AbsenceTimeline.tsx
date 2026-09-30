import { StepTimeline, type TimelineStep } from '@/components/structures/StepTimeline'
import { ABSENCE_COPY } from '@/declarations/absences/copy'

import type { MemberAbsence } from '@/types/members'
import { AbsenceStatuses } from '@/utils/constants/workflow'

export interface AbsenceTimelineProps {
  absence: MemberAbsence
}

/**
 * Horizontal progress of one request, informative only, never an authorisation
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

  return (
    <div className="mx-auto w-full max-w-sm">
      <StepTimeline steps={steps} label={ABSENCE_COPY.timelineLabel} />
    </div>
  )
}
