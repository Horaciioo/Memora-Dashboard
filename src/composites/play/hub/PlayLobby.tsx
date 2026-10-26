'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Avatar } from '@/components/elements/display/Avatar'
import { PLAY_RULES_DRAWERS, PLAY_SETUP_DRAWERS } from '@/composites/play/registry'
import type { PlayRulesValue } from '@/composites/play/registry'
import { PlayInviteSlot } from '@/composites/play/session/PlayInviteSlot'
import { usePlayMoves } from '@/core/hooks/data/play/usePlayMoves'
import { usePlayPeopleMenu } from '@/core/hooks/interaction/state/usePlayPeopleMenu'
import { fillPlayMessage, PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_HUB, PLAY_ROOM } from '@/declarations/ui/variants'
import type { PlayCandidate } from '@/types/play'
import { PlayStatuses } from '@/utils/constants/play'
import type { PlayGameName, PlayStatusName } from '@/utils/constants/play'
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
  gameSlug: string
  status: PlayStatusName
  minPlayers: number
  maxPlayers: number
  seats: PlayLobbySeat[]
  candidates: PlayCandidate[]
  viewerId: string
  me: { isSeated: boolean; isHost: boolean; isSpectator: boolean }
  game: PlayGameName
  rules: PlayRulesValue
}

/**
 * Players of a game under their title, then the gestures open to the reader
 * @param {PlayLobbyProps} props - Game
 * @return {JSX.Element}
 */

export const PlayLobby = ({
  id,
  gameSlug,
  status,
  minPlayers,
  maxPlayers,
  seats,
  candidates,
  viewerId,
  me,
  game,
  rules,
}: PlayLobbyProps) => {
  const moves = usePlayMoves()
  const [isRulesOpen, setRulesOpen] = useState(false)
  const menuOf = usePlayPeopleMenu({
    sessionId: id,
    gameSlug,
    status,
    viewerId,
    isViewerHost: me.isHost,
  })
  const present = seats.filter((seat) => !seat.hasLeft)
  const isLobby = status === PlayStatuses.Lobby
  const Rules = PLAY_RULES_DRAWERS[game]
  const Setup = PLAY_SETUP_DRAWERS[game]
  // The host edits, the others read
  const canEdit = isLobby && me.isHost && Boolean(Setup)
  const closeRules = () => setRulesOpen(false)

  return (
    <div className={PLAY_ROOM.middle} data-play-box>
      <section className={PLAY_ROOM.box}>
        <h2 className={PLAY_ROOM.playersTitle}>{PLAY_HUB_COPY.playersTitle}</h2>
        <div className={PLAY_ROOM.seatsBox}>
          <div className={PLAY_HUB.seats}>
            {seats.map((seat) => (
              <div
                key={seat.accountId}
                className={cn(PLAY_HUB.seat, seat.hasLeft && PLAY_HUB.seatOff)}
                onContextMenu={menuOf(
                  {
                    accountId: seat.accountId,
                    isSeated: !seat.hasLeft,
                    hasSeat: true,
                    isHost: seat.isHost,
                  },
                  seat.name
                )}
              >
                <Avatar name={seat.name} src={seat.avatarUrl} />
                <div className={PLAY_HUB.seatText}>
                  <p className={PLAY_HUB.seatName} style={{ color: `var(--play-${seat.color})` }}>
                    {seat.name}
                  </p>
                  <p className={PLAY_HUB.seatNote}>
                    {seat.hasLeft ? PLAY_HUB_COPY.left : seat.isHost ? PLAY_HUB_COPY.host : ' '}
                  </p>
                </div>
              </div>
            ))}
            {isLobby && me.isSeated && present.length < maxPlayers && (
              <PlayInviteSlot sessionId={id} candidates={candidates} />
            )}
          </div>
        </div>

        <div className={PLAY_ROOM.actions}>
          {isLobby && me.isHost && (
            <Button
              variant="arcadeHero"
              disabled={present.length < minPlayers}
              isLoading={moves.isSaving}
              onClick={() => void moves.start(id)}
            >
              {PLAY_HUB_COPY.start}
            </Button>
          )}
          {isLobby && me.isSpectator && (
            <Button
              variant="arcadeHero"
              isLoading={moves.isSaving}
              onClick={() => void moves.join(id)}
            >
              {PLAY_HUB_COPY.join}
            </Button>
          )}
          {isLobby && (me.isHost || me.isSpectator) && <div className={PLAY_ROOM.divider} />}
          <div className={PLAY_ROOM.secondary}>
            {isLobby && (Rules || canEdit) && (
              <Button variant="arcadeGhost" onClick={() => setRulesOpen(true)}>
                {me.isHost ? PLAY_HUB_COPY.rulesHost : PLAY_HUB_COPY.rules}
              </Button>
            )}
            {isLobby && me.isHost && (
              <Button
                variant="arcadeDanger"
                isLoading={moves.isSaving}
                onClick={() => void moves.cancel(id, gameSlug)}
              >
                {PLAY_HUB_COPY.cancel}
              </Button>
            )}
            {me.isSeated && !(isLobby && me.isHost) && (
              <Button
                variant={isLobby ? 'arcadeDanger' : 'arcadeGhost'}
                isLoading={moves.isSaving}
                onClick={() => void moves.leave(id)}
              >
                {isLobby ? PLAY_HUB_COPY.leaveLobby : PLAY_HUB_COPY.leave}
              </Button>
            )}
          </div>
        </div>

        {isLobby && present.length < minPlayers && (
          <p className={PLAY_ROOM.note}>
            {fillPlayMessage(PLAY_HUB_COPY.needPlayers, { min: minPlayers })}
          </p>
        )}
        {!isLobby && me.isSpectator && <p className={PLAY_ROOM.note}>{PLAY_HUB_COPY.spectating}</p>}
      </section>

      {canEdit && Setup && isRulesOpen ? (
        <Setup
          open
          isSaving={moves.isSaving}
          current={rules}
          player={seats.find((seat) => seat.accountId === viewerId)}
          onClose={closeRules}
          onSubmit={(setup) =>
            void moves.rules(id, setup).then((isSaved) => isSaved && closeRules())
          }
        />
      ) : (
        Rules && <Rules open={isRulesOpen} onClose={closeRules} {...rules} />
      )}
    </div>
  )
}
