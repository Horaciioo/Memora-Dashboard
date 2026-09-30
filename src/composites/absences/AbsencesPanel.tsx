'use client'

import { useMemo, useState } from 'react'
import { StatusText } from '@/components/elements/display/StatusText'
import { Button } from '@/components/elements/actions/Button'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { AddRow } from '@/components/structures/AddRow'
import { FormDrawer } from '@/components/structures/FormDrawer'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'
import { Section } from '@/components/structures/Section'
import { AbsenceTimeline } from '@/composites/absences/AbsenceTimeline'
import { useAbsences } from '@/core/hooks/data/useAbsences'
import { ABSENCE_COPY } from '@/declarations/absences/copy'
import { ABSENCE_STATUS_REGISTRY } from '@/declarations/reference/registries'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { ABSENCE_CARD, RECORD_ROW } from '@/declarations/ui/variants'
import { useMenu, type MenuItem } from '@/managers/front-end'
import type { FieldDefinition } from '@/types/forms'
import type { MemberAbsence } from '@/types/members'
import { absenceReasonText } from '@/utils/format/absences'
import { formatDayRange } from '@/utils/format/dates'

export interface AbsencesPanelProps {
  mine: MemberAbsence[]
  fields: FieldDefinition[]
  thresholdDays: number
  canCreate: boolean
}

/**
 * Own absences, the latest read as a card then the older ones as quiet rows. Requests waiting
 * on the viewer are settled from the home page, never here
 * @param {MemberAbsence[]} mine - Own requests resolved server-side
 * @param {FieldDefinition[]} fields - Declarations of the request form
 * @param {number} thresholdDays - Days an absence must exceed
 * @param {boolean} canCreate - Member may declare an absence
 * @return {JSX.Element}
 */

export const AbsencesPanel = ({ mine, fields, thresholdDays, canCreate }: AbsencesPanelProps) => {
  const { absences, isSaving, issues, clearIssues, create, remove } = useAbsences(mine)
  const { contextMenu } = useMenu()
  const [isCreating, setCreating] = useState(false)
  const [pendingDeletion, setPendingDeletion] = useState<MemberAbsence | null>(null)

  // Latest first, the newest one leading
  const [current, ...history] = useMemo(
    () => [...absences].sort((a, b) => b.startDate.localeCompare(a.startDate)),
    [absences]
  )

  const openCreate = () => {
    clearIssues()
    setCreating(true)
  }

  const removalMenu = (absence: MemberAbsence): MenuItem[] => [
    {
      id: 'delete',
      label: ACTION_COPY.delete,
      icon: 'remove',
      danger: true,
      onSelect: () => setPendingDeletion(absence),
    },
  ]

  const status = current ? ABSENCE_STATUS_REGISTRY.get(current.status) : null
  const reason = current ? absenceReasonText(current) : null

  return (
    <div className={ABSENCE_CARD.page}>
      {current && status ? (
        <Section bare>
          <div className={ABSENCE_CARD.card} onContextMenu={contextMenu(removalMenu(current))}>
            <StatusText label={status.label} accent={status.accent} />
            <p className={ABSENCE_CARD.dates}>
              {formatDayRange(current.startDate, current.endDate)}
            </p>
            {reason && <p className={ABSENCE_CARD.reason}>{reason}</p>}
            <AbsenceTimeline absence={current} />
            <Button
              variant="secondary"
              onClick={() => setPendingDeletion(current)}
              className="self-center"
            >
              {ABSENCE_COPY.cancel}
            </Button>
          </div>
        </Section>
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
        <Section title={ABSENCE_COPY.historyTitle} bare>
          <div className={RECORD_ROW.stack}>
            {history.map((absence) => {
              const past = ABSENCE_STATUS_REGISTRY.get(absence.status)

              return (
                <div
                  key={absence.id}
                  className={RECORD_ROW.static}
                  onContextMenu={contextMenu(removalMenu(absence))}
                >
                  <span className={RECORD_ROW.body}>
                    <span className={RECORD_ROW.title}>
                      {formatDayRange(absence.startDate, absence.endDate)}
                    </span>
                    {absenceReasonText(absence) && (
                      <span className={RECORD_ROW.meta}>{absenceReasonText(absence)}</span>
                    )}
                  </span>
                  <StatusText label={past.label} accent={past.accent} />
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {current && (
        <AddRow label={ABSENCE_COPY.planAnother} disabled={!canCreate} onClick={openCreate} />
      )}

      <FormDrawer
        subject={FORM_SUBJECTS.absence}
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
    </div>
  )
}
