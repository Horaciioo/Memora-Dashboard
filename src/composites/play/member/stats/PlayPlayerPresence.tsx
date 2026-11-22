'use client'

import type { ReactNode } from 'react'

import AppLink from '@/components/elements/navigation/AppLink'
import { usePlayOnline } from '@/composites/play/mobile/PlayOnline'
import { presenceSentence } from '@/composites/play/mobile/presenceSentence'
import { PlayPlaceStates, readPlayPlace } from '@/core/lib/play/presenceState'
import { ROUTES } from '@/declarations/navigation'
import { fillPlayMessage, PLAY_MOBILE_COPY, PLAY_PROFILE_COPY } from '@/declarations/play'
import { PLAY_PROFILE, PLAY_PROFILE_HERO } from '@/declarations/ui/variants'
import type { PlayPresence } from '@/types/play'
import { cn } from '@/utils/classnames'
import { PlayStatuses } from '@/utils/constants/play'
import { formatSince } from '@/utils/format/time/dates'

interface PlaceProps {
  playerId: string
  // Table the player sits at, read on the server
  seat: PlayPresence | null
}

/**
 * Where a player is: a seat is the surest sign, the room tells the rest
 * @param {PlaceProps} props - Player and seat
 * @return {Object}
 */

const usePlayerPlace = ({ playerId, seat }: PlaceProps) => {
  const member = usePlayOnline().find((entry) => entry.accountId === playerId)
  const place = readPlayPlace(member?.place ?? null)

  return {
    isOnline: Boolean(member) || Boolean(seat),
    state: seat ? PlayPlaceStates.Playing : place?.state,
    sessionId: seat?.sessionId ?? place?.sessionId,
    isLobby: seat?.status === PlayStatuses.Lobby,
  }
}

/**
 * Presence line of the hero: online and where, or last seen
 * @param {PlaceProps & {lastSeenAt: string | null}} props - Player, seat, last visit
 * @return {JSX.Element}
 */

export const PlayPresenceBadge = ({
  lastSeenAt,
  ...place
}: PlaceProps & { lastSeenAt: string | null }) => {
  const { isOnline, state } = usePlayerPlace(place)

  return (
    <p className={cn(PLAY_PROFILE_HERO.presence, isOnline && PLAY_PROFILE_HERO.presenceOn)}>
      {isOnline
        ? presenceSentence(state, place.seat?.game ?? null)
        : lastSeenAt
          ? fillPlayMessage(PLAY_PROFILE_COPY.seen, { since: formatSince(lastSeenAt) })
          : PLAY_PROFILE_COPY.offline}
    </p>
  )
}

/**
 * Gestures of the hero: the main key, watch or join, then the tie keys
 * @param {PlaceProps} props - Player, seat, viewer lobby, tie keys
 * @return {JSX.Element}
 */

export const PlayPresenceActions = ({
  viewerLobbyId,
  children,
  ...place
}: PlaceProps & {
  // Lobby the viewer sits in, where an invitation can go
  viewerLobbyId: string | null
  children?: ReactNode
}) => {
  const { sessionId, isLobby } = usePlayerPlace(place)

  return (
    <div className={PLAY_PROFILE_HERO.actions}>
      <div className={PLAY_PROFILE_HERO.row}>
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
      <div className={PLAY_PROFILE_HERO.row}>{children}</div>
    </div>
  )
}
