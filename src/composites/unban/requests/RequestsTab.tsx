'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { Status } from '@/components/elements/display/Status'
import { Button } from '@/components/elements/actions/Button'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { FilterBar } from '@/components/structures/data/FilterBar'
import type { FilterDefinition } from '@/components/structures/data/FilterBar'
import { RowList } from '@/components/structures/data/RowList'
import { useUnbanRequests } from '@/core/hooks/data/unban/useUnbanRequests'
import { useCopy } from '@/core/hooks/interaction/state/useCopy'
import { useDebouncedValue } from '@/core/hooks/interaction/state/useDebouncedValue'
import { useUrlParams } from '@/core/hooks/interaction/state/useUrlParams'
import { ROUTES } from '@/declarations/navigation'
import { UNBAN_DESK_STYLES } from '@/declarations/ui/variants'
import { UNBAN_COPY } from '@/declarations/unban/copy'
import { UNBAN_STATUS_REGISTRY } from '@/declarations/unban/registries'
import { UNBAN_PERIOD_DAYS, UNBAN_SCREEN_COPY } from '@/declarations/unban/screen'
import type { MenuItem } from '@/managers/front-end'
import type { FieldOption } from '@/types/forms'
import type { UnbanRequestItem } from '@/types/unban'
import { periodStart } from '@/core/lib/unban/requestFilter'

// Filters the address keeps
const FILTER_PARAMS = ['q', 'status', 'period', 'youtuber'] as const

export interface RequestsTabProps {
  creators: FieldOption[]
}

/**
 * Filters and the plain list of requests, a row opens the person's page
 * @param {RequestsTabProps} props - Perimeter
 * @return {JSX.Element}
 */

export const RequestsTab = ({ creators }: RequestsTabProps) => {
  const { values, set } = useUrlParams(FILTER_PARAMS)
  const [search, setSearch] = useState(values.q)
  const router = useRouter()
  const copyReference = useCopy(UNBAN_SCREEN_COPY.referenceCopied)
  const q = useDebouncedValue(search.trim(), 300)

  // Start of the period, stable until the period changes
  const periodDays = Number(values.period) || 0
  const from = useMemo(() => periodStart(periodDays), [periodDays])
  const filters = useMemo(
    () =>
      Object.fromEntries(
        Object.entries({
          q,
          status: values.status,
          youtuberId: values.youtuber,
          from,
        }).filter(([, value]) => value)
      ),
    [q, values.status, values.youtuber, from]
  )

  const list = useUnbanRequests(filters)
  const isFiltered = Object.keys(filters).length > 0

  const definitions: FilterDefinition[] = [
    {
      name: 'status',
      label: UNBAN_SCREEN_COPY.filterStatus,
      allLabel: UNBAN_SCREEN_COPY.allStatuses,
      options: UNBAN_STATUS_REGISTRY.keys.map((value) => ({
        value,
        label: UNBAN_STATUS_REGISTRY.label(value),
      })),
    },
    {
      name: 'period',
      label: UNBAN_SCREEN_COPY.filterPeriod,
      allLabel: UNBAN_SCREEN_COPY.allPeriods,
      options: UNBAN_PERIOD_DAYS.map((days) => ({
        value: String(days),
        label: UNBAN_SCREEN_COPY.periodLast.replace('{days}', String(days)),
      })),
    },
    ...(creators.length > 1
      ? [
          {
            name: 'youtuber',
            label: UNBAN_SCREEN_COPY.filterCreator,
            allLabel: UNBAN_SCREEN_COPY.allCreators,
            options: creators,
          },
        ]
      : []),
  ]

  const select = (id: string) => router.push(`${ROUTES.unbanRequest(id)}${window.location.search}`)

  const menuOf = (item: UnbanRequestItem): MenuItem[] => [
    { id: 'open', label: UNBAN_SCREEN_COPY.open, icon: 'forward', onSelect: () => select(item.id) },
    {
      id: 'copy',
      label: UNBAN_SCREEN_COPY.copyReference,
      icon: 'copy',
      onSelect: () => void copyReference(item.reference),
    },
  ]

  const rows = list.items.map((item) => {
    const status = UNBAN_STATUS_REGISTRY.get(item.status)

    return {
      id: item.id,
      title: item.discordName,
      meta: `${item.reference} · ${item.youtuberName}`,
      lead: <Avatar name={item.discordName} src={item.discordAvatar} size="md" />,
      trail: <Status label={status.label} tone={status.accent} icon={status.icon} />,
      menu: menuOf(item),
      onOpen: () => select(item.id),
    }
  })

  return (
    <div className={UNBAN_DESK_STYLES.list}>
      <FilterBar
        searchLabel={UNBAN_SCREEN_COPY.searchLabel}
        search={search}
        onSearch={(value) => {
          setSearch(value)
          set({ q: value.trim() })
        }}
        filters={definitions}
        values={values}
        onFilter={(name, value) => set({ [name]: value })}
        onReset={() => {
          setSearch('')
          set({ q: '', status: '', period: '', youtuber: '' })
        }}
        isFiltered={isFiltered}
      />

      {rows.length === 0 && !list.isLoading ? (
        <EmptyState
          variant={isFiltered ? 'filter' : 'start'}
          figure="moderation"
          title={isFiltered ? UNBAN_SCREEN_COPY.emptyFiltered : UNBAN_COPY.emptyRequests}
          compact
        />
      ) : (
        <RowList groups={[{ id: 'requests', label: '', items: rows }]} />
      )}
      {list.hasMore && (
        <div className={UNBAN_DESK_STYLES.more}>
          <Button isLoading={list.isFetchingMore} onClick={list.loadMore}>
            {UNBAN_SCREEN_COPY.loadMore}
          </Button>
        </div>
      )}
    </div>
  )
}
