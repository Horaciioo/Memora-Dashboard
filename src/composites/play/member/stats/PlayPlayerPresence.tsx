'use client'

import AppLink from '@/components/elements/navigation/AppLink'
import { usePlayOnline } from '@/composites/play/mobile/PlayOnline'
import { presenceSentence } from '@/composites/play/mobile/presenceSentence'
import { PlayPlaceStates, readPlayPlace } from '@/core/lib/play/presenceState'
import { ROUTES } from '@/declarations/navigation'
import { fillPlayMessage, PLAY_MOBILE_COPY, PLAY_PROFILE_COPY } from '@/declarations/play'
import { PLAY_PROFILE } from '@/declarations/ui/variants'
import type { PlayPresence } from '@/types/play'
import { cn } from '@/utils/classnames'
import { PlayStatuses } from '@/utils/constants/play'
import { formatSince } from '@/utils/format/dates'

export interface PlayPlayerPresenceProps {
  playerId: string
  // Table the player sits at, read on the server
  seat: PlayPresence | null
  lastSeenAt: string | null
  // Lobby the viewer sits in, where an invitation can go
  viewerLobbyId: string | null
}

/**
 * Where a player is right now, with the gestures that follow: watch, join, invite
 * @param {PlayPlayerPresenceProps} props - Player, seat and viewer lobby
 * @return {JSX.Element}
 */

export const PlayPlayerPresence = ({
  playerId,
  seat,
  lastSeenAt,
  viewerLobbyId,
}: PlayPlayerPresenceProps) => {
  const member = usePlayOnline().find((entry) => entry.accountId === playerId)
  const place = readPlayPlace(member?.place ?? null)
  // A seat is the surest sign, the room tells the rest
  const state = seat ? PlayPlaceStates.Playing : place?.state
  const sessionId = seat?.sessionId ?? place?.sessionId
  const isOnline = Boolean(member) || Boolean(seat)
  const isLobby = seat?.status === PlayStatuses.Lobby

  return (
    <>
      <p className={cn(PLAY_PROFILE.presence, isOnline && PLAY_PROFILE.presenceOn)}>
        <span className={cn(PLAY_PROFILE.dot, isOnline && PLAY_PROFILE.dotOn)} aria-hidden="true" />
        {isOnline
          ? presenceSentence(state, seat?.game ?? null)
          : lastSeenAt
            ? fillPlayMessage(PLAY_PROFILE_COPY.seen, { since: formatSince(lastSeenAt) })
            : PLAY_PROFILE_COPY.offline}
      </p>
      <div className={PLAY_PROFILE.actions}>
        {sessionId && (
          <AppLink href={ROUTES.playSession(sessionId)} className={PLAY_PROFILE.keyGhost}>
            {isLobby ? PLAY_MOBILE_COPY.join : PLAY_MOBILE_COPY.watch}
          </AppLink>
        )}
        <AppLink
          href={viewerLobbyId ? ROUTES.playSessionInvite(viewerLobbyId) : ROUTES.play}
          className={PLAY_PROFILE.key}
        >
          {viewerLobbyId ? PLAY_PROFILE_COPY.inviteHere : PLAY_PROFILE_COPY.invite}
        </AppLink>
      </div>
    </>
  )
}
