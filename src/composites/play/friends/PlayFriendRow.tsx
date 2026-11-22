'use client'

import { useRouter } from 'next/navigation'

import { usePlayOnline } from '@/composites/play/mobile/PlayOnline'
import { presenceSentence } from '@/composites/play/mobile/presenceSentence'
import { PlayAvatar } from '@/composites/play/skin/PlayAvatar'
import { usePlayFriends } from '@/core/hooks/data/play/usePlayFriends'
import { usePlayInvites } from '@/core/hooks/data/play/usePlayInvites'
import { usePlayMoves } from '@/core/hooks/data/play/usePlayMoves'
import { useActionMenu } from '@/core/hooks/interaction/layout/overlay/useActionMenu'
import { readPlayPlace } from '@/core/lib/play/presenceState'
import { usePlayCardStore } from '@/core/store/play/playCard'
import { ROUTES } from '@/declarations/navigation'
import { fillPlayMessage, PLAY_FRIENDS_COPY } from '@/declarations/play'
import { PLAY_FRIENDS } from '@/declarations/ui/variants'
import type { PlayFriendView, PlayLobbyCard, PlayPresence } from '@/types/play'
import { cn } from '@/utils/classnames'
import { PlayInviteRoles, PlayStatuses } from '@/utils/constants/play'
import { formatSince } from '@/utils/format/time/dates'

export interface PlayFriendRowProps {
  friend: PlayFriendView
  tables: PlayLobbyCard[]
  // Game the viewer sits in
  presence: PlayPresence | null
}

/**
 * Friend: what they do now, and the key that brings you together
 * @param {PlayFriendRowProps} props - Friend and tables
 * @return {JSX.Element}
 */

export const PlayFriendRow = ({ friend, tables, presence }: PlayFriendRowProps) => {
  const router = useRouter()
  const moves = usePlayMoves()
  const invites = usePlayInvites()
  const friends = usePlayFriends()
  const member = usePlayOnline().find((entry) => entry.accountId === friend.id)
  const place = member ? readPlayPlace(member.place) : null
  const table = place ? tables.find((entry) => entry.id === place.sessionId) : undefined
  const isLobby = table?.status === PlayStatuses.Lobby
  const canInvite = !table && presence?.status === PlayStatuses.Lobby
  const menu = useActionMenu([
    {
      id: 'profile',
      label: PLAY_FRIENDS_COPY.profile,
      icon: 'playProfile',
      onSelect: () => usePlayCardStore.getState().open(friend.id),
    },
    {
      id: 'remove',
      label: PLAY_FRIENDS_COPY.remove,
      icon: 'remove',
      danger: true,
      separatorBefore: true,
      onSelect: () => void friends.remove(friend.id, PLAY_FRIENDS_COPY.removed),
    },
  ])

  const key = (label: string, onClick: () => void, isMain = false) => (
    <button
      type="button"
      className={cn(PLAY_FRIENDS.small, isMain ? PLAY_FRIENDS.smallMain : PLAY_FRIENDS.smallGhost)}
      disabled={moves.isSaving || invites.isSaving}
      onClick={onClick}
    >
      {label}
    </button>
  )

  return (
    <div
      className={cn(PLAY_FRIENDS.row, !member && PLAY_FRIENDS.rowOff)}
      onContextMenu={menu.onContextMenu}
    >
      <button type="button" data-play-card={friend.id} className={PLAY_FRIENDS.rowWho}>
        <PlayAvatar accountId={friend.id} name={friend.name} src={friend.avatarUrl} size="md" />
        <span className={PLAY_FRIENDS.rowText}>
          <span className={PLAY_FRIENDS.rowName}>{friend.name}</span>
          {member ? (
            <span className={PLAY_FRIENDS.rowLive}>
              {presenceSentence(place?.state, table ? table.game : null)}
            </span>
          ) : (
            <span className={PLAY_FRIENDS.rowNote}>
              {friend.lastSeenAt
                ? fillPlayMessage(PLAY_FRIENDS_COPY.seen, { since: formatSince(friend.lastSeenAt) })
                : PLAY_FRIENDS_COPY.never}
            </span>
          )}
        </span>
      </button>
      <div className={PLAY_FRIENDS.rowActions}>
        {table && isLobby && key(PLAY_FRIENDS_COPY.join, () => void moves.join(table.id), true)}
        {table &&
          !isLobby &&
          key(PLAY_FRIENDS_COPY.watch, () => router.push(ROUTES.playSession(table.id)))}
        {member &&
          canInvite &&
          presence &&
          key(
            PLAY_FRIENDS_COPY.inviteHere,
            () =>
              void invites.invite(presence.sessionId, PlayInviteRoles.Player, {
                accountIds: [friend.id],
              })
          )}
      </div>
    </div>
  )
}
