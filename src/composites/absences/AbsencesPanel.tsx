'use client'

import { useMemo, useState } from 'react'
import { Avatar } from '@/components/elements/display/Avatar'
import { Badge } from '@/components/elements/display/Badge'
import { Button } from '@/components/elements/actions/Button'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { DataTable, type DataTableColumn } from '@/components/structures/DataTable'
import { FormDialog } from '@/components/structures/FormDialog'
import { Section } from '@/components/structures/Section'
import { Tabs } from '@/components/elements/navigation/Tabs'
import { useAbsences } from '@/core/hooks/data/useAbsences'
import { ABSENCE_COPY } from '@/declarations/absences/copy'
import { ABSENCE_STATUS_REGISTRY } from '@/declarations/reference/registries'
import { ACTION_COPY, FIELD_COPY } from '@/declarations/ui/copy'
import { toTone } from '@/declarations/ui/theme'
import type { MenuItem } from '@/managers/front-end'
import type { FieldDefinition, FormValues } from '@/types/forms'
import type { MemberAbsence } from '@/types/members'
import { AbsenceStatuses } from '@/utils/constants/workflow'
import type { AbsenceStatusName } from '@/utils/constants/workflow'
import { formatDayRange } from '@/utils/format/dates'

export interface AbsencesPanelProps {
  initialAbsences: MemberAbsence[]
  fields: FieldDefinition[]
  reviewFields: FieldDefinition[]
  currentAccountId: string
  thresholdDays: number
  canCreate: boolean
  canReadAll: boolean
  canReview: boolean
}

/**
 * Absence requests, split between the member's own and everyone else's, with the review
 * gesture behind its own permission
 * @param {MemberAbsence[]} initialAbsences - Requests resolved server-side
 * @param {FieldDefinition[]} fields - Declarations of the request form
 * @param {FieldDefinition[]} reviewFields - Declarations of the review form
 * @param {string} currentAccountId - Signed-in member identifier
 * @param {number} thresholdDays - Days an absence must exceed
 * @param {boolean} canCreate - Member may declare an absence
 * @param {boolean} canReadAll - Member may see every request
 * @param {boolean} canReview - Member may settle a request
 * @return {JSX.Element}
 */

