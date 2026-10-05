'use client'

import { useMemo, useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { PageOptions, type PageOption } from '@/components/structures/PageOptions'
import { AbsenceWizard } from '@/composites/absences/AbsenceWizard'
import { AbsenceList } from '@/composites/absences/AbsenceList'
import { useAbsences } from '@/core/hooks/data/useAbsences'
import { ABSENCE_COPY } from '@/declarations/absences/copy'
import { ACTION_COPY, PAGE_OPTIONS_COPY } from '@/declarations/ui/copy'
import { ABSENCE_PAGE, ABSENCE_WIZARD } from '@/declarations/ui/variants'
import type { FieldDefinition } from '@/types/forms'
import type { MemberAbsence } from '@/types/members'
import { AbsenceStatuses } from '@/utils/constants/workflow'
import { isFinishedAbsence } from '@/utils/format/absences'
import { toDayKey } from '@/utils/format/calendar'
import { startOfDay } from '@/utils/format/days'

export interface AbsencesPanelProps {
  mine: MemberAbsence[]
  // Kept for the page contract
  fields: FieldDefinition[]
  thresholdDays: number
  canCreate: boolean
}

/**
 * Own absences: declared from a calendar on top
 * @param {AbsencesPanelProps} props - Own requests
 * @return {JSX.Element}
 */

export const AbsencesPanel = ({ mine, thresholdDays, canCreate }: AbsencesPanelProps) => {
  const { absences, isSaving, issues, clearIssues, create, remove } = useAbsences(mine)
  const [pendingDeletion, setPendingDeletion] = useState<MemberAbsence | null>(null)
  const [showFinished, setShowFinished] = useState(false)
  const [isDeclaring, setDeclaring] = useState(false)

  // Current absences first
  const [current, finished] = useMemo(() => {
    const today = startOfDay(new Date()).getTime()

    return [
      absences.filter((absence) => !isFinishedAbsence(absence, today)),
      absences.filter((absence) => isFinishedAbsence(absence, today)),
    ]
  }, [absences])

  const visible = showFinished ? absences : current

  const pageOptions: PageOption[] =
    finished.length > 0
      ? [
          {
            id: 'finished',
            label: PAGE_OPTIONS_COPY.showFinished,
            checked: showFinished,
            onChange: setShowFinished,
          },
        ]
      : []

  const openDeclaration = () => {
    clearIssues()
    setDeclaring(true)
  }

  // Days a new absence cannot cover
  const booked = useMemo(
    () =>
      absences
        .filter(
          (absence) =>
            absence.status !== AbsenceStatuses.Refused &&
            absence.status !== AbsenceStatuses.Cancelled
        )
        .map((absence) => ({
          start: toDayKey(absence.startDate),
          end: toDayKey(absence.endDate),
        })),
    [absences]
  )

  return (
    <div className={ABSENCE_PAGE.page}>
      <PageOptions options={pageOptions} />

      {isDeclaring && canCreate && (
        <AbsenceWizard
          booked={booked}
          thresholdDays={thresholdDays}
          isSaving={isSaving}
          issues={issues}
          onSubmit={create}
          onEdit={clearIssues}
          onClose={() => setDeclaring(false)}
        />
      )}

      {visible.length === 0 && !isDeclaring && (
        <EmptyState
          figure="absences"
          title={ABSENCE_COPY.emptyTitle}
          action={
            <Button variant="primary" icon="add" disabled={!canCreate} onClick={openDeclaration}>
              {ABSENCE_COPY.declare}
            </Button>
          }
        />
      )}

      {visible.length > 0 && (
        <>
          {!isDeclaring && canCreate && (
            <div className={ABSENCE_WIZARD.header}>
              <Button variant="primary" icon="add" onClick={openDeclaration}>
                {ABSENCE_COPY.declare}
              </Button>
            </div>
          )}
          <AbsenceList absences={visible} onRemove={setPendingDeletion} />
        </>
      )}

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
