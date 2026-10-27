'use client'

import { useEffect, useState } from 'react'

import { GolfSettings } from '@/composites/play/golf/hud/GolfSettings'
import { usePlayStageStore } from '@/core/store/playStage'
import { GOLF_BOARD_COPY } from '@/declarations/play/golf/copy'
import { ICONS } from '@/declarations/ui/icons'
import { GOLF_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * View key, settings key opening a card under them
 * @param {Object} props - View
 * @param {boolean} props.isOverview - Whole hole shown
 * @param {() => void} props.onOverview - Switch view
 * @return {JSX.Element}
 */

export const GolfViewKeys = ({
  isOverview,
  onOverview,
}: {
  isOverview: boolean
  onOverview: () => void
}) => {
  const [isOpen, setOpen] = useState(false)
  const ViewIcon = isOverview ? ICONS.golfFollow : ICONS.golfOverview
  const SettingsIcon = ICONS.settingsLine
  const { isFullscreen, isChatOpen, toggleFullscreen, toggleChat } = usePlayStageStore()
  const FullscreenIcon = isFullscreen ? ICONS.playWindowed : ICONS.playFullscreen
  const ChatIcon = ICONS.playChat

  useEffect(() => {
    if (!isOpen) return
    const close = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', close)

    return () => window.removeEventListener('keydown', close)
  }, [isOpen])

  return (
    <div className={GOLF_BOARD.keys}>
      <div className={GOLF_BOARD.views}>
        <button
          type="button"
          className={cn(GOLF_BOARD.view, isOverview && GOLF_BOARD.viewOn)}
          aria-label={isOverview ? GOLF_BOARD_COPY.follow : GOLF_BOARD_COPY.overview}
          aria-pressed={isOverview}
          onClick={onOverview}
        >
          <ViewIcon className={GOLF_BOARD.viewIcon} aria-hidden="true" />
        </button>
        <button
          type="button"
          className={cn(GOLF_BOARD.view, isOpen && GOLF_BOARD.viewOn)}
          aria-label={GOLF_BOARD_COPY.settings}
          aria-expanded={isOpen}
          onClick={() => setOpen(!isOpen)}
        >
          <SettingsIcon className={GOLF_BOARD.viewIcon} aria-hidden="true" />
        </button>
        <button
          type="button"
          className={cn(GOLF_BOARD.view, isFullscreen && GOLF_BOARD.viewOn)}
          aria-label={isFullscreen ? GOLF_BOARD_COPY.windowed : GOLF_BOARD_COPY.fullscreen}
          aria-pressed={isFullscreen}
          onClick={toggleFullscreen}
        >
          <FullscreenIcon className={GOLF_BOARD.viewIcon} aria-hidden="true" />
        </button>
        {isFullscreen && (
          <button
            type="button"
            className={cn(GOLF_BOARD.view, isChatOpen && GOLF_BOARD.viewOn)}
            aria-label={isChatOpen ? GOLF_BOARD_COPY.hideChat : GOLF_BOARD_COPY.showChat}
            aria-pressed={isChatOpen}
            onClick={toggleChat}
          >
            <ChatIcon className={GOLF_BOARD.viewIcon} aria-hidden="true" />
          </button>
        )}
      </div>
      {isOpen && <GolfSettings />}
    </div>
  )
}
