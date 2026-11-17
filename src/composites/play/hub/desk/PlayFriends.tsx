'use client'

import { useState } from 'react'

import { PlayRecentRow } from '@/composites/play/hub/desk/PlayRecentRow'
import { PlayOnlineList } from '@/composites/play/mobile/PlayOnlineList'
import { PLAY_HUB_COPY, PLAY_MOBILE_COPY } from '@/declarations/play'
import { PLAY_DESK } from '@/declarations/ui/variants'
import type { PlayLobbyCard, PlayRecentPlayer } from '@/types/play'
import { cn } from '@/utils/classnames'

type FriendsTab = 'recent' | 'online'

// Tabs of the column, one shown at a time
const TABS: { key: FriendsTab; label: string }[] = [
  { key: 'recent', label: PLAY_HUB_COPY.tabRecent },
  { key: 'online', label: PLAY_MOBILE_COPY.tabOnline },
]

export interface PlayFriendsProps {
  recents: PlayRecentPlayer[]
  tables: PlayLobbyCard[]
}

/**
 * Right column of the desktop hub: players met lately, or players online
 * @param {PlayFriendsProps} props - Former opponents and open tables
 * @return {JSX.Element}
 */

export const PlayFriends = ({ recents, tables }: PlayFriendsProps) => {
  const [tab, setTab] = useState<FriendsTab>('recent')

  return (
    <aside className={PLAY_DESK.side} aria-label={PLAY_HUB_COPY.friendsTitle}>
      <div role="tablist" className={PLAY_DESK.tabs}>
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            className={cn(PLAY_DESK.tab, tab === key && PLAY_DESK.tabOn)}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className={PLAY_DESK.scroll}>
        {tab === 'online' && <PlayOnlineList tables={tables} />}
        {tab === 'recent' && recents.length === 0 && (
          <p className={PLAY_DESK.empty}>{PLAY_HUB_COPY.recentEmpty}</p>
        )}
        {tab === 'recent' &&
          recents.map((player) => (
            <PlayRecentRow key={player.id} player={player} tables={tables} />
          ))}
      </div>
    </aside>
  )
}
