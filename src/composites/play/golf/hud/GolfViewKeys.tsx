'use client'

import { useCallback, useRef, useState } from 'react'

import { GolfSettings } from '@/composites/play/golf/hud/GolfSettings'
import { useOutsideDismiss } from '@/core/hooks/interaction/layout/overlay/useOutsideDismiss'
import { usePlayStageStore } from '@/core/store/play/playStage'
import { GOLF_BOARD_COPY } from '@/declarations/play/golf/copy'
import { ICONS } from '@/declarations/ui/icons'
import { GOLF_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * View key, settings key opening a card under them
 * @param {Object} props - View
 * @param {boolean} props.isOverview - Whole hole shown
 * @param {() => void} props.onOverview - Switch view
 * @param {string} props.sessionId - Session id
 * @param {boolean} props.isSeated - Viewer plays
 * @return {JSX.Element}
 */

export const GolfViewKeys = ({
  isOverview,
  onOverview,
  sessionId,
  isSeated,
}: {
  isOverview: boolean
  onOverview: () => void
  sessionId: string
  isSeated: boolean
}) => {
  const [isOpen, setOpen] = useState(false)
  const ViewIcon = isOverview ? ICONS.golfFollow : ICONS.golfOverview
  const SettingsIcon = ICONS.settingsLine
  const { isFullscreen, isChatOpen, toggleFullscreen, toggleChat } = usePlayStageStore()
  const FullscreenIcon = isFullscreen ? ICONS.playWindowed : ICONS.playFullscreen
  const ChatIcon = ICONS.playChat

  const keysRef = useRef<HTMLDivElement>(null)
  const fold = useCallback(() => setOpen(false), [])
  useOutsideDismiss(isOpen, keysRef, fold)

  return (
    <div ref={keysRef} className={GOLF_BOARD.keys}>
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
          className={cn(GOLF_BOARD.view, GOLF_BOARD.viewDesktop, isFullscreen && GOLF_BOARD.viewOn)}
          aria-label={isFullscreen ? GOLF_BOARD_COPY.windowed : GOLF_BOARD_COPY.fullscreen}
          aria-pressed={isFullscreen}
          onClick={toggleFullscreen}
        >
          <FullscreenIcon className={GOLF_BOARD.viewIcon} aria-hidden="true" />
        </button>
        {isFullscreen && (
          <button
            type="button"
            className={cn(GOLF_BOARD.view, GOLF_BOARD.viewDesktop, isChatOpen && GOLF_BOARD.viewOn)}
            aria-label={isChatOpen ? GOLF_BOARD_COPY.hideChat : GOLF_BOARD_COPY.showChat}
            aria-pressed={isChatOpen}
            onClick={toggleChat}
          >
            <ChatIcon className={GOLF_BOARD.viewIcon} aria-hidden="true" />
          </button>
        )}
      </div>
      {isOpen && <GolfSettings sessionId={sessionId} isSeated={isSeated} />}
    </div>
  )
}
