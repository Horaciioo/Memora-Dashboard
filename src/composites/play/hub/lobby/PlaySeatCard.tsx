'use client'

import type { MouseEventHandler } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Avatar } from '@/components/elements/display/Avatar'
import { botSeatNote, PLAY_HUB_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_ROOM } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import type { PlayLobbySeat } from '@/composites/play/hub/lobby/PlayLobby'

export interface PlaySeatCardProps {
  seat: PlayLobbySeat
  // Position, staggers the entrance
  index: number
  isLobby: boolean
  isMine: boolean
  isMobile: boolean
  // The host may send this player away
  canKick: boolean
  // Own ready key lives on the own card
  onToggleReady: (() => void) | null
  isSaving: boolean
  onKick: () => void
  onContextMenu: MouseEventHandler<HTMLDivElement>
}

/**
 * One player card: avatar, name, then ready or not yet
 * @param {PlaySeatCardProps} props - Seat and gestures
 * @return {JSX.Element}
 */

export const PlaySeatCard = ({
  seat,
  index,
  isLobby,
  isMine,
  isMobile,
  canKick,
  onToggleReady,
  isSaving,
  onKick,
  onContextMenu,
}: PlaySeatCardProps) => {
  const TickIcon = ICONS.playTick
  const CrownIcon = ICONS.playCrown
  const KickIcon = ICONS.playClose
  const isReady = isLobby && !seat.hasLeft && seat.isReady
  const isIdle = isLobby && !seat.hasLeft && !seat.isReady
  const note = seat.hasLeft
    ? PLAY_HUB_COPY.left
    : seat.botKind
      ? botSeatNote(seat.botKind)
      : seat.isHost
        ? PLAY_HUB_COPY.host
        : PLAY_HUB_COPY.player

  return (
    <div
      className={cn(
        PLAY_ROOM.seat,
        isReady && PLAY_ROOM.seatReady,
        isIdle && PLAY_ROOM.seatIdle,
        isMine && PLAY_ROOM.seatMine,
        seat.hasLeft && PLAY_ROOM.seatOff
      )}
      style={{ animationDelay: `${index * 50}ms` }}
      onContextMenu={onContextMenu}
    >
      {isMine && <span className={PLAY_ROOM.seatYou}>{PLAY_HUB_COPY.you}</span>}
      {canKick && (
        <button
          type="button"
          className={PLAY_ROOM.seatKick}
          aria-label={`${PLAY_HUB_COPY.seatKick} ${seat.name}`}
          disabled={isSaving}
          onClick={onKick}
        >
          <KickIcon className={PLAY_ROOM.seatKickIcon} aria-hidden="true" />
        </button>
      )}
      <div className={PLAY_ROOM.seatAvatar}>
        {seat.isHost && <CrownIcon className={PLAY_ROOM.seatCrown} aria-hidden="true" />}
        <Avatar name={seat.name} src={seat.avatarUrl} size={isMobile ? 'md' : 'lg'} />
        {isReady && (
          <span key="tick" className={PLAY_ROOM.seatBadge}>
            <TickIcon className={PLAY_ROOM.seatBadgeIcon} aria-hidden="true" />
          </span>
        )}
      </div>
      <p className={PLAY_ROOM.seatName} style={{ color: `var(--play-${seat.color})` }}>
        {seat.name}
      </p>
      {seat.isHost || seat.botKind || seat.hasLeft ? (
        <p className={PLAY_ROOM.seatRole}>{note}</p>
      ) : null}
      {isLobby && !seat.hasLeft && (
        <p
          key={String(seat.isReady)}
          className={cn(PLAY_ROOM.seatState, !seat.isReady && PLAY_ROOM.seatStateIdle)}
        >
          {seat.isReady ? PLAY_HUB_COPY.ready : PLAY_HUB_COPY.notReady}
        </p>
      )}
      {onToggleReady && (
        <Button
          variant={seat.isReady ? 'arcadeGhostSmall' : 'arcadeSmall'}
          className={PLAY_ROOM.seatAction}
          onClick={onToggleReady}
        >
          {seat.isReady ? PLAY_HUB_COPY.notReadyAgain : PLAY_HUB_COPY.imReady}
        </Button>
      )}
    </div>
  )
}
