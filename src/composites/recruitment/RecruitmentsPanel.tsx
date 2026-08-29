'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { Avatar } from '@/components/elements/display/Avatar'
import { Badge } from '@/components/elements/display/Badge'
import { Button } from '@/components/elements/actions/Button'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { AddRow } from '@/components/structures/AddRow'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { FilterBar, type FilterDefinition } from '@/components/structures/FilterBar'
import { FormDialog } from '@/components/structures/FormDialog'
import { Section } from '@/components/structures/Section'
import { useRecruitments } from '@/core/hooks/data/useRecruitments'
import { toOptions } from '@/core/lib/forms/options'
import { ROUTES } from '@/declarations/navigation'
import { RECRUITMENT_COPY, RECRUITMENT_FILTER_COPY } from '@/declarations/recruitment/copy'
import { RECRUITMENT_STATUS_REGISTRY } from '@/declarations/recruitment/registries'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { LIST_STYLES } from '@/declarations/ui/variants'
import { useMenu, type MenuItem } from '@/managers/front-end'
import type { FieldDefinition, FieldOption } from '@/types/forms'
import type { RecruitmentSummary } from '@/types/recruitment'
import { cn } from '@/utils/classnames'
import { formatDay } from '@/utils/format/dates'

export interface RecruitmentsPanelProps {
  initialSessions: RecruitmentSummary[]
  fields: FieldDefinition[]
  youtubers: FieldOption[]
  functions: FieldOption[]
  canManage: boolean
}

/**
 * Recruitment board, one card per session, each opening its own file
 * @param {RecruitmentSummary[]} initialSessions - Sessions resolved server-side
 * @param {FieldDefinition[]} fields - Declarations of the session form
 * @param {FieldOption[]} youtubers - Creator filter options
 * @param {FieldOption[]} functions - Function filter options
 * @param {boolean} canManage - Member may open and close sessions
 * @return {JSX.Element}
 */

export const RecruitmentsPanel = ({
  initialSessions,
  fields,
  youtubers,
  functions,
  canManage,
}: RecruitmentsPanelProps) => {
  const router = useRouter()
  const { sessions, isSaving, issues, clearIssues, create, update, remove } =
    useRecruitments(initialSessions)
  const { contextMenu } = useMenu()
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [isCreating, setCreating] = useState(false)
  const [editing, setEditing] = useState<RecruitmentSummary | null>(null)
  const [pendingDeletion, setPendingDeletion] = useState<RecruitmentSummary | null>(null)

  const isFiltered =
    search.trim().length > 0 || Object.values(filters).some((value) => value.length > 0)

  const visibleSessions = useMemo(() => {
    const term = search.trim().toLowerCase()

    return sessions.filter((entry) => {
      if (term.length > 0 && !entry.name.toLowerCase().includes(term)) return false
      if (filters.status && entry.status !== filters.status) return false
      if (filters.youtuber && entry.youtuber.id !== filters.youtuber) return false
      if (filters.jobFunction && entry.jobFunction.id !== filters.jobFunction) return false

      return true
    })
  }, [sessions, search, filters])

  const filterDefinitions: FilterDefinition[] = [
    {
      name: 'status',
      label: RECRUITMENT_FILTER_COPY.status,
      allLabel: RECRUITMENT_FILTER_COPY.allStatuses,
      options: toOptions(RECRUITMENT_STATUS_REGISTRY),
      mark: 'dot',
    },
    {
      name: 'youtuber',
      label: RECRUITMENT_FILTER_COPY.youtuber,
      allLabel: RECRUITMENT_FILTER_COPY.allYoutubers,
      options: youtubers,
      mark: 'avatar',
    },
    {
      name: 'jobFunction',
      label: RECRUITMENT_FILTER_COPY.jobFunction,
      allLabel: RECRUITMENT_FILTER_COPY.allFunctions,
      options: functions,
      mark: 'dot',
    },
  ]

  const openCreate = () => {
    clearIssues()
    setCreating(true)
  }

  const resetFilters = () => {
    setSearch('')
    setFilters({})
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

  return (
    <>
      <Section bare>
        <FilterBar
          searchLabel={RECRUITMENT_FILTER_COPY.search}
          search={search}
          onSearch={setSearch}
          filters={filterDefinitions}
          values={filters}
          onFilter={(name, value) => setFilters((current) => ({ ...current, [name]: value }))}
          onReset={resetFilters}
          isFiltered={isFiltered}
        />

        {isFiltered && visibleSessions.length === 0 ? (
          <EmptyState
            variant="filter"
            title={RECRUITMENT_COPY.filterTitle}
            description={RECRUITMENT_COPY.filterDescription}
            action={<Button onClick={resetFilters}>{ACTION_COPY.clearFilter}</Button>}
          />
        ) : sessions.length === 0 ? (
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
        ) : (
          <div className={LIST_STYLES.grid}>
            {visibleSessions.map((entry) => {
              const status = RECRUITMENT_STATUS_REGISTRY.get(entry.status)

              return (
                <article
                  key={entry.id}
                  onClick={() => router.push(ROUTES.recruitment(entry.id))}
                  onContextMenu={contextMenu(sessionMenu(entry), entry.name)}
                  className={cn(LIST_STYLES.card, LIST_STYLES.cardClickable)}
                >
                  <header className="flex flex-wrap items-center gap-2">
                    <Avatar name={entry.youtuber.label} src={entry.youtuber.image} size="sm" />
                    <span className="min-w-0 flex-1 truncate text-sm font-bold">{entry.name}</span>
                    <Badge label={status.label} accent={status.accent} tone={'neutral'} dot />
                  </header>
                  <span className="flex flex-wrap items-center gap-2">
                    <Badge
                      label={entry.jobFunction.label}
                      accent={entry.jobFunction.accent}
                      tone={'brand'}
                      dot
                    />
                    {entry.opensAt && (
                      <span className="text-xs text-[var(--color-ink-subtle)]">
                        {formatDay(entry.opensAt)}
                      </span>
                    )}
                  </span>
                  {entry.summary && (
                    <p className="text-xs text-[var(--color-ink-subtle)]">{entry.summary}</p>
                  )}
                  <footer className="flex items-center justify-between gap-2 text-xs text-[var(--color-ink-subtle)] tabular-nums">
                    <span>{`${entry.candidateCount} ${RECRUITMENT_COPY.candidateCount}`}</span>
                    <Badge
                      label={`${entry.interviewedCount}`}
                      tone={entry.interviewedCount > 0 ? 'success' : 'neutral'}
                      icon="confirm"
                    />
                  </footer>
                </article>
              )
            })}
            <AddRow label={RECRUITMENT_COPY.add} disabled={!canManage} tile onClick={openCreate} />
          </div>
        )}
      </Section>

      <FormDialog
        open={isCreating}
        title={RECRUITMENT_COPY.addTitle}
        fields={fields}
        issues={issues}
        isSaving={isSaving}
        size="lg"
        onSubmit={create}
        onClose={() => setCreating(false)}
      />

      <FormDialog
        open={editing !== null}
        title={RECRUITMENT_COPY.editTitle}
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
}
