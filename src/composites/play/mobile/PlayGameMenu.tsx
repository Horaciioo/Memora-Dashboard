'use client'

import { useState } from 'react'

import AppLink from '@/components/elements/navigation/AppLink'
import { BottomSheet } from '@/components/structures/overlays/BottomSheet'
import { ConfirmDialog } from '@/components/structures/overlays/ConfirmDialog'
import { PlaySettingsPanel } from '@/composites/play/mobile/PlaySettingsPanel'
import { usePlayMoves } from '@/core/hooks/data/play/usePlayMoves'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_MOBILE_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_GAME_BAR } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface PlayGameMenuProps {
  sessionId: string
  gameSlug: string
  isSeated: boolean
}

/**
 * Phone gear: back to the hub, all games, give up, settings
 * @param {PlayGameMenuProps} props - Session and seat
 * @return {JSX.Element}
 */

export const PlayGameMenu = ({ sessionId, gameSlug, isSeated }: PlayGameMenuProps) => {
  const moves = usePlayMoves()
  const [isOpen, setOpen] = useState(false)
  const [isAsking, setAsking] = useState(false)
  const GearIcon = ICONS.settings
  const BackIcon = ICONS.playBack
  const GamesIcon = ICONS.play
  const LeaveIcon = ICONS.playLeave

  return (
    <>
      <button
        type="button"
        className={PLAY_GAME_BAR.gear}
        aria-label={PLAY_MOBILE_COPY.gameMenu}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        <GearIcon className={PLAY_GAME_BAR.gearIcon} aria-hidden="true" />
      </button>

      <BottomSheet
        open={isOpen}
        onClose={() => setOpen(false)}
        title={PLAY_MOBILE_COPY.gameMenu}
        figure={<h2 className={PLAY_GAME_BAR.sheetTitle}>{PLAY_MOBILE_COPY.gameMenu}</h2>}
      >
        <div className={PLAY_GAME_BAR.sheet}>
          <AppLink href={ROUTES.playGame(gameSlug)} className={PLAY_GAME_BAR.menuItem}>
            <BackIcon className={PLAY_GAME_BAR.menuIcon} aria-hidden="true" />
            {PLAY_MOBILE_COPY.gameLobby}
          </AppLink>
          <AppLink href={ROUTES.play} className={PLAY_GAME_BAR.menuItem}>
            <GamesIcon className={PLAY_GAME_BAR.menuIcon} aria-hidden="true" />
            {PLAY_MOBILE_COPY.gameAll}
          </AppLink>
          {isSeated && (
            <button
              type="button"
              className={cn(PLAY_GAME_BAR.menuItem, PLAY_GAME_BAR.menuDanger)}
              onClick={() => setAsking(true)}
            >
              <LeaveIcon className={PLAY_GAME_BAR.menuIcon} aria-hidden="true" />
              {PLAY_MOBILE_COPY.gameLeave}
            </button>
          )}
          <PlaySettingsPanel />
        </div>
      </BottomSheet>

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
            setOpen(false)
          })
        }}
      />
    </>
  )
}
