'use client'

import { Button } from '@/components/elements/actions/Button'
import { PlayVolumeKey } from '@/composites/play/session/PlayVolumeKey'
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
 * @return {JSX.Element}
 */

export const PlayStageKeys = ({ game }: { game: PlayGameName }) => {
  const { isFullscreen, isChatOpen, toggleFullscreen, toggleChat } = usePlayStageStore()
  const FullscreenIcon = isFullscreen ? ICONS.playWindowed : ICONS.playFullscreen
  const ChatIcon = ICONS.playChat

  return (
    <div
      className={cn(
        BAC_SESSION.keys,
        isFullscreen && [BAC_SESSION.keysFull, isChatOpen && BAC_SESSION.keysShifted]
      )}
    >
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
