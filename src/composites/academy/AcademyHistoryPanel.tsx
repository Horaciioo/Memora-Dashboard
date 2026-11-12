'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { Button } from '@/components/elements/actions/Button'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { FilterBar, type FilterDefinition } from '@/components/structures/data/FilterBar'
import { RowList, type RowListGroup } from '@/components/structures/data/RowList'
import {
  useAcademyHistory,
  type AcademyHistoryFilters,
} from '@/core/hooks/data/academy/useAcademyHistory'
import { ACADEMY_HISTORY_COPY } from '@/declarations/academy/historyCopy'
import {
  ACADEMY_JUNIOR_STATUS_REGISTRY,
  ACADEMY_SESSION_STATUS_REGISTRY,
} from '@/declarations/academy/registries'
import { ROUTES } from '@/declarations/navigation'
import { accentVars } from '@/declarations/ui/theme'
import { PASTEL_TAG } from '@/declarations/ui/variants'
import { formatDay } from '@/utils/format/time/dates'

// No search, no filter
const NO_FILTERS: AcademyHistoryFilters = {
  search: '',
  status: '',
  juniorStatus: '',
  referentId: '',
}

const SESSION_STATUSES = ACADEMY_SESSION_STATUS_REGISTRY.keys.map((value) => ({
  value,
  label: ACADEMY_SESSION_STATUS_REGISTRY.label(value),
}))

const JUNIOR_STATUSES = ACADEMY_JUNIOR_STATUS_REGISTRY.keys.map((value) => ({
  value,
  label: ACADEMY_JUNIOR_STATUS_REGISTRY.label(value),
}))

/**
 * Promotions with their juniors, found again by name
 * @return {JSX.Element}
 */

export const AcademyHistoryPanel = () => {
  const router = useRouter()
  const [filters, setFilters] = useState<AcademyHistoryFilters>(NO_FILTERS)
  const history = useAcademyHistory(filters)

  const isFiltered = Object.values(filters).some((value) => value !== '')

  const definitions: FilterDefinition[] = [
    {
      name: 'status',
      label: ACADEMY_HISTORY_COPY.status,
      allLabel: ACADEMY_HISTORY_COPY.allStatuses,
      options: SESSION_STATUSES,
    },
    {
      name: 'junior',
      label: ACADEMY_HISTORY_COPY.junior,
      allLabel: ACADEMY_HISTORY_COPY.allJuniors,
      options: JUNIOR_STATUSES,
    },
    {
      name: 'referent',
      label: ACADEMY_HISTORY_COPY.referent,
      allLabel: ACADEMY_HISTORY_COPY.allReferents,
      options: history.referents.map((item) => ({ value: item.id, label: item.label })),
    },
  ]

  const values: Record<string, string> = {
    status: filters.status,
    junior: filters.juniorStatus,
    referent: filters.referentId,
  }

  const applyFilter = (name: string, value: string) =>
    setFilters((current) => ({
      ...current,
      ...(name === 'status' ? { status: value } : {}),
      ...(name === 'junior' ? { juniorStatus: value } : {}),
      ...(name === 'referent' ? { referentId: value } : {}),
    }))

  const groups: RowListGroup[] = history.sessions.map((session) => ({
    id: session.id,
    label: `${session.title} · ${ACADEMY_SESSION_STATUS_REGISTRY.label(session.status)}`,
    items: session.juniors.map((junior) => {
      const status = ACADEMY_JUNIOR_STATUS_REGISTRY.get(junior.status)

      return {
        id: junior.id,
        title: junior.name,
        meta: junior.referent ?? ACADEMY_HISTORY_COPY.noReferent,
        metaEmpty: junior.referent === null,
        lead: <Avatar name={junior.name} src={junior.avatarUrl} size="md" />,
        trail: (
          <span className="flex items-center gap-3">
            <span className={PASTEL_TAG} style={accentVars(status.accent)}>
              {status.label}
            </span>
            <span>{formatDay(junior.startedAt)}</span>
          </span>
        ),
        menu: [],
        onOpen: () => router.push(ROUTES.junior(session.id, junior.id)),
      }
    }),
  }))

  return (
    <div className="flex flex-col gap-6">
      <FilterBar
        searchLabel={ACADEMY_HISTORY_COPY.search}
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
          title={ACADEMY_HISTORY_COPY.emptyTitle}
          description={ACADEMY_HISTORY_COPY.emptyDescription}
          action={null}
        />
      ) : (
        <RowList groups={groups} />
      )}

      {history.hasMore && (
        <Button onClick={history.loadMore} isLoading={history.isFetchingMore}>
          {ACADEMY_HISTORY_COPY.more}
        </Button>
      )}
    </div>
  )
}
