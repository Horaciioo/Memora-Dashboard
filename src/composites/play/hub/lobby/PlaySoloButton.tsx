'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Tip } from '@/components/elements/feedback/Tip'
import { PLAY_SETUP_DRAWERS } from '@/composites/play/registry'
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
 * Start a private table alone, the map picked first when the game has a setup
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
  const [isSetting, setSetting] = useState(false)
  // Bot-filled games let the player pick the map before starting
  const Setup = PLAY_GAMES.get(game).soloBots ? PLAY_SETUP_DRAWERS[game] : undefined
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
      onClick={() => (Setup ? setSetting(true) : void moves.solo(game))}
    >
      {PLAY_HUB_COPY.solo}
    </Button>
  )

  return (
    <>
      {Setup && (
        <Setup
          open={isSetting}
          isSaving={moves.isSaving}
          onClose={() => setSetting(false)}
          onSubmit={(setup) => void moves.solo(game, setup as Record<string, unknown>)}
        />
      )}
      {isLocked && reason ? (
        <Tip label={reason} className={PLAY_HUB.tipBlock}>
          {button}
        </Tip>
      ) : (
        button
      )}
    </>
  )
}
