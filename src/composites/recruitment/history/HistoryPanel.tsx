'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { Status } from '@/components/elements/display/Status'
import { accentVars } from '@/declarations/ui/theme'
import { PASTEL_TAG } from '@/declarations/ui/variants'
import { Button } from '@/components/elements/actions/Button'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { FilterBar, type FilterDefinition } from '@/components/structures/data/FilterBar'
import { RowList, type RowListGroup } from '@/components/structures/data/RowList'
import { BanDrawer, type BanTarget } from '@/composites/recruitment/history/BanDrawer'
import {
  useRecruitmentHistory,
  type HistoryFilters,
} from '@/core/hooks/data/recruitment/useRecruitmentHistory'
import { RECRUITMENT_STATUS_REGISTRY } from '@/declarations/recruitment/registries'
import { ROUTES } from '@/declarations/navigation'
import { HISTORY_COPY } from '@/declarations/recruitment/historyCopy'
import type { MenuItem } from '@/managers/front-end'
import type { HistoryCandidate } from '@/types/recruitment'
import { formatDay } from '@/utils/format/time/dates'

// No search, no filter
const NO_FILTERS: HistoryFilters = {
  search: '',
  bannedOnly: false,
  outcomeId: '',
  recruiterId: '',
  status: '',
}

// Value of the blacklist filter
const BANNED = 'banned'

// Phases a session of the history can be in
const STATUS_OPTIONS = RECRUITMENT_STATUS_REGISTRY.keys.map((value) => ({
  value,
  label: RECRUITMENT_STATUS_REGISTRY.label(value),
}))

/**
 * Sessions with their candidates, found again by name or Discord identity
 * @return {JSX.Element}
 */

