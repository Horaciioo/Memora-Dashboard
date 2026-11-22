'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { SelectMenu } from '@/components/elements/forms/selects/SelectMenu'
import { PlayAdminBulk, type BulkMode } from '@/composites/play/admin/PlayAdminBulk'
import { PlayAdminGroup } from '@/composites/play/admin/PlayAdminGroup'
import { PlayAdminCard } from '@/composites/play/admin/PlayAdminCard'
import { usePlayOnline } from '@/composites/play/mobile/PlayOnline'
import { ROUTES } from '@/declarations/navigation'
import { fillPlayMessage } from '@/declarations/play'
import { PLAY_BOARD_ADMIN_COPY as COPY } from '@/declarations/play/admin'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_ADMIN, PLAY_BOX } from '@/declarations/ui/variants'
import type { PlayAdminBoard } from '@/types/play'
import { withToggled } from '@/utils/format/arrays'
import { foldText } from '@/utils/format/strings'
import { formatNumber } from '@/utils/format/numbers'

// States a player is filtered by
const PLAY_STATES = [
  { value: 'online', label: COPY.filterOnline },
  { value: 'banned', label: COPY.filterBanned },
  { value: 'played', label: COPY.filterPlayed },
  { value: 'idle', label: COPY.filterIdle },
]

export interface PlayAdminPlayersProps {
  board: PlayAdminBoard
  // The admin level chooses and wipes several players
  canBulk: boolean
}

/**
 * Player list of the Play admin: figures, search and menus, one box per creator, sections inside
 * @param {PlayAdminPlayersProps} props - Board and reach
 * @return {JSX.Element}
 */

