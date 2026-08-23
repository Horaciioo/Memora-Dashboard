'use client'

import { useMemo, useState } from 'react'
import { Avatar } from '@/components/elements/display/Avatar'
import { Badge } from '@/components/elements/display/Badge'
import { Button } from '@/components/elements/actions/Button'
import { AddRow } from '@/components/structures/AddRow'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { FormDialog } from '@/components/structures/FormDialog'
import { Section } from '@/components/structures/Section'
import { AbsenceTimeline } from '@/composites/absences/AbsenceTimeline'
import { useAbsences } from '@/core/hooks/data/useAbsences'
import { ABSENCE_COPY } from '@/declarations/absences/copy'
import { ABSENCE_STATUS_REGISTRY } from '@/declarations/reference/registries'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { LIST_STYLES } from '@/declarations/ui/variants'
import { toTone } from '@/declarations/ui/theme'
import type { FieldDefinition, FormValues } from '@/types/forms'
import type { MemberAbsence } from '@/types/members'
import { AbsenceStatuses } from '@/utils/constants/workflow'
import type { AbsenceStatusName } from '@/utils/constants/workflow'
import { formatDayRange } from '@/utils/format/dates'

export interface AbsencesPanelProps {
  mine: MemberAbsence[]
  queue: MemberAbsence[]
  fields: FieldDefinition[]
  reviewFields: FieldDefinition[]
  currentAccountId: string
  thresholdDays: number
  canCreate: boolean
  canReview: boolean
}

/**
 * Absence surface, its own timeline first, the team's pending requests underneath — no table,
 * no tabs, the timeline itself carries no authority over the absence
 * @param {MemberAbsence[]} mine - Own requests resolved server-side
 * @param {MemberAbsence[]} queue - Team requests awaiting review
 * @param {FieldDefinition[]} fields - Declarations of the request form
 * @param {FieldDefinition[]} reviewFields - Declarations of the review form
 * @param {string} currentAccountId - Signed-in member identifier
 * @param {number} thresholdDays - Days an absence must exceed
 * @param {boolean} canCreate - Member may declare an absence
 * @param {boolean} canReview - Member may settle a request
 * @return {JSX.Element}
 */

