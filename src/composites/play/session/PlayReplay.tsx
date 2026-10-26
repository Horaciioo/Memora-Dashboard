'use client'

import { Button } from '@/components/elements/actions/Button'
import AppLink from '@/components/elements/navigation/AppLink'
import { usePlayMoves } from '@/core/hooks/data/play/usePlayMoves'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_HUB_COPY } from '@/declarations/play'
import { BUTTON_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * Replay offer of a finished game
 * @typedef {Object} PlayReplayState
 */

export interface PlayReplayState {
  isHost: boolean
  isSeated: boolean
  // Game already replayed, open while it still waits or runs
  rematch: { id: string; isOpen: boolean } | null
}

export interface PlayReplayProps extends PlayReplayState {
  sessionId: string
  className?: string
}

/**
 * Replay key: the host opens a new table, the others follow it
 * @param {PlayReplayProps} props - Finished game and its replay
 * @return {JSX.Element | null}
 */

export const PlayReplay = ({
  sessionId,
  isHost,
  isSeated,
  rematch,
  className,
}: PlayReplayProps) => {
  const moves = usePlayMoves()

  // Table opened, seated players follow
  if (rematch) {
    return rematch.isOpen && isSeated ? (
      <AppLink
        href={ROUTES.playSession(rematch.id)}
        className={cn(BUTTON_STYLES.base, BUTTON_STYLES.arcade, className)}
      >
        {PLAY_HUB_COPY.replayJoin}
      </AppLink>
    ) : null
  }

  if (!isHost) return null

  return (
    <Button
      variant="arcade"
      className={className}
      isLoading={moves.isSaving}
      onClick={() => void moves.replay(sessionId)}
    >
      {PLAY_HUB_COPY.replay}
    </Button>
  )
}
