'use client'

import { usePathname } from 'next/navigation'
import type { CSSProperties } from 'react'

import { PlayLiveBox } from '@/composites/play/friends/PlayLiveBox'
import { PlayColumnHandle } from '@/composites/play/friends/PlayColumnHandle'
import { PlayFriendsList } from '@/composites/play/friends/PlayFriendsList'
import { PlayMeBox } from '@/composites/play/friends/PlayMeBox'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_COLUMNS } from '@/declarations/play/columns'
import { usePlayPrefsStore } from '@/core/store/play/playPrefs'
import { PLAY_FRIENDS_COPY, isPlayGameHubPath } from '@/declarations/play'
import { PLAY_FRIENDS } from '@/declarations/ui/variants'
import type { PlayFriendsState, PlayLobbyCard, PlayPresence } from '@/types/play'

export interface PlayFriendsPanelProps {
  state: PlayFriendsState
  tables: PlayLobbyCard[]
  presence: PlayPresence | null
  isLocked: boolean
}

/**
 * Friends column: own box, games going on, friends
 * @param {PlayFriendsPanelProps} props - Friends and tables
 * @return {JSX.Element | null}
 */

export const PlayFriendsPanel = ({ state, tables, presence, isLocked }: PlayFriendsPanelProps) => {
  const path = usePathname()
  const width = usePlayPrefsStore((store) => store.friendsWidth)
  const setWidth = usePlayPrefsStore((store) => store.setFriendsWidth)
  // Games and their hubs fill the room
  if (path.startsWith(ROUTES.playSession('')) || isPlayGameHubPath(path)) return null

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
      <PlayFriendsList state={state} tables={tables} presence={presence} />
    </div>
  )
}