export const AbsencesPanel = ({
  initialAbsences,
  fields,
  reviewFields,
  currentAccountId,
  thresholdDays,
  canCreate,
  canReadAll,
  canReview,
}: AbsencesPanelProps) => {
  const { absences, isSaving, issues, clearIssues, create, review, remove } =
    useAbsences(initialAbsences)
  const [tab, setTab] = useState('mine')
  const [isCreating, setCreating] = useState(false)
  const [reviewing, setReviewing] = useState<{ absence: MemberAbsence; status: AbsenceStatusName } | null>(
    null
  )
  const [pendingDeletion, setPendingDeletion] = useState<MemberAbsence | null>(null)

  const mine = useMemo(
    () => absences.filter((absence) => absence.accountId === currentAccountId),
    [absences, currentAccountId]
  )
  const pending = useMemo(
    () => absences.filter((absence) => absence.status === AbsenceStatuses.Pending),
    [absences]
  )

  const visible = tab === 'mine' ? mine : tab === 'pending' ? pending : absences

  const openCreate = () => {
    clearIssues()
    setCreating(true)
  }

  const tabs = [
    { value: 'mine', label: ABSENCE_COPY.tabMine, icon: 'absences' as const, count: mine.length },
    ...(canReadAll
      ? [{ value: 'team', label: ABSENCE_COPY.tabTeam, icon: 'members' as const, count: absences.length }]
      : []),
    ...(canReview
      ? [{ value: 'pending', label: ABSENCE_COPY.tabPending, icon: 'clock' as const, count: pending.length }]
      : []),
  ]

  const columns: DataTableColumn<MemberAbsence>[] = [
    ...(tab === 'mine'
      ? []
      : [
          {
            key: 'member',
            header: FIELD_COPY.name,
            sortValue: (absence: MemberAbsence) => absence.memberName.toLowerCase(),
            render: (absence: MemberAbsence) => (
              <span className="flex items-center gap-2">
                <Avatar name={absence.memberName} size="xs" />
                {absence.memberName}
              </span>
            ),
          },
        ]),
    {
      key: 'range',
      header: FIELD_COPY.date,
      sortValue: (absence) => absence.startDate,
      className: 'whitespace-nowrap',
      render: (absence) => formatDayRange(absence.startDate, absence.endDate),
    },
    {
      key: 'dayCount',
      header: FIELD_COPY.duration,
      sortValue: (absence) => absence.dayCount,
      render: (absence) => (
        <Badge
          label={`${absence.dayCount} ${absence.dayCount === 1 ? ABSENCE_COPY.dayOne : ABSENCE_COPY.days}`}
          tone="neutral"
          icon="clock"
        />
      ),
    },
    {
      key: 'reason',
      header: FIELD_COPY.reason,
      render: (absence) => (
        <span className="text-[var(--color-ink-subtle)]">{absence.reason ?? ''}</span>
      ),
    },
    {
      key: 'status',
      header: FIELD_COPY.status,
      sortValue: (absence) => absence.status,
      render: (absence) => {
        const status = ABSENCE_STATUS_REGISTRY.get(absence.status)

        return <Badge label={status.label} tone={toTone(status.accent)} dot />
      },
    },
    {
      key: 'reviewer',
      header: FIELD_COPY.author,
      render: (absence) => (
        <span className="text-[var(--color-ink-subtle)]">{absence.reviewerName ?? ''}</span>
      ),
    },
  ]

  const rowMenu = (absence: MemberAbsence): MenuItem[] => [
    {
      id: 'approve',
      label: ABSENCE_COPY.approve,
      icon: 'success',
      disabled: !canReview || absence.status === AbsenceStatuses.Approved,
      onSelect: () => {
        clearIssues()
        setReviewing({ absence, status: AbsenceStatuses.Approved })
      },
    },
    {
      id: 'refuse',
      label: ABSENCE_COPY.refuse,
      icon: 'blocked',
      disabled: !canReview || absence.status === AbsenceStatuses.Refused,
      onSelect: () => {
        clearIssues()
        setReviewing({ absence, status: AbsenceStatuses.Refused })
      },
    },
    {
      id: 'delete',
      label: ABSENCE_COPY.cancel,
      icon: 'remove',
      danger: true,
      separatorBefore: true,
      disabled: !canReview && absence.accountId !== currentAccountId,
      onSelect: () => setPendingDeletion(absence),
    },
  ]

  return (
    <>
      <Section
        title={ABSENCE_COPY.title}
        description={ABSENCE_COPY.lead.replace('{threshold}', String(thresholdDays))}
        action={
          canCreate ? (
            <Button variant="primary" icon="add" onClick={openCreate}>
              {ABSENCE_COPY.add}
            </Button>
          ) : undefined
        }
        bare
      >
        {tabs.length > 1 && (
          <Tabs items={tabs} value={tab} onChange={setTab} label={ABSENCE_COPY.title} />
        )}
        <DataTable
          columns={columns}
          rows={visible}
          getRowId={(absence) => absence.id}
          rowMenu={rowMenu}
          emptyState={{
            variant: 'start',
            figure: 'absences',
            title: tab === 'pending' ? ABSENCE_COPY.noPendingTitle : ABSENCE_COPY.emptyTitle,
            description:
              tab === 'pending'
                ? ABSENCE_COPY.noPendingDescription
                : ABSENCE_COPY.emptyDescription,
            action: (
              <Button variant="primary" icon="add" disabled={!canCreate} onClick={openCreate}>
                {ABSENCE_COPY.add}
              </Button>
            ),
          }}
        />
      </Section>

      <FormDialog
        open={isCreating}
        title={ABSENCE_COPY.add}
        description={ABSENCE_COPY.lead.replace('{threshold}', String(thresholdDays))}
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
          reviewing ? formatDayRange(reviewing.absence.startDate, reviewing.absence.endDate) : ''
        }
        fields={reviewFields}
        issues={issues}
        isSaving={isSaving}
        submitLabel={
          reviewing?.status === AbsenceStatuses.Approved
            ? ABSENCE_COPY.approve
            : ABSENCE_COPY.refuse
        }
        onSubmit={(values: FormValues) =>
          review(reviewing!.absence.id, reviewing!.status, values)
        }
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
