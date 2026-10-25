'use client'

import { Button } from '@/components/elements/actions/Button'
import { Avatar } from '@/components/elements/display/Avatar'
import { usePlayMoves } from '@/core/hooks/data/play/usePlayMoves'
import { ROUTES } from '@/declarations/navigation'
import { fillPlayMessage, PLAY_GAMES, PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_HUB } from '@/declarations/ui/variants'
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
}

/**
 * Open or running tables
 * @param {PlayLobbyListProps} props - Tables
 * @return {JSX.Element}
 */

export const PlayLobbyList = ({ lobbies, isRunning, isLocked, empty }: PlayLobbyListProps) => {
  const router = useRouter()
  const moves = usePlayMoves()

  if (!lobbies.length) return <p className={PLAY_HUB.empty}>{empty}</p>

  return (
    <div className={PLAY_HUB.list}>
      {lobbies.map((lobby) => (
        <div key={lobby.id} className={PLAY_HUB.row}>
          <Avatar name={lobby.hostName ?? ''} src={lobby.hostAvatarUrl} />
          <div className={PLAY_HUB.rowText}>
            <span className={PLAY_HUB.rowTitle}>
              {PLAY_GAMES.label(lobby.game)}
              {' · '}
              {fillPlayMessage(PLAY_HUB_COPY.hostedBy, { host: lobby.hostName ?? '' })}
            </span>
            <span className={PLAY_HUB.rowNote}>
              {fillPlayMessage(PLAY_HUB_COPY.players, {
                players: lobby.players,
                max: lobby.maxPlayers,
              })}
              {lobby.gamesCount &&
                ` · ${fillPlayMessage(PLAY_HUB_COPY.tournament, { games: lobby.gamesCount })}`}
            </span>
          </div>
          {isRunning ? (
            <Button variant="secondary" onClick={() => router.push(ROUTES.playSession(lobby.id))}>
              {PLAY_HUB_COPY.watch}
            </Button>
          ) : (
            <Button
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
