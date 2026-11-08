'use client'

import { useState } from 'react'

import AppLink from '@/components/elements/navigation/AppLink'
import { ConfirmDialog } from '@/components/structures/overlays/ConfirmDialog'
import { usePlayMoves } from '@/core/hooks/data/play/usePlayMoves'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_MOBILE_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_GAME_BAR } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface PlayGameActionsProps {
  sessionId: string
  gameSlug: string
  isSeated: boolean
  // Row look, the host menu decides
  itemClass?: string
  iconClass?: string
  onLeft?: () => void
}

/**
 * Game exits: lobby, all games, give up
 * @param {PlayGameActionsProps} props - Session, seat and look
 * @return {JSX.Element}
 */

export const PlayGameActions = ({
  sessionId,
  gameSlug,
  isSeated,
  itemClass = PLAY_GAME_BAR.menuItem,
  iconClass = PLAY_GAME_BAR.menuIcon,
  onLeft,
}: PlayGameActionsProps) => {
  const moves = usePlayMoves()
  const [isAsking, setAsking] = useState(false)
  const BackIcon = ICONS.playBack
  const GamesIcon = ICONS.play
  const LeaveIcon = ICONS.playLeave

  return (
    <>
      <AppLink href={ROUTES.playGame(gameSlug)} className={itemClass}>
        <BackIcon className={iconClass} aria-hidden="true" />
        {PLAY_MOBILE_COPY.gameLobby}
      </AppLink>
      <AppLink href={ROUTES.play} className={itemClass}>
        <GamesIcon className={iconClass} aria-hidden="true" />
        {PLAY_MOBILE_COPY.gameAll}
      </AppLink>
      {isSeated && (
        <button
          type="button"
          className={cn(itemClass, PLAY_GAME_BAR.menuDanger)}
          onClick={() => setAsking(true)}
        >
          <LeaveIcon className={iconClass} aria-hidden="true" />
          {PLAY_MOBILE_COPY.gameLeave}
        </button>
      )}
      <ConfirmDialog
        open={isAsking}
        title={PLAY_MOBILE_COPY.gameLeaveTitle}
        description={PLAY_MOBILE_COPY.gameLeaveText}
        confirmLabel={PLAY_MOBILE_COPY.gameLeaveConfirm}
        cancelLabel={PLAY_MOBILE_COPY.gameLeaveKeep}
        pending={moves.isSaving}
        onCancel={() => setAsking(false)}
        onConfirm={() => {
          void moves.leave(sessionId).then(() => {
            setAsking(false)
            onLeft?.()
          })
        }}
      />
    </>
  )
}
