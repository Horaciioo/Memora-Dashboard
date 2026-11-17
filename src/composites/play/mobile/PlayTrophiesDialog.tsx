'use client'

import { createPortal } from 'react-dom'

import { PlayTrophies } from '@/composites/play/member/stats/PlayTrophies'
import { usePlayProfile } from '@/core/hooks/data/play/usePlayProfile'
import { useFocusTrap } from '@/core/hooks/interaction/layout/overlay/useFocusTrap'
import { PLAY_HUB_COPY, PLAY_ME_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_HUB, PLAY_TABS } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * Window listing every trophy, won ones in gold and the others with their bar
 * @param {Object} props - Window
 * @param {() => void} props.onClose - Close handler
 * @return {JSX.Element}
 */

export const PlayTrophiesDialog = ({ onClose }: { onClose: () => void }) => {
  const profile = usePlayProfile()
  const trapRef = useFocusTrap(true, onClose)
  const CloseIcon = ICONS.playClose
  // Inside the stage so the browser full screen keeps showing it
  const host = document.querySelector('[data-play-stage]') ?? document.body

  return createPortal(
    <div className={cn(PLAY_HUB.sheet, 'z-[60]')} data-floating-layer>
      <div className={PLAY_HUB.sheetScrim} onMouseDown={onClose} />
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-label={PLAY_ME_COPY.trophies}
        className={cn(PLAY_HUB.sheetWindow, PLAY_TABS.trophiesWindow)}
      >
        <header className={PLAY_HUB.sheetHead}>
          <h2 className={PLAY_HUB.sheetTitle}>{PLAY_ME_COPY.trophies}</h2>
          <button
            type="button"
            className={PLAY_HUB.sheetClose}
            aria-label={PLAY_HUB_COPY.close}
            onClick={onClose}
          >
            <CloseIcon className={PLAY_HUB.sheetCloseIcon} aria-hidden="true" />
          </button>
        </header>
        <div className={PLAY_HUB.sheetBody}>
          {profile && <PlayTrophies global={profile.global} isBare />}
        </div>
      </div>
    </div>,
    host
  )
}
