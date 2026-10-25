'use client'

import { useRouter } from 'next/navigation'

import { usePlayMoves } from '@/core/hooks/data/play/usePlayMoves'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_HUB_COPY } from '@/declarations/play'
import { useMenu } from '@/managers/front-end'
import type { MenuItem } from '@/managers/front-end'
import { PlayInviteRoles, PlayStatuses } from '@/utils/constants/play'
import type { PlayStatusName } from '@/utils/constants/play'

/**
 * Someone a menu opens on
 * @typedef {Object} PlayPerson
 * @property {string} accountId - Account
 * @property {boolean} isSeated - Holds a seat now
 * @property {boolean} hasSeat - Sat once, perhaps left
 * @property {boolean} isHost - Hosts the game
 */

export interface PlayPerson {
  accountId: string
  isSeated: boolean
  hasSeat: boolean
  isHost: boolean
}

export interface PlayPeopleTable {
  sessionId: string
  gameSlug: string
  status: PlayStatusName
  viewerId: string
  isViewerHost: boolean
}

/**
 * Right-click menu on someone at a table: moves, stats, profile, split by dividers
 * @param {PlayPeopleTable} table - Game and reader
 * @return {(person: PlayPerson) => MenuItem[]} - Menu of a person
 */

export const usePlayPeopleMenu = ({
  sessionId,
  gameSlug,
  status,
  viewerId,
  isViewerHost,
}: PlayPeopleTable) => {
  const moves = usePlayMoves()
  const router = useRouter()
  const { contextMenu } = useMenu()

  const itemsOf = (person: PlayPerson): MenuItem[] => {
    const { accountId } = person
    const canManage = isViewerHost && !person.isHost && accountId !== viewerId
    const canPlace = canManage && status === PlayStatuses.Lobby && person.hasSeat

    const manage: MenuItem[] = [
      ...(canPlace
        ? [
            {
              id: 'place',
              label: person.isSeated ? PLAY_HUB_COPY.seatToSpectator : PLAY_HUB_COPY.seatToPlayer,
              icon: person.isSeated ? ('playSpectators' as const) : ('playPawn' as const),
              onSelect: () =>
                void moves.place(
                  sessionId,
                  accountId,
                  person.isSeated ? PlayInviteRoles.Spectator : PlayInviteRoles.Player
                ),
            },
          ]
        : []),
      ...(canManage && person.isSeated
        ? [
            {
              id: 'kick',
              label: PLAY_HUB_COPY.seatKick,
              icon: 'playKick' as const,
              danger: true,
              onSelect: () => void moves.kick(sessionId, accountId),
            },
          ]
        : []),
    ]
    const stats: MenuItem[] = [
      {
        id: 'stats-global',
        label: PLAY_HUB_COPY.seatStatsGlobal,
        icon: 'playStats',
        onSelect: () => router.push(ROUTES.playPlayer(accountId)),
      },
      {
        id: 'stats-game',
        label: PLAY_HUB_COPY.seatStatsGame,
        icon: 'play',
        onSelect: () => router.push(ROUTES.playPlayerGame(accountId, gameSlug)),
      },
    ]
    const profile: MenuItem[] = [
      {
        id: 'profile',
        label: PLAY_HUB_COPY.seatProfile,
        icon: 'playProfile',
        onSelect: () => router.push(ROUTES.member(accountId)),
      },
    ]

    // A divider opens each group after the first
    return [manage, stats, profile]
      .filter((group) => group.length)
      .flatMap((group, index) =>
        group.map((item, at) => ({ ...item, separatorBefore: index > 0 && at === 0 }))
      )
  }

  return (person: PlayPerson, title: string) => contextMenu(itemsOf(person), title)
}
