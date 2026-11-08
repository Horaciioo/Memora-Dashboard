'use client'

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Avatar } from '@/components/elements/display/Avatar'
import {
  PLAY_RULES_DRAWERS,
  PLAY_SETUP_DRAWERS,
  PLAY_START_VOTES,
} from '@/composites/play/registry'
import type { PlayRulesValue } from '@/composites/play/registry'
import { PlayLobbyExtras } from '@/composites/play/hub/PlayLobbyExtras'
import { PlayLobbyLink } from '@/composites/play/hub/PlayLobbyLink'
import { PlayInviteSlot } from '@/composites/play/session/PlayInviteSlot'
import { useIsMobileShell } from '@/core/hooks/interaction/layout/useBreakpoint'
import { usePlayMoves } from '@/core/hooks/data/play/usePlayMoves'
import { usePlayPeopleMenu } from '@/core/hooks/interaction/state/usePlayPeopleMenu'
import { PLAY_INVITE_QUERY } from '@/declarations/navigation'
import { botSeatNote, fillPlayMessage, PLAY_HUB_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_HUB, PLAY_ROOM } from '@/declarations/ui/variants'
import type { PlayInviteCandidate } from '@/types/play'
import { PlayStatuses, PlayVisibilities } from '@/utils/constants/play'
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
  const isFresh = useSearchParams().get(PLAY_INVITE_QUERY) === '1'
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
  const mySeat = seats.find((seat) => seat.accountId === viewerId)
  const TickIcon = ICONS.playTick
  const Rules = PLAY_RULES_DRAWERS[game]
  const Setup = PLAY_SETUP_DRAWERS[game]
  const Vote = PLAY_START_VOTES[game]
  // The host edits, the others read
  const canEdit = isLobby && me.isHost && Boolean(Setup)
  const closeRules = () => setRulesOpen(false)

  return (
    <div className={PLAY_ROOM.middle} data-play-box>
      <section className={PLAY_ROOM.box}>
        <h2 className={PLAY_ROOM.playersTitle}>{PLAY_HUB_COPY.playersTitle}</h2>
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
          <span className={PLAY_ROOM.summaryCount}>
            {fillPlayMessage(PLAY_HUB_COPY.playerCount, { count: present.length, max: maxPlayers })}
          </span>
          {isLobby && (me.isSeated || me.isSpectator) && (Rules || canEdit) ? (
            <button
              type="button"
              className={cn(PLAY_ROOM.summaryLink, PLAY_ROOM.summaryEnd)}
              onClick={() => setRulesOpen(true)}
            >
              {PLAY_HUB_COPY.rulesLine}
            </button>
          ) : (
            <span />
          )}
        </div>

        <div className={PLAY_ROOM.table}>
          {seats.map((seat) => (
            <div
              key={seat.accountId}
              className={cn(PLAY_ROOM.tile, seat.hasLeft && PLAY_ROOM.tileOff)}
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
            >
              <Avatar name={seat.name} src={seat.avatarUrl} size={isMobile ? 'md' : 'lg'} />
              <p className={PLAY_ROOM.tileName} style={{ color: `var(--play-${seat.color})` }}>
                {seat.name}
              </p>
              {isLobby && !seat.hasLeft && seat.isReady && !seat.isHost && !seat.botKind ? (
                <p className={PLAY_ROOM.tileReady}>
                  <TickIcon className={PLAY_HUB.seatReadyIcon} aria-hidden="true" />
                  {PLAY_HUB_COPY.ready}
                </p>
              ) : (
                <p className={PLAY_ROOM.tileNote}>
                  {seat.hasLeft
                    ? PLAY_HUB_COPY.left
                    : seat.botKind
                      ? botSeatNote(seat.botKind)
                      : seat.isHost
                        ? PLAY_HUB_COPY.host
                        : isLobby
                          ? PLAY_HUB_COPY.seatWaiting
                          : PLAY_HUB_COPY.player}
                </p>
              )}
            </div>
          ))}
          {isLobby &&
            me.isSeated &&
            Array.from(
              { length: Math.min(maxPlayers, EMPTY_SEATS_MAX) - present.length },
              (_, index) => (
                <PlayInviteSlot
                  key={`free-${index}`}
                  sessionId={id}
                  candidates={candidates}
                  isOpenAtStart={index === 0 && isFresh}
                  extras={me.isHost ? <PlayLobbyExtras sessionId={id} game={game} /> : undefined}
                />
              )
            )}
        </div>

        {isLobby && me.isSeated && <PlayLobbyLink sessionId={id} joinCode={joinCode} />}

        <div className={PLAY_ROOM.actions}>
          {isLobby && me.isHost && (
            <Button
              variant="arcadeHero"
              disabled={present.length < minPlayers}
              isLoading={moves.isSaving}
              onClick={() => void (Vote ? moves.openVote(id) : moves.start(id))}
            >
              {waiting > 0 ? PLAY_HUB_COPY.startAnyway : PLAY_HUB_COPY.start}
            </Button>
          )}
          {isLobby && me.isSeated && !me.isHost && mySeat && (
            <Button
              variant={mySeat.isReady ? 'arcadeGhost' : 'arcadeHero'}
              onClick={() => void moves.ready(id, !mySeat.isReady)}
            >
              {mySeat.isReady ? PLAY_HUB_COPY.notReadyAgain : PLAY_HUB_COPY.imReady}
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
          {me.isSeated && !(isLobby && me.isHost) && (
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

        {isLobby && me.isHost && waiting > 0 && present.length >= minPlayers && (
          <p className={PLAY_ROOM.note}>
            {fillPlayMessage(PLAY_HUB_COPY.waitingFor, { count: waiting })}
          </p>
        )}
        {isLobby && present.length < minPlayers && (
          <p className={PLAY_ROOM.note}>
            {fillPlayMessage(PLAY_HUB_COPY.needPlayers, { min: minPlayers })}
          </p>
        )}
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
