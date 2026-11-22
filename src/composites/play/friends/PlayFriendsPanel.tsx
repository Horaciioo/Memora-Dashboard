'use client'

import { usePathname } from 'next/navigation'
import { useState, type CSSProperties } from 'react'

import { PlayLiveBox } from '@/composites/play/friends/PlayLiveBox'
import { PlayColumnHandle } from '@/composites/play/friends/PlayColumnHandle'
import { PlayFriendAdd } from '@/composites/play/friends/PlayFriendAdd'
import { PlayMeBox } from '@/composites/play/friends/PlayMeBox'
import { PlayFriendRequests } from '@/composites/play/friends/PlayFriendRequests'
import { PlayFriendRow } from '@/composites/play/friends/PlayFriendRow'
import { usePlayOnline } from '@/composites/play/mobile/PlayOnline'
import { ICONS } from '@/declarations/ui/icons'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_COLUMNS } from '@/declarations/play/columns'
import { useScrollFade } from '@/core/hooks/interaction/state/play/useScrollFade'
import { usePlayPrefsStore } from '@/core/store/play/playPrefs'
import { PLAY_FRIENDS_COPY, isPlayGameHubPath } from '@/declarations/play'
import { PLAY_FRIENDS } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import type { PlayFriendsState, PlayLobbyCard, PlayPresence } from '@/types/play'

export interface PlayFriendsPanelProps {
  state: PlayFriendsState
  tables: PlayLobbyCard[]
  presence: PlayPresence | null
  isLocked: boolean
}

/**
 * Friends column: search, requests, who is here, who is away
 * @param {PlayFriendsPanelProps} props - Friends and tables
 * @return {JSX.Element | null}
 */

export const PlayFriendsPanel = ({ state, tables, presence, isLocked }: PlayFriendsPanelProps) => {
  const path = usePathname()
  const width = usePlayPrefsStore((store) => store.friendsWidth)
  const setWidth = usePlayPrefsStore((store) => store.setFriendsWidth)
  const [filter, setFilter] = useState<'all' | 'online'>('all')
  const [tool, setTool] = useState<'add' | 'find' | null>(null)
  const [term, setTerm] = useState('')
  const {
    ref: fadeRef,
    onScroll,
    hasMore,
  } = useScrollFade([state.friends.length, state.incoming.length, filter, term])
  const onlineIds = new Set(usePlayOnline().map((member) => member.accountId))
  // Games and their hubs fill the room
  if (path.startsWith(ROUTES.playSession('')) || isPlayGameHubPath(path)) return null

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
    <div className={PLAY_FRIENDS.column} style={{ '--col-w': `${width}px` } as CSSProperties}>
      <PlayColumnHandle
        edge="left"
        width={width}
        min={PLAY_COLUMNS.friends.min}
        max={PLAY_COLUMNS.friends.max}
        label={PLAY_FRIENDS_COPY.resize}
        onResize={(next) => setWidth(next)}
      />
      <PlayMeBox />
      <PlayLiveBox tables={tables} presence={presence} isLocked={isLocked} />
      <aside aria-label={PLAY_FRIENDS_COPY.panel} className={PLAY_FRIENDS.root}>
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
          className={cn(PLAY_FRIENDS.scroll, hasMore && PLAY_FRIENDS.fade)}
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
    </div>
  )
}
