'use client'

import { useState } from 'react'
import type { CSSProperties } from 'react'

import { Button } from '@/components/elements/actions/Button'
import {
  PLAY_RULES_DRAWERS,
  PLAY_SETUP_DRAWERS,
  PLAY_START_VOTES,
} from '@/composites/play/registry'
import type { PlayRulesValue } from '@/composites/play/registry'
import { PlayLobbyExtras } from '@/composites/play/hub/PlayLobbyExtras'
import { PlayLobbyLink } from '@/composites/play/hub/lobby/PlayLobbyLink'
import { PlaySeatCard } from '@/composites/play/hub/lobby/PlaySeatCard'
import { PlayLoadingScreen } from '@/composites/play/loading/PlayLoadingScreen'
import { PlayInviteSlot } from '@/composites/play/session/PlayInviteSlot'
import { useIsMobileShell } from '@/core/hooks/interaction/layout/measure/useBreakpoint'
import { usePlayMoves } from '@/core/hooks/data/play/usePlayMoves'
import { usePlayStarting } from '@/core/hooks/data/play/usePlayStarting'
import { usePlayPeopleMenu } from '@/core/hooks/interaction/state/play/usePlayPeopleMenu'
import { fillPlayMessage, PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_ROOM } from '@/declarations/ui/variants'
import type { PlayInviteCandidate } from '@/types/play'
import { PLAY_OPEN_STATUSES, PlayStatuses, PlayVisibilities } from '@/utils/constants/play'
import type {
  PlayBotKindName,
  PlayGameName,
  PlayStatusName,
  PlayVisibilityName,
} from '@/utils/constants/play'
import { cn } from '@/utils/classnames'

// Empty seats drawn at most
const EMPTY_SEATS_MAX = 8

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
  botKind: PlayBotKindName | null
  isReady: boolean
  hasLeft: boolean
}

