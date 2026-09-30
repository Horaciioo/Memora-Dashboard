'use client'

import { useMemo, useState } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { Button } from '@/components/elements/actions/Button'
import { FormDrawer } from '@/components/structures/FormDrawer'
import { Section } from '@/components/structures/Section'
import { useAbsences } from '@/core/hooks/data/useAbsences'
import { ABSENCE_COPY } from '@/declarations/absences/copy'
import { HOME_SETTINGS } from '@/declarations/configurations/settings'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'
import { HOME_STYLES } from '@/declarations/ui/variants'
import type { FieldDefinition, FormValues } from '@/types/forms'
import type { MemberAbsence } from '@/types/members'
import { AbsenceStatuses } from '@/utils/constants/workflow'
import type { AbsenceStatusName } from '@/utils/constants/workflow'
import { absenceReasonText } from '@/utils/format/absences'
import { formatDayRange } from '@/utils/format/dates'

export interface HomeAbsenceRequestsProps {
  initial: MemberAbsence[]
  reviewFields: FieldDefinition[]
}

/**
 * Absence requests waiting on the viewer, settled without leaving home
 * @param {MemberAbsence[]} initial - Pending requests resolved server-side
 * @param {FieldDefinition[]} reviewFields - Declarations of the review form
 * @return {JSX.Element | null}
 */

export const HomeAbsenceRequests = ({ initial, reviewFields }: HomeAbsenceRequestsProps) => {
  const { absences, isSaving, issues, clearIssues, review } = useAbsences(initial)
  const [expanded, setExpanded] = useState(false)
  const [reviewing, setReviewing] = useState<{
    absence: MemberAbsence
    status: AbsenceStatusName
  } | null>(null)

  // A settled request leaves the list
  const pending = useMemo(
    () => absences.filter((absence) => absence.status === AbsenceStatuses.Pending),
    [absences]
  )

  if (pending.length === 0) return null

  const shown = expanded ? pending : pending.slice(0, HOME_SETTINGS.taskMax)

  const openReview = (absence: MemberAbsence, status: AbsenceStatusName) => {
    clearIssues()
    setReviewing({ absence, status })
  }

  return (
    <Section title={ABSENCE_COPY.queueTitle} bare>
      <ul className={HOME_STYLES.rows}>
        {shown.map((absence) => (
          <li key={absence.id} className={HOME_STYLES.line}>
            <Avatar name={absence.memberName} size="md" />
            <span className={HOME_STYLES.rowBody}>
              <span className={HOME_STYLES.rowTitle}>{absence.memberName}</span>
              <span className={HOME_STYLES.rowMeta}>
                {[formatDayRange(absence.startDate, absence.endDate), absenceReasonText(absence)]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            </span>
            <span className={HOME_STYLES.actions}>
              <Button
                variant="icon"
                icon="success"
                aria-label={ABSENCE_COPY.approve}
                onClick={() => openReview(absence, AbsenceStatuses.Approved)}
              />
              <Button
                variant="icon"
                icon="blocked"
                aria-label={ABSENCE_COPY.refuse}
                onClick={() => openReview(absence, AbsenceStatuses.Refused)}
              />
            </span>
          </li>
        ))}
      </ul>
      {pending.length > HOME_SETTINGS.taskMax && (
        <button type="button" className={HOME_STYLES.more} onClick={() => setExpanded(!expanded)}>
          {expanded ? ABSENCE_COPY.showLess : ABSENCE_COPY.showAll}
        </button>
      )}

      <FormDrawer
        subject={FORM_SUBJECTS.absence}
        open={reviewing !== null}
        title={ABSENCE_COPY.reviewTitle}
        description={
          reviewing
            ? `${reviewing.absence.memberName} · ${formatDayRange(reviewing.absence.startDate, reviewing.absence.endDate)}`
            : ''
        }
        fields={reviewFields}
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
    </Section>
  )
}
