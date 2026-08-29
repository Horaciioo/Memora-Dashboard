'use client'

import { useMemo, useState } from 'react'
import { Avatar } from '@/components/elements/display/Avatar'
import { Badge } from '@/components/elements/display/Badge'
import { AddRow } from '@/components/structures/AddRow'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { FormDialog } from '@/components/structures/FormDialog'
import { Section } from '@/components/structures/Section'
import { useDragAndDrop } from '@/core/hooks/interaction/useDragAndDrop'
import { useTeams } from '@/core/hooks/data/useTeams'
import { TEAM_COPY } from '@/declarations/teams/copy'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import { BOARD_STYLES, GROUP_STYLES } from '@/declarations/ui/variants'
import { useMenu, type MenuItem } from '@/managers/front-end'
import type { FieldDefinition, FieldOption } from '@/types/forms'
import type { TeamBoardData, TeamView } from '@/types/teams'
import { cn } from '@/utils/classnames'

export interface TeamsBoardProps {
  initialBoard: TeamBoardData
  fields: FieldDefinition[]
  canManage: boolean
  // Creator the board belongs to, set when the board sits inside a creator file
  youtuberId?: string
  // YouTuber options driving the grouping, omitted once the board is already scoped to one
  youtubers?: FieldOption[]
}

// Column holding everyone without a team
const UNASSIGNED = 'unassigned'

interface TeamGroup {
  label: string | null
  youtuberId: string | undefined
  image?: string | null
  teams: TeamView[]
}

/**
 * Team board, a member moving from one team to another by dragging their card, its teams
 * categorised by YouTuber unless the board is already scoped to one
 * @param {TeamBoardData} initialBoard - Board resolved server-side
 * @param {FieldDefinition[]} fields - Declarations of the team form
 * @param {boolean} canManage - Member may create teams and move people
 * @param {string} [youtuberId] - Creator the board belongs to
 * @param {FieldOption[]} [youtubers] - YouTuber options driving the grouping
 * @return {JSX.Element}
 */

export const TeamsBoard = ({
  initialBoard,
  fields,
  canManage,
  youtuberId,
  youtubers,
}: TeamsBoardProps) => {
  const { board, isSaving, issues, clearIssues, create, update, remove, move } = useTeams(
    initialBoard,
    youtuberId
  )
  const { contextMenu } = useMenu()
  const [isCreating, setCreating] = useState(false)
  const [createYoutuberId, setCreateYoutuberId] = useState<string | undefined>(undefined)
  const [editing, setEditing] = useState<TeamView | null>(null)
  const [pendingDeletion, setPendingDeletion] = useState<TeamView | null>(null)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const ChevronIcon = ICONS.expand

  const toggleGroup = (key: string) => {
    setCollapsed((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)

      return next
    })
  }

  const { over, itemProps, containerProps } = useDragAndDrop((item, container) =>
    move(item.id, container === UNASSIGNED ? null : container)
  )

  // Unscoped, every configured YouTuber keeps its row even with no team yet
  const groups = useMemo<TeamGroup[]>(() => {
    if (!youtubers) return [{ label: null, youtuberId: undefined, teams: board.teams }]

    const buckets = new Map<string, TeamView[]>()

    for (const team of board.teams) {
      const key = team.youtuber?.id ?? 'none'
      if (!buckets.has(key)) buckets.set(key, [])
      buckets.get(key)!.push(team)
    }

    const ordered = youtubers.map((option) => ({
      label: option.label,
      youtuberId: option.value as string | undefined,
      image: option.image,
      teams: buckets.get(option.value) ?? [],
    }))

    const withoutYoutuber = buckets.get('none')

    return withoutYoutuber
      ? [
          ...ordered,
          {
            label: TEAM_COPY.noYoutuber,
            youtuberId: undefined,
            image: undefined,
            teams: withoutYoutuber,
          },
        ]
      : ordered
  }, [board.teams, youtubers])

  const openCreate = (forYoutuberId?: string) => {
    clearIssues()
    setCreateYoutuberId(forYoutuberId)
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
      id: 'archive',
      label: team.archived ? TEAM_COPY.unarchive : TEAM_COPY.archive,
      icon: team.archived ? 'visible' : 'hidden',
      disabled: !canManage,
      onSelect: () => void update(team.id, { ...team.values, archived: !team.archived }),
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

  return (
    <>
      <Section bare>
        <div className={GROUP_STYLES.stack}>
          {groups.map((group, index) => {
            const key = group.youtuberId ?? group.label ?? 'flat'
            const isOpen = !group.label || !collapsed.has(key)

            return (
              <div
                key={key}
                className={cn(GROUP_STYLES.section, index > 0 && GROUP_STYLES.sectionDivided)}
              >
                {group.label && (
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => toggleGroup(key)}
                    className={GROUP_STYLES.heading}
                  >
                    {group.youtuberId && <Avatar name={group.label} src={group.image} size="sm" />}
                    {group.label}
                    <span className={GROUP_STYLES.count}>{group.teams.length}</span>
                    <ChevronIcon
                      className={cn(GROUP_STYLES.chevron, isOpen && GROUP_STYLES.chevronOpen)}
                      aria-hidden="true"
                    />
                  </button>
                )}
                {isOpen && (
                  <div className={BOARD_STYLES.scroller}>
                    {group.teams.map((team) => (
                      <section
                        key={team.id}
                        className={cn(
                          BOARD_STYLES.column,
                          team.archived && BOARD_STYLES.columnArchived
                        )}
                        onContextMenu={contextMenu(teamMenu(team), team.name)}
                      >
                        <header className={BOARD_STYLES.columnHead}>
                          <span className="flex min-w-0 flex-col gap-1">
                            <span className="truncate font-bold">{team.name}</span>
                            {team.archived && (
                              <span className="flex flex-wrap items-center gap-1.5">
                                <Badge label={TEAM_COPY.archived} tone="neutral" icon="hidden" />
                              </span>
                            )}
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
                    {canManage && (
                      <AddRow
                        label={TEAM_COPY.add}
                        tile
                        onClick={() => openCreate(group.youtuberId)}
                        className="w-72! shrink-0"
                      />
                    )}
                  </div>
                )}
              </div>
            )
          })}

          <div
            className={cn(GROUP_STYLES.section, groups.length > 0 && GROUP_STYLES.sectionDivided)}
          >
            <button
              type="button"
              aria-expanded={!collapsed.has('unassigned')}
              onClick={() => toggleGroup('unassigned')}
              className={GROUP_STYLES.heading}
            >
              {TEAM_COPY.unassigned}
              <span className={GROUP_STYLES.count}>{board.unassigned.length}</span>
              <ChevronIcon
                className={cn(
                  GROUP_STYLES.chevron,
                  !collapsed.has('unassigned') && GROUP_STYLES.chevronOpen
                )}
                aria-hidden="true"
              />
            </button>
            {!collapsed.has('unassigned') && (
              <div className={BOARD_STYLES.scroller}>
                <section className={cn(BOARD_STYLES.column, 'border-dashed')}>
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
            )}
          </div>
        </div>
      </Section>

      <FormDialog
        open={isCreating}
        title={TEAM_COPY.add}
        fields={fields}
        initialValues={
          youtuberId
            ? { youtuberId }
            : createYoutuberId
              ? { youtuberId: createYoutuberId }
              : undefined
        }
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
