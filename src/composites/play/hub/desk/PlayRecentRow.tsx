'use client'

import AppLink from '@/components/elements/navigation/AppLink'
import { usePlayOnline } from '@/composites/play/mobile/PlayOnline'
import { presenceSentence } from '@/composites/play/mobile/presenceSentence'
import { PlayAvatar } from '@/composites/play/skin/PlayAvatar'
import { readPlayPlace } from '@/core/lib/play/presenceState'
import { ROUTES } from '@/declarations/navigation'
import { fillPlayMessage, PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_DESK } from '@/declarations/ui/variants'
import type { PlayLobbyCard, PlayRecentPlayer } from '@/types/play'
import { formatSince } from '@/utils/format/time/dates'

/**
 * Player met lately: what they do now when online, else when the last game was
 * @param {Object} props - Row
 * @param {PlayRecentPlayer} props.player - Former opponent
 * @param {PlayLobbyCard[]} props.tables - Open and running tables
 * @return {JSX.Element}
 */

export const PlayRecentRow = ({
  player,
  tables,
}: {
  player: PlayRecentPlayer
  tables: PlayLobbyCard[]
}) => {
  const member = usePlayOnline().find((entry) => entry.accountId === player.id)
  const place = member && readPlayPlace(member.place)
  const table = place && tables.find((entry) => entry.id === place.sessionId)

  return (
    <AppLink href={ROUTES.playPlayer(player.id)} className={PLAY_DESK.friend}>
      <PlayAvatar accountId={player.id} name={player.name} src={player.image} size="md" />
      <span className={PLAY_DESK.friendText}>
        <span className={PLAY_DESK.friendName}>{player.name}</span>
        {member ? (
          <span className={PLAY_DESK.friendLive}>
            {presenceSentence(place?.state, table ? table.game : null)}
          </span>
        ) : (
          <span className={PLAY_DESK.friendNote}>
            {fillPlayMessage(PLAY_HUB_COPY.recentSince, { since: formatSince(player.playedAt) })}
          </span>
        )}
      </span>
    </AppLink>
  )
}
