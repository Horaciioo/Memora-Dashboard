'use client'

import { useState } from 'react'

import AppLink from '@/components/elements/navigation/AppLink'
import { PlayLeaveDialog } from '@/composites/play/mobile/PlayLeaveDialog'
import { PlaySettingsDialog } from '@/composites/play/mobile/PlaySettingsDialog'
import { usePlayMoves } from '@/core/hooks/data/play/usePlayMoves'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_MOBILE_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_GAME_BAR } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface PlayGameActionsProps {
  sessionId: string
  gameSlug: string
  // Viewer holds a seat
  isSeated: boolean
  // Viewer hosts the game
  isHost?: boolean
  // Game finished, nothing left to give up
  isOver?: boolean
  // Settings row, off where the game has its own card
  hasSettings?: boolean
  // Row look, the host menu decides
  itemClass?: string
  iconClass?: string
  onLeft?: () => void
}

type PlayAsk = 'leave' | 'end' | 'settings' | null

/**
 * Game menu: hub, all games, settings, then give up or end, only what fits the moment
 * @param {PlayGameActionsProps} props - Session, seat, state and look
 * @return {JSX.Element}
 */

export const PlayGameActions = ({
  sessionId,
  gameSlug,
  isSeated,
  isHost = false,
  isOver = false,
  hasSettings = true,
  itemClass = PLAY_GAME_BAR.menuItem,
  iconClass = PLAY_GAME_BAR.menuIcon,
  onLeft,
}: PlayGameActionsProps) => {
  const moves = usePlayMoves()
  const [asking, setAsking] = useState<PlayAsk>(null)
  const BackIcon = ICONS.playBack
  const GamesIcon = ICONS.play
  const LeaveIcon = ICONS.playLeave
  const EndIcon = ICONS.playCancel
  const SettingsIcon = ICONS.settings
  const danger = cn(itemClass, PLAY_GAME_BAR.menuDanger)
  const close = () => setAsking(null)
  // Playing: a seat gives up, the host can stop it for everyone
  const canLeave = isSeated && !isOver
  const canEnd = isHost && !isOver
  const done = () => {
    close()
    onLeft?.()
  }

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
      {hasSettings && (
        <button type="button" className={itemClass} onClick={() => setAsking('settings')}>
          <SettingsIcon className={iconClass} aria-hidden="true" />
          {PLAY_MOBILE_COPY.gameSettings}
        </button>
      )}
      {canLeave && (
        <button type="button" className={danger} onClick={() => setAsking('leave')}>
          <LeaveIcon className={iconClass} aria-hidden="true" />
          {PLAY_MOBILE_COPY.gameLeave}
        </button>
      )}
      {canEnd && (
        <button type="button" className={danger} onClick={() => setAsking('end')}>
          <EndIcon className={iconClass} aria-hidden="true" />
          {PLAY_MOBILE_COPY.gameEnd}
        </button>
      )}
      {asking === 'settings' && <PlaySettingsDialog gameSlug={gameSlug} onClose={close} />}
      {asking === 'leave' && (
        <PlayLeaveDialog
          title={PLAY_MOBILE_COPY.gameLeaveTitle}
          text={PLAY_MOBILE_COPY.gameLeaveText}
          confirm={PLAY_MOBILE_COPY.gameLeaveConfirm}
          pending={moves.isSaving}
          onCancel={close}
          onConfirm={() => void moves.leave(sessionId).then(done)}
        />
      )}
      {asking === 'end' && (
        <PlayLeaveDialog
          title={PLAY_MOBILE_COPY.gameEndTitle}
          text={PLAY_MOBILE_COPY.gameEndText}
          confirm={PLAY_MOBILE_COPY.gameEndConfirm}
          pending={moves.isSaving}
          onCancel={close}
          onConfirm={() => void moves.end(sessionId, gameSlug).then(done)}
        />
      )}
    </>
  )
}
