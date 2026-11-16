'use client'

import { Button } from '@/components/elements/actions/Button'
import { PlayMenuKey } from '@/composites/play/session/PlayMenuKey'
import { PlayVolumeKey } from '@/composites/play/session/PlayVolumeKey'
import { useIsMobileShell } from '@/core/hooks/interaction/layout/measure/useBreakpoint'
import { usePlayStageStore } from '@/core/store/play/playStage'
import { PLAY_HUB_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { BAC_SESSION } from '@/declarations/ui/variants'
import type { PlayGameName } from '@/utils/constants/play'
import { cn } from '@/utils/classnames'

/**
 * Menu key, sound key, full screen key, and the chat key once the table fills the screen
 * @param {Object} props - Game
 * @param {PlayGameName} props.game - Game played
 * @param {string} props.sessionId - Session id
 * @param {string} props.gameSlug - Hub of the game
 * @param {boolean} props.isSeated - Viewer plays
 * @param {boolean} props.isHost - Viewer hosts
 * @param {boolean} props.isOver - Game finished
 * @return {JSX.Element}
 */

export const PlayStageKeys = ({
  game,
  sessionId,
  gameSlug,
  isSeated,
  isHost = false,
  isOver = false,
}: {
  game: PlayGameName
  sessionId: string
  gameSlug: string
  isSeated: boolean
  isHost?: boolean
  isOver?: boolean
}) => {
  const { isScreen, isChatOpen, toggleScreen, toggleChat } = usePlayStageStore()
  const isMobile = useIsMobileShell()
  const FullscreenIcon = isScreen ? ICONS.playWindowed : ICONS.playFullscreen
  const ChatIcon = ICONS.playChat
  // Phone: the gear holds them
  if (isMobile) return null

  return (
    <div className={cn(BAC_SESSION.keys, BAC_SESSION.keysFull)}>
      <PlayMenuKey
        sessionId={sessionId}
        gameSlug={gameSlug}
        isSeated={isSeated}
        isHost={isHost}
        isOver={isOver}
        hasSettings={false}
      />
      <PlayVolumeKey game={game} />
      <Button
        variant="arcadeGhost"
        className={BAC_SESSION.keyButton}
        aria-label={isChatOpen ? PLAY_HUB_COPY.hideChat : PLAY_HUB_COPY.showChat}
        aria-pressed={isChatOpen}
        onClick={toggleChat}
      >
        <ChatIcon className={BAC_SESSION.keysIcon} aria-hidden="true" />
      </Button>
      <Button
        variant="arcadeGhost"
        className={BAC_SESSION.keyButton}
        aria-label={isScreen ? PLAY_HUB_COPY.windowed : PLAY_HUB_COPY.fullscreen}
        aria-pressed={isScreen}
        onClick={toggleScreen}
      >
        <FullscreenIcon className={BAC_SESSION.keysIcon} aria-hidden="true" />
      </Button>
    </div>
  )
}
