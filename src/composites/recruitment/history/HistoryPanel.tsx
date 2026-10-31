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
import { useRecruitmentHistory } from '@/core/hooks/data/recruitment/useRecruitmentHistory'
import { ROUTES } from '@/declarations/navigation'
import { HISTORY_COPY } from '@/declarations/recruitment/historyCopy'
import type { MenuItem } from '@/managers/front-end'
import type { HistoryEntry, HistoryPassage } from '@/types/recruitment'
import { formatDay } from '@/utils/format/dates'

// Value of the only filter
const BANNED = 'banned'

const FILTERS: FilterDefinition[] = [
  {
    name: 'blacklist',
    label: HISTORY_COPY.banned,
    allLabel: HISTORY_COPY.allIdentities,
    options: [{ value: BANNED, label: HISTORY_COPY.bannedOnly }],
  },
]

/**
 * Candidates of every session, found again by their Discord identity
 * @return {JSX.Element}
 */

export const HistoryPanel = () => {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [bannedOnly, setBannedOnly] = useState(false)
  const [target, setTarget] = useState<BanTarget | null>(null)
  const history = useRecruitmentHistory(search, bannedOnly)

  const isFiltered = search !== '' || bannedOnly
  const targetBanned = history.entries.some(
    (entry) => entry.discordId === target?.discordId && entry.ban !== null
  )

  // Barring and freeing share one menu entry
  const banMenu = (entry: HistoryEntry, passage?: HistoryPassage): MenuItem[] => [
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

  const groups: RowListGroup[] = history.entries.map((entry) => {
    const lead = <Avatar name={entry.name} src={entry.avatarUrl} size="md" />
    const banned = entry.ban && <Status label={HISTORY_COPY.banned} tone="danger" />

    return {
      id: entry.discordId,
      label: `${entry.name} · ${entry.discordId}`,
      items:
        entry.passages.length > 0
          ? entry.passages.map((passage) => ({
              id: passage.candidateId,
              title: passage.sessionName,
              meta:
                passage.recruiters.map((member) => member.label).join(', ') ||
                HISTORY_COPY.noRecruiter,
              metaEmpty: passage.recruiters.length === 0,
              lead,
              trail: (
                <span className="flex items-center gap-3">
                  {banned}
                  <span className={PASTEL_TAG} style={accentVars(passage.outcome?.accent)}>
                    {passage.outcome?.label ?? HISTORY_COPY.noOutcome}
                  </span>
                  <span>{formatDay(passage.at)}</span>
                </span>
              ),
              menu: banMenu(entry, passage),
              onOpen: () => router.push(ROUTES.candidate(passage.sessionId, passage.candidateId)),
            }))
          : [
              {
                id: entry.discordId,
                title: entry.name,
                meta: entry.ban?.reason ?? undefined,
                lead,
                trail: banned,
                menu: banMenu(entry),
                onOpen: () => setTarget({ discordId: entry.discordId, sessionId: null }),
              },
            ],
    }
  })

  return (
    <div className="flex flex-col gap-6">
      <FilterBar
        searchLabel={HISTORY_COPY.search}
        search={search}
        onSearch={setSearch}
        filters={FILTERS}
        values={{ blacklist: bannedOnly ? BANNED : '' }}
        onFilter={(_, value) => setBannedOnly(value === BANNED)}
        onReset={() => {
          setSearch('')
          setBannedOnly(false)
        }}
        isFiltered={isFiltered}
      />

      {history.entries.length === 0 && !history.isLoading ? (
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