export const AbsencesPanel = ({
  mine,
  queue,
  fields,
  reviewFields,
  currentAccountId,
  thresholdDays,
  canCreate,
  canReview,
}: AbsencesPanelProps) => {
  const initial = useMemo(() => {
    const seen = new Set(mine.map((absence) => absence.id))

    return [...mine, ...queue.filter((absence) => !seen.has(absence.id))]
  }, [mine, queue])

  const { absences, isSaving, issues, clearIssues, create, review, remove } = useAbsences(initial)
  const [isCreating, setCreating] = useState(false)
  const [reviewing, setReviewing] = useState<{
    absence: MemberAbsence
    status: AbsenceStatusName
  } | null>(null)
  const [pendingDeletion, setPendingDeletion] = useState<MemberAbsence | null>(null)

  const myAbsences = useMemo(
    () =>
      absences
        .filter((absence) => absence.accountId === currentAccountId)
        .sort((a, b) => b.startDate.localeCompare(a.startDate)),
    [absences, currentAccountId]
  )
  const pendingQueue = useMemo(
    () =>
      absences
        .filter(
          (absence) =>
            absence.accountId !== currentAccountId && absence.status === AbsenceStatuses.Pending
        )
        .sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [absences, currentAccountId]
  )

  const [current, ...history] = myAbsences

  const openCreate = () => {
    clearIssues()
    setCreating(true)
  }

  const openReview = (absence: MemberAbsence, status: AbsenceStatusName) => {
    clearIssues()
    setReviewing({ absence, status })
  }

  return (
    <>
      <Section bare>
        {current ? (
          <div className="flex flex-col gap-3">
            <AbsenceTimeline absence={current} />
            <p className="max-w-2xl text-xs text-[var(--color-ink-subtle)] italic">
              {ABSENCE_COPY.timelineDisclaimer}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {canCreate && <AddRow label={ABSENCE_COPY.planAnother} onClick={openCreate} />}
              <Button
                variant="ghost"
                icon="remove"
                onClick={() => setPendingDeletion(current)}
                className="shrink-0"
              >
                {ABSENCE_COPY.cancel}
              </Button>
            </div>
          </div>
        ) : (
          <EmptyState
            variant="start"
            figure="absences"
            title={ABSENCE_COPY.emptyTitle}
            description={ABSENCE_COPY.emptyDescription}
            action={
              <Button variant="primary" icon="add" disabled={!canCreate} onClick={openCreate}>
                {ABSENCE_COPY.add}
              </Button>
            }
          />
        )}

        {history.length > 0 && (
          <div className="flex flex-col gap-2 pt-2">
            <p className="text-xs font-semibold tracking-wide text-[var(--color-ink-subtle)] uppercase">
              {ABSENCE_COPY.historyTitle}
            </p>
            <div className={LIST_STYLES.stack}>
              {history.map((absence) => {
                const status = ABSENCE_STATUS_REGISTRY.get(absence.status)

                return (
                  <div key={absence.id} className={LIST_STYLES.item}>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="font-medium">
                        {formatDayRange(absence.startDate, absence.endDate)}
                      </span>
                      {absence.reason && (
                        <span className="truncate text-xs text-[var(--color-ink-subtle)]">
                          {absence.reason}
                        </span>
                      )}
                    </span>
                    <Badge label={status.label} tone={toTone(status.accent)} dot />
                    <Button
                      variant="icon"
                      icon="remove"
                      aria-label={ACTION_COPY.delete}
                      onClick={() => setPendingDeletion(absence)}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </Section>

      {canReview && (
        <Section title={ABSENCE_COPY.queueTitle} bare>
          {pendingQueue.length === 0 ? (
            <p className="text-sm text-[var(--color-ink-subtle)] italic">
              {ABSENCE_COPY.noPendingDescription}
            </p>
          ) : (
            <div className={LIST_STYLES.stack}>
              {pendingQueue.map((absence) => (
                <div key={absence.id} className={LIST_STYLES.item}>
                  <Avatar name={absence.memberName} size="sm" />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="font-medium">{absence.memberName}</span>
                    <span className="truncate text-xs text-[var(--color-ink-subtle)]">
                      {formatDayRange(absence.startDate, absence.endDate)}
                      {absence.reason ? ` · ${absence.reason}` : ''}
                    </span>
                  </span>
                  <Badge
                    label={`${absence.dayCount} ${absence.dayCount === 1 ? ABSENCE_COPY.dayOne : ABSENCE_COPY.days}`}
                    tone="neutral"
                    icon="clock"
                  />
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
                  <Button
                    variant="icon"
                    icon="remove"
                    aria-label={ACTION_COPY.delete}
                    onClick={() => setPendingDeletion(absence)}
                  />
                </div>
              ))}
            </div>
          )}
        </Section>
      )}

      <FormDialog
        open={isCreating}
        title={ABSENCE_COPY.add}
        description={ABSENCE_COPY.underThresholdNotice.replace(
          '{threshold}',
          String(thresholdDays)
        )}
        fields={fields}
        issues={issues}
        isSaving={isSaving}
        onSubmit={create}
        onClose={() => setCreating(false)}
      />

      <FormDialog
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
        submitLabel={
          reviewing?.status === AbsenceStatuses.Approved
            ? ABSENCE_COPY.approve
            : ABSENCE_COPY.refuse
        }
        onSubmit={(values: FormValues) => review(reviewing!.absence.id, reviewing!.status, values)}
        onClose={() => setReviewing(null)}
      />

      <ConfirmDialog
        open={pendingDeletion !== null}
        title={ABSENCE_COPY.deleteTitle}
        description={ABSENCE_COPY.deleteDescription}
        confirmLabel={ACTION_COPY.confirm}
        pending={isSaving}
        onCancel={() => setPendingDeletion(null)}
        onConfirm={async () => {
          await remove(pendingDeletion!.id)
          setPendingDeletion(null)
        }}
      />
    </>
  )
}
