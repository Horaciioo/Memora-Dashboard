'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/elements/actions/Button'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { AddRow } from '@/components/structures/inline/AddRow'
import { ConfirmDialog } from '@/components/structures/overlays/ConfirmDialog'
import { PageOptions, type PageOption } from '@/components/structures/page/PageOptions'
import { FormDrawer } from '@/components/structures/overlays/FormDrawer'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'
import { Avatar } from '@/components/elements/display/Avatar'
import { SessionTiles, type SessionTileGroup } from '@/components/structures/data/SessionTiles'
import { useRecruitments } from '@/core/hooks/data/recruitment/useRecruitments'
import { ROUTES } from '@/declarations/navigation'
import { RECRUITMENT_COPY } from '@/declarations/recruitment/copy'
import { RECRUITMENT_STATUS_REGISTRY } from '@/declarations/recruitment/registries'
import { ACTION_COPY, PAGE_OPTIONS_COPY } from '@/declarations/ui/copy'
import { GROUP_STYLES } from '@/declarations/ui/variants'
import { CloseRecruitmentDialog } from '@/composites/recruitment/CloseRecruitmentDialog'
import type { MenuItem } from '@/managers/front-end'
import type { FieldDefinition } from '@/types/forms'
import type { RecruitmentSummary } from '@/types/recruitment'
import { FINISHED_RECRUITMENT_STATUSES, RecruitmentStatuses } from '@/utils/constants/recruitment'
import { formatDay, formatDayRange } from '@/utils/format/dates'

// Display order of the states
const STATUS_ORDER = [
  RecruitmentStatuses.Interviews,
  RecruitmentStatuses.Announced,
  RecruitmentStatuses.Draft,
  RecruitmentStatuses.Closed,
  RecruitmentStatuses.Archived,
]

/**
 * Days a campaign runs between
 * @param {RecruitmentSummary} entry - Campaign
 * @return {string | undefined} - Period
 */

const periodOf = (entry: RecruitmentSummary): string | undefined => {
  if (entry.opensAt && entry.closesAt) return formatDayRange(entry.opensAt, entry.closesAt)

  return entry.opensAt ? formatDay(entry.opensAt) : undefined
}

// Left for later, nobody sits in on a session yet
const CREATION_SKIPPED = ['observerIds']

export interface RecruitmentsPanelProps {
  initialSessions: RecruitmentSummary[]
  fields: FieldDefinition[]
  canManage: boolean
}

/**
 * Recruitment sessions
 * @param {RecruitmentSummary[]} initialSessions - Sessions resolved server-side
 * @param {FieldDefinition[]} fields - Declarations of the session form
 * @param {boolean} canManage - Member may open and close sessions
 * @return {JSX.Element}
 */

