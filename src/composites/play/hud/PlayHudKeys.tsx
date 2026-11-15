'use client'

import { useCallback, useRef, useState } from 'react'

import { PlayGameActions } from '@/composites/play/mobile/PlayGameActions'
import { PlayVolume } from '@/composites/play/session/PlayVolume'
import { useOutsideDismiss } from '@/core/hooks/interaction/layout/overlay/useOutsideDismiss'
import { useStopGoCameraStore } from '@/core/store/play/stopgoCamera'
import { usePlayStageStore } from '@/core/store/play/playStage'
import { PLAY_GAMES, PLAY_HUD_COPY } from '@/declarations/play'
import { STOPGO_BOARD_COPY } from '@/declarations/play/stopgo/track'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_HUD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { PlayGames } from '@/utils/constants/play'
import type { PlayGameName } from '@/utils/constants/play'

export interface PlayHudKeysProps {
  game: PlayGameName
  sessionId: string
  isSeated: boolean
}

/**
 * Settings, full screen and chat keys
 * @param {PlayHudKeysProps} props - Session
 * @return {JSX.Element}
 */

export const PlayHudKeys = ({ game, sessionId, isSeated }: PlayHudKeysProps) => {
  const [isOpen, setOpen] = useState(false)
  const { isScreen, isChatOpen, toggleScreen, toggleChat } = usePlayStageStore()
  const SettingsIcon = ICONS.settingsLine
  const FullscreenIcon = isScreen ? ICONS.playWindowed : ICONS.playFullscreen
  const ChatIcon = ICONS.playChat
  const RecenterIcon = ICONS.playRecenter
  const recenter = useStopGoCameraStore((state) => state.recenter)

  const keysRef = useRef<HTMLDivElement>(null)
  const fold = useCallback(() => setOpen(false), [])
  useOutsideDismiss(isOpen, keysRef, fold)

  return (
    <div ref={keysRef} className={PLAY_HUD.keys}>
      <div className={PLAY_HUD.keyRow}>
        {game === PlayGames.StopGo && (
          <button
            type="button"
            className={PLAY_HUD.key}
            aria-label={STOPGO_BOARD_COPY.recenter}
            title={STOPGO_BOARD_COPY.recenter}
            onClick={recenter}
          >
            <RecenterIcon className={PLAY_HUD.keyIcon} aria-hidden="true" />
          </button>
        )}
        <button
          type="button"
          className={cn(PLAY_HUD.key, isOpen && PLAY_HUD.keyOn)}
          aria-label={PLAY_HUD_COPY.settings}
          aria-expanded={isOpen}
          onClick={() => setOpen(!isOpen)}
        >
          <SettingsIcon className={PLAY_HUD.keyIcon} aria-hidden="true" />
        </button>
        <button
          type="button"
          className={cn(PLAY_HUD.key, PLAY_HUD.keyDesktop, isScreen && PLAY_HUD.keyOn)}
          aria-label={isScreen ? PLAY_HUD_COPY.windowed : PLAY_HUD_COPY.fullscreen}
          aria-pressed={isScreen}
          onClick={toggleScreen}
        >
          <FullscreenIcon className={PLAY_HUD.keyIcon} aria-hidden="true" />
        </button>
        <button
          type="button"
          className={cn(PLAY_HUD.key, PLAY_HUD.keyDesktop, isChatOpen && PLAY_HUD.keyOn)}
          aria-label={isChatOpen ? PLAY_HUD_COPY.hideChat : PLAY_HUD_COPY.showChat}
          aria-pressed={isChatOpen}
          onClick={toggleChat}
        >
          <ChatIcon className={PLAY_HUD.keyIcon} aria-hidden="true" />
        </button>
      </div>
      {isOpen && (
        <div className={PLAY_HUD.settings} role="dialog" aria-label={PLAY_HUD_COPY.settings}>
          <div className={PLAY_HUD.soundRow}>
            <PlayVolume game={game} />
          </div>
          <div className={PLAY_HUD.rule} role="separator" />
          <PlayGameActions
            sessionId={sessionId}
            gameSlug={PLAY_GAMES.get(game).slug}
            isSeated={isSeated}
            hasSettings={false}
            itemClass={PLAY_HUD.setting}
            iconClass={PLAY_HUD.keyIcon}
          />
        </div>
      )}
    </div>
  )
}
