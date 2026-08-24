'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { AvatarStack } from '@/components/elements/display/Avatar'
import { Badge } from '@/components/elements/display/Badge'
import { Button } from '@/components/elements/actions/Button'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { AddRow } from '@/components/structures/AddRow'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { FormDialog } from '@/components/structures/FormDialog'
import { Section } from '@/components/structures/Section'
import { useSessions } from '@/core/hooks/data/useAcademy'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { ACADEMY_SESSION_STATUS_REGISTRY } from '@/declarations/academy/registries'
import { ROUTES } from '@/declarations/navigation'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { toTone } from '@/declarations/ui/theme'
import { LIST_STYLES } from '@/declarations/ui/variants'
import { useMenu, type MenuItem } from '@/managers/front-end'
import type { SessionSummary } from '@/types/academy'
import type { FieldDefinition } from '@/types/forms'
import { cn } from '@/utils/classnames'
import { formatDay } from '@/utils/format/dates'

export interface SessionsPanelProps {
  initialSessions: SessionSummary[]
  fields: FieldDefinition[]
  canManage: boolean
}

/**
 * Academy board, one card per session, each opening its own follow-up screen
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

  return (
    <>
      <Section bare>
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
          <div className={LIST_STYLES.grid}>
            {sessions.map((session) => {
              const jobFunction = session.function
              const status = ACADEMY_SESSION_STATUS_REGISTRY.get(session.status)

              return (
                <article
                  key={session.id}
                  onClick={() => router.push(ROUTES.session(session.id))}
                  onContextMenu={contextMenu(sessionMenu(session), jobFunction.name)}
                  className={cn(LIST_STYLES.card, LIST_STYLES.cardClickable)}
                >
                  <header className="flex flex-wrap items-center gap-2">
                    <Badge
                      label={jobFunction.name}
                      tone={toTone(jobFunction.accent, 'brand')}
                      dot
                    />
                    <span className="text-sm font-bold">{formatDay(session.startsAt)}</span>
                    <Badge
                      label={status.label}
                      tone={toTone(status.accent, 'neutral')}
                      dot
                      className="ml-auto"
                    />
                  </header>
                  {jobFunction.summary && (
                    <p className="text-xs text-[var(--color-ink-subtle)]">{jobFunction.summary}</p>
                  )}
                  <footer className="flex items-center justify-between gap-2">
                    {session.trainers.length > 0 ? (
                      <AvatarStack people={session.trainers} />
                    ) : (
                      <span className="text-xs text-[var(--color-ink-subtle)] italic">
                        {ACADEMY_COPY.noTrainer}
                      </span>
                    )}
                    <span className="text-xs text-[var(--color-ink-subtle)] tabular-nums">
                      {`${session.juniorCount} ${
                        session.juniorCount === 1
                          ? ACADEMY_COPY.sessionCountOne
                          : ACADEMY_COPY.sessionCount
                      }`}
                    </span>
                  </footer>
                </article>
              )
            })}
            <AddRow
              label={ACADEMY_COPY.sessionAdd}
              disabled={!canManage}
              tile
              onClick={openCreate}
            />
          </div>
        )}
      </Section>

      <FormDialog
        open={isCreating}
        title={ACADEMY_COPY.sessionAdd}
        fields={fields}
        issues={issues}
        isSaving={isSaving}
        size="lg"
        onSubmit={create}
        onClose={() => setCreating(false)}
      />

      <FormDialog
        open={editing !== null}
        title={ACTION_COPY.edit}
        fields={fields}
        initialValues={editing?.values}
        issues={issues}
        isSaving={isSaving}
        size="lg"
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