export interface PlayLobbyProps {
  id: string
  gameSlug: string
  status: PlayStatusName
  minPlayers: number
  maxPlayers: number
  seats: PlayLobbySeat[]
  candidates: PlayInviteCandidate[]
  viewerId: string
  me: { isSeated: boolean; isHost: boolean; isSpectator: boolean }
  game: PlayGameName
  rules: PlayRulesValue
  // Server ms at the page render, clock of the vote
  serverTime: number
  visibility: PlayVisibilityName
  joinCode: string | null
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
  serverTime,
  visibility,
  joinCode,
}: PlayLobbyProps) => {
  const moves = usePlayMoves()
  // Fresh table lands on the picker
  const isPrivate = visibility === PlayVisibilities.Private
  const [isRulesOpen, setRulesOpen] = useState(false)
  const isMobile = useIsMobileShell()
  const menuOf = usePlayPeopleMenu({
    sessionId: id,
    gameSlug,
    status,
    viewerId,
    isViewerHost: me.isHost,
  })
  const present = seats.filter((seat) => !seat.hasLeft)
  const isLobby = status === PlayStatuses.Lobby
  const waiting = present.filter((seat) => !seat.isReady).length
  const canStart = present.length >= minPlayers && waiting === 0
  const freeSeats = Math.max(0, Math.min(maxPlayers, EMPTY_SEATS_MAX) - present.length)
  const columns = Math.min(4, Math.max(2, seats.length + (me.isSeated ? freeSeats : 0)))
  const subtitle =
    present.length < minPlayers
      ? fillPlayMessage(PLAY_HUB_COPY.needPlayers, { min: minPlayers })
      : waiting > 0
        ? me.isHost
          ? fillPlayMessage(PLAY_HUB_COPY.waitingFor, { count: waiting })
          : PLAY_HUB_COPY.lobbyNeedReady
        : PLAY_HUB_COPY.lobbyAllReady
  const Rules = PLAY_RULES_DRAWERS[game]
  const Setup = PLAY_SETUP_DRAWERS[game]
  const Vote = PLAY_START_VOTES[game]
  // The host edits, the others read
  const canEdit = isLobby && me.isHost && Boolean(Setup)
  const closeRules = () => setRulesOpen(false)
  // Loading screen from the start click, or the host's signal, until the game replaces the lobby
  const isStarting = usePlayStarting(id)
  const [isLaunching, setLaunching] = useState(false)
  const launch = async () => {
    setLaunching(true)
    setLaunching(await moves.start(id))
  }

  return (
    <div className={PLAY_ROOM.middle} data-play-box>
      {(isLaunching || isStarting) && isLobby && <PlayLoadingScreen isCover />}
      {isLobby && (
        <header className={PLAY_ROOM.lobbyHead}>
          <p className={PLAY_ROOM.eyebrow}>{PLAY_HUB_COPY.lobbyEyebrow}</p>
          <h1 className={PLAY_ROOM.lobbyTitle}>{PLAY_HUB_COPY.lobbyWaiting}</h1>
          <p className={PLAY_ROOM.lobbySub} role="status">
            {subtitle}
          </p>
        </header>
      )}
      {isLobby && isPrivate && me.isSeated && <PlayLobbyLink sessionId={id} joinCode={joinCode} />}
      <section className={PLAY_ROOM.box}>
        <div className={PLAY_ROOM.summary}>
          <button
            type="button"
            className={PLAY_ROOM.summaryLink}
            disabled={!me.isHost || !isLobby}
            aria-label={isPrivate ? PLAY_HUB_COPY.makePublic : PLAY_HUB_COPY.makePrivate}
            onClick={() => void moves.visibility(id, !isPrivate)}
          >
            {isPrivate ? PLAY_HUB_COPY.privateOption : PLAY_HUB_COPY.publicOption}
          </button>
          {isLobby && (me.isSeated || me.isSpectator) && (Rules || canEdit) && (
            <button
              type="button"
              className={cn(PLAY_ROOM.summaryLink, PLAY_ROOM.summaryEnd)}
              onClick={() => setRulesOpen(true)}
            >
              {PLAY_HUB_COPY.rulesLine}
            </button>
          )}
        </div>

        <div className={PLAY_ROOM.table} style={{ '--cols': columns } as CSSProperties}>
          {seats.map((seat, index) => (
            <PlaySeatCard
              key={seat.accountId}
              seat={seat}
              index={index}
              isLobby={isLobby}
              isMine={seat.accountId === viewerId}
              isMobile={isMobile}
              canKick={
                isLobby && me.isHost && !seat.isHost && !seat.hasLeft && seat.accountId !== viewerId
              }
              isSaving={moves.isSaving}
              onKick={() => void moves.kick(id, seat.accountId)}
              onToggleReady={
                isLobby && me.isSeated && !me.isHost && seat.accountId === viewerId
                  ? () => void moves.ready(id, !seat.isReady)
                  : null
              }
              onContextMenu={menuOf(
                {
                  accountId: seat.accountId,
                  isSeated: !seat.hasLeft,
                  hasSeat: true,
                  isHost: seat.isHost,
                  isBot: Boolean(seat.botKind),
                },
                seat.name
              )}
            />
          ))}
          {isLobby &&
            me.isSeated &&
            Array.from({ length: freeSeats }, (_, index) => (
              <PlayInviteSlot
                key={`free-${index}`}
                sessionId={id}
                candidates={candidates}
                extras={me.isHost ? <PlayLobbyExtras sessionId={id} game={game} /> : undefined}
              />
            ))}
        </div>

        {isLobby && !isPrivate && me.isSeated && (
          <PlayLobbyLink sessionId={id} joinCode={joinCode} />
        )}

        <div className={PLAY_ROOM.actions}>
          {isLobby && me.isHost && (
            <Button
              variant="arcadeHero"
              disabled={!canStart}
              isLoading={moves.isSaving}
              onClick={() => void (Vote ? moves.openVote(id) : launch())}
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
          {isLobby && me.isHost && (
            <button
              type="button"
              className={PLAY_ROOM.exit}
              disabled={moves.isSaving}
              onClick={() => void moves.cancel(id, gameSlug)}
            >
              {PLAY_HUB_COPY.cancel}
            </button>
          )}
          {me.isSeated && PLAY_OPEN_STATUSES.includes(status) && !(isLobby && me.isHost) && (
            <button
              type="button"
              className={PLAY_ROOM.exit}
              disabled={moves.isSaving}
              onClick={() => void moves.leave(id)}
            >
              {isLobby ? PLAY_HUB_COPY.leaveLobby : PLAY_HUB_COPY.leave}
            </button>
          )}
        </div>

        {!isLobby && me.isSpectator && <p className={PLAY_ROOM.note}>{PLAY_HUB_COPY.spectating}</p>}
      </section>

      {isLobby && Vote && (
        <Vote
          sessionId={id}
          settings={rules.settings}
          serverTime={serverTime}
          viewerId={viewerId}
          hostId={seats.find((seat) => seat.isHost)?.accountId ?? ''}
          faces={Object.fromEntries(
            seats.map(({ accountId, name, avatarUrl }) => [accountId, { name, avatarUrl }])
          )}
        />
      )}

      {canEdit && Setup && isRulesOpen ? (
        <Setup
          open
          isSaving={moves.isSaving}
          current={rules}
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
