'use client'

import { useCallback, useRef, useState } from 'react'

import { PlayGameActions } from '@/composites/play/mobile/PlayGameActions'
import { GolfSettings } from '@/composites/play/golf/hud/GolfSettings'
import { useOutsideDismiss } from '@/core/hooks/interaction/layout/overlay/useOutsideDismiss'
import { usePlayScoreStore } from '@/core/store/play/playScore'
import { usePlayStageStore } from '@/core/store/play/playStage'
import { PLAY_GAMES, PLAY_HUD_COPY } from '@/declarations/play'
import { GOLF_BOARD_COPY } from '@/declarations/play/golf/copy'
import { ICONS } from '@/declarations/ui/icons'
import { GOLF_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { PlayGames } from '@/utils/constants/play'

/**
 * View, settings and exit keys opening a card under them
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
  const [panel, setPanel] = useState<'settings' | 'exit' | null>(null)
  const ViewIcon = isOverview ? ICONS.golfFollow : ICONS.golfOverview
  const ExitIcon = ICONS.playLeave
  const SettingsIcon = ICONS.settingsLine
  const { isScreen, isChatOpen, toggleScreen, toggleChat } = usePlayStageStore()
  const FullscreenIcon = isScreen ? ICONS.playWindowed : ICONS.playFullscreen
  const ChatIcon = ICONS.playChat
  const ScoreIcon = ICONS.trophy
  const isScoreOn = usePlayScoreStore((state) => state.isOpen)
  const toggleScore = usePlayScoreStore((state) => state.toggle)

  const keysRef = useRef<HTMLDivElement>(null)
  const fold = useCallback(() => setPanel(null), [])
  useOutsideDismiss(panel !== null, keysRef, fold)

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
          className={cn(GOLF_BOARD.view, isScoreOn && GOLF_BOARD.viewOn)}
          aria-label={GOLF_BOARD_COPY.scorecard}
          title={GOLF_BOARD_COPY.scorecard}
          aria-pressed={isScoreOn}
          onClick={toggleScore}
        >
          <ScoreIcon className={GOLF_BOARD.viewIcon} aria-hidden="true" />
        </button>
        <button
          type="button"
          className={cn(GOLF_BOARD.view, panel === 'settings' && GOLF_BOARD.viewOn)}
          aria-label={GOLF_BOARD_COPY.settings}
          aria-expanded={panel === 'settings'}
          onClick={() => setPanel(panel === 'settings' ? null : 'settings')}
        >
          <SettingsIcon className={GOLF_BOARD.viewIcon} aria-hidden="true" />
        </button>
        <button
          type="button"
          className={cn(GOLF_BOARD.view, GOLF_BOARD.viewDesktop, isScreen && GOLF_BOARD.viewOn)}
          aria-label={isScreen ? GOLF_BOARD_COPY.windowed : GOLF_BOARD_COPY.fullscreen}
          aria-pressed={isScreen}
          onClick={toggleScreen}
        >
          <FullscreenIcon className={GOLF_BOARD.viewIcon} aria-hidden="true" />
        </button>
        <button
          type="button"
          className={cn(GOLF_BOARD.view, GOLF_BOARD.viewDesktop, isChatOpen && GOLF_BOARD.viewOn)}
          aria-label={isChatOpen ? GOLF_BOARD_COPY.hideChat : GOLF_BOARD_COPY.showChat}
          aria-pressed={isChatOpen}
          onClick={toggleChat}
        >
          <ChatIcon className={GOLF_BOARD.viewIcon} aria-hidden="true" />
        </button>
        <button
          type="button"
          className={cn(GOLF_BOARD.view, panel === 'exit' && GOLF_BOARD.viewOn)}
          aria-label={PLAY_HUD_COPY.exit}
          title={PLAY_HUD_COPY.exit}
          aria-expanded={panel === 'exit'}
          onClick={() => setPanel(panel === 'exit' ? null : 'exit')}
        >
          <ExitIcon className={GOLF_BOARD.viewIcon} aria-hidden="true" />
        </button>
      </div>
      {panel === 'settings' && <GolfSettings />}
      {panel === 'exit' && (
        <div className={GOLF_BOARD.settings} role="dialog" aria-label={PLAY_HUD_COPY.exit}>
          <PlayGameActions
            sessionId={sessionId}
            gameSlug={PLAY_GAMES.get(PlayGames.Golf).slug}
            isSeated={isSeated}
            hasSettings={false}
            itemClass={cn(GOLF_BOARD.setting, 'justify-start')}
            iconClass="size-5"
          />
        </div>
      )}
    </div>
  )
}
