'use client'

import { createPortal } from 'react-dom'

import { Button } from '@/components/elements/actions/Button'
import { PlaySettingsPanel } from '@/composites/play/mobile/PlaySettingsPanel'
import { useFocusTrap } from '@/core/hooks/interaction/layout/overlay/useFocusTrap'
import { PLAY_MOBILE_COPY } from '@/declarations/play'
import { PLAY_HUB, PLAY_LEAVE_UI } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * Game settings window: sound, animations, game options
 * @param {Object} props - Window
 * @param {string} props.gameSlug - Game played
 * @param {() => void} props.onClose - Close handler
 * @return {JSX.Element}
 */

export const PlaySettingsDialog = ({
  gameSlug,
  onClose,
}: {
  gameSlug: string
  onClose: () => void
}) => {
  const trapRef = useFocusTrap(true, onClose)
  // Inside the stage so the browser full screen keeps showing it
  const host = document.querySelector('[data-play-stage]') ?? document.body

  return createPortal(
    <div className={cn(PLAY_HUB.sheet, 'z-[60]')}>
      <div className={PLAY_HUB.sheetScrim} onMouseDown={onClose} />
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-label={PLAY_MOBILE_COPY.gameSettingsTitle}
        className={cn(PLAY_HUB.sheetWindow, PLAY_LEAVE_UI.window, 'w-full text-left')}
      >
        <h2 className={cn(PLAY_LEAVE_UI.title, 'w-full text-center')}>
          {PLAY_MOBILE_COPY.gameSettingsTitle}
        </h2>
        <div className="w-full">
          <PlaySettingsPanel gameSlug={gameSlug} />
        </div>
        <Button variant="arcadeGhost" className={PLAY_LEAVE_UI.key} onClick={onClose}>
          {PLAY_MOBILE_COPY.gameSettingsClose}
        </Button>
      </div>
    </div>,
    host
  )
}
