'use client'

import { useState } from 'react'

import { BottomSheet } from '@/components/structures/overlays/BottomSheet'
import { PlayGameActions } from '@/composites/play/mobile/PlayGameActions'
import { PlaySettingsPanel } from '@/composites/play/mobile/PlaySettingsPanel'
import { PLAY_MOBILE_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_GAME_BAR } from '@/declarations/ui/variants'

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
  const [isOpen, setOpen] = useState(false)
  const GearIcon = ICONS.settings

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
          <PlayGameActions
            sessionId={sessionId}
            gameSlug={gameSlug}
            isSeated={isSeated}
            onLeft={() => setOpen(false)}
          />
          <PlaySettingsPanel gameSlug={gameSlug} />
        </div>
      </BottomSheet>
    </>
  )
}
