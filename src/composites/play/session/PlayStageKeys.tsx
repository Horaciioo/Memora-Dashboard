'use client'

import { Button } from '@/components/elements/actions/Button'
import { PlayGameActions } from '@/composites/play/mobile/PlayGameActions'
import { PlayVolumeKey } from '@/composites/play/session/PlayVolumeKey'
import { useIsMobileShell } from '@/core/hooks/interaction/layout/useBreakpoint'
import { usePlayStageStore } from '@/core/store/playStage'
import { PLAY_HUB_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { BAC_SESSION } from '@/declarations/ui/variants'
import type { PlayGameName } from '@/utils/constants/play'
import { cn } from '@/utils/classnames'

/**
 * Sound key, full screen key, and the chat key once the table fills the screen
 * @param {Object} props - Game
 * @param {PlayGameName} props.game - Game played
 * @param {string} props.sessionId - Session id
 * @param {string} props.gameSlug - Hub of the game
 * @param {boolean} props.isSeated - Viewer plays
 * @return {JSX.Element}
 */

export const PlayStageKeys = ({
  game,
  sessionId,
  gameSlug,
  isSeated,
}: {
  game: PlayGameName
  sessionId: string
  gameSlug: string
  isSeated: boolean
}) => {
  const { isFullscreen, isChatOpen, toggleFullscreen, toggleChat } = usePlayStageStore()
  const isMobile = useIsMobileShell()
  const FullscreenIcon = isFullscreen ? ICONS.playWindowed : ICONS.playFullscreen
  const ChatIcon = ICONS.playChat
  // Phone: the gear holds them
  if (isMobile) return null

  return (
    <div
      className={cn(
        BAC_SESSION.keys,
        isFullscreen && [BAC_SESSION.keysFull, isChatOpen && BAC_SESSION.keysShifted]
      )}
    >
      {isFullscreen && (
        <PlayGameActions
          sessionId={sessionId}
          gameSlug={gameSlug}
          isSeated={isSeated}
          itemClass={BAC_SESSION.exitKey}
          iconClass={BAC_SESSION.exitIcon}
        />
      )}
      <PlayVolumeKey game={game} />
      {isFullscreen && (
        <Button
          variant="arcadeGhost"
          className={BAC_SESSION.keyButton}
          aria-label={isChatOpen ? PLAY_HUB_COPY.hideChat : PLAY_HUB_COPY.showChat}
          aria-pressed={isChatOpen}
          onClick={toggleChat}
        >
          <ChatIcon className={BAC_SESSION.keysIcon} aria-hidden="true" />
        </Button>
      )}
      <Button
        variant="arcadeGhost"
        className={BAC_SESSION.keyButton}
        aria-label={isFullscreen ? PLAY_HUB_COPY.windowed : PLAY_HUB_COPY.fullscreen}
        aria-pressed={isFullscreen}
        onClick={toggleFullscreen}
      >
        <FullscreenIcon className={BAC_SESSION.keysIcon} aria-hidden="true" />
      </Button>
    </div>
  )
}
