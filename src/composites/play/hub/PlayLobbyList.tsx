'use client'

import { PlayCurrentGame } from '@/composites/play/brand/PlayCurrentGame'
import { Button } from '@/components/elements/actions/Button'
import { Avatar } from '@/components/elements/display/Avatar'
import { PlayGameLogo } from '@/composites/play/brand/PlayGameLogo'
import { usePlayMoves } from '@/core/hooks/data/play/usePlayMoves'
import { ROUTES } from '@/declarations/navigation'
import { fillPlayMessage, PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_HUB } from '@/declarations/ui/variants'
import type { PlayPresence } from '@/types/play'
import type { PlayGameName } from '@/utils/constants/play'
import { useRouter } from 'next/navigation'

/**
 * Lobby card read by the hub
 * @typedef {Object} PlayLobbyCard
 */

export interface PlayLobbyCard {
  id: string
  game: PlayGameName
  hostName: string | null
  hostAvatarUrl: string | null
  players: number
  maxPlayers: number
  gamesCount: number | null
}

export interface PlayLobbyListProps {
  lobbies: PlayLobbyCard[]
  // Running games are watched, not joined
  isRunning?: boolean
  isLocked: boolean
  empty: string
  // Game the reader sits in, listed first like in the feed
  presence?: PlayPresence | null
}

/**
 * Open or running tables
 * @param {PlayLobbyListProps} props - Tables
 * @return {JSX.Element}
 */

export const PlayLobbyList = ({
  lobbies,
  isRunning,
  isLocked,
  empty,
  presence,
}: PlayLobbyListProps) => {
  const router = useRouter()
  const moves = usePlayMoves()

  const others = lobbies.filter((lobby) => lobby.id !== presence?.sessionId)
  const resume = presence && (
    <div className={PLAY_HUB.row}>
      <PlayGameLogo game={presence.game} className={PLAY_HUB.rowLogo} />
      <div className={PLAY_HUB.rowText}>
        <span className={PLAY_HUB.rowTitle}>
          <PlayCurrentGame game={presence.game} />
        </span>
      </div>
      <div className={PLAY_HUB.rowActions}>
        <Button
          variant="arcadeGhostSmall"
          isLoading={moves.isSaving}
          onClick={() => void moves.leave(presence.sessionId)}
        >
          {PLAY_HUB_COPY.leave}
        </Button>
        <Button
          variant="arcadeSmall"
          onClick={() => router.push(ROUTES.playSession(presence.sessionId))}
        >
          {PLAY_HUB_COPY.resume}
        </Button>
      </div>
    </div>
  )

  if (!others.length && !resume) return <p className={PLAY_HUB.empty}>{empty}</p>

  return (
    <div className={PLAY_HUB.list}>
      {resume}
      {others.map((lobby) => (
        <div key={lobby.id} className={PLAY_HUB.row}>
          <Avatar name={lobby.hostName ?? ''} src={lobby.hostAvatarUrl} />
          <div className={PLAY_HUB.rowText}>
            <span className={PLAY_HUB.rowTitle}>
              {fillPlayMessage(PLAY_HUB_COPY.hostedBy, { host: lobby.hostName ?? '' })}
            </span>
            <span className={PLAY_HUB.rowNote}>
              {fillPlayMessage(PLAY_HUB_COPY.players, {
                players: lobby.players,
                max: lobby.maxPlayers,
              })}
              {lobby.gamesCount &&
                ` - ${fillPlayMessage(PLAY_HUB_COPY.tournament, { games: lobby.gamesCount })}`}
            </span>
          </div>
          {isRunning ? (
            <Button variant="arcadeGhost" onClick={() => router.push(ROUTES.playSession(lobby.id))}>
              {PLAY_HUB_COPY.watch}
            </Button>
          ) : (
            <Button
              variant="arcade"
              disabled={isLocked || lobby.players >= lobby.maxPlayers}
              isLoading={moves.isSaving}
              onClick={() => void moves.join(lobby.id)}
            >
              {PLAY_HUB_COPY.join}
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}
