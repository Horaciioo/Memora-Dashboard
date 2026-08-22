'use client'

import { useState } from 'react'
import { Avatar } from '@/components/elements/display/Avatar'
import { Badge } from '@/components/elements/display/Badge'
import { Button } from '@/components/elements/actions/Button'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { FormDialog } from '@/components/structures/FormDialog'
import { Section } from '@/components/structures/Section'
import { useDragAndDrop } from '@/core/hooks/interaction/useDragAndDrop'
import { useTeams } from '@/core/hooks/data/useTeams'
import { TEAM_COPY } from '@/declarations/teams/copy'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { BOARD_STYLES } from '@/declarations/ui/variants'
import { toTone } from '@/declarations/ui/theme'
import { useMenu, type MenuItem } from '@/managers/front-end'
import type { FieldDefinition } from '@/types/forms'
import type { TeamBoardData, TeamView } from '@/types/teams'
import { cn } from '@/utils/classnames'

export interface TeamsBoardProps {
  initialBoard: TeamBoardData
  fields: FieldDefinition[]
  canManage: boolean
}

// Column holding everyone without a team
const UNASSIGNED = 'unassigned'

/**
 * Team board, a member moving from one team to another by dragging their card
 * @param {TeamBoardData} initialBoard - Board resolved server-side
 * @param {FieldDefinition[]} fields - Declarations of the team form
 * @param {boolean} canManage - Member may create teams and move people
 * @return {JSX.Element}
 */

export const TeamsBoard = ({ initialBoard, fields, canManage }: TeamsBoardProps) => {
  const { board, isSaving, issues, clearIssues, create, update, remove, move } =
    useTeams(initialBoard)
  const { contextMenu } = useMenu()
  const [isCreating, setCreating] = useState(false)
  const [editing, setEditing] = useState<TeamView | null>(null)
  const [pendingDeletion, setPendingDeletion] = useState<TeamView | null>(null)

  const { over, itemProps, containerProps } = useDragAndDrop((item, container) =>
    move(item.id, container === UNASSIGNED ? null : container)
  )

  const openCreate = () => {
    clearIssues()
    setCreating(true)
  }

  const teamMenu = (team: TeamView): MenuItem[] => [
    {
      id: 'edit',
      label: ACTION_COPY.edit,
      icon: 'edit',
      disabled: !canManage,
      onSelect: () => {
        clearIssues()
        setEditing(team)
      },
    },
    {
      id: 'delete',
      label: ACTION_COPY.delete,
      icon: 'remove',
      danger: true,
      separatorBefore: true,
      disabled: !canManage,
      onSelect: () => setPendingDeletion(team),
    },
  ]

  if (board.teams.length === 0) {
    return (
      <>
        <EmptyState
          figure="teams"
          title={TEAM_COPY.emptyTitle}
          description={TEAM_COPY.emptyDescription}
          action={
            <Button variant="primary" icon="add" disabled={!canManage} onClick={openCreate}>
              {TEAM_COPY.add}
            </Button>
          }
        />
        <FormDialog
          open={isCreating}
          title={TEAM_COPY.add}
          fields={fields}
          issues={issues}
          isSaving={isSaving}
          onSubmit={create}
          onClose={() => setCreating(false)}
        />
      </>
    )
  }

  return (
    <>
      <Section
        title={TEAM_COPY.title}
        description={TEAM_COPY.lead}
        action={
          canManage ? (
            <Button variant="primary" icon="add" onClick={openCreate}>
              {TEAM_COPY.add}
            </Button>
          ) : undefined
        }
        bare
      >
        <div className={BOARD_STYLES.scroller}>
          {board.teams.map((team) => (
            <section
              key={team.id}
              className={BOARD_STYLES.column}
              onContextMenu={contextMenu(teamMenu(team), team.name)}
            >
              <header className={BOARD_STYLES.columnHead}>
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="truncate font-bold">{team.name}</span>
                  <span className="flex flex-wrap items-center gap-1.5">
                    {team.youtuber && (
                      <Badge
                        label={team.youtuber.label}
                        tone={toTone(team.youtuber.accent, 'info')}
                        icon="youtuber"
                      />
                    )}
                    <span className="text-xs text-[var(--color-ink-subtle)]">
                      {team.lead ? `${TEAM_COPY.leadLabel} · ${team.lead.name}` : TEAM_COPY.noLead}
                    </span>
                  </span>
                </span>
                <span className={BOARD_STYLES.count}>{team.members.length}</span>
              </header>
              <div
                className={cn(BOARD_STYLES.body, over === team.id && 'is-drop-target')}
                {...(canManage ? containerProps(team.id) : {})}
              >
                {team.members.length === 0 && (
                  <p className="px-2 py-6 text-center text-xs text-[var(--color-ink-subtle)] italic">
                    {TEAM_COPY.emptyColumn}
                  </p>
                )}
                {team.members.map((member) => (
                  <article
                    key={member.id}
                    className={cn(BOARD_STYLES.card, 'flex-row items-center gap-2')}
                    {...(canManage ? itemProps({ id: member.id, from: team.id }) : {})}
                  >
                    <Avatar name={member.name} src={member.src} size="xs" />
                    <span className="truncate text-sm">{member.name}</span>
                  </article>
                ))}
              </div>
            </section>
          ))}
          <section className={cn(BOARD_STYLES.column, 'border-dashed')}>
            <header className={BOARD_STYLES.columnHead}>
              <span className="flex min-w-0 flex-col gap-1">
                <span className="truncate font-bold">{TEAM_COPY.unassigned}</span>
                <span className="text-xs text-[var(--color-ink-subtle)]">
                  {TEAM_COPY.unassignedHint}
                </span>
              </span>
              <span className={BOARD_STYLES.count}>{board.unassigned.length}</span>
            </header>
            <div
              className={cn(BOARD_STYLES.body, over === UNASSIGNED && 'is-drop-target')}
              {...(canManage ? containerProps(UNASSIGNED) : {})}
            >
              {board.unassigned.length === 0 && (
                <p className="px-2 py-6 text-center text-xs text-[var(--color-ink-subtle)] italic">
                  {TEAM_COPY.emptyColumn}
                </p>
              )}
              {board.unassigned.map((member) => (
                <article
                  key={member.id}
                  className={cn(BOARD_STYLES.card, 'flex-row items-center gap-2')}
                  {...(canManage ? itemProps({ id: member.id, from: UNASSIGNED }) : {})}
                >
                  <Avatar name={member.name} src={member.src} size="xs" />
                  <span className="truncate text-sm">{member.name}</span>
                </article>
              ))}
            </div>
          </section>
        </div>
      </Section>

      <FormDialog
        open={isCreating}
        title={TEAM_COPY.add}
        fields={fields}
        issues={issues}
        isSaving={isSaving}
        onSubmit={create}
        onClose={() => setCreating(false)}
      />

      <FormDialog
        open={editing !== null}
        title={editing ? `${ACTION_COPY.edit} · ${editing.name}` : ACTION_COPY.edit}
        fields={fields}
        initialValues={editing?.values}
        issues={issues}
        isSaving={isSaving}
        onSubmit={(values) => update(editing!.id, values)}
        onClose={() => setEditing(null)}
      />

      <ConfirmDialog
        open={pendingDeletion !== null}
        title={TEAM_COPY.deleteTitle}
        description={TEAM_COPY.deleteDescription}
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