export const RecruitmentsPanel = ({
  initialSessions,
  fields,
  canManage,
}: RecruitmentsPanelProps) => {
  const router = useRouter()
  const { sessions, isSaving, issues, clearIssues, create, update, remove, replace } =
    useRecruitments(initialSessions)
  const [isCreating, setCreating] = useState(false)
  const [showFinished, setShowFinished] = useState(false)
  const [editing, setEditing] = useState<RecruitmentSummary | null>(null)
  const [closingId, setClosingId] = useState<string | null>(null)
  const [pendingDeletion, setPendingDeletion] = useState<RecruitmentSummary | null>(null)

  const openCreate = () => {
    clearIssues()
    setCreating(true)
  }

  const sessionMenu = (entry: RecruitmentSummary): MenuItem[] => [
    {
      id: 'open',
      label: ACTION_COPY.open,
      icon: 'forward',
      onSelect: () => router.push(ROUTES.recruitment(entry.id)),
    },
    {
      id: 'edit',
      label: ACTION_COPY.edit,
      icon: 'edit',
      disabled: !canManage,
      onSelect: () => {
        clearIssues()
        setEditing(entry)
      },
    },
    {
      id: 'delete',
      label: ACTION_COPY.delete,
      icon: 'remove',
      danger: true,
      separatorBefore: true,
      disabled: !canManage,
      onSelect: () => setPendingDeletion(entry),
    },
  ]

  // Heaviest state first, finished ones only on request
  const groups: SessionTileGroup[] = STATUS_ORDER.filter(
    (status) => showFinished || !FINISHED_RECRUITMENT_STATUSES.includes(status)
  )
    .map((status) => {
      const option = RECRUITMENT_STATUS_REGISTRY.get(status)

      return {
        id: status,
        label: option.label,
        accent: option.accent,
        items: sessions
          .filter((entry) => entry.status === status)
          .map((entry) => ({
            id: entry.id,
            lead: <Avatar name={entry.youtuber.label} src={entry.youtuber.image} size="xl" />,
            title: entry.promotionTitle ?? entry.name,
            meta: periodOf(entry),
            people: entry.responsables.map((person) => ({
              id: person.id,
              name: person.label,
              src: person.image,
            })),
            muted: FINISHED_RECRUITMENT_STATUSES.includes(status),
            menu: sessionMenu(entry),
            onOpen: () => router.push(ROUTES.recruitment(entry.id)),
          })),
      }
    })
    .filter((group) => group.items.length > 0)

  const hasFinished = sessions.some((entry) => FINISHED_RECRUITMENT_STATUSES.includes(entry.status))

  const pageOptions: PageOption[] = hasFinished
    ? [
        {
          id: 'finished',
          label: PAGE_OPTIONS_COPY.showFinished,
          checked: showFinished,
          onChange: setShowFinished,
        },
      ]
    : []

  const drawers = () => (
    <>
      <FormDrawer
        subject={FORM_SUBJECTS.recruitment}
        open={isCreating}
        title={RECRUITMENT_COPY.addTitle}
        fields={fields.filter((field) => !CREATION_SKIPPED.includes(field.name))}
        issues={issues}
        isSaving={isSaving}
        onSubmit={create}
        onClose={() => setCreating(false)}
      />

      <FormDrawer
        subject={FORM_SUBJECTS.recruitment}
        open={editing !== null}
        title={RECRUITMENT_COPY.editTitle}
        fields={fields}
        initialValues={editing?.values}
        issues={issues}
        isSaving={isSaving}
        onSubmit={async (values) => {
          // Closing asks first, the rest saves as it is
          const isClosing =
            values.status === RecruitmentStatuses.Closed &&
            editing!.status !== RecruitmentStatuses.Closed
          const saved = await update(
            editing!.id,
            isClosing ? { ...values, status: editing!.status } : values
          )
          if (saved && isClosing) setClosingId(editing!.id)

          return saved
        }}
        onClose={() => setEditing(null)}
      />

      <CloseRecruitmentDialog
        sessionId={closingId}
        onClose={() => setClosingId(null)}
        onClosed={replace}
      />

      <ConfirmDialog
        open={pendingDeletion !== null}
        title={RECRUITMENT_COPY.deleteTitle}
        description={RECRUITMENT_COPY.deleteDescription}
        pending={isSaving}
        onCancel={() => setPendingDeletion(null)}
        onConfirm={async () => {
          await remove(pendingDeletion!.id)
          setPendingDeletion(null)
        }}
      />
    </>
  )

  if (sessions.length === 0) {
    return (
      <>
        <EmptyState
          figure="members"
          title={RECRUITMENT_COPY.emptyTitle}
          description={RECRUITMENT_COPY.emptyDescription}
          action={
            <Button variant="primary" icon="add" disabled={!canManage} onClick={openCreate}>
              {RECRUITMENT_COPY.add}
            </Button>
          }
        />
        {drawers()}
      </>
    )
  }

  return (
    <>
      <PageOptions options={pageOptions} />
      <div className={GROUP_STYLES.spaced}>
        <SessionTiles groups={groups} />
        <AddRow label={RECRUITMENT_COPY.add} disabled={!canManage} onClick={openCreate} />
      </div>

      {drawers()}
    </>
  )
}
