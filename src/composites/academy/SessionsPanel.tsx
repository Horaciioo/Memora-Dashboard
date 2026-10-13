'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { AvatarStack } from '@/components/elements/display/Avatar'
import { Status } from '@/components/elements/display/Status'
import { Button } from '@/components/elements/actions/Button'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { AddRow } from '@/components/structures/AddRow'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { PageOptions, type PageOption } from '@/components/structures/PageOptions'
import { FormDrawer } from '@/components/structures/FormDrawer'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'
import { ProgramCard } from '@/components/structures/ProgramCard'
import { Section } from '@/components/structures/Section'
import { useSessions } from '@/core/hooks/data/useAcademy'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { ACADEMY_SESSION_STATUS_REGISTRY } from '@/declarations/academy/registries'
import { ROUTES } from '@/declarations/navigation'
import { ACTION_COPY, PAGE_OPTIONS_COPY } from '@/declarations/ui/copy'

import { GROUP_STYLES, PROGRAM_CARD, PROGRAM_ROW } from '@/declarations/ui/variants'
import type { MenuItem } from '@/managers/front-end'
import type { SessionSummary } from '@/types/academy'
import type { FieldDefinition } from '@/types/forms'
import {
  AcademySessionStatuses,
  FINISHED_ACADEMY_SESSION_STATUSES,
} from '@/utils/constants/hierarchy'
import { sessionTitle } from '@/utils/format/academy'
import { formatDay, formatDayRange } from '@/utils/format/dates'

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

  // Running sessions first
  const [running, finished] = [
    sessions.filter((entry) => !FINISHED_ACADEMY_SESSION_STATUSES.includes(entry.status)),
    sessions.filter((entry) => FINISHED_ACADEMY_SESSION_STATUSES.includes(entry.status)),
  ]

  const card = (session: SessionSummary, compact = false) => {
    const status = ACADEMY_SESSION_STATUS_REGISTRY.get(session.status)
    const range = session.endsAt
      ? formatDayRange(session.startsAt, session.endsAt)
      : formatDay(session.startsAt)

    return (
      <ProgramCard
        key={session.id}
        compact={compact}
        title={sessionTitle(session)}
        meta={range}
        icon={session.function.icon}
        accent={session.function.accent}
        foot={
          session.status === AcademySessionStatuses.Running ? undefined : (
            <Status label={status.label} accent={status.accent} />
          )
        }
        side={<AvatarStack people={session.trainers} size="sm" />}
        menu={sessionMenu(session)}
        onOpen={() => router.push(ROUTES.session(session.id))}
      />
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
            <div className={PROGRAM_CARD.grid}>
              {running.map((session) => card(session))}
              <AddRow
                tile="session"
                label={ACADEMY_COPY.sessionAdd}
                disabled={!canManage}
                onClick={openCreate}
              />
            </div>
          </Section>

          {showFinished && finished.length > 0 && (
            <Section title={ACADEMY_COPY.groupFinished} bare>
              <div className={PROGRAM_ROW.list}>
                {finished.map((session) => card(session, true))}
              </div>
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
