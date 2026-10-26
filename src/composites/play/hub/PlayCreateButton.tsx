'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Tip } from '@/components/elements/feedback/Tip'
import { PLAY_SETUP_DRAWERS } from '@/composites/play/registry'
import type { PlaySetupProps } from '@/composites/play/registry'
import { usePlayMoves } from '@/core/hooks/data/play/usePlayMoves'
import { PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_HUB } from '@/declarations/ui/variants'
import type { PlayGameName } from '@/utils/constants/play'

export interface PlayCreateButtonProps {
  game: PlayGameName
  // Busy, banned or not shipped
  disabled: boolean
  // Said on hover while locked
  lockedReason?: string | null
  // Who sets the game up
  player?: PlaySetupProps['player']
  className?: string
}

/**
 * Open a table of this game
 * @param {PlayCreateButtonProps} props - Game
 * @return {JSX.Element}
 */

export const PlayCreateButton = ({
  game,
  disabled,
  lockedReason,
  player,
  className,
}: PlayCreateButtonProps) => {
  const moves = usePlayMoves()
  const [isSetupOpen, setSetupOpen] = useState(false)

  // Games with rules ask them first
  const Setup = PLAY_SETUP_DRAWERS[game]
  const button = (
    <Button
      variant="arcade"
      className={className}
      disabled={disabled}
      isLoading={moves.isSaving}
      onClick={() => (Setup ? setSetupOpen(true) : void moves.create(game))}
    >
      {PLAY_HUB_COPY.create}
    </Button>
  )

  return (
    <>
      {disabled && lockedReason ? (
        <Tip label={lockedReason} className={PLAY_HUB.tipBlock}>
          {button}
        </Tip>
      ) : (
        button
      )}
      {Setup && (
        <Setup
          open={isSetupOpen}
          isSaving={moves.isSaving}
          player={player}
          onClose={() => setSetupOpen(false)}
          onSubmit={(setup) => void moves.create(game, { ...setup })}
        />
      )}
    </>
  )
}
