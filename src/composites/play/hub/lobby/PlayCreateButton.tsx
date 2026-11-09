'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Tip } from '@/components/elements/feedback/Tip'
import { PLAY_SETUP_DRAWERS } from '@/composites/play/registry'
import { usePlayMoves } from '@/core/hooks/data/play/usePlayMoves'
import { PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_HUB } from '@/declarations/ui/variants'
import { PlayGames } from '@/utils/constants/play'
import type { PlayGameName } from '@/utils/constants/play'

export interface PlayCreateButtonProps {
  game: PlayGameName
  // Busy, banned or not shipped
  disabled: boolean
  // Said on hover while locked
  lockedReason?: string | null
  className?: string
  // Words of the button, create by default
  label?: string
}

/**
 * Open a table of this game, the rules rail first except for Golf
 * @param {PlayCreateButtonProps} props - Game
 * @return {JSX.Element}
 */

export const PlayCreateButton = ({
  game,
  disabled,
  lockedReason,
  className,
  label = PLAY_HUB_COPY.create,
}: PlayCreateButtonProps) => {
  const moves = usePlayMoves()
  const [isSetting, setSetting] = useState(false)
  const Setup = game === PlayGames.Golf ? undefined : PLAY_SETUP_DRAWERS[game]

  const button = (
    <Button
      variant="arcade"
      className={className}
      disabled={disabled}
      isLoading={moves.isSaving}
      onClick={() => (Setup ? setSetting(true) : void moves.create(game))}
    >
      {label}
    </Button>
  )

  return (
    <>
      {Setup && (
        <Setup
          open={isSetting}
          isSaving={moves.isSaving}
          onClose={() => setSetting(false)}
          onSubmit={(setup) => void moves.create(game, setup as Record<string, unknown>)}
        />
      )}
      {disabled && lockedReason ? (
        <Tip label={lockedReason} className={PLAY_HUB.tipBlock}>
          {button}
        </Tip>
      ) : (
        button
      )}
    </>
  )
}
