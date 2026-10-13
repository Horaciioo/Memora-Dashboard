'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/elements/actions/Button'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { AddRow } from '@/components/structures/AddRow'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { PageOptions, type PageOption } from '@/components/structures/PageOptions'
import { FormDrawer } from '@/components/structures/FormDrawer'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'
import { RowList, type RowListGroup } from '@/components/structures/RowList'
import { useSessions } from '@/core/hooks/data/useAcademy'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { ACADEMY_SESSION_STATUS_REGISTRY } from '@/declarations/academy/registries'
import { ROUTES } from '@/declarations/navigation'
import { ACTION_COPY, PAGE_OPTIONS_COPY } from '@/declarations/ui/copy'

import { GROUP_STYLES } from '@/declarations/ui/variants'
import type { MenuItem } from '@/managers/front-end'
import type { SessionSummary } from '@/types/academy'
import type { FieldDefinition } from '@/types/forms'
import {
  AcademySessionStatuses,
  FINISHED_ACADEMY_SESSION_STATUSES,
} from '@/utils/constants/hierarchy'
import { sessionTitle } from '@/utils/format/academy'
import { formatDay, formatDayRange } from '@/utils/format/dates'

// Display order of the states
const STATUS_ORDER = [
  AcademySessionStatuses.Running,
  AcademySessionStatuses.Open,
  AcademySessionStatuses.Draft,
  AcademySessionStatuses.Closed,
  AcademySessionStatuses.Archived,
]

export interface SessionsPanelProps {
  initialSessions: SessionSummary[]
  fields: FieldDefinition[]
  canManage: boolean
}

/**
 * Academy board
 * @param {SessionSummary[]} initialSessions - Sessions resolved server-side
 * @param {FieldDefinition[]} fields - Declarations of the session form
 * @param {boolean} canManage - Member may open and close sessions
 * @return {JSX.Element}
 */

export const SessionsPanel = ({ initialSessions, fields, canManage }: SessionsPanelProps) => {
  const router = useRouter()
  const { sessions, isSaving, issues, clearIssues, create, update, remove } =
    useSessions(initialSessions)
  const [isCreating, setCreating] = useState(false)
  const [showFinished, setShowFinished] = useState(false)
  const [editing, setEditing] = useState<SessionSummary | null>(null)
  const [pendingDeletion, setPendingDeletion] = useState<SessionSummary | null>(null)

  const openCreate = () => {
    clearIssues()
    setCreating(true)
  }

  const sessionMenu = (session: SessionSummary): MenuItem[] => [
    {
      id: 'open',
      label: ACTION_COPY.open,
      icon: 'forward',
      onSelect: () => router.push(ROUTES.session(session.id)),
    },
    {
      id: 'edit',
      label: ACTION_COPY.edit,
      icon: 'edit',
      disabled: !canManage,
      onSelect: () => {
        clearIssues()
        setEditing(session)
      },
    },
    {
      id: 'delete',
      label: ACTION_COPY.delete,
      icon: 'remove',
      danger: true,
      separatorBefore: true,
      disabled: !canManage,
      onSelect: () => setPendingDeletion(session),
    },
  ]

  // Heaviest state first, finished ones only on request
  const groups: RowListGroup[] = STATUS_ORDER.filter(
    (status) => showFinished || !FINISHED_ACADEMY_SESSION_STATUSES.includes(status)
  )
    .map((status) => ({
      id: status,
      label: ACADEMY_SESSION_STATUS_REGISTRY.label(status),
      accent: ACADEMY_SESSION_STATUS_REGISTRY.get(status).accent,
      items: sessions
        .filter((entry) => entry.status === status)
        .map((session) => ({
          id: session.id,
          title: sessionTitle(session),
          meta: session.endsAt
            ? formatDayRange(session.startsAt, session.endsAt)
            : formatDay(session.startsAt),
          icon: session.function.icon,
          muted: FINISHED_ACADEMY_SESSION_STATUSES.includes(status),
          menu: sessionMenu(session),
          onOpen: () => router.push(ROUTES.session(session.id)),
        })),
    }))
    .filter((group) => group.items.length > 0)

  const hasFinished = sessions.some((entry) =>
    FINISHED_ACADEMY_SESSION_STATUSES.includes(entry.status)
  )

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

  return (
    <>
      {sessions.length === 0 ? (
        <EmptyState
          figure="academy"
          title={ACADEMY_COPY.emptyTitle}
          description={ACADEMY_COPY.emptyDescription}
          action={
            <Button variant="primary" icon="add" disabled={!canManage} onClick={openCreate}>
              {ACADEMY_COPY.sessionAdd}
            </Button>
          }
        />
      ) : (
        <div className={GROUP_STYLES.spaced}>
          <PageOptions options={pageOptions} />
          <RowList groups={groups} />
          <AddRow label={ACADEMY_COPY.sessionAdd} disabled={!canManage} onClick={openCreate} />
        </div>
      )}

      <FormDrawer
        subject={FORM_SUBJECTS.session}
        open={isCreating}
        title={ACADEMY_COPY.sessionAdd}
        fields={fields}
        issues={issues}
        isSaving={isSaving}
        onSubmit={create}
        onClose={() => setCreating(false)}
      />

      <FormDrawer
        subject={FORM_SUBJECTS.session}
        open={editing !== null}
        title={ACTION_COPY.edit}
        fields={fields}
        initialValues={editing?.values}
        issues={issues}
        isSaving={isSaving}
        onSubmit={(values) => update(editing!.id, values)}
        onClose={() => setEditing(null)}
      />

      <ConfirmDialog
        open={pendingDeletion !== null}
        title={ACADEMY_COPY.sessionDeleteTitle}
        description={ACADEMY_COPY.sessionDeleteDescription}
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
