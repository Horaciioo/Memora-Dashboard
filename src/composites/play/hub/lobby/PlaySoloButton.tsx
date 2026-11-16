'use client'

import { Button } from '@/components/elements/actions/Button'
import { Tip } from '@/components/elements/feedback/Tip'
import { usePlayMoves } from '@/core/hooks/data/play/usePlayMoves'
import { PLAY_GAMES, PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_HUB } from '@/declarations/ui/variants'
import type { PlayGameName } from '@/utils/constants/play'

export interface PlaySoloButtonProps {
  game: PlayGameName
  // Banned or locked out
  disabled: boolean
  // Said on hover while locked
  lockedReason?: string | null
  className?: string
}

/**
 * Start a private table alone, straight into the game
 * @param {PlaySoloButtonProps} props - Game
 * @return {JSX.Element}
 */

export const PlaySoloButton = ({
  game,
  disabled,
  lockedReason,
  className,
}: PlaySoloButtonProps) => {
  const moves = usePlayMoves()
  // Games that need a second player wait for the bots to wake up
  const needsOthers = PLAY_GAMES.get(game).minPlayers > 1 && !PLAY_GAMES.get(game).soloBots
  const reason = lockedReason ?? (needsOthers ? PLAY_HUB_COPY.soloNeedsPlayers : null)
  const isLocked = disabled || needsOthers

  const button = (
    <Button
      variant="arcade"
      className={className}
      disabled={isLocked}
      isLoading={moves.isSaving}
      onClick={() => void moves.solo(game)}
    >
      {PLAY_HUB_COPY.solo}
    </Button>
  )

  return isLocked && reason ? (
    <Tip label={reason} className={PLAY_HUB.tipBlock}>
      {button}
    </Tip>
  ) : (
    button
  )
}
