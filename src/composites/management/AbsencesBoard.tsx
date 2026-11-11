'use client'

import { useMemo, useState } from 'react'
import { AbsenceReason } from '@/components/elements/display/AbsenceReason'
import { Status } from '@/components/elements/display/Status'
import type { FilterDefinition } from '@/components/structures/data/FilterBar'
import { FormDrawer } from '@/components/structures/overlays/FormDrawer'
import {
  ManagementBoard,
  type BoardGroup,
  type BoardRow,
} from '@/composites/management/ManagementBoard'
import { useAbsences } from '@/core/hooks/data/people/useAbsences'
import { toOptions } from '@/core/lib/forms/options'
import { memberFacets } from '@/core/lib/management/board'
import { ABSENCE_COPY } from '@/declarations/absences/copy'
import { MANAGEMENT_BOARD_COPY } from '@/declarations/management/copy'
import { ABSENCE_STATUS_REGISTRY } from '@/declarations/reference/registries'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'
import { MANAGEMENT_BOARD } from '@/declarations/ui/variants'
import type { FieldDefinition, FieldOption, FormValues } from '@/types/forms'
import type { ManagedAbsences } from '@/types/management'
import type { MemberAbsence } from '@/types/members'
import { AbsenceStatuses } from '@/utils/constants/workflow'
import type { AbsenceStatusName } from '@/utils/constants/workflow'
import { absenceReasonText, isFinishedAbsence } from '@/utils/format/absences'
import { formatDayRange } from '@/utils/format/time/dates'
import { startOfDay } from '@/utils/format/time/days'

const COPY = MANAGEMENT_BOARD_COPY.absences

// Boxes in reading order
const GROUPS: BoardGroup[] = [
  { key: AbsenceStatuses.Pending, label: COPY.groupPending },
  { key: 'active', label: COPY.groupActive },
  { key: 'finished', label: COPY.groupFinished, collapsed: true },
  { key: 'closed', label: COPY.groupClosed, collapsed: true },
]

/**
 * Box an absence belongs to
 * @param {MemberAbsence} absence - Request
 * @param {number} today - Start of today
 * @return {string} - Group key
 */

const groupOf = (absence: MemberAbsence, today: number): string => {
  if (absence.status === AbsenceStatuses.Pending) return AbsenceStatuses.Pending
  if (absence.status !== AbsenceStatuses.Approved) return 'closed'

  return isFinishedAbsence(absence, today) ? 'finished' : 'active'
}

export interface AbsencesBoardProps {
  initial: ManagedAbsences
  fields: FieldDefinition[]
  youtubers: FieldOption[]
  canReview: boolean
}

/**
 * Absences of the whole team, sorted by what they wait for
 * @param {ManagedAbsences} initial - Requests and owners read server-side
 * @param {FieldDefinition[]} fields - Declarations of the review form
 * @param {FieldOption[]} youtubers - Creator filter options
 * @param {boolean} canReview - Viewer settles requests
 * @return {JSX.Element}
 */

export const AbsencesBoard = ({ initial, fields, youtubers, canReview }: AbsencesBoardProps) => {
  const { absences, isSaving, issues, clearIssues, review } = useAbsences(initial.absences)
  const [reviewing, setReviewing] = useState<{
    absence: MemberAbsence
    status: AbsenceStatusName
  } | null>(null)

  const members = useMemo(
    () => new Map(initial.members.map((member) => [member.id, member])),
    [initial.members]
  )

  const openReview = (absence: MemberAbsence, status: AbsenceStatusName) => {
    clearIssues()
    setReviewing({ absence, status })
  }

  const filters: FilterDefinition[] = [
    {
      name: 'status',
      label: COPY.status,
      allLabel: COPY.allStatuses,
      options: toOptions(ABSENCE_STATUS_REGISTRY),
      mark: 'dot',
    },
  ]

  const today = startOfDay(new Date()).getTime()

  const rows: BoardRow[] = absences.flatMap((absence) => {
    const member = members.get(absence.accountId)
    if (!member) return []

    const reason = absenceReasonText(absence)

    return {
      id: absence.id,
      member,
      group: groupOf(absence, today),
      haystack: [reason ?? ''],
      facets: { ...memberFacets(member), status: [absence.status] },
      body: (
        <>
          <span className={MANAGEMENT_BOARD.title}>
            {formatDayRange(absence.startDate, absence.endDate)}
          </span>
          <span className={MANAGEMENT_BOARD.detail}>
            {absence.dayCount === 1
              ? ABSENCE_COPY.durationOne
              : ABSENCE_COPY.duration.replace('{days}', String(absence.dayCount))}
          </span>
          <AbsenceReason reason={reason} />
        </>
      ),
      aside:
        canReview && absence.status === AbsenceStatuses.Pending ? (
          <>
            <button
              type="button"
              className={MANAGEMENT_BOARD.action}
              onClick={() => openReview(absence, AbsenceStatuses.Refused)}
            >
              {ABSENCE_COPY.refuse}
            </button>
            <button
              type="button"
              className={MANAGEMENT_BOARD.link}
              onClick={() => openReview(absence, AbsenceStatuses.Approved)}
            >
              {ABSENCE_COPY.approve}
            </button>
          </>
        ) : (
          <Status
            label={ABSENCE_STATUS_REGISTRY.label(absence.status)}
            accent={ABSENCE_STATUS_REGISTRY.get(absence.status).accent}
          />
        ),
    }
  })

  return (
    <>
      <ManagementBoard
        rows={rows}
        groups={GROUPS}
        youtubers={youtubers}
        filters={filters}
        searchLabel={COPY.search}
        figure="absences"
        emptyTitle={COPY.emptyTitle}
        emptyDescription={COPY.emptyDescription}
      />

      <FormDrawer
        subject={FORM_SUBJECTS.absence}
        open={reviewing !== null}
        title={ABSENCE_COPY.reviewTitle}
        description={
          reviewing
            ? `${reviewing.absence.memberName}, ${formatDayRange(reviewing.absence.startDate, reviewing.absence.endDate)}`
            : ''
        }
        fields={fields}
        issues={issues}
        isSaving={isSaving}
        submitVerb={
          reviewing?.status === AbsenceStatuses.Approved
            ? ABSENCE_COPY.approve
            : ABSENCE_COPY.refuse
        }
        onSubmit={async (values: FormValues) => {
          const saved = await review(reviewing!.absence.id, reviewing!.status, values)
          if (saved) setReviewing(null)

          return saved
        }}
        onClose={() => setReviewing(null)}
      />
    </>
  )
}
