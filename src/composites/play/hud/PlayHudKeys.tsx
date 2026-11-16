'use client'

import { useCallback, useRef, useState } from 'react'

import { PlayPrefSwitches } from '@/composites/play/prefs/PlayPrefSwitches'
import { PlayGameActions } from '@/composites/play/mobile/PlayGameActions'
import { PlayVolume } from '@/composites/play/session/PlayVolume'
import { useOutsideDismiss } from '@/core/hooks/interaction/layout/overlay/useOutsideDismiss'
import { useConcordatViewStore } from '@/core/store/play/concordatView'
import { useStopGoCameraStore } from '@/core/store/play/stopgoCamera'
import { usePlayScoreStore } from '@/core/store/play/playScore'
import { usePlayStageStore } from '@/core/store/play/playStage'
import { PLAY_GAMES, PLAY_HUD_COPY } from '@/declarations/play'
import { CONCORDAT_HUD_COPY } from '@/declarations/play/concordat/hudCopy'
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
 * Score, settings, full screen, chat and exit keys
 * @param {PlayHudKeysProps} props - Session
 * @return {JSX.Element}
 */

export const PlayHudKeys = ({ game, sessionId, isSeated }: PlayHudKeysProps) => {
  const [panel, setPanel] = useState<'settings' | 'exit' | null>(null)
  const { isScreen, isChatOpen, toggleScreen, toggleChat } = usePlayStageStore()
  const ExitIcon = ICONS.playLeave
  const SettingsIcon = ICONS.settingsLine
  const FullscreenIcon = isScreen ? ICONS.playWindowed : ICONS.playFullscreen
  const ChatIcon = ICONS.playChat
  const ScoreIcon = ICONS.trophy
  const RecenterIcon = ICONS.playRecenter
  const isScoreOn = usePlayScoreStore((state) => state.isOpen)
  const toggleScore = usePlayScoreStore((state) => state.toggle)
  const recenter = useStopGoCameraStore((state) => state.recenter)
  const recenterConcordat = useConcordatViewStore((state) => state.recenter)

  const keysRef = useRef<HTMLDivElement>(null)
  const fold = useCallback(() => setPanel(null), [])
  useOutsideDismiss(panel !== null, keysRef, fold)

  return (
    <div ref={keysRef} className={PLAY_HUD.keys}>
      <div className={PLAY_HUD.keyRow}>
        {game === PlayGames.Concordat && (
          <button
            type="button"
            className={PLAY_HUD.key}
            aria-label={CONCORDAT_HUD_COPY.recenter}
            title={CONCORDAT_HUD_COPY.recenter}
            onClick={recenterConcordat}
          >
            <RecenterIcon className={PLAY_HUD.keyIcon} aria-hidden="true" />
          </button>
        )}
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
          className={cn(PLAY_HUD.key, isScoreOn && PLAY_HUD.keyOn)}
          aria-label={PLAY_HUD_COPY.scorecard}
          title={PLAY_HUD_COPY.scorecard}
          aria-pressed={isScoreOn}
          onClick={toggleScore}
        >
          <ScoreIcon className={PLAY_HUD.keyIcon} aria-hidden="true" />
        </button>
        <button
          type="button"
          className={cn(PLAY_HUD.key, panel === 'settings' && PLAY_HUD.keyOn)}
          aria-label={PLAY_HUD_COPY.settings}
          aria-expanded={panel === 'settings'}
          onClick={() => setPanel(panel === 'settings' ? null : 'settings')}
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
        <button
          type="button"
          className={cn(PLAY_HUD.key, panel === 'exit' && PLAY_HUD.keyOn)}
          aria-label={PLAY_HUD_COPY.exit}
          title={PLAY_HUD_COPY.exit}
          aria-expanded={panel === 'exit'}
          onClick={() => setPanel(panel === 'exit' ? null : 'exit')}
        >
          <ExitIcon className={PLAY_HUD.keyIcon} aria-hidden="true" />
        </button>
      </div>
      {panel === 'settings' && (
        <div className={PLAY_HUD.settings} role="dialog" aria-label={PLAY_HUD_COPY.settings}>
          <div className={PLAY_HUD.soundRow}>
            <PlayVolume game={game} />
          </div>
          <div className={PLAY_HUD.rule} role="separator" />
          <PlayPrefSwitches game={game} isHud />
        </div>
      )}
      {panel === 'exit' && (
        <div className={PLAY_HUD.settings} role="dialog" aria-label={PLAY_HUD_COPY.exit}>
          <PlayGameActions
            sessionId={sessionId}
            gameSlug={PLAY_GAMES.get(game).slug}
            isSeated={isSeated}
            hasSettings={false}
            itemClass={PLAY_HUD.action}
            iconClass={PLAY_HUD.keyIcon}
          />
        </div>
      )}
    </div>
  )
}