export const HistoryPanel = () => {
  const router = useRouter()
  const [filters, setFilters] = useState<HistoryFilters>(NO_FILTERS)
  const [target, setTarget] = useState<BanTarget | null>(null)
  const history = useRecruitmentHistory(filters)

  const isFiltered =
    filters.search !== '' ||
    filters.bannedOnly ||
    filters.outcomeId !== '' ||
    filters.recruiterId !== '' ||
    filters.status !== ''
  const targetBanned =
    history.orphans.some((orphan) => orphan.discordId === target?.discordId) ||
    history.sessions.some((session) =>
      session.candidates.some((entry) => entry.discordId === target?.discordId && entry.ban)
    )

  const definitions: FilterDefinition[] = [
    {
      name: 'status',
      label: HISTORY_COPY.status,
      allLabel: HISTORY_COPY.allStatuses,
      options: STATUS_OPTIONS,
    },
    {
      name: 'outcome',
      label: HISTORY_COPY.outcome,
      allLabel: HISTORY_COPY.allOutcomes,
      options: history.options.outcomes.map((item) => ({ value: item.id, label: item.name })),
    },
    {
      name: 'recruiter',
      label: HISTORY_COPY.recruiter,
      allLabel: HISTORY_COPY.allRecruiters,
      options: history.options.recruiters.map((item) => ({ value: item.id, label: item.label })),
    },
    {
      name: 'blacklist',
      label: HISTORY_COPY.banned,
      allLabel: HISTORY_COPY.allIdentities,
      options: [{ value: BANNED, label: HISTORY_COPY.bannedOnly }],
    },
  ]

  const values: Record<string, string> = {
    status: filters.status,
    outcome: filters.outcomeId,
    recruiter: filters.recruiterId,
    blacklist: filters.bannedOnly ? BANNED : '',
  }

  const applyFilter = (name: string, value: string) =>
    setFilters((current) => ({
      ...current,
      ...(name === 'status' ? { status: value } : {}),
      ...(name === 'outcome' ? { outcomeId: value } : {}),
      ...(name === 'recruiter' ? { recruiterId: value } : {}),
      ...(name === 'blacklist' ? { bannedOnly: value === BANNED } : {}),
    }))

  // Barring and freeing share one menu entry
  const banMenu = (
    entry: Pick<HistoryCandidate, 'discordId' | 'ban'>,
    passage?: { sessionId: string; candidateId: string }
  ): MenuItem[] => [
    ...(passage
      ? [
          {
            id: 'open',
            label: HISTORY_COPY.openFile,
            icon: 'forward' as const,
            onSelect: () => router.push(ROUTES.candidate(passage.sessionId, passage.candidateId)),
          },
        ]
      : []),
    {
      id: 'ban',
      label: entry.ban ? HISTORY_COPY.unban : HISTORY_COPY.ban,
      icon: 'remove',
      danger: !entry.ban,
      separatorBefore: Boolean(passage),
      onSelect: () =>
        setTarget({
          discordId: entry.discordId,
          sessionId: entry.ban?.sessionId ?? passage?.sessionId ?? null,
          candidateId: passage?.candidateId,
        }),
    },
  ]

  const groups: RowListGroup[] = [
    ...history.sessions.map((session) => ({
      id: session.id,
      label: `${session.name} · ${session.youtuber} · ${RECRUITMENT_STATUS_REGISTRY.label(session.status)}`,
      items: session.candidates.map((entry) => ({
        id: entry.candidateId,
        title: entry.name,
        meta: entry.recruiters.map((member) => member.label).join(', ') || HISTORY_COPY.noRecruiter,
        metaEmpty: entry.recruiters.length === 0,
        lead: <Avatar name={entry.name} src={entry.avatarUrl} size="md" />,
        trail: (
          <span className="flex items-center gap-3">
            {entry.ban && <Status label={HISTORY_COPY.banned} tone="danger" />}
            <span className={PASTEL_TAG} style={accentVars(entry.outcome?.accent)}>
              {entry.outcome?.label ?? HISTORY_COPY.noOutcome}
            </span>
            <span>{formatDay(entry.at)}</span>
          </span>
        ),
        menu: banMenu(entry, { sessionId: session.id, candidateId: entry.candidateId }),
        onOpen: () => router.push(ROUTES.candidate(session.id, entry.candidateId)),
      })),
    })),
    ...(history.orphans.length > 0
      ? [
          {
            id: 'orphans',
            label: HISTORY_COPY.orphans,
            items: history.orphans.map((orphan) => ({
              id: orphan.discordId,
              title: orphan.name,
              meta: orphan.ban.reason ?? undefined,
              lead: <Avatar name={orphan.name} src={orphan.avatarUrl} size="md" />,
              trail: <Status label={HISTORY_COPY.banned} tone="danger" />,
              menu: banMenu(orphan),
              onOpen: () => setTarget({ discordId: orphan.discordId, sessionId: null }),
            })),
          },
        ]
      : []),
  ]

  return (
    <div className="flex flex-col gap-6">
      <FilterBar
        searchLabel={HISTORY_COPY.search}
        search={filters.search}
        onSearch={(search) => setFilters((current) => ({ ...current, search }))}
        filters={definitions}
        values={values}
        onFilter={applyFilter}
        onReset={() => setFilters(NO_FILTERS)}
        isFiltered={isFiltered}
      />

      {groups.length === 0 && !history.isLoading ? (
        <EmptyState
          variant={isFiltered ? 'filter' : 'start'}
          figure="members"
          title={HISTORY_COPY.emptyTitle}
          description={HISTORY_COPY.emptyDescription}
          action={null}
        />
      ) : (
        <RowList groups={groups} />
      )}

      {history.hasMore && (
        <Button onClick={history.loadMore} isLoading={history.isFetchingMore}>
          {HISTORY_COPY.more}
        </Button>
      )}
      <p className="text-sm text-[var(--color-ink-subtle)]">{HISTORY_COPY.retention}</p>

      <BanDrawer target={target} isBanned={targetBanned} onClose={() => setTarget(null)} />
    </div>
  )
}