export const PlayAdminPlayers = ({ board, canBulk }: PlayAdminPlayersProps) => {
  const router = useRouter()
  const onlineMembers = usePlayOnline()
  const online = useMemo(
    () => new Set(onlineMembers.map((member) => member.accountId)),
    [onlineMembers]
  )
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Record<string, string>>({})
  // Boxes flipped from their default, creators folded
  const [flipped, setFlipped] = useState<Set<string>>(new Set())
  const [chosen, setChosen] = useState<Set<string>>(new Set())
  const [form, setForm] = useState<BulkMode | null>(null)

  const isFiltered =
    search.trim().length > 0 || Object.values(filters).some((value) => value.length > 0)
  // Matching boxes open by default while searching
  const isOpenByDefault = isFiltered

  const shown = useMemo(() => {
    const term = foldText(search.trim())

    return board.players.filter((entry) => {
      if (term.length > 0 && !foldText(entry.name).includes(term)) return false
      if (filters.youtuber && !entry.youtuberIds.includes(filters.youtuber)) return false
      if (filters.state === 'online' && !online.has(entry.accountId)) return false
      if (filters.state === 'banned' && !entry.isBanned) return false
      if (filters.state === 'played' && entry.played === 0) return false
      if (filters.state === 'idle' && entry.played > 0) return false

      return true
    })
  }, [board.players, search, filters, online])

  // One box per creator, a player with several sits in each
  const groups = useMemo(() => {
    const known = new Set(board.youtubers.map((youtuber) => youtuber.id))
    const boxes = board.youtubers.map((youtuber) => ({
      key: youtuber.id,
      label: youtuber.name,
      image: youtuber.avatarUrl,
      players: shown.filter((entry) => entry.youtuberIds.includes(youtuber.id)),
    }))
    const loose = shown.filter((entry) => !entry.youtuberIds.some((id) => known.has(id)))

    return [...boxes, { key: 'none', label: COPY.noYoutuber, image: null, players: loose }].filter(
      (group) => group.players.length > 0 || (!isFiltered && group.key !== 'none')
    )
  }, [board.youtubers, shown, isFiltered])

  const setFilter = (name: string, value: string) =>
    setFilters((current) => ({ ...current, [name]: value }))

  const totals = [
    [COPY.totalPlayers, board.totals.players],
    [COPY.totalActive, board.totals.active],
    [COPY.totalBanned, board.totals.banned],
    [COPY.totalXp, board.totals.xp],
  ] as const

  const resetFilters = () => {
    setSearch('')
    setFilters({})
  }

  // Once some are chosen, a click chooses rather than opens
  const activate = (accountId: string) =>
    chosen.size > 0
      ? setChosen((current) => withToggled(current, accountId))
      : router.push(ROUTES.playAdminPlayer(accountId))

  const SearchIcon = ICONS.search

  return (
    <div className={PLAY_BOX.flat}>
      <dl className={PLAY_ADMIN.totals}>
        {totals.map(([label, value]) => (
          <div key={label} className={PLAY_ADMIN.total}>
            <dd className={PLAY_ADMIN.totalValue}>{formatNumber(value)}</dd>
            <dt className={PLAY_ADMIN.totalLabel}>{label}</dt>
          </div>
        ))}
      </dl>

      <div className={PLAY_ADMIN.toolbar}>
        <label className={PLAY_BOX.search}>
          <SearchIcon className={PLAY_BOX.searchIcon} aria-hidden="true" />
          <input
            type="search"
            value={search}
            aria-label={COPY.search}
            placeholder={COPY.search}
            onChange={(event) => setSearch(event.target.value)}
            className={PLAY_BOX.searchInput}
          />
        </label>
        <SelectMenu
          isPlay
          label={COPY.filterYoutuber}
          emptyLabel={COPY.allYoutubers}
          mark="avatar"
          options={board.youtubers.map((youtuber) => ({
            value: youtuber.id,
            label: youtuber.name,
            image: youtuber.avatarUrl,
          }))}
          value={filters.youtuber ?? ''}
          onChange={(value) => setFilter('youtuber', value)}
        />
        <SelectMenu
          isPlay
          label={COPY.filterStatus}
          emptyLabel={COPY.filterAll}
          options={PLAY_STATES}
          value={filters.state ?? ''}
          onChange={(value) => setFilter('state', value)}
        />
      </div>

      {canBulk && (
        <div className={PLAY_ADMIN.toolbarAction}>
          <Button variant="arcade" onClick={() => setForm('give')}>
            {COPY.giveEveryone}
          </Button>
        </div>
      )}

      {isFiltered && shown.length === 0 ? (
        <EmptyState
          variant="filter"
          title={COPY.empty}
          description=""
          action={<Button onClick={resetFilters}>{ACTION_COPY.clearFilter}</Button>}
        />
      ) : (
        <div className={PLAY_ADMIN.groups}>
          {groups.map((group) => {
            const sections = [
              {
                key: 'online',
                label: COPY.sectionOnline,
                list: group.players.filter(
                  (entry) => !entry.isBanned && online.has(entry.accountId)
                ),
              },
              {
                key: 'players',
                label: COPY.sectionPlayers,
                list: group.players.filter(
                  (entry) => !entry.isBanned && !online.has(entry.accountId)
                ),
              },
              {
                key: 'banned',
                label: COPY.sectionBanned,
                list: group.players.filter((entry) => entry.isBanned),
              },
            ].filter((section) => section.list.length > 0)

            return (
              <PlayAdminGroup
                key={group.key}
                name={group.label}
                avatarUrl={group.image}
                note={fillPlayMessage(COPY.groupCount, { count: group.players.length })}
                isOpen={flipped.has(group.key) !== isOpenByDefault}
                onToggle={() => setFlipped((current) => withToggled(current, group.key))}
              >
                <div className={PLAY_ADMIN.sections}>
                  {sections.map((section) => (
                    <div key={section.key} className={PLAY_ADMIN.section}>
                      <h3 className={PLAY_ADMIN.sectionHeading}>{section.label}</h3>
                      <div className={PLAY_ADMIN.grid}>
                        {section.list.map((entry) => (
                          <PlayAdminCard
                            key={entry.accountId}
                            player={entry}
                            isOnline={online.has(entry.accountId)}
                            isChosen={chosen.has(entry.accountId)}
                            canChoose={canBulk}
                            onOpen={() => activate(entry.accountId)}
                            onChoose={() =>
                              setChosen((current) => withToggled(current, entry.accountId))
                            }
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </PlayAdminGroup>
            )
          })}
        </div>
      )}

      {canBulk && (
        <PlayAdminBulk
          form={form}
          onForm={setForm}
          selectedIds={[...chosen]}
          playerCount={board.totals.players}
          onClear={() => setChosen(new Set())}
        />
      )}
    </div>
  )
}
