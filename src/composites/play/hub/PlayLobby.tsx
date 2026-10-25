'use client'

import { Button } from '@/components/elements/actions/Button'
import { Avatar } from '@/components/elements/display/Avatar'
import { usePlayMoves } from '@/core/hooks/data/play/usePlayMoves'
import { fillPlayMessage, PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_HUB } from '@/declarations/ui/variants'
import { PlayStatuses } from '@/utils/constants/play'
import type { PlayStatusName } from '@/utils/constants/play'
import { cn } from '@/utils/classnames'

/**
 * Seat shown in the lobby
 * @typedef {Object} PlayLobbySeat
 */

export interface PlayLobbySeat {
  accountId: string
  name: string
  avatarUrl: string | null
  color: string
  score: number
  isHost: boolean
  hasLeft: boolean
}

export interface PlayLobbyProps {
  id: string
  status: PlayStatusName
  minPlayers: number
  seats: PlayLobbySeat[]
  me: { isSeated: boolean; isHost: boolean; isSpectator: boolean }
}

/**
 * Table of a game: seats and the gestures open to the reader
 * @param {PlayLobbyProps} props - Game
 * @return {JSX.Element}
 */

export const PlayLobby = ({ id, status, minPlayers, seats, me }: PlayLobbyProps) => {
  const moves = usePlayMoves()
  const present = seats.filter((seat) => !seat.hasLeft)
  const isLobby = status === PlayStatuses.Lobby

  return (
    <div className={PLAY_HUB.stack}>
      <div className={PLAY_HUB.seats}>
        {seats.map((seat) => (
          <div
            key={seat.accountId}
            className={cn(PLAY_HUB.seat, seat.hasLeft && PLAY_HUB.seatOff)}
            style={{ borderColor: `var(--play-${seat.color})` }}
          >
            <Avatar name={seat.name} src={seat.avatarUrl} />
            <div className={PLAY_HUB.seatText}>
              <p className={PLAY_HUB.seatName} style={{ color: `var(--play-${seat.color})` }}>
                {seat.name}
              </p>
              <p className={PLAY_HUB.seatNote}>
                {seat.hasLeft ? PLAY_HUB_COPY.left : seat.isHost ? PLAY_HUB_COPY.host : ' '}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className={PLAY_HUB.actions}>
        {isLobby && me.isHost && (
          <Button
            disabled={present.length < minPlayers}
            isLoading={moves.isSaving}
            onClick={() => void moves.start(id)}
          >
            {PLAY_HUB_COPY.start}
          </Button>
        )}
        {isLobby && me.isSpectator && (
          <Button isLoading={moves.isSaving} onClick={() => void moves.join(id)}>
            {PLAY_HUB_COPY.join}
          </Button>
        )}
        {me.isSeated && (
          <Button
            variant="secondary"
            isLoading={moves.isSaving}
            onClick={() => void moves.leave(id)}
          >
            {PLAY_HUB_COPY.leave}
          </Button>
        )}
        {isLobby && present.length < minPlayers && (
          <span className={PLAY_HUB.seatNote}>
            {fillPlayMessage(PLAY_HUB_COPY.needPlayers, { min: minPlayers })}
          </span>
        )}
        {!isLobby && me.isSpectator && (
          <span className={PLAY_HUB.seatNote}>{PLAY_HUB_COPY.spectating}</span>
        )}
      </div>
    </div>
  )
}
