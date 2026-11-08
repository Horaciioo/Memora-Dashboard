'use client'

import { useState } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import AppLink from '@/components/elements/navigation/AppLink'
import { usePlayOnline } from '@/composites/play/mobile/PlayOnline'
import { presenceSentence } from '@/composites/play/mobile/presenceSentence'
import { readPlayPlace } from '@/core/lib/play/presenceState'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_MOBILE_COPY } from '@/declarations/play'
import { PLAY_ONLINE } from '@/declarations/ui/variants'
import type { PlayLobbyCard } from '@/types/play'
import { cn } from '@/utils/classnames'
import { PlayStatuses } from '@/utils/constants/play'

/**
 * Players in Play, tap one for join, profile or a private game
 * @param {Object} props - Tables
 * @param {PlayLobbyCard[]} props.tables - Open and running tables
 * @return {JSX.Element}
 */

export const PlayOnlineList = ({ tables }: { tables: PlayLobbyCard[] }) => {
  const members = usePlayOnline()
  const [openId, setOpenId] = useState<string | null>(null)

  if (members.length === 0)
    return <p className={PLAY_ONLINE.empty}>{PLAY_MOBILE_COPY.onlineEmpty}</p>

  return (
    <ul className={PLAY_ONLINE.list}>
      {members.map((member) => {
        const place = readPlayPlace(member.place)
        const table = place && tables.find((entry) => entry.id === place.sessionId)
        const isOpen = openId === member.accountId

        return (
          <li key={member.accountId} className={cn(PLAY_ONLINE.row, isOpen && PLAY_ONLINE.rowOpen)}>
            <button
              type="button"
              aria-expanded={isOpen}
              className={PLAY_ONLINE.head}
              onClick={() => setOpenId(isOpen ? null : member.accountId)}
            >
              <Avatar name={member.name} src={member.image} size="md" />
              <span className={PLAY_ONLINE.who}>
                <span className={PLAY_ONLINE.name}>{member.name}</span>
                <span className={place ? PLAY_ONLINE.playing : PLAY_ONLINE.idle}>
                  {presenceSentence(place?.state, table ? table.game : null)}
                </span>
              </span>
            </button>
            {isOpen && (
              <div className={PLAY_ONLINE.actions}>
                {place && (
                  <AppLink
                    href={ROUTES.playSession(place.sessionId)}
                    className={PLAY_ONLINE.primary}
                  >
                    {table?.status === PlayStatuses.Lobby
                      ? PLAY_MOBILE_COPY.join
                      : PLAY_MOBILE_COPY.watch}
                  </AppLink>
                )}
                <AppLink href={ROUTES.playPlayer(member.accountId)} className={PLAY_ONLINE.action}>
                  {PLAY_MOBILE_COPY.seeProfile}
                </AppLink>
                <AppLink href={ROUTES.play} className={PLAY_ONLINE.action}>
                  {PLAY_MOBILE_COPY.privateGame}
                </AppLink>
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
