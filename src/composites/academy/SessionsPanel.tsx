'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Status } from '@/components/elements/display/Status'
import { Button } from '@/components/elements/actions/Button'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { AddRow } from '@/components/structures/AddRow'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { PageOptions, type PageOption } from '@/components/structures/PageOptions'
import { FormDrawer } from '@/components/structures/FormDrawer'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'
import { Section } from '@/components/structures/Section'
import { useSessions } from '@/core/hooks/data/useAcademy'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { ACADEMY_SESSION_STATUS_REGISTRY } from '@/declarations/academy/registries'
import { ROUTES } from '@/declarations/navigation'
import { ACTION_COPY, PAGE_OPTIONS_COPY } from '@/declarations/ui/copy'

import { GROUP_STYLES, SESSION_CARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { useMenu, type MenuItem } from '@/managers/front-end'
import type { SessionSummary } from '@/types/academy'
import type { FieldDefinition } from '@/types/forms'
import {
  AcademySessionStatuses,
  FINISHED_ACADEMY_SESSION_STATUSES,
} from '@/utils/constants/hierarchy'
import { formatDay } from '@/utils/format/dates'

export interface SessionsPanelProps {
  initialSessions: SessionSummary[]
  fields: FieldDefinition[]
  canManage: boolean
}

// Glyph of a session

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
  const { contextMenu } = useMenu()
  const [isCreating, setCreating] = useState(false)
  const [showFinished, setShowFinished] = useState(false)
  // Read once
  const [now] = useState(() => Date.now())
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

  // Running sessions first
  const [running, finished] = [
    sessions.filter((entry) => !FINISHED_ACADEMY_SESSION_STATUSES.includes(entry.status)),
    sessions.filter((entry) => FINISHED_ACADEMY_SESSION_STATUSES.includes(entry.status)),
  ]

  const card = (session: SessionSummary) => {
    const status = ACADEMY_SESSION_STATUS_REGISTRY.get(session.status)
    const isFinished = FINISHED_ACADEMY_SESSION_STATUSES.includes(session.status)
    // Inside the running group every card says so
    const isRunning = session.status === AcademySessionStatuses.Running

    // How far the session went between its two dates
    const startsAt = new Date(session.startsAt).getTime()
    const endsAt = session.endsAt ? new Date(session.endsAt).getTime() : null
    const progress =
      endsAt && endsAt > startsAt && !isFinished
        ? Math.min(Math.max(((now - startsAt) / (endsAt - startsAt)) * 100, 0), 100)
        : null

    return (
      <article
        key={session.id}
        role="button"
        tabIndex={0}
        onClick={() => router.push(ROUTES.session(session.id))}
        onKeyDown={(event) => {
          if (event.key === 'Enter') router.push(ROUTES.session(session.id))
        }}
        onContextMenu={contextMenu(sessionMenu(session), session.function.name)}
        className={cn(SESSION_CARD.card, isFinished && SESSION_CARD.muted)}
      >
        <div className={SESSION_CARD.head}>
          <div className={SESSION_CARD.body}>
            <span className={SESSION_CARD.title}>{session.function.name}</span>
            <span className={SESSION_CARD.meta}>{formatDay(session.startsAt)}</span>
            {!isRunning && <Status label={status.label} accent={status.accent} className="mt-1" />}
          </div>
        </div>

        {progress !== null && (
          <div className={SESSION_CARD.track} aria-hidden="true">
            <div className={SESSION_CARD.fill} style={{ width: `${progress}%` }} />
          </div>
        )}
      </article>
    )
  }

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
          <Section title={ACADEMY_COPY.groupRunning} bare>
            <div className={SESSION_CARD.grid}>
              {running.map(card)}
              <AddRow
                tile
                label={ACADEMY_COPY.sessionAdd}
                disabled={!canManage}
                onClick={openCreate}
              />
            </div>
          </Section>

          {showFinished && finished.length > 0 && (
            <Section title={ACADEMY_COPY.groupFinished} bare>
              <div className={SESSION_CARD.grid}>{finished.map(card)}</div>
            </Section>
          )}
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
