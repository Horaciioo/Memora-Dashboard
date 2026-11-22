'use client'

import { useState } from 'react'

import { PlayFriendAdd } from '@/composites/play/friends/PlayFriendAdd'
import { PlayFriendRequests } from '@/composites/play/friends/PlayFriendRequests'
import { PlayFriendRow } from '@/composites/play/friends/PlayFriendRow'
import { usePlayOnline } from '@/composites/play/mobile/PlayOnline'
import { ICONS } from '@/declarations/ui/icons'
import { useScrollFade } from '@/core/hooks/interaction/state/play/useScrollFade'
import { PLAY_FRIENDS_COPY } from '@/declarations/play'
import { PLAY_FRIENDS } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import type { PlayFriendsState, PlayLobbyCard, PlayPresence } from '@/types/play'

export interface PlayFriendsListProps {
  state: PlayFriendsState
  tables: PlayLobbyCard[]
  presence: PlayPresence | null
  // Phone sheet: the sheet scrolls, not the box
  isSheet?: boolean
}

/**
 * Friends box: search, requests, who is here, who is away
 * @param {PlayFriendsListProps} props - Friends and tables
 * @return {JSX.Element}
 */

export const PlayFriendsList = ({ state, tables, presence, isSheet }: PlayFriendsListProps) => {
  const [filter, setFilter] = useState<'all' | 'online'>('all')
  const [tool, setTool] = useState<'add' | 'find' | null>(null)
  const [term, setTerm] = useState('')
  const {
    ref: fadeRef,
    onScroll,
    hasMore,
  } = useScrollFade([state.friends.length, state.incoming.length, filter, term])
  const onlineIds = new Set(usePlayOnline().map((member) => member.accountId))

  const isOnline = filter === 'online'
  const needle = term.trim().toLowerCase()
  const friends = needle
    ? state.friends.filter((friend) => friend.name.toLowerCase().includes(needle))
    : state.friends
  const here = friends.filter((friend) => onlineIds.has(friend.id))
  const away = isOnline ? [] : friends.filter((friend) => !onlineIds.has(friend.id))
  const section = (title: string, list: typeof here) =>
    list.length > 0 && (
      <section className={PLAY_FRIENDS.section} aria-label={title}>
        <h3 className={PLAY_FRIENDS.sectionTitle}>{title}</h3>
        {list.map((friend) => (
          <PlayFriendRow key={friend.id} friend={friend} tables={tables} presence={presence} />
        ))}
      </section>
    )
  const filters = [
    { key: 'all', label: PLAY_FRIENDS_COPY.all },
    { key: 'online', label: PLAY_FRIENDS_COPY.online },
  ] as const

  const keys = [
    { key: 'add', label: PLAY_FRIENDS_COPY.addKey, Icon: ICONS.playInvite },
    { key: 'find', label: PLAY_FRIENDS_COPY.filterKey, Icon: ICONS.search },
  ] as const
  const toggle = (key: 'add' | 'find') => {
    setTool((current) => (current === key ? null : key))
    setTerm('')
  }

  return (
    <aside
      aria-label={PLAY_FRIENDS_COPY.panel}
      className={isSheet ? PLAY_FRIENDS.sheet : PLAY_FRIENDS.root}
    >
      <div className={PLAY_FRIENDS.head}>
        <h2 className={PLAY_FRIENDS.title}>{PLAY_FRIENDS_COPY.title}</h2>
        <div className={PLAY_FRIENDS.headKeys}>
          {keys.map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              aria-label={label}
              aria-pressed={tool === key}
              title={label}
              className={cn(PLAY_FRIENDS.headKey, tool === key && PLAY_FRIENDS.headKeyOn)}
              onClick={() => toggle(key)}
            >
              <Icon className={PLAY_FRIENDS.headGlyph} aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>
      <div role="tablist" aria-label={PLAY_FRIENDS_COPY.panel} className={PLAY_FRIENDS.tabs}>
        {filters.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={filter === key}
            className={cn(PLAY_FRIENDS.tab, filter === key && PLAY_FRIENDS.tabOn)}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>
      {tool === 'add' && <PlayFriendAdd />}
      {tool === 'find' && (
        <input
          type="search"
          value={term}
          placeholder={PLAY_FRIENDS_COPY.filter}
          aria-label={PLAY_FRIENDS_COPY.filterKey}
          className={PLAY_FRIENDS.field}
          onChange={(event) => setTerm(event.target.value)}
        />
      )}
      <div
        ref={fadeRef}
        className={cn(
          isSheet ? PLAY_FRIENDS.sheetBody : PLAY_FRIENDS.scroll,
          !isSheet && hasMore && PLAY_FRIENDS.fade
        )}
        onScroll={onScroll}
      >
        {!isOnline && <PlayFriendRequests incoming={state.incoming} outgoing={state.outgoing} />}
        {section(PLAY_FRIENDS_COPY.online, here)}
        {section(PLAY_FRIENDS_COPY.offline, away)}
        {isOnline && here.length === 0 && (
          <p className={PLAY_FRIENDS.empty}>{PLAY_FRIENDS_COPY.noneOnline}</p>
        )}
        {!isOnline && state.friends.length === 0 && state.incoming.length === 0 && (
          <p className={PLAY_FRIENDS.empty}>{PLAY_FRIENDS_COPY.empty}</p>
        )}
      </div>
    </aside>
  )
}
